// Selected Boot root and dependency closure; does not check the entire project.
const fs=require("node:fs");
const ts=require("typescript");
const configFile=ts.readConfigFile("tsconfig.json",ts.sys.readFile);
if(configFile.error)throw Error(ts.flattenDiagnosticMessageText(configFile.error.messageText," "));
const config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,process.cwd());
const roots=["app/index.tsx",...config.fileNames.filter(file=>file.endsWith(".d.ts"))];
const program=ts.createProgram(roots,{...config.options,noEmit:true,incremental:false});
const diagnostics=[...config.errors,...ts.getPreEmitDiagnostics(program)];
const result={scope:"Boot root app/index.tsx plus imported dependency closure; not a full-project check",diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(d=>({file:d.file?.fileName,line:d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start).line+1:undefined,code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText," ")}))};
fs.writeFileSync("docs/qa/senior-5-2026-10-09/boot/typecheck-results.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result));process.exitCode=diagnostics.length?1:0;
