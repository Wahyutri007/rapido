// Write candidates in QC evidence only. Never writes application source.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const { spawnSync } = require('node:child_process');
const proposalRoot = path.join(__dirname, 'proposal');
fs.mkdirSync(proposalRoot, { recursive: true });
const files = ['general', 'adjusting'].map((name) => ({ name, source: `app/(no-layout)/(back-office)/report/accounting/${name === 'general' ? 'general-journal' : 'adjusting-journal'}/modify.tsx`, proposal: path.join(proposalRoot, `${name}.tsx`) }));
const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'source-before.json'), 'utf8')).hashes;
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
for (const item of files) {
  const source = fs.readFileSync(item.source, 'utf8');
  if (hash(source) !== expected[item.source]) throw new Error(`Source changed during review: ${item.source}`);
  const original = '\tconst isBalanced =\n\t\tNumber.isFinite(totalDebit)';
  const replacement = '\tconst isBalanced =\n\t\tlines.every(\n\t\t\t(line) =>\n\t\t\t\tNumber.isFinite(line.debit) &&\n\t\t\t\tNumber.isFinite(line.credit) &&\n\t\t\t\tline.debit >= 0 &&\n\t\t\t\tline.credit >= 0,\n\t\t) &&\n\t\tNumber.isFinite(totalDebit)';
  if (source.split(original).length !== 2) throw new Error('Expected one balanced predicate');
  fs.writeFileSync(item.proposal, source.replace(original, replacement));
}
const biome = spawnSync(process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', ...files.map((item) => item.proposal)], { encoding: 'utf8' });
fs.writeFileSync(path.join(__dirname, 'proposal-biome.out.txt'), biome.stdout || '');
fs.writeFileSync(path.join(__dirname, 'proposal-biome.err.txt'), biome.stderr || '');
// Replace only the balanced initializer by a marker to compare the remaining AST.
const normalize = (text) => {
  const source = ts.createSourceFile('candidate.tsx', text.replace(/\r\n/g, '\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const transform = ts.transform(source, [(context) => (root) => {
    const visit = (node) => ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'isBalanced' ? ts.factory.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type, ts.factory.createIdentifier('QC_BALANCED_PREDICATE')) : ts.visitEachChild(node, visit, context);
    return ts.visitNode(root, visit);
  }]);
  const printed = ts.createPrinter().printFile(transform.transformed[0]);
  transform.dispose();
  return { printed, syntaxErrors: source.parseDiagnostics.length };
};
const comparisons = files.map((item) => {
  const original = fs.readFileSync(item.source, 'utf8');
  const candidate = fs.readFileSync(item.proposal, 'utf8');
  const before = normalize(original), after = normalize(candidate);
  return { source: item.source, candidate: path.relative(process.cwd(), item.proposal).replaceAll('\\', '/'), sourceSha256: hash(original), proposalSha256: hash(candidate), astUnchangedExceptBalancedPredicate: before.printed === after.printed, syntaxErrors: before.syntaxErrors + after.syntaxErrors };
});
const patches = files.map((item) => {
  const diff = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--', item.source, item.proposal], { encoding: 'utf8' });
  if (diff.status !== 1 || !diff.stdout) throw new Error('Candidate diff could not be generated');
  return diff.stdout.replace(/^diff --git .*$/m, `diff --git a/${item.source} b/${item.source}`).replace(/^--- .*$/m, `--- a/${item.source}`).replace(/^\+\+\+ .*$/m, `+++ b/${item.source}`);
});
const patchFile = path.join(__dirname, 'balanced-badge.patch');
fs.writeFileSync(patchFile, patches.join(''));
const applicability = spawnSync('git', ['apply', '--check', patchFile], { encoding: 'utf8' });
const passed = biome.status === 0 && applicability.status === 0 && comparisons.every((item) => item.astUnchangedExceptBalancedPredicate && item.syntaxErrors === 0);
const result = { owner: 'QC', finding: 'QC-JOURNAL-001', appliedToApplication: false, comparisons, biome: { exitCode: biome.status }, applicability: { exitCode: applicability.status, stdout: applicability.stdout, stderr: applicability.stderr }, patch: 'balanced-badge.patch', passed };
fs.writeFileSync(path.join(__dirname, 'proposal-verification.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ passed, astUnchangedExceptBalancedPredicate: comparisons.every((item) => item.astUnchangedExceptBalancedPredicate), biomeExitCode: biome.status, patchCheckExitCode: applicability.status }));
process.exitCode = passed ? 0 : 1;
