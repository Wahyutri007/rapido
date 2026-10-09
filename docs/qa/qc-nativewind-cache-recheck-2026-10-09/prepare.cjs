const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const root = __dirname;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const handoffDir = 'docs/qa/senior-7-2026-10-09/startup/style-recheck';
const previousDir = 'docs/qa/qc-nativewind-cache-2026-10-09';
const handoff = read(handoffDir + '/verification.json'), previous = read(previousDir + '/DECISION.json');
assert.equal(handoff.status, 'READY_FOR_QC_RECHECK');
assert.equal(handoff.finding, 'QC-STARTUP-CACHE-001');
assert.equal(previous.status, 'CHANGES_REQUESTED');
assert.ok(!fs.existsSync(path.join(root, 'source-before.json')), 'Review already prepared; do not overwrite snapshots.');
const inputs = [...handoff.files, handoff.dependency, ...handoff.evidence];
const currentMatches = inputs.map(item => ({file:item.file,expected:item.sha256,actual:hash(item.file)}));
for (const item of currentMatches) assert.equal(item.actual, item.expected, 'Handoff drift: ' + item.file);
fs.mkdirSync(path.join(root, 'before'), {recursive:true});
fs.mkdirSync(path.join(root, 'reviewed'), {recursive:true});
const oldSnapshots = handoff.files.map(item => {
  const old = handoffDir + '/before/' + path.basename(item.file) + '.txt';
  const expected = previous.sourceFiles[item.file];
  assert.equal(hash(old), expected, 'Historical source mismatch: ' + item.file);
  fs.copyFileSync(old, path.join(root,'before',path.basename(item.file)+'.txt'));
  fs.copyFileSync(item.file, path.join(root,'reviewed',path.basename(item.file)+'.txt'));
  return {file:old,expected};
});
const historical = read(previousDir + '/artifact-manifest.json').files.map(item => ({file:previousDir + '/' + item.file,expected:item.sha256}));
const originalHandoff = read('docs/qa/senior-7-2026-10-09/startup/verification.json');
historical.push(...originalHandoff.evidence.map(item=>({file:item.file,expected:item.sha256})));
for (const item of historical) assert.equal(hash(item.file), item.expected, 'Historical evidence drift: ' + item.file);
const extras = ['package.json','package-lock.json','biome.json','eslint.config.js','tailwind.config.js','global.css',
  'node_modules/react-native-css-interop/package.json','node_modules/nativewind/package.json','node_modules/nativewind/dist/metro/index.js',
  handoffDir + '/verification.json', 'docs/qa/senior-7-2026-10-09/startup/verification.json', previousDir + '/artifact-manifest.json'];
const hashes = Object.fromEntries([...new Set([...inputs.map(x=>x.file),...oldSnapshots.map(x=>x.file),...extras])].map(file=>[file,hash(file)]));
const cache = 'node_modules/react-native-css-interop/.cache/android.js';
const data = fs.readFileSync(cache);
assert.equal(hash(cache), previous.activeAndroidCache.sha256);
assert.ok(data.includes(Buffer.from('class dark')));
const result = {capturedAt:new Date().toISOString(),scope:'Four CJS files only; code quality and cache/queue compatibility recheck. Native/routing/SDK gate separate.',currentMatches,oldSnapshots,historicalMatches:historical,hashes,androidCache:{file:cache,sha256:hash(cache),bytes:data.length,hasClassDarkFlag:true}};
fs.writeFileSync(path.join(root,'source-before.json'),JSON.stringify(result,null,2)+'\n');
for (const name of ['guard-boundaries.cjs','queue-boundaries.cjs']) {
  const original = previousDir + '/' + name;
  const content = fs.readFileSync(original,'utf8');
  // Both QC directories have identical depth; no require/root adaptation needed.
  fs.writeFileSync(path.join(root,name),content);
  assert.equal(hash(path.join(root,name)),hash(original));
}
fs.writeFileSync(path.join(root,'runner-provenance.json'),JSON.stringify({copies:['guard-boundaries.cjs','queue-boundaries.cjs'].map(name=>({original:previousDir+'/'+name,originalHash:hash(previousDir+'/'+name),copy:name,copyHash:hash(path.join(root,name)),byteIdentical:true})),initializer:'Run actual scripts/verify-nativewind-cache.cjs with output in own QC folder',queue:'Run actual scripts/verify-metro-cache.cjs in isolated VM; stdout captured in own QC folder'},null,2)+'\n');
fs.appendFileSync('docs/SESSION_COORDINATION.md','\n\n## QC - QC-STARTUP-CACHE-001 RECHECK IN_PROGRESS (9 Oktober 2026)\n\nScope empat CJS final Senior7: metro.config.js, preserve-nativewind-cache.cjs, verify-nativewind-cache.cjs, verify-metro-cache.cjs. Handoff style-recheck READY_FOR_QC_RECHECK dan empat snapshot before cocok keputusan QC lama. Folder reviewer baru docs/qa/qc-nativewind-cache-recheck-2026-10-09/. Validasi scoped ESLint/Biome/diff/syntax, AST delta dan initializer/guard/queue terisolasi; tambahan jalur cleanup/error bila diperlukan. Tidak mengambil warning rute/runtime HP milik Senior7, dependency SDK, source modal/Stock/auth/sesi lain. Paket developer/QC lama frozen.\n\nExecution Profile & Operator Tips: Medium. Hash -> replay41 dan queue -> batas AST/cleanup -> quality -> closure temuan bila lulus -> PM. Tidak require root Metro nyata/bundle/server/HP/backend/dependency/fullTS/Git index/branch/commit/push/merge; operasi direktori sementara memakai target absolute yang divalidasi. Cache aktif diamati baca sebelum/sesudah, tidak ditulis.\n');
console.log(JSON.stringify({prepared:true,currentFingerprintMatches:currentMatches.length,historicalFingerprintMatches:historical.length,trackedInputs:Object.keys(hashes).length,androidCache:result.androidCache}));
