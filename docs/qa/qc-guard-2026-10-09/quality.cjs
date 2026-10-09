const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync, execFileSync } = require('node:child_process');
const ts = require('typescript');
const provider = 'context/AuthContext.tsx';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const testedPath = file => file === provider ? path.join(__dirname, 'fixtures/AuthContext.tsx.txt') : file;
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
function run(name, executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, name + '.out.txt'), result.stdout || '');
  fs.writeFileSync(path.join(__dirname, name + '.err.txt'), result.stderr || '');
  return { executable, args, exitCode: result.status, error: result.error?.message };
}
const source = 'hooks/useProtectedRoute.ts';
const lint = run('eslint', process.execPath, ['node_modules/eslint/bin/eslint.js', source, '--no-cache', '--max-warnings', '0', '--format', 'json']);
const lintResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'eslint.out.txt'), 'utf8'));
const biome = run('biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', source]);
const diff = run('diff', 'git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', source]);
function policy(text) {
  const parsed = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const result = { vars: {}, conditions: [], destinations: [], deps: null };
  const normalize = node => {
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, node.getText(parsed));
    const values = [];
    while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) values.push(scanner.getTokenText());
    return values.join(' ');
  };
  function walk(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'scheduleRedirect') return;
    if (ts.isVariableDeclaration(node) && ['PUBLIC_ROUTES', 'isOnboarding', 'inPublicGroup', 'isIndex'].includes(node.name.getText(parsed))) result.vars[node.name.getText(parsed)] = normalize(node.initializer);
    if (ts.isIfStatement(node)) result.conditions.push(normalize(node.expression));
    if (ts.isCallExpression(node)) {
      const called = node.expression.getText(parsed);
      if (['router.replace', 'scheduleRedirect'].includes(called) && ts.isStringLiteral(node.arguments[0])) result.destinations.push(node.arguments[0].text);
      if (called === 'React.useEffect') result.deps = normalize(node.arguments[1]);
    }
    ts.forEachChild(node, walk);
  }
  walk(parsed); return result;
}
const baseline = execFileSync('git', ['show', 'acba0d92460c1af3149abc3775f09888a2943cab:' + source], { encoding: 'utf8' });
const baselinePolicy = policy(baseline), currentPolicy = policy(fs.readFileSync(source, 'utf8'));
const manifest = JSON.parse(fs.readFileSync('docs/qa/senior-5-2026-10-09/guard/verification.json', 'utf8'));
const routingPolicyUnchanged = JSON.stringify(baselinePolicy) === JSON.stringify(currentPolicy);
// The handoff printer omits the optional trailing comma in some(callback,).
// Preserve it in the independent baseline comparison; normalize only this call for the manifest comparison.
const handoffComparablePolicy = structuredClone(currentPolicy);
handoffComparablePolicy.vars.isOnboarding = handoffComparablePolicy.vars.isOnboarding.replace(/ , \)$/, ' )');
const developerPolicySemanticsMatch = JSON.stringify(handoffComparablePolicy) === JSON.stringify(manifest.routingPolicy);
const before = read('source-before.json');
const stable = Object.entries(before.hashes).map(([file, expected]) => ({ file, testedPath: testedPath(file), expected, actual: hash(testedPath(file)), passed: expected === hash(testedPath(file)), pinnedFixture: file === provider }));
const replay = read('final-results.json'), independent = read('independent-results.json');
const runtimeMatches = [replay.sources, independent.sourceHashes].flatMap((sources, index) => Object.entries(sources).map(([file, expected]) => ({ suite: index ? 'independent' : 'replay', file, testedPath: testedPath(file), expected, actual: hash(testedPath(file)), passed: expected === hash(testedPath(file)) })));
const typecheck = JSON.parse(fs.readFileSync('docs/qa/senior-5-2026-10-09/guard/typecheck-results.json', 'utf8'));
const counts = { replay: { passed: replay.passed, failed: replay.failed, errors: replay.errors.length }, independent: { passed: independent.passed, failed: independent.failed, runtimeErrors: independent.runtimeErrors.length, unhandledRejections: independent.unhandledRejections.length } };
const passed = [lint, biome, diff].every(x => x.exitCode === 0) && lintResults.every(x => !x.errorCount && !x.warningCount) && stable.every(x => x.passed) && runtimeMatches.every(x => x.passed) && routingPolicyUnchanged && developerPolicySemanticsMatch && replay.passed === 105 && replay.failed === 0 && replay.errors.length === 0 && independent.passed === 46 && independent.failed === 0 && independent.runtimeErrors.length === 0 && independent.unhandledRejections.length === 0 && typecheck.diagnosticCount === 0;
const result = {
  owner: 'QC', ticket: 'SD5-004', createdAt: new Date().toISOString(), status: passed ? 'PASS' : 'FAILED', sourceHash: hash(source),
  lint: { run: lint, errors: lintResults.reduce((sum, x) => sum + x.errorCount, 0), warnings: lintResults.reduce((sum, x) => sum + x.warningCount, 0) }, biome, diff,
  routingPolicyUnchanged, developerPolicySemanticsMatch, baselinePolicy, currentPolicy, trackedFilesStable: stable, runtimeMatches, counts,
  workspaceProviderExcluded: { hashAtQuality: hash(provider), testedHash: hash(testedPath(provider)), reason: 'Active SD5-005 developer scope; current provider is not tested or approved by this guard decision.' },
  focusedTypecheck: { developerEvidenceReviewed: true, rerunByQC: false, diagnosticCount: typecheck.diagnosticCount, scope: typecheck.scope, fingerprintMatches: stable.find(x => x.file.endsWith('/typecheck-results.json'))?.passed === true, currentProviderCovered: false },
  productionIndependentModules: Object.keys(independent.sourceHashes).length,
};
fs.writeFileSync(path.join(__dirname, 'quality-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, counts, lint: result.lint, biomeExit: biome.exitCode, diffExit: diff.exitCode, routingPolicyUnchanged, diskStable: stable.filter(x => x.passed && !x.pinnedFixture).length, pinnedFixtureStable: stable.filter(x => x.passed && x.pinnedFixture).length, independentProductionModules: result.productionIndependentModules, typeEvidenceOnly: result.focusedTypecheck }));
process.exitCode = passed ? 0 : 1;
