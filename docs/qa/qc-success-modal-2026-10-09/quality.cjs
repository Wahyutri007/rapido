const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), ts = require('typescript'), { spawnSync } = require('node:child_process');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const source = 'components/common/SuccessModal.tsx', candidate = path.join(__dirname, 'proposal/SuccessModal.tsx');
function run(name, args, input) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', input, maxBuffer: 8 * 1024 * 1024 });
  fs.writeFileSync(path.join(__dirname, name + '.out.txt'), result.stdout || ''); fs.writeFileSync(path.join(__dirname, name + '.err.txt'), result.stderr || '');
  return { args, exitCode: result.status, error: result.error?.message };
}
const lint = run('eslint', ['node_modules/eslint/bin/eslint.js', source, '--no-cache', '--max-warnings', '0', '--format', 'json']);
const candidateLint = run('proposal-eslint', ['node_modules/eslint/bin/eslint.js', '--stdin', '--stdin-filename', source, '--max-warnings', '0', '--format', 'json'], fs.readFileSync(candidate, 'utf8'));
const lintCounts = name => JSON.parse(fs.readFileSync(path.join(__dirname, name + '.out.txt'), 'utf8')).reduce((sum, x) => ({ errors: sum.errors + x.errorCount, warnings: sum.warnings + x.warningCount }), { errors: 0, warnings: 0 });
const biome = run('biome', ['node_modules/@biomejs/biome/bin/biome', 'check', source]);
// With stdin, Biome requires --write to return the fixed contents on stdout.
// This never writes a source file. Require byte-identical output to the tested copy.
const candidateBiome = run('proposal-biome', ['node_modules/@biomejs/biome/bin/biome', 'check', '--write', '--stdin-file-path=' + source], fs.readFileSync(candidate, 'utf8'));
const proposalBiomeOutputUnchanged = fs.readFileSync(path.join(__dirname, 'proposal-biome.out.txt'), 'utf8') === fs.readFileSync(candidate, 'utf8');
const diffRun = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--check', '--', source], { encoding: 'utf8' });
fs.writeFileSync(path.join(__dirname, 'diff.out.txt'), diffRun.stdout || ''); fs.writeFileSync(path.join(__dirname, 'diff.err.txt'), diffRun.stderr || '');
function normalized(text) {
  const parsed = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const transformed = ts.transform(parsed, [context => {
    function visit(node) {
      if (ts.isImportSpecifier(node) && ['Dimensions', 'useWindowDimensions', 'ScrollView'].includes(node.name.text)) return undefined;
      if (ts.isVariableStatement(node) && /^(const\{width\}|const\{width,height\})=useWindowDimensions\(\);$/.test(node.getText(parsed).replace(/\s/g, ''))) return undefined;
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(parsed) === 'ScrollView') return ts.visitNodes(node.children, visit);
      if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(parsed) === 'Image') node = ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.filter(x => !ts.isJsxAttribute(x) || x.name.getText(parsed) !== 'style')));
      if (ts.isJsxOpeningElement(node) && node.tagName.getText(parsed) === 'ModalContent') {
        node = ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, ts.factory.updateJsxAttributes(node.attributes, node.attributes.properties.map(attr => {
          if (!ts.isJsxAttribute(attr) || attr.name.getText(parsed) !== 'style') return attr;
          const expression = attr.initializer.expression;
          const value = ts.factory.updateObjectLiteralExpression(expression, expression.properties.filter(prop => !['width', 'maxHeight'].includes(prop.name?.getText(parsed))));
          return ts.factory.updateJsxAttribute(attr, attr.name, ts.factory.updateJsxExpression(attr.initializer, undefined, value));
        })));
      }
      return ts.visitEachChild(node, visit, context);
    }
    return root => ts.visitNode(root, visit);
  }]);
  const result = ts.createPrinter().printFile(transformed.transformed[0]).replace(/\s+/g, ' ').trim(); transformed.dispose(); return result;
}
const baseline = fs.readFileSync(path.join(__dirname, 'SuccessModal.before.tsx.txt'), 'utf8');
const actual = fs.readFileSync(source, 'utf8'), proposed = fs.readFileSync(candidate, 'utf8');
const currentContractUnchangedExceptGeometry = normalized(baseline) === normalized(actual);
const proposalContractUnchangedExceptGeometryAndScrollWrapper = normalized(actual) === normalized(proposed);
const before = read('source-before.json');
const isolation = read('stock-isolation.json');
const externalContext = new Set(isolation.mutableContext.map(x => x.file));
const externalContextChanges = isolation.mutableContext.map(x => ({ ...x, actual: hash(x.file), certified: false }));
const stable = Object.entries(before.hashes).filter(([file]) => !externalContext.has(file)).map(([file, expected]) => {
  const testedPath = file === isolation.stock.sourcePath ? isolation.stock.reviewedFixture : file;
  return { file, testedPath, expected, actual: hash(testedPath), passed: expected === hash(testedPath), disposition: testedPath === file ? 'current source' : 'exact reviewed historical caller contract; current live Stock excluded' };
});
const historic = before.historicalMatches.map(x => ({ ...x, actual: hash(x.file), passed: x.expected === hash(x.file) }));
const fixtureHashes = read('fixture-before.json');
const fixtures = Object.entries(fixtureHashes).map(([file, originalExpected]) => {
  const expected = file === isolation.entry.file ? isolation.entry.isolatedHash : originalExpected;
  return { file, originalExpected, expected, actual: hash(file), passed: expected === hash(file), intentionallyIsolated: file === isolation.entry.file };
});
const lifecycle = read('delete-lifecycle/results.json'), stock = read('stock-final/browser-results.json'), shared = read('modal-browser-results.json');
const orientation = read('orientation-current/results.json'), proposalOrientation = read('orientation-proposal/results.json');
const proposalShared = read('proposal/modal-browser-results.json'), proposalStock = read('proposal/stock-final/browser-results.json'), proposalLifecycle = read('proposal/delete-lifecycle/results.json');
const proposalRuntimeMatches = Object.entries(proposalLifecycle.productionModuleHashes).map(([file, expected]) => ({ file, testedPath: file === source ? candidate : file, expected, actual: hash(file === source ? candidate : file), passed: expected === hash(file === source ? candidate : file) }));
const runtimeMatches = Object.entries(lifecycle.productionModuleHashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile), parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const roots = [source, candidate];
const program = ts.createProgram([...roots, ...parsed.fileNames.filter(file => file.endsWith('.d.ts'))], { ...parsed.options, noEmit: true });
const diagnostics = ts.getPreEmitDiagnostics(program).map(item => ({ file: item.file?.fileName, message: ts.flattenDiagnosticMessageText(item.messageText, '\n') }));
const typeSources = program.getSourceFiles().filter(file => !file.fileName.includes('node_modules') && fs.existsSync(file.fileName)).map(file => ({ file: path.relative(process.cwd(), file.fileName).replaceAll('\\', '/'), sha256: hash(file.fileName) }));
fs.writeFileSync(path.join(__dirname, 'typecheck-results.json'), JSON.stringify({ owner: 'QC', roots, scope: 'Current SuccessModal + proposal root and imported/declaration closure; not full project', diagnosticCount: diagnostics.length, diagnostics, sourceHashes: typeSources }, null, 2) + '\n');
const currentCounts = { stockBrowser: { passed: stock.passed, failed: stock.failed }, sharedBrowser: { passed: shared.passed, failed: shared.failed }, lifecycle: { passed: lifecycle.passed, failed: lifecycle.failed }, orientation: { passed: orientation.passed, failed: orientation.failed } };
const noBrowserErrors = result => (result.errors || []).length === 0 && (result.consoleErrors || []).length === 0 && (result.blocked || result.blockedRequests || []).length === 0 && !result.exception;
const codeAndEvidencePass = [lint, candidateLint, biome, candidateBiome].every(x => x.exitCode === 0) && proposalBiomeOutputUnchanged && diffRun.status === 0 && [lintCounts('eslint'), lintCounts('proposal-eslint')].every(x => x.errors === 0 && x.warnings === 0) && stable.every(x => x.passed) && historic.every(x => x.passed) && fixtures.every(x => x.passed) && runtimeMatches.every(x => x.passed) && currentContractUnchangedExceptGeometry && proposalContractUnchangedExceptGeometryAndScrollWrapper && diagnostics.length === 0 && lifecycle.passed === 156 && lifecycle.failed === 0 && lifecycle.runtimeErrors.length === 0 && lifecycle.controlFallbacks.length === 0 && stock.passed === 36 && stock.failed === 0 && stock.executionMode === 'REVIEWED_STOCK_CONTRACT_WITH_CURRENT_SUCCESSMODAL' && shared.passed === 51 && shared.failed === 0 && [stock, shared, orientation, proposalOrientation].every(noBrowserErrors) && proposalOrientation.failed === 0 && proposalOrientation.sourceHash === hash(candidate) && hash(candidate) === hash('.expo/qc-success-modal-candidate.tsx');
const proposalRegressionPass = proposalShared.passed === 51 && proposalShared.failed === 0 && proposalShared.sourceHash === hash(candidate) && proposalStock.passed === 36 && proposalStock.failed === 0 && proposalLifecycle.passed === 156 && proposalLifecycle.failed === 0 && proposalLifecycle.runtimeErrors.length === 0 && proposalLifecycle.controlFallbacks.length === 0 && proposalLifecycle.mode === 'PROPOSAL_ONLY_NOT_APPLIED' && proposalRuntimeMatches.every(x => x.passed) && proposalOrientation.passed === 27 && [proposalShared, proposalStock].every(noBrowserErrors);
const result = { owner: 'QC', status: codeAndEvidencePass && proposalRegressionPass ? 'CODE_AND_EVIDENCE_PASS' : 'FAILED', applicationGate: orientation.failed ? 'CHANGES_REQUESTED' : 'PASS_RECHECK', sourceHash: hash(source), proposalHash: hash(candidate), applied: false,
  lint: { run: lint, ...lintCounts('eslint') }, proposalLint: { run: candidateLint, ...lintCounts('proposal-eslint') }, biome, proposalBiome: candidateBiome, proposalBiomeOutputUnchanged, diffExit: diffRun.status,
  currentContractUnchangedExceptGeometry, proposalContractUnchangedExceptGeometryAndScrollWrapper, trackedFilesStable: stable, externalContextChanges, stockIsolation: isolation, historicalMatches: historic, fixtureMatches: fixtures, runtimeMatches,
  currentCounts, totalCurrentPassed: stock.passed + shared.passed + lifecycle.passed + orientation.passed, totalCurrentFailed: stock.failed + shared.failed + lifecycle.failed + orientation.failed, includesOverlappingCoverage: true,
  proposalOrientation: { passed: proposalOrientation.passed, failed: proposalOrientation.failed, errors: proposalOrientation.errors.length }, proposalRegression: { pass: proposalRegressionPass, stock: 36, shared: 51, lifecycle: 156, orientation: 27, totalPassed: proposalStock.passed + proposalShared.passed + proposalLifecycle.passed + proposalOrientation.passed, totalFailed: proposalStock.failed + proposalShared.failed + proposalLifecycle.failed + proposalOrientation.failed }, proposalRuntimeMatches, focusedTypecheck: { rerunByQC: true, roots, diagnostics: diagnostics.length, importedSourceCount: typeSources.length, fullProjectCheck: false },
};
fs.writeFileSync(path.join(__dirname, 'quality-results.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, applicationGate: result.applicationGate, currentCounts, passed: result.totalCurrentPassed, failed: result.totalCurrentFailed, proposalOrientation: result.proposalOrientation, lint: result.lint, proposalLint: result.proposalLint, biomeExit: biome.exitCode, proposalBiomeExit: candidateBiome.exitCode, diffExit: diffRun.status, currentContractUnchangedExceptGeometry, proposalContractUnchangedExceptGeometryAndScrollWrapper, typeDiagnostics: diagnostics.length, trackedStable: stable.filter(x => x.passed).length, sourceDrift: stable.filter(x => !x.passed).map(x => x.file) }));
process.exitCode = codeAndEvidencePass && proposalRegressionPass ? 0 : 1;
