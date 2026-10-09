const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const old=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../sales-target-navigation/source-inputs.json'),'utf8'));
const files=[...old.inputs.map(x=>x.file),'components/common/Card.tsx','components/custom/BottomTab.tsx'];
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const file=path.join(__dirname,'source-inputs.json');
if(process.argv.includes('--capture')){
 assert.ok(!fs.existsSync(file),'Snapshot exists; preserve it.');
 const inputs=files.map((f,i)=>({file:f,sha256:digest(f),...(f.endsWith('.cache/web.css')?{servedFile:path.relative(process.cwd(),path.join(__dirname,'input-snapshots',`${String(i).padStart(2,'0')}-${path.basename(f)}`)).replaceAll('\\','/')}:{})}));
 fs.mkdirSync(path.join(__dirname,'input-snapshots'),{recursive:true});
 for(const [i,x] of inputs.entries())fs.copyFileSync(x.file,path.join(__dirname,'input-snapshots',`${String(i).padStart(2,'0')}-${path.basename(x.file)}`));
 const delta=inputs.filter(x=>old.inputs.some(i=>i.file===x.file&&i.sha256!==x.sha256));
 const sourceDelta=delta.filter(x=>!x.servedFile);
 assert.deepEqual(sourceDelta.map(x=>x.file),['components/common/SearchBar.tsx','components/common/SingleSelect.tsx']);
 assert.equal(inputs[0].sha256,old.inputs[0].sha256);
 fs.writeFileSync(file,JSON.stringify({capturedAt:new Date().toISOString(),sourceDelta:0,coveredLayout:old.owned,inputs,externalOverlay:sourceDelta,generatedStyleOverlay:delta.filter(x=>x.servedFile),scope:'44 selected feature/navigation/shared/auth/build source inputs and one served production CSS snapshot; not full import graph.'},null,2)+'\n');
}else{const s=JSON.parse(fs.readFileSync(file));for(const i of s.inputs)assert.equal(digest(i.servedFile||i.file),i.sha256,i.file);console.log(`PASS ${s.inputs.length} tested inputs unchanged (44source+CSS snapshot).`);}
