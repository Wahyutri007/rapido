// Guard root with imported dependency/declaration closure, not the entire app.
const fs = require('node:fs');
const ts = require('typescript');
const file = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if(file.error)throw Error(ts.flattenDiagnosticMessageText(file.error.messageText,' '));
const config = ts.parseJsonConfigFileContent(file.config,ts.sys,process.cwd());
const roots = ['hooks/useProtectedRoute.ts',...config.fileNames.filter(name=>name.endsWith('.d.ts'))];
const program = ts.createProgram(roots,{...config.options,noEmit:true,incremental:false});
const diagnostics = [...config.errors,...ts.getPreEmitDiagnostics(program)];
const result={scope:'useProtectedRoute root with imported dependency/declaration closure; not a full-project check',diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(item=>({file:item.file?.fileName,line:item.file&&item.start!==undefined?item.file.getLineAndCharacterOfPosition(item.start).line+1:undefined,code:item.code,message:ts.flattenDiagnosticMessageText(item.messageText,' ')}))};
fs.writeFileSync('docs/qa/senior-5-2026-10-09/guard/typecheck-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));process.exitCode=diagnostics.length?1:0;
