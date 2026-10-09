// Application-root, one production screen plus its imported TypeScript closure.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), { spawnSync } = require('node:child_process');
const file = 'app/(no-layout)/manage/pos-settings/stock-limit.tsx';
const hash = () => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const beforeHash = hash();
const commands = [
  ['ESLint', process.execPath, ['node_modules/eslint/bin/eslint.js', file, '--no-cache', '--max-warnings', '0', '--format', 'json', '--output-file', path.join(__dirname, 'eslint.json')]],
  ['Biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', file]],
  ['TypeScript focused root', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '--project', '.expo/senior6-stock-tsconfig.json']],
  ['git diff whitespace', 'git.exe', ['diff', '--check', '--', file]],
];
const checks = commands.map(([name, executable, args]) => {
  const result = spawnSync(executable, args, { encoding: 'utf8', timeout: 120000, windowsHide: true });
  console.log(`${name}: exit ${result.status}`);
  return { name, executable, args, exitCode: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message };
});
const afterHash = hash();
const result = { source: file, beforeHash, afterHash, checks, limitations: 'One screen lint/format/whitespace; TypeScript root with dependency closure, not full-project gate. No production source edits.' };
fs.writeFileSync(path.join(__dirname, 'quality-results.json'), JSON.stringify(result, null, 2) + '\n');
assert.equal(beforeHash, afterHash); assert.ok(checks.every(check => check.exitCode === 0 && !check.error));
