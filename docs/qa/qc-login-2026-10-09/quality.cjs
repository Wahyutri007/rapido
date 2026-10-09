const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync, execFileSync } = require('node:child_process');
const { ESLint } = require('eslint');
const ts = require('typescript');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const write = (name, result) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(result, null, 2) + '\n');
const run = (name, executable, args) => {
  const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, `${name}.out.txt`), result.stdout || '');
  fs.writeFileSync(path.join(__dirname, `${name}.err.txt`), result.stderr || '');
  return { executable, args, exitCode: result.status, error: result.error?.message };
};
function otherModuleAst(source) {
  const file = ts.createSourceFile('api/hooks/auth.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statements = file.statements.filter(node => !(ts.isFunctionDeclaration(node) && node.name?.text === 'useLoginRequest') && !(ts.isImportDeclaration(node) && node.moduleSpecifier.text === 'react'));
  const printer = ts.createPrinter({ removeComments: true });
  return statements.map(node => printer.printNode(ts.EmitHint.Unspecified, node, file)).join('\n');
}
(async () => {
  const lintRun = run('source-eslint', process.execPath, ['node_modules/eslint/bin/eslint.js', 'api/hooks/auth.ts', '--no-cache', '--max-warnings', '0', '--format', 'json']);
  const sourceLint = JSON.parse(fs.readFileSync(path.join(__dirname, 'source-eslint.out.txt'), 'utf8'));
  const sourceBiome = run('source-biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', 'api/hooks/auth.ts']);
  const diff = run('source-diff', 'git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', 'api/hooks/auth.ts']);
  const originalFile = 'context/AuthContext.tsx', candidateFile = path.join(__dirname, 'proposal/AuthContext.tsx');
  const original = fs.readFileSync(originalFile, 'utf8'), candidate = fs.readFileSync(candidateFile, 'utf8');
  const eslint = new ESLint({ cwd: process.cwd() });
  const [providerBaselineLint, providerCandidateLint] = await Promise.all([eslint.lintText(original, { filePath: path.resolve(originalFile) }), eslint.lintText(candidate, { filePath: path.resolve(originalFile) })]);
  const flattenLint = results => results.map(item => ({ errors: item.errorCount, warnings: item.warningCount, messages: item.messages }));
  const diagnosticIdentity = results => results.map(item => ({ errors: item.errorCount, warnings: item.warningCount, messages: item.messages.map(({ ruleId, severity, line, column, message }) => ({ ruleId, severity, line, column, message })) }));
  const providerLintNoAddedDiagnostics = JSON.stringify(diagnosticIdentity(providerBaselineLint)) === JSON.stringify(diagnosticIdentity(providerCandidateLint));
  const providerBaselineBiome = run('provider-baseline-biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', originalFile]);
  const candidateBiome = run('proposal-biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', candidateFile]);
  const biomeDiagnostics = name => {
    const out = fs.readFileSync(path.join(__dirname, name + '.out.txt'), 'utf8');
    const err = fs.readFileSync(path.join(__dirname, name + '.err.txt'), 'utf8');
    return { errors: +(out.match(/Found (\d+) errors?\./)?.[1] || 0), warnings: +(out.match(/Found (\d+) warnings?\./)?.[1] || 0), rules: [...new Set(err.match(/\blint\/[a-zA-Z0-9/_-]+\b/g) || [])].sort(), formatterError: /\bformat\s/.test(err) };
  };
  const baselineBiomeDiagnostics = biomeDiagnostics('provider-baseline-biome'), candidateBiomeDiagnostics = biomeDiagnostics('proposal-biome');
  const providerBiomeNoAddedDiagnostics = providerBaselineBiome.exitCode === candidateBiome.exitCode && JSON.stringify(baselineBiomeDiagnostics) === JSON.stringify(candidateBiomeDiagnostics);
  const intendedCallOnly = candidate.replace('\t\t\tawait userQuery.refetch({ throwOnError: true });', '\t\t\tawait userQuery.refetch();') === original;
  const oldHook = execFileSync('git', ['show', 'acba0d92460c1af3149abc3775f09888a2943cab:api/hooks/auth.ts'], { encoding: 'utf8' });
  const remainingModuleAstUnchanged = otherModuleAst(oldHook) === otherModuleAst(fs.readFileSync('api/hooks/auth.ts', 'utf8'));
  const patchResult = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--', originalFile, candidateFile], { encoding: 'utf8' });
  if (patchResult.status !== 1 || !patchResult.stdout) throw Error('Candidate patch missing');
  const patch = patchResult.stdout.replace(/^diff --git .*$/m, `diff --git a/${originalFile} b/${originalFile}`).replace(/^--- .*$/m, `--- a/${originalFile}`).replace(/^\+\+\+ .*$/m, `+++ b/${originalFile}`);
  const patchFile = path.join(__dirname, 'auth-refetch.patch'); fs.writeFileSync(patchFile, patch);
  const apply = run('proposal-apply-check', 'git', ['-c', 'core.autocrlf=false', 'apply', '--check', patchFile]);
  const before = read('source-before.json');
  const tracked = Object.entries(before.hashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file), externalScope: file === 'hooks/useProtectedRoute.ts' }));
  const runtime = [read('final-results.json'), read('integration-results.json'), read('proposal-results.json')].flatMap((result, index) => Object.entries(result.sources || result.sourceHashes).map(([file, expected]) => {
    const testedFile = file === 'hooks/useProtectedRoute.ts' ? path.join(__dirname, 'fixtures/useProtectedRoute.ts.txt') : index === 2 && file === originalFile ? candidateFile : file;
    return { suite: ['replay', 'current-integration', 'candidate-integration'][index], file, testedFile, expected, actual: hash(testedFile), passed: expected === hash(testedFile) };
  }));
  const replay = read('final-results.json'), current = read('integration-results.json'), proposed = read('proposal-results.json');
  const counts = { replay: { passed: replay.passed, failed: replay.failed }, current: { passed: current.passed, failed: current.failed }, candidate: { passed: proposed.passed, failed: proposed.failed } };
  const allErrorsZero = [replay, current, proposed].every(result => result.runtimeErrors.length === 0 && result.unhandledRejections.length === 0);
  const passed = [lintRun, sourceBiome, diff, apply].every(item => item.exitCode === 0) && sourceLint.every(item => !item.errorCount && !item.warningCount) && providerLintNoAddedDiagnostics && providerBiomeNoAddedDiagnostics && intendedCallOnly && remainingModuleAstUnchanged && tracked.every(item => item.passed || item.externalScope) && runtime.every(item => item.passed) && replay.passed === 74 && replay.failed === 0 && current.passed === 44 && current.failed === 3 && proposed.passed === 47 && proposed.failed === 0 && allErrorsZero;
  const result = { owner: 'QC', createdAt: new Date().toISOString(), status: passed ? 'PASS_EVIDENCE_WITH_PROVIDER_QUALITY_OPEN' : 'FAILED', currentApplicationDecision: 'CHANGES_REQUESTED', reviewedSourceHashes: { 'api/hooks/auth.ts': hash('api/hooks/auth.ts'), 'context/AuthContext.tsx': hash(originalFile) }, sourceLint: { run: lintRun, errors: sourceLint.reduce((sum, item) => sum + item.errorCount, 0), warnings: sourceLint.reduce((sum, item) => sum + item.warningCount, 0) }, sourceBiome, diff, providerBaselineLint: flattenLint(providerBaselineLint), providerCandidateLint: flattenLint(providerCandidateLint), providerLintNoAddedDiagnostics, providerBaselineBiome, baselineBiomeDiagnostics, candidateBiomeDiagnostics, providerBiomeNoAddedDiagnostics, candidateBiome, intendedCallOnly, remainingModuleAstUnchanged, tracked, runtime, counts, runtimeUnhandledZero: allErrorsZero, patch: { file: 'auth-refetch.patch', sha256: hash(patchFile), applied: false, applyCheck: apply }, candidateHash: hash(candidateFile), independentProductionModules: Object.keys(current.sourceHashes).length, providerQualityClean: false };
  write('quality-results.json', result);
  console.log(JSON.stringify({ status: result.status, counts, currentApplicationDecision: result.currentApplicationDecision, sourceLint: result.sourceLint, providerBaselineLintCounts: diagnosticIdentity(providerBaselineLint).map(({ errors, warnings }) => ({ errors, warnings })), providerCandidateLintCounts: diagnosticIdentity(providerCandidateLint).map(({ errors, warnings }) => ({ errors, warnings })), providerLintNoAddedDiagnostics, providerBiomeNoAddedDiagnostics, baselineBiomeDiagnostics, candidateBiomeDiagnostics, candidateBiomeExit: candidateBiome.exitCode, applyCheckExit: apply.exitCode, intendedCallOnly, remainingModuleAstUnchanged, stable: tracked.filter(item => item.passed).length, externallyChanged: tracked.filter(item => !item.passed), runtimeMatched: runtime.every(item => item.passed), providerQualityClean: false }));
  process.exitCode = passed ? 0 : 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
