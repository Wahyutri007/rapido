// Read-only observation: virtual Expo Router fixture does not execute these real layouts.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'fingerprints-before.json'), 'utf8')).files;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const allowed = ['app/(no-layout)/_layout.tsx', 'app/(no-layout)/(cashier)/catalog/_layout.tsx'];
const drift = Object.entries(before).filter(([file, expected]) => hash(file) !== expected).map(([file, expected]) => ({ file, testedContextHash: expected, observedAfterRunHash: hash(file) }));
assert.deepEqual(drift.map(entry => entry.file).sort(), allowed.sort());
const fixture = fs.readFileSync('.expo/senior6-stock-ui-entry.jsx', 'utf8');
assert.ok(fixture.includes("'./_layout.tsx':{default:Layout}"));
for (const file of allowed) assert.ok(!fixture.includes(file), file);
const result = { capturedAt: new Date().toISOString(), drift, virtualLayoutProvidedByFixture: true, rootLayoutsNotExecuted: true,
  ownerEvidence: 'SESSION_COORDINATION.md: Senior7 QC-HP-WARNING-001; two layouts 66399da5/1f55b421, removed invalid route registrations and search header moved to child.',
  limitations: 'Observation only. Does not approve Senior7 routing correction; full root/router/native remain separate QA/QC gates. Screen, actual UI/API dependencies and all other recorded contracts still match.' };
fs.writeFileSync(path.join(__dirname, 'context-drift.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
