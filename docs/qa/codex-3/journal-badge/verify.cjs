const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), ts = require("typescript");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const directory = path.relative(process.cwd(), __dirname).replaceAll("\\", "/");
const validation = read(`${directory}/results.json`), lifecycle = read(`${directory}/regression-results.json`);
const replay = read(`${directory}/independent-results.json`), baseline = read(`${directory}/baseline.json`);
const quality = read(`${directory}/quality-results.json`), types = read(`${directory}/typecheck-results.json`);
const qcDirectory = "docs/qa/qc-journals-2026-10-09";
const qc = read(`${qcDirectory}/DECISION.json`), proposal = read(`${qcDirectory}/proposal-verification.json`);
const sources = ["app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx", "app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx"];
const testedSourceMatches = [validation, lifecycle, replay, types].flatMap((report, index) => Object.entries(report.sourceHashes).map(([file, expected]) => ({
	suite: ["validation", "lifecycle", "qcCasesDeveloperReplay", "typecheck"][index], file, expected, actual: hash(file), passed: expected === hash(file),
})));
const baselineSnapshotMatches = sources.map((file, index) => {
	const snapshot = `${directory}/${index ? "adjusting" : "general"}-modify.before.tsx.txt`;
	return { file, snapshot, expected: qc.reviewedSourceHashes[file], actual: hash(snapshot), passed: hash(snapshot) === qc.reviewedSourceHashes[file] && baseline.sourceHashes[file] === qc.reviewedSourceHashes[file] };
});
const proposalMatches = proposal.comparisons.map((item) => ({ file: item.source, expected: item.proposalSha256, actual: hash(item.source), passed: hash(item.source) === item.proposalSha256 }));
const withoutBalanced = (file) => {
	const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const transformed = ts.transform(ast, [(context) => {
		const visit = (node) => ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "isBalanced"
			? ts.factory.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type, ts.factory.createIdentifier("BALANCED_PREDICATE"))
			: ts.visitEachChild(node, visit, context);
		return (node) => ts.visitNode(node, visit);
	}]);
	const printed = ts.createPrinter().printFile(transformed.transformed[0]); transformed.dispose(); return printed;
};
const astComparisons = baselineSnapshotMatches.map((item) => ({ file: item.file, comparison: "Entire AST unchanged except initializer isBalanced", passed: withoutBalanced(item.snapshot) === withoutBalanced(item.file) }));
const originalDirectory = "docs/qa/codex-3/journal-validation";
const copiedRunnerMatches = [["validation.cjs", "check.cjs"], ["regression.cjs", "regression.cjs"], ["quality.cjs", "quality.cjs"], ["typecheck.cjs", "typecheck.cjs"]].map(([file, original]) => ({
	file: `${directory}/${file}`, origin: `${originalDirectory}/${original}`, sha256: hash(`${directory}/${file}`), passed: hash(`${directory}/${file}`) === hash(`${originalDirectory}/${original}`),
}));
const qcOriginal = fs.readFileSync(`${qcDirectory}/independent.cjs`, "utf8").replace(/\r\n/g, "\n");
const expectedReplay = qcOriginal.replace("owner:'QC',mode:", "owner:'Codex-3',origin:'Developer replay of QC cases, not independent QA/QC approval',mode:");
const replayProvenance = { origin: `${qcDirectory}/independent.cjs`, sha256: hash(`${qcDirectory}/independent.cjs`), metadataOnlyChange: expectedReplay !== qcOriginal && expectedReplay === fs.readFileSync(`${directory}/qc-replay.cjs`, "utf8").replace(/\r\n/g, "\n") };
const unchangedContractMatches = Object.entries(baseline.sourceHashes).filter(([file]) => !sources.includes(file)).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
const passed = validation.passed === 187 && validation.failed === 0 && validation.errors.length === 0 &&
	lifecycle.passed === 55 && lifecycle.failed === 0 && lifecycle.errors.length === 0 &&
	replay.passed === 41 && replay.failed === 0 && replay.errors.length === 0 && baseline.passed === 37 && baseline.failed === 4 &&
	[validation, lifecycle, replay].every((report) => report.checks.every((item) => item.passed)) &&
	quality.lint.exitCode === 0 && quality.lint.files.every((file) => file.errorCount === 0 && file.warningCount === 0) &&
	quality.biome.exitCode === 0 && quality.format.exitCode === 0 && quality.diff.exitCode === 0 && quality.renderComparisons.every((item) => item.passed) &&
	types.exitCode === 0 && types.diagnostics.length === 0 && replayProvenance.metadataOnlyChange &&
	[testedSourceMatches, baselineSnapshotMatches, proposalMatches, astComparisons, copiedRunnerMatches, unchangedContractMatches].every((list) => list.every((item) => item.passed));
