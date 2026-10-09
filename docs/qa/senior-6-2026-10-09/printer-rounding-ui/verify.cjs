// Application-root; default read-only, --seal creates a new manifest once.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const output=__dirname,manifestPath=path.join(output,'verification.json');
const read=name=>JSON.parse(fs.readFileSync(path.join(output,name),'utf8').replace(/^\uFEFF/,''));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources={
 'app/(no-layout)/manage/printer/modify.tsx':'0174597063bea4d9604925c4d3e43c52160ec4c3a4ab1685c3338866578bf126',
 'app/(no-layout)/manage/pos-settings/rounding.tsx':'79893f4bd22b9d85cd42287d12dfadc9f9dac7df3c978312b69071dd8e191ba8'
};
for(const[file,expected]of Object.entries(sources))assert.equal(hash(file),expected,file);
const ui=read('browser-results.json'),audit=read('token-audit.json'),quality=read('quality-results.json'),eslint=read('eslint.json');
assert.equal(ui.checks.length,47);assert.ok(ui.checks.every(check=>check.passed));assert.ok(!ui.error);
for(const key of ['drift','runtimeErrors','consoleErrors','blockedRequests'])assert.deepEqual(ui[key],[]);
assert.deepEqual(ui.sourceHashes,ui.afterHashes);for(const[file,expected]of Object.entries(ui.sourceHashes))assert.equal(hash(file),expected,file);
assert.equal(audit.results.length,2);assert.equal(audit.results.reduce((sum,result)=>sum+result.before.count,0),17);
for(const result of audit.results){assert.equal(result.after.count,0);assert.ok(result.logicBeforeJsxIdentical&&result.eventAttributesIdentical);assert.equal(result.sourceHash,sources[result.source]);}
assert.ok(audit.results.find(result=>result.source.endsWith('rounding.tsx')).classNameOnlyDelta);
assert.deepEqual(quality.before,sources);assert.deepEqual(quality.after,sources);assert.equal(quality.checks.length,4);assert.ok(quality.checks.every(check=>check.exitCode===0&&!check.error));
assert.equal(eslint.length,2);assert.ok(eslint.every(result=>result.errorCount===0&&result.warningCount===0));
assert.equal(hash(path.join(output,'ui-entry.jsx')),hash('.expo/senior6-printer-pos-ui-entry.jsx'));
assert.equal(hash(path.join(output,'scoped-tsconfig.json')),hash('.expo/senior6-printer-pos-tsconfig.json'));
const stockHash='0b61bef95fe023f1aa685560151c716c4c58faed9164509cd70546262878cc9d';assert.equal(hash('app/(no-layout)/manage/pos-settings/stock-limit.tsx'),stockHash);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const file=path.join(dir,entry.name);return entry.isDirectory()?walk(file):file===manifestPath?[]:[file];});}
const artifacts=Object.fromEntries(walk(output).map(file=>[path.relative(output,file).replace(/\\/g,'/'),hash(file)]));
const summary={browserChecks:47,failed:0,runtimeErrors:0,consoleErrors:0,externalHttpAttempts:0,uiFingerprints:Object.keys(ui.sourceHashes).length,tokenAudit:{before:17,after:0},qualityChecks:4,scopedTypeScriptDiagnostics:0,stockSourceUnchanged:stockHash};
if(process.argv.includes('--seal')){
 assert.ok(!fs.existsSync(manifestPath),'Do not overwrite frozen evidence');
 fs.writeFileSync(manifestPath,JSON.stringify({capturedAt:new Date().toISOString(),owner:'Software Developer Senior 6',status:'READY_FOR_QA',sources,sourceHashes:ui.sourceHashes,summary,artifacts,limitations:'Developer UI/transport/navigation fixture; not independent QA/QC, full auth/router/native/Figma/API/printer hardware certification. Prior QA/QC snapshots remain historical.'},null,2)+'\n');
}else{const manifest=read('verification.json');assert.deepEqual(manifest.sources,sources);assert.deepEqual(manifest.sourceHashes,ui.sourceHashes);assert.deepEqual(manifest.artifacts,artifacts);assert.deepEqual(manifest.summary,summary);}
console.log(JSON.stringify({status:'READY_FOR_QA',sources,artifacts:Object.keys(artifacts).length,summary}));
