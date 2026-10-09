const fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');
const file = path.join(__dirname, 'proposal/SuccessModal.tsx');
const format = spawnSync(process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'format', '--stdin-file-path=components/common/SuccessModal.tsx'], { encoding: 'utf8', input: fs.readFileSync(file, 'utf8') });
if (format.status !== 0) throw Error(format.stderr || format.stdout);
fs.writeFileSync(file, format.stdout);
fs.copyFileSync(file, '.expo/qc-success-modal-candidate.tsx');
console.log('Proposal formatted; application source unchanged.');
