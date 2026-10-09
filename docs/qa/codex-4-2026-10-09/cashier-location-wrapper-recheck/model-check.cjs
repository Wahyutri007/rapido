const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto'), ts = require('typescript');
const inputs = ['lib/cashier/location.ts', 'constants/data/manage/place.ts'];
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} }; cache.set(file, mod.exports);
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('module', 'exports', 'require', compiled)(mod, mod.exports, name => name.startsWith('@/') ? load(name.slice(2) + '.ts') : require(name));
  return mod.exports;
}
const api = load(inputs[0]), { PLACE_OUTLETS } = load(inputs[1]), checks = [], before = JSON.stringify(PLACE_OUTLETS);
function check(name, run) { run(); checks.push(name); }
const outlet = PLACE_OUTLETS[0], rows = api.cashierPlaces(outlet), filters = { search: '' };
check('All eighteen places belong to explicitly supplied outlet', () => { assert.equal(rows.length, 18); assert.ok(rows.every(row => row.outlet.id === outlet.id)); });
check('Effective activity requires both outlet and place', () => { assert.equal(rows.filter(row => row.active).length, 17); assert.equal(api.cashierPlaces(PLACE_OUTLETS[4]).filter(row => row.active).length, 0); });
check('Area order follows configured outlet order', () => assert.deepEqual([...new Set(rows.map(row => row.area.id))], outlet.areas.map(area => area.id)));
check('Place order follows saved positions without sorting source in place', () => { const reordered = structuredClone(outlet); reordered.areas[0].places[0].position = 100; assert.equal(api.cashierPlaces(reordered)[6].place.id, reordered.areas[0].places[0].id); });
check('Equal positions preserve original source order', () => { const equal = structuredClone(outlet); equal.areas[0].places.forEach(place => place.position = 0); assert.deepEqual(api.cashierPlaces(equal).slice(0,7).map(row => row.place.id), outlet.areas[0].places.map(place => place.id)); });
check('Search trims and ignores case', () => assert.equal(api.filterCashierPlaces(rows, { search: '  KASIR 01  ' }).length, 1));
check('Search can match area name', () => assert.equal(api.filterCashierPlaces(rows, { search: 'indoor' }).length, 7));
check('Search can match kind label', () => assert.equal(api.filterCashierPlaces(rows, { search: 'counter' }).length, 1));
check('Area, search and inactive status combine', () => assert.equal(api.filterCashierPlaces(rows, { search: 'tunggu', areaId: outlet.areas[0].id, status: 'inactive' }).length, 1));
check('Area from another outlet cannot leak data', () => assert.equal(api.filterCashierPlaces(rows, { ...filters, areaId: PLACE_OUTLETS[1].areas[0].id }).length, 0));
check('Unmatched search stays empty', () => assert.equal(api.filterCashierPlaces(rows, { search: 'not-found' }).length, 0));
check('Whitespace search returns all records', () => assert.equal(api.filterCashierPlaces(rows, { search: '  ' }).length, rows.length));
check('Empty outlet returns no invented places', () => assert.deepEqual(api.cashierPlaces({ ...outlet, areas: [] }), []));
check('Empty data filter has no records', () => assert.deepEqual(api.filterCashierPlaces([], filters), []));
const area = outlet.areas[0], place = area.places[0];
check('Exact three IDs resolve same source object', () => assert.equal(api.findCashierPlace(PLACE_OUTLETS, outlet.id, area.id, place.id).place, place));
for (const [name, ids] of [
 ['wrong outlet', ['missing', area.id, place.id]], ['wrong area', [outlet.id, 'missing', place.id]], ['wrong place', [outlet.id, area.id, 'missing']],
 ['cross-outlet area', [PLACE_OUTLETS[1].id, area.id, place.id]], ['cross-area place', [outlet.id, outlet.areas[1].id, place.id]],
 ['missing ID', [outlet.id, area.id, undefined]], ['array outlet', [[outlet.id], area.id, place.id]], ['array area', [outlet.id, [area.id], place.id]], ['array place', [outlet.id, area.id, [place.id]]],
]) check('Reject ' + name + ' without first-record fallback', () => assert.equal(api.findCashierPlace(PLACE_OUTLETS, ...ids), undefined));
check('Removing a live source record makes its detail unavailable', () => { const changed = structuredClone(PLACE_OUTLETS); changed[0].areas[0].places.shift(); assert.equal(api.findCashierPlace(changed, outlet.id, area.id, place.id), undefined); });
check('Live outlet deactivation updates detail activity', () => { const changed = structuredClone(PLACE_OUTLETS); changed[0].active = false; assert.equal(api.findCashierPlace(changed, outlet.id, area.id, place.id).active, false); });
check('Kind capacity units remain distinct', () => { assert.equal(api.cashierPlaceKind(area.places[0]).unit, 'kursi'); assert.equal(api.cashierPlaceKind(area.places[3]).unit, 'operator'); assert.equal(api.cashierPlaceKind(area.places[5]).unit, 'rak'); });
check('Read-only projection and filters preserve complete source', () => assert.equal(JSON.stringify(PLACE_OUTLETS), before));
const result = { status: 'PASS', passed: checks.length, checks, checkedAt: new Date().toISOString(), inputs: inputs.map(file => ({ file, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') })), scope: 'Production pure helper and existing design fixture; no backend or native approval.' };
fs.writeFileSync(path.join(__dirname,'model-results.json'), JSON.stringify(result,null,2)); console.log(JSON.stringify({status: result.status, passed: result.passed}));
