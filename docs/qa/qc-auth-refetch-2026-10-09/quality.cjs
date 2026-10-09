const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const source = 'context/AuthContext.tsx', developerFolder = 'docs/qa/senior-5-2026-10-09/auth-refetch';
function run(name, executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, name + '.out.txt'), result.stdout || '');
  fs.writeFileSync(path.join(__dirname, name + '.err.txt'), result.stderr || '');
  return { executable, args, exitCode: result.status, error: result.error?.message };
}
const lint = run('eslint', process.execPath, ['node_modules/eslint/bin/eslint.js', source, '--no-cache', '--max-warnings', '0', '--format', 'json']);
const lintResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'eslint.out.txt'), 'utf8'));
const biome = run('biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', source]);
const diff = run('diff', 'git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', source]);
const eol = text => text.replaceAll('\r\n', '\n');
function unchangedContract(text) {
  const parsed = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const provider = parsed.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'AuthProvider');
  if (!provider) throw Error('Provider declaration missing');
  let omittedLoader = 0, omittedReload = 0, omittedBootstrap = 0, stableRefetchBinding = 0, refetchOptionRemoved = 0;
  const statements = provider.body.statements.flatMap(node => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'loadToken') { omittedLoader++; return []; }
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'reloadAuth') { omittedReload++; return []; }
    if (ts.isVariableStatement(node) && node.declarationList.declarations.some(x => x.name.getText(parsed) === 'loadToken')) { omittedLoader++; return []; }
    if (ts.isVariableStatement(node) && node.declarationList.declarations.length === 1) {
      const declaration = node.declarationList.declarations[0];
      if (ts.isObjectBindingPattern(declaration.name) && declaration.name.elements.length === 1 && declaration.name.elements[0].name.getText(parsed) === 'refetch' && declaration.initializer?.getText(parsed) === 'userQuery') { stableRefetchBinding++; return []; }
    }
    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && node.expression.expression.getText(parsed) === 'React.useEffect') { omittedBootstrap++; return []; }
    let value = eol(node.getText(parsed));
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'updateToken') {
      const target = 'await userQuery.refetch({ throwOnError: true });';
      refetchOptionRemoved = value.split(target).length - 1;
      value = value.replace(target, 'await userQuery.refetch();');
    }
    return [value];
  });
  return { contract: { outsideProvider: parsed.statements.filter(node => node !== provider).map(node => eol(node.getText(parsed))), statements }, omittedLoader, omittedReload, omittedBootstrap, stableRefetchBinding, refetchOptionRemoved };
}
const old = unchangedContract(fs.readFileSync(path.join(__dirname, 'AuthContext.before.tsx.txt'), 'utf8'));
const current = unchangedContract(fs.readFileSync(source, 'utf8'));
const unchangedOutsideDeclaredDelta = JSON.stringify(old.contract) === JSON.stringify(current.contract) && old.omittedLoader === 1 && current.omittedLoader === 1 && old.omittedReload === 1 && current.omittedReload === 1 && old.omittedBootstrap === 1 && current.omittedBootstrap === 1 && old.stableRefetchBinding === 0 && current.stableRefetchBinding === 1 && old.refetchOptionRemoved === 0 && current.refetchOptionRemoved === 1;
const before = read('source-before.json');
const stable = Object.entries(before.hashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
const historicalMatches = before.historicalMatches.map(item => ({ ...item, actual: hash(item.file), passed: item.expected === hash(item.file) }));
const definitions = [
  ['loginProviderReplay', 'final-results.json', 85],
  ['bootReplay', 'boot-regression/final-results.json', 64],
  ['guardReplay', 'guard-regression/final-results.json', 105],
  ['guardIntegration', 'guard-integration/independent-results.json', 46],
  ['bootIntegration', 'boot-integration/independent-results.json', 41],
  ['newQcIntegration', 'independent-results.json', 48],
];
const suites = definitions.map(([name, file, expectedPassed]) => {
  const result = read(file);
  return { name, file, result, expectedPassed, errorCount: (result.errors || result.runtimeErrors || []).length, unhandledRejectionCount: (result.unhandledRejections || []).length };
});
const runtimeMatches = suites.flatMap(({ name, result }) => Object.entries(result.sources || result.sourceHashes).map(([file, expected]) => ({ suite: name, file, expected, actual: hash(file), passed: expected === hash(file) })));
const runtimeProviderMatches = suites.map(({ name, result }) => ({ suite: name, actual: (result.sources || result.sourceHashes)[source], expected: hash(source), passed: (result.sources || result.sourceHashes)[source] === hash(source) }));
const baseline = read('independent-baseline-results.json');
const baselineMatches = Object.entries(baseline.sourceHashes).map(([file, expected]) => ({ file, testedPath: file === source ? path.join(__dirname, 'AuthContext.before.tsx.txt') : file, expected, actual: hash(file === source ? path.join(__dirname, 'AuthContext.before.tsx.txt') : file), passed: expected === hash(file === source ? path.join(__dirname, 'AuthContext.before.tsx.txt') : file) }));
const type = JSON.parse(fs.readFileSync(developerFolder + '/typecheck-results.json', 'utf8'));
const typeSourceMatches = Object.entries(type.sourceHashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
const counts = Object.fromEntries(suites.map(item => [item.name, { passed: item.result.passed, failed: item.result.failed, errors: item.errorCount, unhandledRejections: item.unhandledRejectionCount }]));
const productionRuntimeModules = [...new Set(runtimeMatches.map(x => x.file))].sort();
const passed = [lint, biome, diff].every(x => x.exitCode === 0) && lintResults.every(x => !x.errorCount && !x.warningCount) && stable.every(x => x.passed) && historicalMatches.every(x => x.passed) && runtimeMatches.every(x => x.passed) && runtimeProviderMatches.every(x => x.passed) && baselineMatches.every(x => x.passed) && suites.every(x => x.result.passed === x.expectedPassed && x.result.failed === 0 && x.errorCount === 0 && x.unhandledRejectionCount === 0) && unchangedOutsideDeclaredDelta && type.diagnosticCount === 0 && typeSourceMatches.every(x => x.passed) && baseline.passed === 38 && baseline.failed === 10 && baseline.runtimeErrors.length === 0 && baseline.unhandledRejections.length === 0;
const result = {
  owner: 'QC', ticket: 'SD5-005', createdAt: new Date().toISOString(), status: passed ? 'PASS' : 'FAILED', sourceHash: hash(source),
  lint: { run: lint, errors: lintResults.reduce((sum, x) => sum + x.errorCount, 0), warnings: lintResults.reduce((sum, x) => sum + x.warningCount, 0) }, biome, diff,
  unchangedOutsideDeclaredDelta, contractComparison: { baseline: old, current }, trackedFilesStable: stable, historicalMatches, historicalUniqueFiles: new Set(historicalMatches.map(x => x.file)).size,
  counts, totalPassed: suites.reduce((sum, x) => sum + x.result.passed, 0), totalFailed: suites.reduce((sum, x) => sum + x.result.failed, 0), includesOverlappingCoverage: true,
  runtimeMatches, runtimeProviderMatches, productionRuntimeModules,
  baseline: { passed: baseline.passed, failed: baseline.failed, errors: baseline.runtimeErrors.length, unhandledRejections: baseline.unhandledRejections.length, matches: baselineMatches, countedInCurrentTotal: false },
  focusedTypecheck: { developerEvidenceReviewed: true, rerunByQC: false, diagnosticCount: type.diagnosticCount, scope: type.scope, roots: type.roots, currentSourceMatches: typeSourceMatches, dependencyFingerprintsMatched: typeSourceMatches.filter(x => x.passed).length },
};
fs.writeFileSync(path.join(__dirname, 'quality-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, counts, passed: result.totalPassed, failed: result.totalFailed, lintErrors: result.lint.errors, lintWarnings: result.lint.warnings, biomeExit: biome.exitCode, diffExit: diff.exitCode, unchangedOutsideDeclaredDelta, trackedStable: stable.filter(x => x.passed).length, historicalUniqueMatched: result.historicalUniqueFiles, runtimeModules: productionRuntimeModules.length, typeEvidenceMatched: typeSourceMatches.filter(x => x.passed).length, failures: [...stable, ...historicalMatches, ...runtimeMatches, ...typeSourceMatches].filter(x => !x.passed).map(x => x.file) }));
process.exitCode = passed ? 0 : 1;
