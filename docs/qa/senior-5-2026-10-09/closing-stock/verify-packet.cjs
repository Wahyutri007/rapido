// Read-only verification: no replay output is written into this frozen packet.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts.json')));
for (const [file, expected] of Object.entries(manifest.files)) {
  assert.equal(hash(path.join(__dirname, file)), expected, 'Packet drift: ' + file);
}
const result = { artifacts: Object.keys(manifest.files).length, matched: true };
if (process.argv.includes('--source')) {
  const verification = JSON.parse(fs.readFileSync(path.join(__dirname, 'verification.json')));
  for (const [file, expected] of Object.entries(verification.ownedSourceHashes)) {
    assert.equal(hash(file), expected, 'Owned source drift: ' + file);
  }
  result.ownedSources = Object.keys(verification.ownedSourceHashes).length;
  result.sharedScope = 'Shared integration hashes are historical snapshots, not whole-file approval.';
}
console.log(JSON.stringify(result));
