const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
const directory = path.relative(process.cwd(), __dirname).replaceAll("\\", "/");
const results = read(`${directory}/results.json`), baseline = read(`${directory}/baseline.json`);
const quality = read(`${directory}/quality-results.json`), types = read(`${directory}/typecheck-results.json`);
const sources = ["components/feature/support/SupportAttachmentInput.tsx", "components/feature/support/SupportFormScreen.tsx"];
const testedSourceMatches = [results, quality, types].flatMap((report, index) => Object.entries(report.sourceHashes).map(([file, expected]) => ({ suite: ["lifecycle", "quality", "typecheck"][index], file, expected, actual: hash(file), passed: expected === hash(file) })));
const baselineSnapshotMatches = sources.map((file, index) => {
	const snapshot = `${directory}/${index ? "form" : "attachment"}.before.tsx.txt`;
	return { file, snapshot, expected: baseline.sourceHashes[file], actual: hash(snapshot), passed: baseline.sourceHashes[file] === hash(snapshot) };
});
const unchangedContractMatches = Object.entries(results.sourceHashes).filter(([file]) => !sources.includes(file)).map(([file, expected]) => ({ file, expected, baseline: baseline.sourceHashes[file], passed: expected === baseline.sourceHashes[file] }));
const initial = read(`${directory}/baseline-initial.json`);
const passed = results.passed === 114 && results.failed === 0 && results.errors.length === 0 && results.checks.length === 114 && results.checks.every((item) => item.passed) &&
	baseline.passed === 90 && baseline.failed === 24 && initial.passed === 93 && initial.failed === 21 &&
	quality.status === "PASS" && quality.lint.exitCode === 0 && quality.lint.files.every((file) => !file.errors && !file.warnings) &&
	quality.biome.exitCode === 0 && quality.diff.exitCode === 0 && quality.renderChecks.every((item) => item.passed) && types.exitCode === 0 && types.diagnostics.length === 0 &&
	[testedSourceMatches, baselineSnapshotMatches, unchangedContractMatches].every((list) => list.every((item) => item.passed));
const artifacts = ["HANDOFF.md", "check.cjs", "check-initial.cjs", "baseline-initial.json", "baseline.json", "results.json", "attachment.before.tsx.txt", "form.before.tsx.txt", "quality.cjs", "quality-results.json", "typecheck.cjs", "typecheck-results.json", "verify.cjs"];
const manifest = {
	owner: "Codex-3", ticket: "SD3-005", status: passed ? "READY_FOR_QA" : "CHECK_FAILED", createdAt: new Date().toISOString(), approval: "Developer evidence, independent QA/QC review pending; publication belongs to PM",
	results: { initialBaseline: { passed: initial.passed, failed: initial.failed }, baseline: { passed: baseline.passed, failed: baseline.failed }, final: { passed: results.passed, failed: results.failed, runtimeErrors: results.errors.length }, typeDiagnostics: types.diagnostics.length, eslintErrors: quality.lint.files.reduce((sum, file) => sum + file.errors, 0), eslintWarnings: quality.lint.files.reduce((sum, file) => sum + file.warnings, 0), biomeExitCode: quality.biome.exitCode, diffExitCode: quality.diff.exitCode, jsxComparisonsPassed: quality.renderChecks.every((item) => item.passed) },
	changedSource: Object.fromEntries(sources.map((file) => [file, hash(file)])),
	readOnlyContractFingerprint: Object.fromEntries(unchangedContractMatches.map(({ file }) => [file, hash(file)])),
	artifactFingerprint: Object.fromEntries(artifacts.map((file) => [`${directory}/${file}`, hash(`${directory}/${file}`)])),
	testedSourceMatches, baselineSnapshotMatches, unchangedContractMatches,
	limitations: ["Actual support components/routes/RHF Controller/FormProvider/Zod with DocumentPicker/native/presentation/modal adapters", "No native picker/browser/full navigator/root auth/SSR/Figma/HTTP/API upload/full-project typecheck", "No cancellation of already open OS picker; token discards late results after removal/unmount", "Historical screenshot/browser/full TS are not reruns on new component hashes; submission remains unavailable in source"],
};
write(`${directory}/verification.json`, manifest);
if (passed && process.argv.includes("--update-main")) {
	const badgeFile = "docs/qa/codex-3/journal-badge/verification.json", badge = read(badgeFile);
	if (badge.status !== "READY_FOR_QC_RECHECK" || !Object.entries(badge.changedSource).every(([file, expected]) => hash(file) === expected)) throw new Error("Journal badge supplement is not current/ready");
	const mainFile = "docs/qa/codex-3/verification.json", main = read(mainFile), supplements = main.currentSupplements ?? {};
	supplements.date = new Date().toISOString();
	supplements.historicalInventoryNote = "Older source/artifact fingerprints retain original snapshots. Current manage, journal, Role/Worker and support editor fingerprints are in supplements; historical tests are not retroactively attributed to new source.";
	supplements.supportAttachment = { file: `${directory}/verification.json`, status: manifest.status, sha256: hash(`${directory}/verification.json`), scope: "Two support components, 114 developer assertions, native/API/browser not verified" };
	supplements.journalBadge = { file: badgeFile, status: badge.status, sha256: hash(badgeFile), finding: "QC-JOURNAL-001", scope: "Two predicates, 283 developer assertion executions including replay/overlap; QC closure pending" };
	if (supplements.journals) { supplements.journals.status = "HISTORICAL_BEFORE_QC_CHANGES_REQUESTED"; supplements.journals.supersededBy = badgeFile; }
	const qcDirectory = "docs/qa/qc-journals-2026-10-09", qc = read(`${qcDirectory}/DECISION.json`);
	supplements.journalQC = { decision: qc.signal, status: qc.status, finding: qc.findings.find((item) => item.id === "QC-JOURNAL-001"), decisionFile: `${qcDirectory}/DECISION.json`, decisionSha256: hash(`${qcDirectory}/DECISION.json`), report: `${qcDirectory}/REPORT.md`, reportSha256: hash(`${qcDirectory}/REPORT.md`), developerCorrectionStatus: badge.status, note: "QC decision covers pre-correction hashes; developer has not closed finding" };
	main.currentSupplements = supplements;
	main.status = main.status.replace("SD3-003 journal validation READY_FOR_QA", "QC-JOURNAL-001 correction READY_FOR_QC_RECHECK");
	if (!main.status.includes("SD3-005")) main.status += " SD3-005 support attachment READY_FOR_QA.";
	write(mainFile, main);
}
console.log(JSON.stringify({ status: manifest.status, assertions: results.passed, testedFingerprintChecks: testedSourceMatches.length, baselineSnapshotChecks: baselineSnapshotMatches.length, unchangedContracts: unchangedContractMatches.length, failedMatches: [testedSourceMatches, baselineSnapshotMatches, unchangedContractMatches].flat().filter((item) => !item.passed) }));
process.exitCode = passed ? 0 : 1;
