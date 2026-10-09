const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const crypto = require('node:crypto');
const source = [
 'app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx',
 'app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx',
 'components/feature/accounting/general-journal/JournalFormNotFound.tsx',
 'lib/accounting/journal-date.ts',
];
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const roots = [...source, ...parsed.fileNames.filter(name=>name.endsWith('.d.ts'))];
const program = ts.createProgram(roots, {...parsed.options, noEmit:true});
const diagnostics = ts.getPreEmitDiagnostics(program);
const result={owner:'Codex-3',scope:'Four journal roots and imported dependency closure, project compiler options/declarations; not full-project typecheck',diagnostics:diagnostics.map(d=>({file:d.file?.fileName,line:d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start).line+1:undefined,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')})),sourceHashes:Object.fromEntries(source.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),exitCode:diagnostics.length?1:0};
fs.writeFileSync(path.join(__dirname,'typecheck-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({diagnosticCount:diagnostics.length,exitCode:result.exitCode}));
process.exitCode=result.exitCode;
