// Only registration hook, sheet and their Wizard consumer/imported declaration closure.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const file = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if(file.error) throw Error(ts.flattenDiagnosticMessageText(file.error.messageText,' '));
const config = ts.parseJsonConfigFileContent(file.config,ts.sys,process.cwd());
const roots = ['api/hooks/registration.ts','components/feature/register/wizard/PersonalInfoAction.tsx','app/(onboarding)/register/wizard.tsx'];
const program = ts.createProgram([...roots,...config.fileNames.filter(name=>name.endsWith('.d.ts'))],{...config.options,noEmit:true,incremental:false});
const diagnostics = [...config.errors,...ts.getPreEmitDiagnostics(program)];
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const sourceHashes = {};
for(const source of program.getSourceFiles()){
  if(source.isDeclarationFile||source.fileName.includes('/node_modules/')||source.fileName.includes('\\node_modules\\')) continue;
  const bytes = fs.readFileSync(source.fileName);
  if(source.text !== bytes.toString('utf8').replace(/^\uFEFF/,'')) throw Error('Typecheck source changed during run: '+source.fileName);
  sourceHashes[path.relative(process.cwd(),source.fileName).replaceAll('\\','/')] = hash(bytes);
}
const result = {scope:'Registration hook/sheet/Wizard consumer and imported source/declaration closure; not full-project TypeScript',roots,sourceHashes,diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(item=>({file:item.file?.fileName,line:item.file&&item.start!==undefined?item.file.getLineAndCharacterOfPosition(item.start).line+1:undefined,code:item.code,message:ts.flattenDiagnosticMessageText(item.messageText,' ')}))};
fs.writeFileSync(path.join(__dirname,'typecheck-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({diagnosticCount:result.diagnosticCount,diagnostics:result.diagnostics}));process.exitCode=diagnostics.length?1:0;
