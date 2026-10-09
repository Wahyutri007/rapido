const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const inputFile = path.join(__dirname, 'SuccessModal.candidate.txt');
const input = fs.readFileSync(inputFile, 'utf8');
const result = cp.spawnSync(process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', '--write', '--stdin-file-path', 'components/common/SuccessModal.tsx'], { input, encoding: 'utf8' });
const outputFile = path.join(__dirname, 'biome-formatted.txt');
fs.writeFileSync(outputFile, result.stdout);
console.log(JSON.stringify({ exit: result.status, stderr: result.stderr, lengths: [input.length, result.stdout.length], equal: input === result.stdout, lastInput: input.slice(-100), lastOutput: result.stdout.slice(-100) }));
const diff = cp.spawnSync('git', ['diff', '--no-index', '--', inputFile, outputFile], { encoding: 'utf8' });
console.log(diff.stdout);
