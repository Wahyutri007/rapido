const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const roots = ['app/(cashier)/location/index.tsx', 'app/(no-layout)/(cashier)/location/_layout.tsx', 'app/(no-layout)/(cashier)/location/detail.tsx'];
const program = ts.createProgram([...roots, ...parsed.fileNames.filter(file => file.endsWith('.d.ts'))], { ...parsed.options, noEmit: true, incremental: false, tsBuildInfoFile: undefined });
const diagnostics = ts.getPreEmitDiagnostics(program);
const result = { status: diagnostics.length ? 'FAIL' : 'PASS', roots, sourceFiles: program.getSourceFiles().length, diagnostics: diagnostics.map(item => ({ file: item.file && path.relative(process.cwd(), item.file.fileName), message: ts.flattenDiagnosticMessageText(item.messageText, '\n') })), checkedAt: new Date().toISOString(), scope: 'Three Tempat Kasir route roots and imported dependencies, not full application TypeScript.' };
fs.writeFileSync(path.join(__dirname, 'typecheck-results.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = diagnostics.length ? 1 : 0;

