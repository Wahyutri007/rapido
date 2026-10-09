const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const configFile = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (configFile.error) throw Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, ' '));
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
const roots = ['api/hooks/auth.ts', 'app/(onboarding)/login.tsx', ...config.fileNames.filter(name => name.endsWith('.d.ts'))];
const options = { ...config.options, noEmit: true, incremental: false };
const host = ts.createCompilerHost(options);
const normalize = file => path.resolve(file).toLowerCase();
const copies = new Map([
  [normalize('context/AuthContext.tsx'), path.join(__dirname, 'proposal/AuthContext.tsx')],
  [normalize('hooks/useProtectedRoute.ts'), path.join(__dirname, 'fixtures/useProtectedRoute.ts.txt')],
]);
const originalRead = host.readFile.bind(host);
host.readFile = file => copies.has(normalize(file)) ? fs.readFileSync(copies.get(normalize(file)), 'utf8') : originalRead(file);
const program = ts.createProgram(roots, options, host);
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const result = { scope: 'Candidate AuthProvider with current login hook/screen and imported dependency closure; reviewed guard bytes pinned; not full-project check', tested: 'PROPOSAL_ONLY_NOT_APPLIED', roots: roots.slice(0, 2), sourceOverrides: { 'context/AuthContext.tsx': hash(path.join(__dirname, 'proposal/AuthContext.tsx')), 'hooks/useProtectedRoute.ts': hash(path.join(__dirname, 'fixtures/useProtectedRoute.ts.txt')) }, diagnosticCount: diagnostics.length, diagnostics: diagnostics.map(item => ({ file: item.file?.fileName, line: item.file && item.start !== undefined ? item.file.getLineAndCharacterOfPosition(item.start).line + 1 : undefined, code: item.code, message: ts.flattenDiagnosticMessageText(item.messageText, ' ') })) };
fs.writeFileSync(path.join(__dirname, 'proposal-typecheck-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ tested: result.tested, diagnosticCount: result.diagnosticCount, sourceOverrides: result.sourceOverrides }));
process.exitCode = diagnostics.length ? 1 : 0;
