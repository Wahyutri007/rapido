const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const checks=[];
const check=(name,kind,fn)=>{fn();checks.push({name,kind,passed:true});};
const parse=text=>{
  const file=ts.createSourceFile('source.js',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  assert.equal(file.parseDiagnostics.length,0);return file;
};
const visit=(node,predicate)=>{const found=[];const walk=n=>{if(predicate(n))found.push(n);ts.forEachChild(n,walk);};walk(node);return found;};
const isCleanupGuard=n=>ts.isIfStatement(n)&&ts.isThrowStatement(n.thenStatement)&&ts.isCallExpression(n.thenStatement.expression)&&n.thenStatement.expression.expression.getText()==='Error'&&n.thenStatement.expression.arguments[0]?.text==='Unexpected temporary path';
function shape(node,{removeCleanupGuard=false,normalizeTemplate=false}={}){
  if(removeCleanupGuard&&isCleanupGuard(node))return undefined;
  if(normalizeTemplate&&ts.isTemplateExpression(node)&&node.head.text===''&&node.templateSpans.length===1&&node.templateSpans[0].literal.text==='\n'){
    return [ts.SyntaxKind.BinaryExpression,null,shape(node.templateSpans[0].expression),[ts.SyntaxKind.PlusToken,null],[ts.SyntaxKind.StringLiteral,'\n']];
  }
  const children=[];ts.forEachChild(node,child=>{const value=shape(child,{removeCleanupGuard,normalizeTemplate});if(value!==undefined)children.push(value);});
  return [node.kind,ts.isIdentifier(node)||ts.isLiteralExpression(node)?node.text:null,...children];
}
const before=file=>fs.readFileSync(path.join(__dirname,'before',path.basename(file)+'.txt'),'utf8');
for(const file of ['metro.config.js','scripts/verify-metro-cache.cjs']){
  check(file+': whole semantic AST preserved','AST_CONTRACT',()=>assert.deepEqual(shape(parse(fs.readFileSync(file,'utf8'))),shape(parse(before(file)))));
}
const helperPath='scripts/preserve-nativewind-cache.cjs',helper=fs.readFileSync(helperPath,'utf8');
check('guard helper: whole AST preserved except declared arrow syntax','AST_CONTRACT',()=>{
  const anchor='(file, data, ...options) => {';assert.equal(helper.split(anchor).length,2);
  assert.deepEqual(shape(parse(helper.replace(anchor,'function (file, data, ...options) {'))),shape(parse(before(helperPath))));
});
check('guard helper: arrow has no receiver/arguments/super/new.target capture','AST_CONTRACT',()=>{
  const file=parse(helper),assignments=visit(file,n=>ts.isBinaryExpression(n)&&n.left.getText(file)==='fs.writeFileSync');
  const assignment=assignments.find(n=>ts.isArrowFunction(n.right));assert.ok(assignment);
  assert.equal(visit(assignment.right.body,n=>n.kind===ts.SyntaxKind.ThisKeyword||n.kind===ts.SyntaxKind.SuperKeyword||(ts.isIdentifier(n)&&n.text==='arguments')||(ts.isMetaProperty(n)&&n.keywordToken===ts.SyntaxKind.NewKeyword)).length,0);
});
const harnessPath='scripts/verify-nativewind-cache.cjs',harness=fs.readFileSync(harnessPath,'utf8');
check('initializer harness: only cleanup validation placement and JSON template changed','AST_CONTRACT',()=>{
  const old=parse(before(harnessPath)),current=parse(harness);
  const oldGuards=visit(old,isCleanupGuard),currentGuards=visit(current,isCleanupGuard);
  assert.equal(oldGuards.length,1);assert.equal(currentGuards.length,1);
  assert.deepEqual(shape(oldGuards[0]),shape(currentGuards[0]));
  assert.ok(ts.isBlock(oldGuards[0].parent)&&oldGuards[0].parent.parent.finallyBlock===oldGuards[0].parent);
  const tempIndex=current.statements.findIndex(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(x=>x.name.getText(current)==='temporaryRoot'));
  const guardIndex=current.statements.indexOf(currentGuards[0]),tryIndex=current.statements.findIndex(ts.isTryStatement);
  assert.equal(guardIndex,tempIndex+1);assert.ok(guardIndex<tryIndex);
  assert.deepEqual(shape(current,{removeCleanupGuard:true,normalizeTemplate:true}),shape(old,{removeCleanupGuard:true,normalizeTemplate:true}));
});

// Execute the complete production initializer harness in a VM with an in-memory
// filesystem and deliberately failing initializer/output adapters. This isolates
// harness error/cleanup behavior; it is not a second installed-CSS integration test.
function runHarness(scenario){
  const tempParent=path.resolve(os.tmpdir());
  const temporary=path.join(tempParent,scenario==='invalid-temp'?'untrusted-qc-memory':'rapido-css-init-QC-memory');
  const cache=path.join(temporary,'.cache'),output=path.join(temporary,'qc-output.json');
  const files=new Map(),calls={cleanup:[],reads:0,initialize:0,writes:0,logs:[],report:null};
  const expected=new Error('QC '+scenario+' fixture error');
  const installedEntry=require.resolve('react-native-css-interop/metro');
  const normalize=file=>path.resolve(file);
  const facade={
    mkdtempSync(prefix){assert.equal(prefix,path.join(os.tmpdir(),'rapido-css-init-'));return temporary;},
    mkdirSync(){},
    writeFileSync(file,data){calls.writes++;if(normalize(file)===output){calls.report=JSON.parse(data);if(scenario==='output-error')throw expected;}files.set(normalize(file),String(data));},
    readFileSync(file){calls.reads++;if(normalize(file)===installedEntry)return 'module.exports = {withCssInterop: require("qc-initializer-fixture")};';if(!files.has(normalize(file)))throw Object.assign(new Error('missing'),{code:'ENOENT'});return files.get(normalize(file));},
    existsSync(file){return files.has(normalize(file));},
    statSync(file){if(!files.has(normalize(file)))throw Object.assign(new Error('missing'),{code:'ENOENT'});return {size:Buffer.byteLength(files.get(normalize(file)))};},
    rmSync(file,options){assert.equal(normalize(file),temporary);assert.deepEqual(JSON.parse(JSON.stringify(options)),{recursive:true,force:true});calls.cleanup.push(file);},
  };
  const originalWrite=facade.writeFileSync;
  const guarded={exports:{}};
  vm.runInNewContext(helper,{module:guarded,exports:guarded.exports,require:name=>name==='node:fs'?facade:require(name)},{filename:helperPath});
  function initialize(config){
    calls.initialize++;
    for(const platform of ['android','ios','native','macos','windows'])facade.writeFileSync(path.join(cache,platform+'.js'),'');
    if(scenario==='initializer-error'&&calls.initialize===2)throw expected;
    config.resolver.resolveRequest=()=>{};return config;
  }
  const dependencyRequire=name=>name==='qc-initializer-fixture'?initialize:require(name);
  dependencyRequire.resolve=require.resolve;
  const localRequire=name=>{
    if(name==='node:fs')return facade;
    if(name==='node:module')return {createRequire:()=>dependencyRequire};
    if(name==='./preserve-nativewind-cache.cjs')return guarded.exports;
    return require(name);
  };
  localRequire.resolve=require.resolve;
  let error;
  try{
    vm.runInNewContext(harness,{require:localRequire,process:{argv:['node',harnessPath,output]},console:{log:value=>calls.logs.push(value)}},{filename:harnessPath});
  }catch(caught){error=caught;}
  return {calls,error,expected,temporary,filesystemRestored:facade.writeFileSync===originalWrite};
}
check('invalid temporary target fails before initializer/writes and never cleans it','HARNESS_FAILURE',()=>{
  const result=runHarness('invalid-temp');assert.equal(result.error?.message,'Unexpected temporary path');
  assert.equal(result.calls.initialize,0);assert.equal(result.calls.reads,0);assert.equal(result.calls.writes,0);assert.deepEqual(result.calls.cleanup,[]);assert.equal(result.filesystemRestored,true);
});
check('guarded initializer error identity survives cleanup with filesystem restored','HARNESS_FAILURE',()=>{
  const result=runHarness('initializer-error');assert.equal(result.error,result.expected);assert.equal(result.calls.initialize,2);assert.deepEqual(result.calls.cleanup,[result.temporary]);assert.equal(result.filesystemRestored,true);
});
check('result-output failure survives cleanup after all ten harness checks','HARNESS_FAILURE',()=>{
  const result=runHarness('output-error');assert.equal(result.error,result.expected);assert.equal(result.calls.report.count,10);assert.deepEqual(result.calls.cleanup,[result.temporary]);assert.equal(result.filesystemRestored,true);
});
const result={owner:'QC',status:'PASS',passed:checks.length,failed:0,astContractChecks:checks.filter(x=>x.kind==='AST_CONTRACT').length,harnessFailureChecks:checks.filter(x=>x.kind==='HARNESS_FAILURE').length,checks,limitations:'Three harness failure cases execute production source with memory filesystem/initializer adapters. Installed dependency execution is the separate 10-check replay.',applicationSourcesEdited:false,rootMetroRequired:false,realTemporaryDirectoryDeletedByThisSuite:false};
fs.writeFileSync(path.join(__dirname,'independent-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
