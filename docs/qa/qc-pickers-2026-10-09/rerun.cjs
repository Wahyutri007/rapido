// Run from application root. Reuse reviewed developer suites with separate QC output.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const suite = process.argv[2];
const entries = {
  availability:'select-availability/availability.cjs',
  form:'select-availability/form-integration.cjs',
  'single-select':'shared-picker-lifecycle.cjs',
  sort:'shared-picker-lifecycle.cjs',
};
if (!(suite in entries)) throw Error('Unknown picker suite');
const developerDir = path.resolve('docs/qa/senior-7-2026-10-09');
const manifest = JSON.parse(fs.readFileSync(path.join(developerDir, 'select-availability/verification.json')));
const shared = JSON.parse(fs.readFileSync(path.join(developerDir, 'shared-verification.json')));
const fingerprint = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const expected = [...manifest.files, ...manifest.readOnlyIntegrationSources, ...manifest.harnesses,
  shared.files.find(file => file.file.endsWith('/SortActionSheet.tsx'))];
for (const file of expected) if (fingerprint(file.file) !== file.sha256) throw Error('Handoff no longer matches: '+file.file);
const scope = [...expected.map(file => file.file), 'components/common/BouncyPressable.tsx'];
const hashes = () => Object.fromEntries(scope.map(file => [file, fingerprint(file)]));
const before = hashes();
process.on('exit', () => {
  const after = hashes();
  const stable = JSON.stringify(before) === JSON.stringify(after);
  fs.writeFileSync(path.join(__dirname, suite+'-snapshot.json'), JSON.stringify({before,after,stable},null,2)+'\n');
  if (!stable) process.exitCode = 1;
});
const original = path.join(developerDir, entries[suite]);
const source = fs.readFileSync(original,'utf8');
const mod = {exports:{}};
const localRequire = createRequire(original);
const wrappedRequire = id => localRequire(id);
wrappedRequire.main = mod;
const output = Object.create(console);
output.log = value => {
  try {
    const result = JSON.parse(value);
    console.log(JSON.stringify({suite,passed:result.passed ?? result.count,failed:result.failed ?? 0}));
  } catch { console.log(value); }
};
new Function('require','module','__dirname','__filename','console',source)(wrappedRequire,mod,__dirname,original,output);
