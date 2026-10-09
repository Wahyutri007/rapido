const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),crypto=require('node:crypto');
const sources=['components/feature/manage/roles/RoleModifyScreen.tsx','components/feature/manage/workers/WorkerModifyScreen.tsx'];
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const program=ts.createProgram([...sources,...parsed.fileNames.filter(file=>file.endsWith('.d.ts'))],{...parsed.options,noEmit:true});
const diagnostics=ts.getPreEmitDiagnostics(program);
const result={owner:'Codex-3',scope:'Two editor roots and imported dependency closure with project compiler options/declarations; not full-project typecheck',diagnostics:diagnostics.map(d=>({file:d.file?.fileName,line:d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start).line+1:undefined,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')})),sourceHashes:Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),exitCode:diagnostics.length?1:0};
fs.writeFileSync(path.join(__dirname,'typecheck-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({diagnosticCount:diagnostics.length,exitCode:result.exitCode}));process.exitCode=result.exitCode;
