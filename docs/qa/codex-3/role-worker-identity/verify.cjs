// Verify this supplement without rerunning suites or changing historical inventories.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const directory = path.relative(process.cwd(), __dirname).replaceAll("\\", "/");
const results = read(`${directory}/results.json`);
const baseline = read(`${directory}/baseline.json`);
const quality = read(`${directory}/quality-results.json`);
const types = read(`${directory}/typecheck-results.json`);
const changed = [
	"components/feature/manage/roles/RoleModifyScreen.tsx",
	"components/feature/manage/workers/WorkerModifyScreen.tsx",
];
const testedSourceMatches = [results, quality, types].flatMap((report, index) =>
	Object.entries(report.sourceHashes).map(([file, expected]) => {
		const actual = hash(file);
		return { suite: ["lifecycle", "quality", "typecheck"][index], file, expected, actual, passed: expected === actual };
	}),
);
const baselineSnapshotMatches = changed.map((file, index) => {
	const snapshot = `${directory}/${index ? "worker" : "role"}.before.tsx.txt`;
	const actual = hash(snapshot);
	return { file, snapshot, expected: baseline.sourceHashes[file], actual, passed: baseline.sourceHashes[file] === actual };
});
const unchangedContractMatches = Object.entries(results.sourceHashes)
	.filter(([file]) => !changed.includes(file))
	.map(([file, expected]) => ({ file, expected, baseline: baseline.sourceHashes[file], passed: expected === baseline.sourceHashes[file] }));
const passed = results.passed === 106 && results.failed === 0 && results.errors.length === 0 &&
	results.checks.length === 106 && results.checks.every((item) => item.passed) &&
	baseline.passed === 75 && baseline.failed === 31 && baseline.errors.length === 0 &&
	quality.status === "PASS" && quality.lint.exitCode === 0 &&
	quality.lint.files.every((file) => file.errors === 0 && file.warnings === 0) &&
	quality.biome.exitCode === 0 && quality.diff.exitCode === 0 &&
	quality.renderChecks.every((item) => item.passed) && types.exitCode === 0 && types.diagnostics.length === 0 &&
	testedSourceMatches.every((item) => item.passed) && baselineSnapshotMatches.every((item) => item.passed) &&
	unchangedContractMatches.every((item) => item.passed);
