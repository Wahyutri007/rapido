const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const developer = 'docs/qa/codex-3/success-modal-size', latest = 'docs/qa/codex-3/alert-modal-size';
const current = 'docs/qa/qc-success-modal-2026-10-09';
const success = JSON.parse(fs.readFileSync(developer + '/verification.json'));
const alert = JSON.parse(fs.readFileSync(latest + '/verification.json'));
assert.equal(success.status, 'READY_FOR_QC_RECHECK');
const handoff = { ...success.sourceHashes, ...alert.sourceHashes, ...alert.contractHashes, ...Object.fromEntries(success.inputMatches.filter(x => !x.file.includes('/.cache/')).map(x => [x.file, x.expected])) };
const handoffMatches = Object.entries(handoff).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
assert.ok(handoffMatches.every(x => x.passed), 'Current source/primitives/contract fingerprint mismatch');
const source = 'components/common/SuccessModal.tsx';
const oldContractChanges = Object.entries(success.contractHashes).filter(([file, expected]) => expected !== hash(file)).map(([file, expected]) => ({ file, historicalHash: expected, currentHash: hash(file), matchesLatestHandoff: handoff[file] === hash(file) }));
assert.ok(oldContractChanges.every(x => x.matchesLatestHandoff));
const historicalMatches = [developer, latest].flatMap(folder => {
  const manifest = JSON.parse(fs.readFileSync(folder + '/verification.json'));
  return Object.entries(manifest.artifactFingerprints).map(([name, expected]) => ({ file: folder + '/' + name, expected, actual: hash(folder + '/' + name), passed: expected === hash(folder + '/' + name) }));
});
assert.ok(historicalMatches.every(x => x.passed), 'Developer historical evidence changed');
const extra = ['api/axios.ts', 'assets/images/illustrations/index.ts', 'assets/images/illustrations/action-success.png', 'constants/Fonts.ts', 'components/common/Wrapper.tsx', 'components/common/SearchBar.tsx', 'components/common/MultiSelect.tsx', 'components/ui/modal/index.tsx', 'components/ui/button/index.tsx', 'components/common/Text.tsx', 'components/ui/gluestack-ui-provider/index.web.tsx', 'hooks/useListContent.ts', 'hooks/useSearch.ts', 'api/hooks/pos-settings.ts', 'tsconfig.json', 'babel.config.js', 'global.css', 'scripts/preserve-nativewind-cache.cjs', 'node_modules/react-native-css-interop/.cache/android.js', 'node_modules/react-native-css-interop/.cache/web.css', developer + '/verification.json', latest + '/verification.json', 'docs/qa/qc-stock-ui-2026-10-09/DECISION.json'];
// Keep optional helper paths only when actually present; screen imports are inspected separately.
const files = [...new Set([...Object.keys(handoff), ...extra.filter(file => fs.existsSync(file))])];
fs.writeFileSync(path.join(__dirname, 'source-before.json'), JSON.stringify({ createdAt: new Date().toISOString(), hashes: Object.fromEntries(files.map(file => [file, hash(file)])), handoffMatches, oldContractChanges, historicalMatches, scope: 'Only SuccessModal geometry and QC-STOCK-UI-001; latest Alert/Delete are tested dependencies, not approved deltas.' }, null, 2) + '\n');
fs.copyFileSync(source, path.join(__dirname, 'SuccessModal.reviewed.tsx.txt'));
fs.copyFileSync(developer + '/SuccessModal.before.tsx.txt', path.join(__dirname, 'SuccessModal.before.tsx.txt'));
assert.equal(hash(path.join(__dirname, 'SuccessModal.before.tsx.txt')), success.baselineHash);
fs.copyFileSync(developer + '/modal-entry.fixture.jsx', '.expo/qc-success-modal-entry.jsx');
fs.copyFileSync(developer + '/stock-entry.fixture.jsx', '.expo/qc-success-stock-entry.jsx');
fs.copyFileSync('.expo/qc-success-modal-entry.jsx', path.join(__dirname, 'modal-entry.fixture.jsx'));
fs.copyFileSync('.expo/qc-success-stock-entry.jsx', path.join(__dirname, 'stock-entry.fixture.jsx'));
fs.copyFileSync('node_modules/react-native-css-interop/.cache/web.css', path.join(__dirname, 'web.css'));
fs.mkdirSync(path.join(__dirname, 'stock-final'), { recursive: true });
fs.copyFileSync(developer + '/stock-final/web-before.css', path.join(__dirname, 'stock-final/web-before.css'));
let modalRunner = fs.readFileSync(developer + '/modal-browser.cjs', 'utf8');
modalRunner = modalRunner.replaceAll('codex-3-success-modal-entry', 'qc-success-modal-entry');
assert.equal(modalRunner.replaceAll('qc-success-modal-entry', 'codex-3-success-modal-entry'), fs.readFileSync(developer + '/modal-browser.cjs', 'utf8'));
fs.writeFileSync(path.join(__dirname, 'modal-browser.cjs'), modalRunner);
const stockRunner = fs.readFileSync(developer + '/stock-browser.cjs', 'utf8').replaceAll('codex-3-success-stock-entry', 'qc-success-stock-entry');
assert.equal(stockRunner.replaceAll('qc-success-stock-entry', 'codex-3-success-stock-entry'), fs.readFileSync(developer + '/stock-browser.cjs', 'utf8'));
fs.writeFileSync(path.join(__dirname, 'stock-browser.cjs'), stockRunner);
fs.mkdirSync(path.join(__dirname, 'delete-lifecycle'), { recursive: true });
// The latest supplement runs the same 156 scenarios on the current three shared modals.
fs.copyFileSync(latest + '/delete-lifecycle/check.cjs', path.join(__dirname, 'delete-lifecycle/check.cjs'));
const fixtureHashes = Object.fromEntries(['.expo/qc-success-modal-entry.jsx', '.expo/qc-success-stock-entry.jsx'].map(file => [file, hash(file)]));
fs.writeFileSync(path.join(__dirname, 'fixture-before.json'), JSON.stringify(fixtureHashes, null, 2) + '\n');
const coordination = 'docs/SESSION_COORDINATION.md';
const note = `

## QC - SD3-007 SuccessModal RECHECK IN_PROGRESS (9 Oktober 2026)

Scope satu shared SuccessModal hash ${hash(source)}, recheck QC-STOCK-UI-001P2. Folder docs/qa/qc-success-modal-2026-10-09/. Penerimaan belum ada handoff koreksi, tetap3OPEN. Source/primitives/Stock/3dialog cocok; dua dependency historis Delete/Alert telah berubah dan dicocokkan ke supplement SD3-009 terkini DABC/76b6, bukan pin campuran histori. Replay browserStock36/shared51 ke entry .expo QC sendiri dan lifecycle156 dari supplement terbaru. Tambahan orientasi/resize pendek untuk memastikan aksi tetap terlihat; nilai hasil aktual sebelum closure. Quality satu source dan tipe terfokus. AGENTS_UI dibaca, legacy tokens tidak dirombak. Figma callable tidak tersedia.

Menggunakan Metro8088 existing PID9200 hanya untuk bundling entry fixture, tanpa restart/config/perubahan server atau HP. Browser Edge headless, Axios IO fixture dan HTTP eksternal diblokir. Source/helper/modal/Stock/account/auth sesi lain tidak diedit. Snapshot native cache/source/config sebelum dan sesudah; tidak API/backend/DB/persistensi nyata/dependency/globalTS/Git publikasi/PDFhistori. Kelulusan dependency bukan approval seluruh Alert/Delete/3domain/native/callerinventory.

Execution Profile & Operator Tips: Medium untuk viewport window dan lifetime resize. Hash -> browserportrait/Stock -> orientasi/resize -> quality -> keputusan/patch salinan bila perlu -> QA/PM. Pertahankan server/cache/harness historis, bedakan browser dari HP native.
`;
if (!fs.readFileSync(coordination, 'utf8').includes('## QC - SD3-007 SuccessModal RECHECK IN_PROGRESS')) fs.appendFileSync(coordination, note);
console.log(JSON.stringify({ handoffMatched: handoffMatches.length, oldContractChanges, historicalMatched: historicalMatches.length, trackedFiles: files.length, fixtures: fixtureHashes, applicationEdited: false }));
