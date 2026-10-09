const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const { spawnSync } = require('node:child_process');
const { ESLint } = require('eslint');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const write = (name, data) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(data, null, 2) + '\n');
const sources = ['app/(no-layout)/manage/income/modify.tsx', 'app/(no-layout)/manage/income/detail.tsx', 'components/feature/manage/income/IncomeForm.tsx', 'components/feature/accounting/CashEntryForm.tsx'];
const candidates = [{ file: sources[1], copy: path.join(__dirname, 'proposal/detail.tsx'), baseline: 'IncomeDetailScreen', current: 'IncomeDetailEditor', tagAttributes: { DetailBottomActions: ['onDelete'], DeleteConfirmModal: ['onClose', 'onConfirm'] } }, { file: sources[3], copy: path.join(__dirname, 'proposal/CashEntryForm.tsx'), baseline: 'CashEntryForm', current: 'CashEntryForm', tagAttributes: { BottomActionButton: ['onPress'] } }];
const run = (name, executable, args) => {
  const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, `${name}.out.txt`), result.stdout || ''); fs.writeFileSync(path.join(__dirname, `${name}.err.txt`), result.stderr || '');
  return { executable, args, exitCode: result.status, error: result.error?.message };
};
function returnedJsx(file, functionName, ignores) {
  const parsed = ts.createSourceFile(file, fs.readFileSync(file, 'utf8').replaceAll('\r\n', '\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = parsed.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === functionName);
  const returned = fn.body.statements.filter(ts.isReturnStatement).at(-1).expression;
  const transformed = ts.transform(returned, [(context) => {
    const visit = (node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const ignore = ignores[node.tagName.getText(parsed)];
        if (ignore) {
          const attributes = ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.filter((attr) => !ts.isJsxAttribute(attr) || !ignore.includes(attr.name.getText(parsed))));
          node = ts.isJsxOpeningElement(node) ? ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, attributes) : ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, attributes);
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  }]);
  const text = ts.createPrinter().printNode(ts.EmitHint.Unspecified, transformed.transformed[0], parsed).replace(/\s+/g, ' ').trim(); transformed.dispose(); return text;
}
(async () => {
  const before = read('source-before.json');
  const lint = run('source-eslint', process.execPath, ['node_modules/eslint/bin/eslint.js', ...sources, '--no-cache', '--max-warnings', '0', '--format', 'json']);
  const sourceLint = JSON.parse(fs.readFileSync(path.join(__dirname, 'source-eslint.out.txt'), 'utf8'));
  const biome = run('source-biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', ...sources]);
  const diff = run('source-diff', 'git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', ...sources]);
  const eslint = new ESLint({ cwd: process.cwd() });
  const candidateLint = (await Promise.all(candidates.map(({ file, copy }) => eslint.lintText(fs.readFileSync(copy, 'utf8'), { filePath: path.resolve(file) })))).flat().map((item) => ({ file: item.filePath, errors: item.errorCount, warnings: item.warningCount, messages: item.messages }));
  const candidateBiome = run('proposal-biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', ...candidates.map((item) => item.copy)]);
  const jsxMatches = candidates.map((item) => ({ file: item.file, normalizedBindings: item.tagAttributes, passed: returnedJsx(item.file, item.baseline, item.tagAttributes) === returnedJsx(item.copy, item.current, item.tagAttributes) }));
  let patch = '';
  for (const item of candidates) {
    const result = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--', item.file, item.copy], { encoding: 'utf8' });
    if (result.status !== 1 || !result.stdout) throw new Error('Proposal diff missing');
    patch += result.stdout.replace(/^diff --git .*$/m, `diff --git a/${item.file} b/${item.file}`).replace(/^--- .*$/m, `--- a/${item.file}`).replace(/^\+\+\+ .*$/m, `+++ b/${item.file}`);
  }
  const patchFile = path.join(__dirname, 'income-lifecycle.patch'); fs.writeFileSync(patchFile, patch);
  const apply = run('proposal-apply-check', 'git', ['-c', 'core.autocrlf=false', 'apply', '--check', patchFile]);
  const stable = Object.entries(before.hashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
  const current = read('lifecycle-results.json'), candidate = read('proposal-results.json'), expense = read('expense-proposal-results.json');
  const sourceMap = Object.fromEntries(candidates.map((item) => [item.file, item.copy]));
  const runtimeMatches = [current, candidate, expense].flatMap((report, index) => Object.entries(report.sourceHashes).map(([file, expected]) => { const actual = hash(index && sourceMap[file] ? sourceMap[file] : file); return { suite: ['current', 'candidate-income', 'candidate-expense'][index], file, expected, actual, passed: expected === actual }; }));
  const passed = [lint, biome, diff, candidateBiome, apply].every((item) => item.exitCode === 0) && sourceLint.every((item) => !item.errorCount && !item.warningCount) && candidateLint.every((item) => !item.errors && !item.warnings) && jsxMatches.every((item) => item.passed) && stable.every((item) => item.passed) && runtimeMatches.every((item) => item.passed) && candidate.failed === 0 && candidate.errors.length === 0 && expense.failed === 0 && expense.errors.length === 0;
  const output = { owner: 'QC', createdAt: new Date().toISOString(), status: passed ? 'PASS_PROPOSAL_AND_FINGERPRINTS' : 'FAILED', currentApplicationDecision: 'CHANGES_REQUESTED', sourceLint: { run: lint, errors: sourceLint.reduce((sum, item) => sum + item.errorCount, 0), warnings: sourceLint.reduce((sum, item) => sum + item.warningCount, 0) }, sourceBiome: biome, diff, candidateLint, candidateBiome, jsxMatches, patch: { file: 'income-lifecycle.patch', sha256: hash(patchFile), applied: false, applyCheck: apply }, trackedSourceStable: stable, runtimeMatches, reviewedSourceHashes: Object.fromEntries(sources.map((file) => [file, hash(file)])), proposalSourceHashes: Object.fromEntries(candidates.map((item) => [item.file, hash(item.copy)])), counts: { current: { passed: current.passed, failed: current.failed, errors: current.errors.length }, candidate: { passed: candidate.passed, failed: candidate.failed, errors: candidate.errors.length }, candidateExpense: { passed: expense.passed, failed: expense.failed, errors: expense.errors.length }, replayedModel: read('model-results.json').checks.length } };
  write('quality-results.json', output);
  console.log(JSON.stringify({ status: output.status, currentApplicationDecision: output.currentApplicationDecision, counts: output.counts, trackedSourceFiles: stable.length, trackedStable: stable.every((item) => item.passed), jsxMatches: jsxMatches.every((item) => item.passed), sourceLint: output.sourceLint, candidateLintClean: candidateLint.every((item) => !item.errors && !item.warnings), candidateBiomeExit: candidateBiome.exitCode, applyCheckExit: apply.exitCode, applied: false }));
  process.exitCode = passed ? 0 : 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
