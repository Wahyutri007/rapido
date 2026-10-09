const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const runs=[
  ['initializer',['scripts/verify-nativewind-cache.cjs',path.join(__dirname,'initializer-results.json')]],
  ['guard',['docs/qa/qc-nativewind-cache-recheck-2026-10-09/guard-boundaries.cjs']],
  ['queue-boundaries',['docs/qa/qc-nativewind-cache-recheck-2026-10-09/queue-boundaries.cjs']],
  ['queue-stress',['scripts/verify-metro-cache.cjs']],
];
const results=[];
for(const [name,args] of runs){
  const run=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:4*1024*1024});
  fs.writeFileSync(path.join(__dirname,name+'.out.txt'),run.stdout||'');
  fs.writeFileSync(path.join(__dirname,name+'.err.txt'),run.stderr||'');
  results.push({name,args,exitCode:run.status,error:run.error?.message});
  assert.equal(run.status,0,'Replay failure: '+name+' '+run.stderr);
}
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8'));
const initializer=read('initializer-results.json'),guard=read('guard-boundaries-results.json'),queue=read('queue-boundaries-results.json');
const stress=read('queue-stress.out.txt');
assert.equal(initializer.count,10);assert.equal(guard.count,16);assert.equal(queue.count,15);
assert.equal(stress.reads,3000);assert.equal(stress.writes,200);assert.equal(stress.maximumOpenRequests,64);assert.equal(stress.errorQueueRecovered,true);
assert.equal(queue.queuedReadOperations,258);assert.equal(queue.maximumOpenRequests,64);
const result={owner:'QC',status:'PASS',runs:results,passed:initializer.count+guard.count+queue.count,failed:0,stress,additionalQueueOperations:queue.queuedReadOperations,countsExcludeQueueOperationTotals:true,isolated:true,rootMetroRequired:false,unexpectedRuntimeErrors:0};
fs.writeFileSync(path.join(__dirname,'replay-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
