const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const qcRoot = 'docs/qa/qc-manage-forms-2026-10-09';
const developerRoot = 'docs/qa/codex-3/manage-imports';
const proposal = read(`${qcRoot}/style-findings.json`);
const initial = read(`${qcRoot}/source-before.json`);
const handoff = read(`${developerRoot}/verification.json`);
const sources = Object.keys(initial.sourceHashes);
const snapshot = () => Object.fromEntries(sources.map((file) => [file, hash(fs.readFileSync(file))]));
const evidenceFiles = [...Object.keys(handoff.artifacts), `${developerRoot}/verification.json`, `${qcRoot}/style-findings.json`, `${qcRoot}/source-before.json`, `${qcRoot}/organize-imports.patch`];
const evidenceSnapshot = () => Object.fromEntries(evidenceFiles.map((file) => [file, hash(fs.readFileSync(file))]));
const sourceBefore = snapshot();
const evidenceBefore = evidenceSnapshot();
const parse = (text) => {
  const source = ts.createSourceFile('form.tsx', text.replace(/\r\n/g, '\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const printer = ts.createPrinter();
  const body = source.statements.filter((node) => !ts.isImportDeclaration(node)).map((node) => printer.printNode(ts.EmitHint.Unspecified, node, source)).join('\n');
  const imports = source.statements.filter(ts.isImportDeclaration).map((node) => ({
    module: node.moduleSpecifier.text,
    typeOnly: !!node.importClause?.isTypeOnly,
    default: node.importClause?.name?.text,
    namespace: node.importClause?.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings) ? node.importClause.namedBindings.name.text : undefined,
    named: node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) ? node.importClause.namedBindings.elements.map((item) => ({ imported: item.propertyName?.text || item.name.text, local: item.name.text, typeOnly: item.isTypeOnly })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) : [],
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return { body, imports, syntaxErrors: source.parseDiagnostics.length };
};
const comparisons = sources.map((file) => {
  const changed = proposal.proposalVerification.find((item) => item.file === file);
  const actual = sourceBefore[file];
  if (!changed) return { file, changed: false, expected: initial.sourceHashes[file], actual, unchanged: actual === initial.sourceHashes[file], matchesDeveloperManifest: actual === handoff.sourceHashes[file] };
  const baseline = fs.readFileSync(path.join(developerRoot, 'baseline', `${file}.txt`));
  const before = parse(baseline.toString('utf8'));
  const after = parse(fs.readFileSync(file, 'utf8'));
  return { file, changed: true, baselineSha256: hash(baseline), matchesOriginalQC: hash(baseline) === changed.originalSha256 && changed.originalSha256 === initial.sourceHashes[file], expected: changed.proposalSha256, actual, rawHashMatchesQCProposal: actual === changed.proposalSha256, matchesDeveloperManifest: actual === handoff.sourceHashes[file], syntaxErrors: before.syntaxErrors + after.syntaxErrors, bodyUnchanged: before.body === after.body, importBindingsUnchanged: JSON.stringify(before.imports) === JSON.stringify(after.imports) };
});
const run = (name, binary, args) => {
  const result = spawnSync(binary, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, `${name}.out.txt`), result.stdout || '');
  fs.writeFileSync(path.join(__dirname, `${name}.err.txt`), result.stderr || '');
  return { command: [binary, ...args], exitCode: result.status, error: result.error?.message };
};
const lint = run('eslint', process.execPath, ['node_modules/eslint/bin/eslint.js', ...sources, '--no-cache', '--max-warnings', '0', '--format', 'json']);
const lintResults = read(path.join(__dirname, 'eslint.out.txt')).map((item) => ({ file: path.relative(process.cwd(), item.filePath).replaceAll('\\', '/'), errors: item.errorCount, warnings: item.warningCount, messages: item.messages }));
const biome = run('biome', process.execPath, ['node_modules/@biomejs/biome/bin/biome', 'check', ...sources]);
const diff = run('diff-check', 'git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', ...sources]);
const sourceAfter = snapshot();
const evidenceAfter = evidenceSnapshot();
const sourceStable = JSON.stringify(sourceBefore) === JSON.stringify(sourceAfter);
const evidenceStable = JSON.stringify(evidenceBefore) === JSON.stringify(evidenceAfter);
const manifestEvidenceMatches = Object.entries(handoff.artifacts).every(([file, expected]) => evidenceBefore[file] === expected);
const passed = comparisons.every((item) => item.matchesDeveloperManifest && (item.changed ? item.matchesOriginalQC && item.rawHashMatchesQCProposal && item.syntaxErrors === 0 && item.bodyUnchanged && item.importBindingsUnchanged : item.unchanged)) && sourceStable && evidenceStable && manifestEvidenceMatches && lint.exitCode === 0 && biome.exitCode === 0 && diff.exitCode === 0;
const result = { owner: 'QC', finding: 'QC-MANAGE-FORMS-001', createdAt: new Date().toISOString(), status: passed ? 'PASS_DELTA' : 'CHECK_FAILED', comparisons, sourceBefore, sourceAfter, sourceStable, evidenceBefore, evidenceAfter, evidenceStable, manifestEvidenceMatches, gates: { eslint: { ...lint, files: lintResults }, biome, diff }, priorBrowserChecks: { passed: 92, rerunThisBatch: false, reason: 'Exact QC proposal; non-import AST and import bindings unchanged. Original results remain historical.' } };
fs.writeFileSync(path.join(__dirname, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, sourceFiles: sources.length, importOnlyFiles: comparisons.filter((item) => item.changed).length, sourceStable, evidenceStable, manifestEvidenceMatches, eslintExitCode: lint.exitCode, biomeExitCode: biome.exitCode, diffExitCode: diff.exitCode }));
process.exitCode = passed ? 0 : 1;
