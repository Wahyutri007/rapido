const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const files = ['app/(absence)/home.tsx','app/(absence)/_layout.tsx','store/useAbsenceStore.ts','lib/manage/absence.ts','types/ui/manage/absence.ts','components/feature/manage/absence/AbsenceCommon.tsx'];
const dir = path.join(__dirname, 'before');
if (fs.existsSync(dir)) throw new Error('Baseline already captured');
fs.mkdirSync(dir);
const hashes = {};
files.forEach((file, index) => {
 const bytes = fs.readFileSync(file);
 hashes[file] = crypto.createHash('sha256').update(bytes).digest('hex');
 fs.writeFileSync(path.join(dir, `${index}-${path.basename(file)}`), bytes);
});
fs.writeFileSync(path.join(__dirname,'baseline.json'), JSON.stringify(hashes,null,2)+'\n');
console.log('Captured six source contracts before edits.');
