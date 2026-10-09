const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
const base='app/(no-layout)/manage/pos-settings/';
const roots=['digital-orders/index.tsx','digital-orders/detail.tsx','digital-orders/modify.tsx','digital-orders/_layout.tsx','index.tsx','_layout.tsx'].map(f=>base+f);
const configPath=ts.findConfigFile(process.cwd(),ts.sys.fileExists,'tsconfig.json'),config=ts.readConfigFile(configPath,ts.sys.readFile),parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const program=ts.createProgram([...roots,...parsed.fileNames.filter(f=>f.endsWith('.d.ts'))],{...parsed.options,noEmit:true,incremental:false,tsBuildInfoFile:undefined});
const diagnostics=ts.getPreEmitDiagnostics(program),fingerprint={},generatedDeclarations={},inputDrift=[];
for(const f of program.getSourceFiles())if(!/[\\/]node_modules[\\/]/.test(f.fileName)){
 const relative=path.relative(process.cwd(),f.fileName);
 if(relative.replaceAll('\\','/')==='.expo/types/router.d.ts'){
  const snapshot='generated-router.d.ts.txt';fs.writeFileSync(path.join(__dirname,snapshot),f.text);
  const hash=crypto.createHash('sha256').update(f.text).digest('hex');fingerprint[relative]=hash;generatedDeclarations[relative]={snapshot,hash,liveHashAtReport:crypto.createHash('sha256').update(fs.readFileSync(f.fileName)).digest('hex')};
 }else{
  fingerprint[relative]=crypto.createHash('sha256').update(fs.readFileSync(f.fileName)).digest('hex');
  if(ts.sys.readFile(f.fileName)!==f.text)inputDrift.push(relative);
 }
}
const result={status:diagnostics.length||inputDrift.length?'FAIL':'PASS',roots,sourceFiles:program.getSourceFiles().length,fingerprint,generatedDeclarations,inputDrift,diagnostics:diagnostics.map(d=>({file:d.file&&path.relative(process.cwd(),d.file.fileName),message:ts.flattenDiagnosticMessageText(d.messageText,'\n')})),limitations:'Six route/POS roots and actual import/declaration/configuration closure. Actual compiler-read auto-generated router declaration preserved as snapshot because active Expo runtime regenerates it; not a latest global router/native/backend type certification.'};
fs.writeFileSync(path.join(__dirname,'typecheck-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,sourceFiles:result.sourceFiles,diagnostics:result.diagnostics,inputDrift}));process.exitCode=result.status==='PASS'?0:1;
