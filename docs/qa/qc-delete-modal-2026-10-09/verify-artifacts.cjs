const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const packet=__dirname,manifest=path.join(packet,'verification.json'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function files(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(item=>{const file=path.join(folder,item.name);return item.isDirectory()?files(file):[file];});}
const current=()=>files(packet).filter(f=>f!==manifest).map(f=>({path:path.relative(packet,f).replaceAll('\\','/'),sha256:hash(f),bytes:fs.statSync(f).size})).sort((a,b)=>a.path.localeCompare(b.path));
if(process.argv.includes('--seal')){
 assert.ok(!fs.existsSync(manifest),'A frozen manifest must not be regenerated');
 const decision=JSON.parse(fs.readFileSync(path.join(packet,'DECISION.json'),'utf8'));
 const data={owner:'QC',sealedAt:new Date().toISOString(),signal:decision.signal,status:decision.status,source:decision.source,proposal:decision.findings[0].proposal,artifacts:current(),limits:'Default verifies frozen packet artifacts and local report links only. Source/dependency changes after seal do not rewrite this historical decision.'};
 fs.writeFileSync(manifest,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({sealed:true,artifacts:data.artifacts.length}));
}else{
 const record=JSON.parse(fs.readFileSync(manifest,'utf8')),now=current();assert.deepEqual(now,record.artifacts,'Frozen artifact fingerprint/list mismatch');
 const report=fs.readFileSync(path.join(packet,'REPORT.md'),'utf8');const links=[...report.matchAll(/\]\(([^)]+)\)/g)].map(x=>x[1]).filter(x=>!/^https?:/.test(x));
 for(const link of links){const target=path.resolve(packet,link);assert.ok(target.startsWith(packet+path.sep));assert.ok(fs.existsSync(target),'Missing local link '+link);}
 const decision=JSON.parse(fs.readFileSync(path.join(packet,'DECISION.json'),'utf8'));assert.equal(decision.signal,record.signal);assert.equal(decision.status,record.status);assert.equal(decision.findings[0].proposal.applied,false);
 console.log(JSON.stringify({verified:true,artifacts:now.length,localReportLinks:links.length,signal:record.signal,readOnly:true}));
}
