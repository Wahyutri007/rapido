// Login hook and its actual screen consumer plus imported dependency closure.
const fs = require('node:fs');
const ts = require('typescript');
const file = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (file.error) throw Error(ts.flattenDiagnosticMessageText(file.error.messageText, ' '));
const config = ts.parseJsonConfigFileContent(file.config, ts.sys, process.cwd());
const roots = ['api/hooks/auth.ts', 'app/(onboarding)/login.tsx', ...config.fileNames.filter(name => name.endsWith('.d.ts'))];
const program = ts.createProgram(roots, {...config.options, noEmit:true, incremental:false});
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const result = {scope:'Login hook and LoginScreen consumer with imported dependency closure; not a full-project check', diagnosticCount:diagnostics.length,
  diagnostics:diagnostics.map(item => ({file:item.file?.fileName,line:item.file&&item.start!==undefined?item.file.getLineAndCharacterOfPosition(item.start).line+1:undefined,code:item.code,message:ts.flattenDiagnosticMessageText(item.messageText,' ')}))};
fs.writeFileSync('docs/qa/senior-5-2026-10-09/login/typecheck-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));process.exitCode=diagnostics.length?1:0;
