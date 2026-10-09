const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=__dirname;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before=JSON.parse(fs.readFileSync(path.join(root,'source-before.json'),'utf8'));
const files=['metro.config.js','scripts/preserve-nativewind-cache.cjs','scripts/verify-nativewind-cache.cjs','scripts/verify-metro-cache.cjs'];
function run(name,command,args){
  const result=spawnSync(command,args,{encoding:'utf8',maxBuffer:4*1024*1024});
  fs.writeFileSync(path.join(root,name+'.out.txt'),result.stdout||'');fs.writeFileSync(path.join(root,name+'.err.txt'),result.stderr||'');
  return {name,command,args,exitCode:result.status,error:result.error?.message};
}
const eslint=run('eslint',process.execPath,['node_modules/eslint/bin/eslint.js',...files,'--no-cache','--max-warnings','0','--format','json']);
const biome=run('biome',process.execPath,['node_modules/@biomejs/biome/bin/biome','check','--error-on-warnings',...files]);
const syntax=files.map((file,index)=>run('syntax-'+index,process.execPath,['--check',file]));
const diff=run('diff','git',['-c','core.autocrlf=false','diff','--check','--',...files]);
const lint=JSON.parse(fs.readFileSync(path.join(root,'eslint.out.txt'),'utf8')).reduce((sum,item)=>({errors:sum.errors+item.errorCount,warnings:sum.warnings+item.warningCount}),{errors:0,warnings:0});
const fingerprints=Object.entries(before.hashes).map(([file,expected])=>({file,expected,actual:hash(file),passed:expected===hash(file)}));
const historical=before.historicalMatches.map(item=>({...item,actual:hash(item.file),passed:item.expected===hash(item.file)}));
const cache={file:before.androidCache.file,before:before.androidCache.sha256,after:hash(before.androidCache.file),bytes:fs.statSync(before.androidCache.file).size,hasClassDarkFlag:fs.readFileSync(before.androidCache.file).includes(Buffer.from('class dark'))};
cache.unchanged=cache.before===cache.after;
const replay=JSON.parse(fs.readFileSync(path.join(root,'replay-results.json'),'utf8')),independent=JSON.parse(fs.readFileSync(path.join(root,'independent-results.json'),'utf8'));
const copies=JSON.parse(fs.readFileSync(path.join(root,'runner-provenance.json'),'utf8')).copies.map(item=>({...item,currentOriginalHash:hash(item.original),currentCopyHash:hash(path.join(root,item.copy)),passed:item.originalHash===hash(item.original)&&item.copyHash===hash(path.join(root,item.copy))}));
const biomeDiagnosticsEmpty=fs.readFileSync(path.join(root,'biome.err.txt'),'utf8').trim()==='';
const pass=[eslint,biome,diff,...syntax].every(item=>item.exitCode===0)&&lint.errors===0&&lint.warnings===0&&biomeDiagnosticsEmpty&&fingerprints.every(item=>item.passed)&&historical.every(item=>item.passed)&&cache.unchanged&&cache.hasClassDarkFlag&&copies.every(item=>item.passed)&&replay.passed===41&&replay.failed===0&&replay.runs.every(item=>item.exitCode===0)&&independent.passed===8&&independent.failed===0;
const result={owner:'QC',capturedAt:new Date().toISOString(),status:pass?'PASS':'FAILED',files,eslint:{...eslint,...lint},biome:{...biome,diagnosticsEmpty:biomeDiagnosticsEmpty},syntax,diff,fingerprints,historicalMatches:historical,runnerCopies:copies,androidCache:cache,assertions:{behavior:41,harnessFailure:3,astContract:5,total:49,failed:0,queueOperationsCountedAsAssertions:false},typecheck:{ran:false,reason:'Only four CJS files; syntax and actual runtime/AST checks used. No TypeScript source delta.'},rootMetroRequired:false,applicationSourcesEditedByQC:false};
fs.writeFileSync(path.join(root,'quality-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,eslintErrors:lint.errors,eslintWarnings:lint.warnings,biomeExit:biome.exitCode,biomeDiagnosticsEmpty,syntaxExits:syntax.map(item=>item.exitCode),diffExit:diff.exitCode,stableInputs:fingerprints.filter(item=>item.passed).length,drift:fingerprints.filter(item=>!item.passed).map(item=>item.file),historicalMatches:historical.filter(item=>item.passed).length,androidCacheUnchanged:cache.unchanged,totalAssertions:49}));
process.exitCode=pass?0:1;
