const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const root='D:/Rapido-QC-temp/pm-main-2026-10-09',out=path.join(root,'docs/qa/pm-main-integration-2026-10-09');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
fs.mkdirSync(out,{recursive:true});
const income=path.join(out,'income-recheck');fs.mkdirSync(income,{recursive:true});
fs.copyFileSync(path.join(root,'docs/qa/qc-income-2026-10-09/lifecycle.cjs'),path.join(income,'lifecycle.cjs'));
let expense=fs.readFileSync(path.join(root,'docs/qa/qc-income-2026-10-09/expense-proposal.cjs'),'utf8');
assert(expense.includes("'lifecycle.cjs'"));
expense=expense.replace("[runner, '--proposal']",'[runner]').replace("tested: 'PROPOSAL_ONLY_NOT_APPLIED'","tested: 'CURRENT_INTEGRATION_SOURCE'");
fs.writeFileSync(path.join(income,'expense.cjs'),expense);
const published={};
for (const branch of ['fix/android-usb-launcher','fix/auth-bootstrap-lifecycle','fix/onboarding-transition-lifecycle','fix/barcode-lifecycle']) {
  const files=cp.execFileSync('git',['diff','--name-only','origin/integration/expo-sdk57..origin/'+branch,'--','app','components','api','hooks','context','scripts','package.json','tailwind.config.js'],{cwd:root}).toString().trim().split('\n').filter(Boolean);
  published[branch]=files.map(file=>{const prior=cp.execFileSync('git',['show','origin/'+branch+':'+file],{cwd:root,maxBuffer:5e6});const current=fs.readFileSync(path.join(root,file));return {file,publishedSha256:hash(prior),integratedSha256:hash(current),matches:hash(prior)===hash(current)};});
}
fs.writeFileSync(path.join(out,'published-source-overlays.json'),JSON.stringify(published,null,2)+'\n');
console.log(JSON.stringify({created:income,publishedMatches:Object.values(published).flat().filter(i=>i.matches).length,publishedDifferences:Object.values(published).flat().filter(i=>!i.matches).map(i=>i.file)}));
