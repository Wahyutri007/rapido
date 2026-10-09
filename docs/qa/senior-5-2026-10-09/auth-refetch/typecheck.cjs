// Current provider/login/boot/guard roots with imported dependency/declaration closure.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const file = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (file.error) throw Error(ts.flattenDiagnosticMessageText(file.error.messageText, ' '));
const config = ts.parseJsonConfigFileContent(file.config, ts.sys, process.cwd());
const appRoots = ['context/AuthContext.tsx', 'api/hooks/auth.ts', 'app/(onboarding)/login.tsx', 'app/index.tsx', 'hooks/useProtectedRoute.ts'];
const roots = [...appRoots, ...config.fileNames.filter(name => name.endsWith('.d.ts'))];
const program = ts.createProgram(roots, { ...config.options, noEmit: true, incremental: false });
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const hash = name => crypto.createHash('sha256').update(fs.readFileSync(name)).digest('hex');
const result = {
  scope: 'AuthProvider/login hook+screen/boot/guard roots with imported dependency/declaration closure; not full-project TypeScript',
  roots: appRoots,
  rootHashes: Object.fromEntries(appRoots.map(name => [name, hash(name)])),
  sourceHashes: Object.fromEntries(program.getSourceFiles().filter(source => !source.isDeclarationFile && !source.fileName.includes('/node_modules/') && !source.fileName.includes('\\node_modules\\')).map(source => [path.relative(process.cwd(), source.fileName).replaceAll('\\', '/'), hash(source.fileName)])),
  diagnosticCount: diagnostics.length,
  diagnostics: diagnostics.map(item => ({ file: item.file?.fileName, line: item.file && item.start !== undefined ? item.file.getLineAndCharacterOfPosition(item.start).line + 1 : undefined, code: item.code, message: ts.flattenDiagnosticMessageText(item.messageText, ' ') })),
};
fs.writeFileSync(path.join(__dirname, 'typecheck-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ diagnosticCount: result.diagnosticCount, roots: appRoots }));
process.exitCode = diagnostics.length ? 1 : 0;