const artifacts = [
	"HANDOFF.md", "check.cjs", "baseline.json", "results.json",
	"quality.cjs", "quality-results.json", "typecheck.cjs", "typecheck-results.json",
	"role.before.tsx.txt", "worker.before.tsx.txt", "verify.cjs",
];
const manifest = {
	owner: "Codex-3", ticket: "SD3-004", status: passed ? "READY_FOR_QA" : "CHECK_FAILED",
	createdAt: new Date().toISOString(),
	approval: "Developer evidence only; independent QA/QC review and PM publication remain pending",
	results: {
		baseline: { passed: baseline.passed, failed: baseline.failed },
		final: { passed: results.passed, failed: results.failed, runtimeErrors: results.errors.length },
		typeDiagnostics: types.diagnostics.length,
		eslintErrors: quality.lint.files.reduce((sum, file) => sum + file.errors, 0),
		eslintWarnings: quality.lint.files.reduce((sum, file) => sum + file.warnings, 0),
		biomeExitCode: quality.biome.exitCode, diffExitCode: quality.diff.exitCode,
		jsxComparisonsPassed: quality.renderChecks.every((item) => item.passed),
	},
	changedSource: Object.fromEntries(changed.map((file) => [file, hash(file)])),
	readOnlyContractFingerprint: Object.fromEntries(unchangedContractMatches.map(({ file }) => [file, hash(file)])),
	artifactFingerprint: Object.fromEntries(artifacts.map((file) => [`${directory}/${file}`, hash(`${directory}/${file}`)])),
	localRawLintEvidence: fs.existsSync(".expo/codex-3-role-worker-lint.json") ? {
		file: ".expo/codex-3-role-worker-lint.json", sha256: hash(".expo/codex-3-role-worker-lint.json"),
		reusedOnUnchangedSource: Boolean(quality.lint.reused),
	} : null,
	testedSourceMatches, baselineSnapshotMatches, unchangedContractMatches,
	limitations: [
		"Actual routes/editors/RHF/Zod/Role helpers/worker multipart helper; query/mutation/error mapper/router/native/UI/fetch adapters",
		"Node FormData/Blob and web image fixture, no HTTP/backend write or production Query/Axios/invalidation execution",
		"Existing request already sent is not cancelled; guard prevents stale UI and request after late image preparation",
		"No browser/full navigator/root-auth/SSR/native/accessibility/Figma or full-project TypeScript gate",
		"Historical browser/router/Laravel results are not reruns on these new editor hashes",
		"JSX comparison excludes only submit event binding and saved disabled condition; no new screenshot or visual approval",
	],
};
write(`${directory}/verification.json`, manifest);
if (passed && process.argv.includes("--update-main")) {
	const file = "docs/qa/codex-3/verification.json";
	const main = read(file);
	const supplements = main.currentSupplements ?? {};
	supplements.date = new Date().toISOString();
	supplements.historicalInventoryNote = "Older source/artifact fingerprints retain their original snapshots. Current manage, journal and Role/Worker editor fingerprints are in the supplements; historical tests are not retroactively attributed to new source.";
	supplements.roleWorkerIdentity = {
		file: `${directory}/verification.json`, status: manifest.status,
		sha256: hash(`${directory}/verification.json`), scope: "Two editors, 106 combined lifecycle/payload assertions; developer evidence awaiting QA/QC",
	};
	main.currentSupplements = supplements;
	if (!main.status.includes("SD3-004")) main.status += " SD3-004 Role/Worker identity READY_FOR_QA.";
	const qcPath = "docs/qa/qc-manage-forms-2026-10-09/recheck/DECISION.json";
	if (fs.existsSync(qcPath)) {
		const qc = read(qcPath);
		if (qc.status === "PASS_DELTA" && qc.finding.id === "QC-MANAGE-FORMS-001" && qc.finding.status === "CLOSED") {
			const matches = Object.entries(qc.reviewedSourceHashes).map(([source, expected]) => ({
				file: source, expected, actual: hash(source), passed: expected === hash(source),
			}));
			if (!matches.every((item) => item.passed)) throw new Error("Kelola QC source changed; stop main status update");
			const report = "docs/qa/qc-manage-forms-2026-10-09/recheck/REPORT.md";
			if (!fs.readFileSync(report, "utf8").includes(qc.signal)) throw new Error("Kelola QC report/decision mismatch");
			supplements.manageFormsQC = {
				decision: qc.signal, status: qc.status, closedFindings: [qc.finding.id],
				decisionFile: qcPath, decisionSha256: hash(qcPath), report, reportSha256: hash(report),
				reviewedSourceHashes: qc.reviewedSourceHashes, currentSourceMatches: matches,
				priorBrowserChecks: qc.priorBrowserChecks,
				scope: "QC approval of ten-source preview form delta; no API/native/full-app approval or developer rerun",
			};
			main.status = main.status.replace("manage import correction READY_FOR_QC_RECHECK", "manage forms QC PASS-DELTA (QC-MANAGE-FORMS-001 CLOSED)");
		}
	}
	write(file, main);
}
console.log(JSON.stringify({
	status: manifest.status, assertions: results.passed, testedFingerprintChecks: testedSourceMatches.length,
	baselineSnapshotChecks: baselineSnapshotMatches.length, unchangedContracts: unchangedContractMatches.length,
	failedMatches: [...testedSourceMatches, ...baselineSnapshotMatches, ...unchangedContractMatches].filter((item) => !item.passed),
}));
process.exitCode = passed ? 0 : 1;
