const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const old=JSON.parse(fs.readFileSync('docs/qa/codex-4-2026-10-09/cashier-location/verification.json','utf8'));
const files=[...old.sourceFiles,...old.readOnlyContracts,'components/common/BottomActionBar.tsx'];
const result={recordedAt:new Date().toISOString(),inputs:files.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))};
fs.writeFileSync(path.join(__dirname,'source-inputs.json'),JSON.stringify(result,null,2));console.log(`Recorded ${files.length} current source/contract inputs`);
