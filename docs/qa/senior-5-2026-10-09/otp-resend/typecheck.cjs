// Focused OTP screen/new hook and imported source/declaration closure; not all routes.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ts=require('typescript');
const file=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
if(file.error)throw Error(ts.flattenDiagnosticMessageText(file.error.messageText,' '));
const config=ts.parseJsonConfigFileContent(file.config,ts.sys,process.cwd());
const roots=['app/(onboarding)/otp.tsx','api/hooks/otp.ts'];
const program=ts.createProgram([...roots,...config.fileNames.filter(name=>name.endsWith('.d.ts'))],{...config.options,noEmit:true,incremental:false});
const diagnostics=[...config.errors,...ts.getPreEmitDiagnostics(program)];
const sourceHashes={};
for(const source of program.getSourceFiles()){
  if(source.isDeclarationFile||/[\\/]node_modules[\\/]/.test(source.fileName))continue;
  const bytes=fs.readFileSync(source.fileName);
  if(source.text!==bytes.toString('utf8').replace(/^\uFEFF/,''))throw Error('Source changed during typecheck: '+source.fileName);
  sourceHashes[path.relative(process.cwd(),source.fileName).replaceAll('\\','/')]=crypto.createHash('sha256').update(bytes).digest('hex');
}
const result={scope:'OTP screen/new API hook and imported source/declaration closure; not full-project TypeScript',roots,sourceHashes,diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(item=>({file:item.file?.fileName,line:item.file&&item.start!==undefined?item.file.getLineAndCharacterOfPosition(item.start).line+1:undefined,code:item.code,message:ts.flattenDiagnosticMessageText(item.messageText,' ')}))};
fs.writeFileSync(path.join(__dirname,'typecheck-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({diagnosticCount:result.diagnosticCount,diagnostics:result.diagnostics}));process.exitCode=diagnostics.length?1:0;
