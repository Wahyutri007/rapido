const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync, execFileSync } = require('node:child_process');
const ts = require('typescript');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const run = (name, executable, args) => {
  const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, `${name}.out.txt`), result.stdout || '');
  fs.writeFileSync(path.join(__dirname, `${name}.err.txt`), result.stderr || '');
  return { executable, args, exitCode: result.status, error: result.error?.message };
};
const lint = run('eslint', process.execPath, ['node_modules/eslint/bin/eslint.js', 'app/index.tsx', '--no-cache', '--max-warnings', '0', '--format', 'json']);
const lintResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'eslint.out.txt'), 'utf8'));
const biome = run('biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', 'app/index.tsx']);
const diff = run('diff', 'git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', 'app/index.tsx']);
const before = read('source-before.json');
const stable = Object.entries(before.hashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
const replay = read('final-results.json');
const independent = read('independent-results.json');
const runtimeMatches = [replay, independent].flatMap((report, index) => Object.entries(report.sources).map(([file, expected]) => ({ suite: index ? 'independent' : 'replay', file, expected, actual: hash(file), passed: expected === hash(file) })));
function returnedJsx(source, removeKey) {
  const parsed = ts.createSourceFile('app/index.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = parsed.statements.find((item) => ts.isFunctionDeclaration(item) && item.name?.text === 'IndexScreen');
  const jsx = fn.body.statements.filter(ts.isReturnStatement).at(-1).expression;
  const transformed = ts.transform(jsx, [(context) => {
    const visit = (node) => {
      if (removeKey && ts.isJsxSelfClosingElement(node)) {
        const attributes = ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.filter((attr) => !ts.isJsxAttribute(attr) || attr.name.getText(parsed) !== 'key'));
        node = ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, attributes);
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  }]);
  const text = ts.createPrinter().printNode(ts.EmitHint.Unspecified, transformed.transformed[0], parsed).replace(/\s+/g, ' ').trim();
  transformed.dispose(); return text;
}
const oldBoot = execFileSync('git', ['show', 'acba0d92460c1af3149abc3775f09888a2943cab:app/index.tsx'], { encoding: 'utf8' });
const jsxMatches = returnedJsx(oldBoot, false) === returnedJsx(fs.readFileSync('app/index.tsx', 'utf8'), true);
const typecheck = JSON.parse(fs.readFileSync('docs/qa/senior-5-2026-10-09/boot/typecheck-results.json', 'utf8'));
const sourceHash = hash('app/index.tsx');
const passed = [lint, biome, diff].every((item) => item.exitCode === 0) && lintResults.every((item) => !item.errorCount && !item.warningCount) && stable.every((item) => item.passed) && runtimeMatches.every((item) => item.passed) && jsxMatches && replay.passed === 64 && replay.failed === 0 && replay.errors.length === 0 && independent.passed === 41 && independent.failed === 0 && independent.errors.length === 0 && typecheck.diagnosticCount === 0;
const result = {
  owner: 'QC', ticket: 'SD5-002', createdAt: new Date().toISOString(), status: passed ? 'PASS' : 'FAILED', sourceHash,
  lint: { run: lint, errors: lintResults.reduce((sum, item) => sum + item.errorCount, 0), warnings: lintResults.reduce((sum, item) => sum + item.warningCount, 0) },
  biome, diff, returnedJsxMatchExceptIntentionalKey: jsxMatches, trackedSourceStable: stable, runtimeMatches,
  counts: { replay: { passed: replay.passed, failed: replay.failed, errors: replay.errors.length }, independent: { passed: independent.passed, failed: independent.failed, errors: independent.errors.length } },
  focusedTypecheck: { developerEvidenceReviewed: true, rerunByQC: false, diagnosticCount: typecheck.diagnosticCount, scope: typecheck.scope, fingerprintMatches: stable.find((item) => item.file.endsWith('/typecheck-results.json'))?.passed === true },
  productionIndependentModules: Object.keys(independent.sources).length,
};
fs.writeFileSync(path.join(__dirname, 'quality-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, counts: result.counts, lint: result.lint, biomeExit: biome.exitCode, diffExit: diff.exitCode, jsxMatches, trackedStable: stable.filter((item) => item.passed).length, independentProductionModules: result.productionIndependentModules, typeEvidenceOnly: result.focusedTypecheck }));
process.exitCode = passed ? 0 : 1;