const artifacts = ["HANDOFF.md", "validation.cjs", "regression.cjs", "qc-replay.cjs", "quality.cjs", "typecheck.cjs", "verify.cjs", "general-modify.before.tsx.txt", "adjusting-modify.before.tsx.txt", "baseline.json", "results.json", "regression-results.json", "independent-results.json", "quality-results.json", "typecheck-results.json"];
const manifest = {
	owner: "Codex-3", finding: "QC-JOURNAL-001", status: passed ? "READY_FOR_QC_RECHECK" : "CHECK_FAILED", createdAt: new Date().toISOString(),
	approval: "Developer correction/replay only; P2 remains OPEN until QC recheck, publication belongs to PM",
	results: { baseline: { passed: baseline.passed, failed: baseline.failed }, validation: { passed: validation.passed, failed: validation.failed }, lifecycle: { passed: lifecycle.passed, failed: lifecycle.failed }, qcCasesDeveloperReplay: { passed: replay.passed, failed: replay.failed }, assertionExecutions: validation.passed + lifecycle.passed + replay.passed, runtimeErrors: validation.errors.length + lifecycle.errors.length + replay.errors.length, typeDiagnostics: types.diagnostics.length, eslintErrors: quality.lint.files.reduce((sum, file) => sum + file.errorCount, 0), eslintWarnings: quality.lint.files.reduce((sum, file) => sum + file.warningCount, 0), biomeExitCode: quality.biome.exitCode, formatExitCode: quality.format.exitCode, diffExitCode: quality.diff.exitCode },
	changedSource: Object.fromEntries(sources.map((file) => [file, hash(file)])),
	readOnlyContractFingerprint: Object.fromEntries(unchangedContractMatches.map(({ file }) => [file, hash(file)])),
	artifactFingerprint: Object.fromEntries(artifacts.map((file) => [`${directory}/${file}`, hash(`${directory}/${file}`)])),
	testedSourceMatches, baselineSnapshotMatches, proposalMatches, astComparisons, copiedRunnerMatches, replayProvenance, unchangedContractMatches,
	qcEvidence: Object.fromEntries(["REPORT.md", "DECISION.json", "balanced-badge.patch", "proposal-verification.json"].map((file) => [`${qcDirectory}/${file}`, hash(`${qcDirectory}/${file}`)])),
	limitations: ["Developer replay includes overlapping assertions; not new independent QA/QC approval", "Route/store/schema and production numeric declarations with UI/native/router/calendar adapters", "No API/persistence/ledger posting/browser/native/Figma/full-project certification", "Store ID Senior8 patch is dependency only; validator/schema/helper/payload/JSX unchanged"],
};
fs.writeFileSync(`${directory}/verification.json`, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ status: manifest.status, assertionExecutions: manifest.results.assertionExecutions, testedFingerprintChecks: testedSourceMatches.length, exactQCProposal: proposalMatches.every((item) => item.passed), astUnchangedExceptPredicate: astComparisons.every((item) => item.passed), failedMatches: [testedSourceMatches, baselineSnapshotMatches, proposalMatches, astComparisons, copiedRunnerMatches, unchangedContractMatches].flat().filter((item) => !item.passed), replayMetadataOnlyChange: replayProvenance.metadataOnlyChange }));
process.exitCode = passed ? 0 : 1;
