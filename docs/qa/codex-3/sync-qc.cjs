// Read QC decisions and update only the parent status index. Frozen developer packets remain untouched.
const fs = require("node:fs"), crypto = require("node:crypto");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const mainFile = "docs/qa/codex-3/verification.json", main = read(mainFile);
const decisions = [
	{ key: "roleWorkerQC", directory: "docs/qa/qc-role-worker-2026-10-09", oldStatus: "SD3-004 Role/Worker identity READY_FOR_QA", newStatus: "SD3-004 Role/Worker editor QC PASS-DELTA" },
	{ key: "journalBadgeQC", directory: "docs/qa/qc-journals-2026-10-09/recheck", oldStatus: "QC-JOURNAL-001 correction READY_FOR_QC_RECHECK", newStatus: "QC-JOURNAL-001 CLOSED / Jurnal QC PASS-DELTA" },
	{ key: "supportQC", directory: "docs/qa/qc-support-2026-10-09", oldStatus: "SD3-005 support attachment READY_FOR_QA", newStatus: "SD3-005 Bantuan QC PASS-DELTA" },
];
const updated = [];
for (const entry of decisions) {
	const file = `${entry.directory}/DECISION.json`;
	const report = `${entry.directory}/REPORT.md`;
	if (!fs.existsSync(file) || !fs.existsSync(report)) continue;
	const decision = read(file);
	if (decision.status !== "PASS_DELTA") continue;
	const reviewedSourceHashes = decision.reviewedSourceHashes ?? decision.approvedSourceHashes;
	const matches = Object.entries(reviewedSourceHashes).map(([source, expected]) => ({ file: source, expected, actual: hash(source), passed: hash(source) === expected }));
	if (!matches.every((item) => item.passed)) throw new Error(`QC-approved source changed: ${entry.key}`);
	if (!fs.readFileSync(report, "utf8").includes(decision.signal)) throw new Error(`QC report/decision mismatch: ${entry.key}`);
	main.currentSupplements[entry.key] = { decision: decision.signal, status: decision.status, decisionFile: file, decisionSha256: hash(file), report, reportSha256: hash(report), reviewedSourceHashes, currentSourceMatches: matches, reportedChecks: decision.checks ?? decision.assertions, findings: decision.findings ?? decision.finding, publication: decision.publication ?? { approval: decision.publicationApproval, owner: decision.publicationOwner }, scope: "QC result on the listed hashes, not a developer rerun or full-app/native/API approval" };
	main.status = main.status.replace(entry.oldStatus, entry.newStatus);
	updated.push({ key: entry.key, decision: decision.signal, matchedSources: matches.length });
}
main.currentSupplements.date = new Date().toISOString();
fs.writeFileSync(mainFile, JSON.stringify(main, null, 2) + "\n");
console.log(JSON.stringify({ updated, status: main.status }));
