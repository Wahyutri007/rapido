// Apply the exact QC-proposed import-only patch after checking every source hash.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const qc='docs/qa/qc-manage-forms-2026-10-09';
const findings=JSON.parse(fs.readFileSync(qc+'/style-findings.json','utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(findings.finding!=='QC-MANAGE-FORMS-001'||findings.proposalVerification.length!==7)throw new Error('Unexpected patch scope');
const before=findings.proposalVerification.map(item=>({file:item.file,expected:item.originalSha256,actual:hash(item.file)}));
if(before.some(item=>item.expected!==item.actual))throw new Error('Source differs from QC patch baseline; refusing overwrite');
const check=spawnSync('git',['apply','--check',qc+'/'+findings.proposal],{encoding:'utf8'});
if(check.status!==0)throw new Error(check.stderr||check.stdout);
for(const item of before){const file=path.join(__dirname,'baseline',item.file+'.txt');fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(item.file,file,fs.constants.COPYFILE_EXCL);}
const applied=spawnSync('git',['apply',qc+'/'+findings.proposal],{encoding:'utf8'});
if(applied.status!==0)throw new Error(applied.stderr||applied.stdout);
// Git on Windows may write CRLF; Biome's project format uses LF.
const normalized=spawnSync(process.execPath,['node_modules/@biomejs/biome/bin/biome','format','--write',...before.map(item=>item.file)],{encoding:'utf8'});
if(normalized.status!==0)throw new Error(normalized.stderr||normalized.stdout);
const after=findings.proposalVerification.map(item=>({file:item.file,expected:item.proposalSha256,actual:hash(item.file)}));
const result={owner:'Codex-3',finding:findings.finding,patch:qc+'/'+findings.proposal,patchSha256:hash(qc+'/'+findings.proposal),before,after,allProposalHashesMatch:after.every(item=>item.expected===item.actual)};
fs.writeFileSync(path.join(__dirname,'apply-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({files:after.length,allProposalHashesMatch:result.allProposalHashesMatch}));process.exitCode=result.allProposalHashesMatch?0:1;
