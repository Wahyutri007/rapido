const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const folder = 'docs/qa/pm-cashier-publication-summary-2026-10-09';
const commit = process.argv[2];
const git = (args) => execFileSync('git', args, { cwd: root });
const read = (file) => commit ? git(['show', `${commit}:${file}`]) : fs.readFileSync(path.join(root, file));
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
function json(bytes) {
  const text = bytes[0] === 0xff && bytes[1] === 0xfe
    ? bytes.subarray(2).toString('utf16le') : bytes.toString('utf8').replace(/^\uFEFF/, '');
  return JSON.parse(text);
}
const manifest = json(read(folder + '/ARCHIVE_MANIFEST.json'));
assert.equal(manifest.baseCommit, '50d8196189d1c7bb945c385f961c5837f0b9c250');
const own = [folder + '/README.md', folder + '/ARCHIVE_MANIFEST.json', folder + '/verify-archive.cjs'];
const allowed = [...manifest.archivedFiles.map((item) => item.file), ...own].sort();
assert.equal(new Set(allowed).size, allowed.length, 'Duplicate archive path');
for (const item of manifest.archivedFiles) {
  assert(item.file.startsWith('docs/qa/pm-cashier-'), `Unexpected scope: ${item.file}`);
  assert(!item.file.split('/').includes('..'));
  const bytes = read(item.file);
  assert.equal(sha(bytes), item.sha256, `Hash mismatch: ${item.file}`);
  assert.equal(bytes.length, item.byteLength);
}
const changed = commit
  ? git(['diff', '--name-only', manifest.baseCommit, commit]).toString('utf8').trim().split(/\r?\n/).filter(Boolean)
  : [...git(['diff', '--name-only', manifest.baseCommit]).toString('utf8').trim().split(/\r?\n/).filter(Boolean), ...git(['ls-files', '--others', '--exclude-standard']).toString('utf8').trim().split(/\r?\n/).filter(Boolean)];
assert.deepEqual([...new Set(changed)].sort(), allowed, 'Git change scope differs from reviewed archive');
assert(allowed.every((file) => file.startsWith('docs/qa/pm-cashier-')), 'Production delta');
let parsedJson = 0;
for (const file of allowed.filter((file) => file.endsWith('.json'))) { json(read(file)); parsedJson += 1; }
const board = json(read('docs/qa/pm-cashier-intake-2026-10-09/TASKBOARD.json'));
assert.equal(new Set(board.tasks.map((task) => task.id)).size, board.tasks.length, 'Duplicate task id');
assert.equal(board.latestPublishedMain, manifest.baseCommit);
assert.equal(board.tasks.find((task) => task.id === 'QC-CASHIER-NAVBAR-VISUAL-001').status, 'PUBLISHED_SCOPED');
assert.equal(board.tasks.find((task) => task.id === 'QC-CASHIER-CATALOG-001').status, 'CHANGES_REQUESTED');
assert.equal(board.tasks.find((task) => task.id === 'QC-CASHIER-SEARCH-RESET-002').status, 'CHANGES_REQUESTED');
for (const file of own) read(file);
console.log(JSON.stringify({ status: 'PASS', mode: commit ? 'committed-git-blobs' : 'candidate-files', documentationFiles: allowed.length, archivedHashesMatched: manifest.archivedFiles.length, validJsonFiles: parsedJson, productionFilesChanged: 0, taskRecords: board.tasks.length }));
