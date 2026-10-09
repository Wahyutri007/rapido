const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = process.cwd();
const packet = path.resolve("docs/qa/codex-3/success-modal-size");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const audit = (entries, base = root) => Object.entries(entries).map(([file, expected]) => {
	const target = path.join(base, file);
	const actual = fs.existsSync(target) ? sha(target) : null;
	return { file, expected, actual, passed: expected === actual };
});
const manifest = read(path.join(packet, "verification.json"));
const modal = read(path.join(packet, "modal-browser-results.json"));
const stock = read(path.join(packet, "stock-final/browser-results.json"));
const lifecycle = read(path.join(packet, "delete-lifecycle/results.json"));
const quality = read(path.join(packet, "quality-results.json"));
const previous = read(path.resolve("docs/qa/qc-stock-ui-2026-10-09/DECISION.json"));
const targetSource = "components/common/SuccessModal.tsx";
const source = fs.readFileSync(targetSource, "utf8").replaceAll("\r\n", "\n");
const before = fs.readFileSync(path.join(packet, "SuccessModal.before.tsx.txt"), "utf8").replaceAll("\r\n", "\n");
const substitutions = [
	['\tuseWindowDimensions,\n', ''],
	['import {\n\tImage,', 'import {\n\tDimensions,\n\tImage,'],
	['\tconst { width } = useWindowDimensions();\n', ''],
	['style={{ width: width - 32, maxWidth: 380 }}', 'style={{ width: Dimensions.get("screen").width - 32, maxWidth: 380 }}'],
	['\t\t\t\t\t\t\t\tstyle={{ height: 176, width: "100%" }}\n', ''],
];
let restored = source;
const transformationAudit = substitutions.map(([needle, replacement]) => {
	const occurrences = restored.split(needle).length - 1;
	restored = restored.replace(needle, replacement);
	return { needle, occurrences, passed: occurrences === 1 };
});
const flags = {
	modalSourceMatches: modal.sourceHash === sha(targetSource),
	lifecycleModalSourceMatches: lifecycle.productionModuleHashes[targetSource] === sha(targetSource),
	qualitySourceMatches: quality.sourceHash === sha(targetSource),
	baselineMatchesExternalQC: sha(path.join(packet, "SuccessModal.before.tsx.txt")) === previous.sourceHashes.successModal,
	proposalMatchesExternalQC: sha(path.join(packet, "image-only/SuccessModal.tsx.txt")) === previous.proposalBrowser.candidateHash,
	publicContractAndRemainingCodeUnchanged: restored === before && transformationAudit.every((item) => item.passed),
	developerCountsConsistent: modal.passed === 51 && stock.passed === 36 && lifecycle.passed === 156 && modal.passed + stock.passed + lifecycle.passed === manifest.checks.totalFinalExecutions,
	developerNoFailures: modal.failed === 0 && stock.failed === 0 && lifecycle.failed === 0 && !modal.exception && !stock.exception,
	developerNoRuntimeErrors: modal.errors.length === 0 && modal.consoleErrors.length === 0 && modal.blocked.length === 0 && stock.errors.length === 0 && stock.consoleErrors.length === 0 && lifecycle.runtimeErrors.length === 0 && lifecycle.controlFallbacks.length === 0,
	developerQualityPass: quality.status === "PASS" && quality.diagnostics.length === 0 && quality.contractUnchanged === true,
	preservationOfExternalGate: manifest.finding.status === "OPEN_PENDING_QC_RECHECK" && manifest.publicationApproval === false,
};
const result = {
	kind: "INTERNAL_QA_REVIEW",
	reviewer: "Codex-3 delegated internal reviewer / review_success_modal",
	capturedAt: new Date().toISOString(),
	manifestPath: path.relative(root, path.join(packet, "verification.json")).replaceAll("\\", "/"),
	manifestSha256: sha(path.join(packet, "verification.json")),
	sourceHashes: audit(manifest.sourceHashes),
	contractHashes: audit(manifest.contractHashes),
	artifactFingerprints: audit(manifest.artifactFingerprints, packet),
	callerHashes: audit(Object.fromEntries(manifest.callerReview.matches.map((item) => [item.file, item.expected]))),
	inputHashes: audit(Object.fromEntries(manifest.inputMatches.map((item) => [item.file, item.expected]))),
	fixtureHashes: audit(manifest.fixtureHashes),
	flags,
	transformationAudit,
	developerEvidence: { modalBrowser: modal.passed, stockBrowser: stock.passed, lifecycleReplay: lifecycle.passed, totalExecutions: manifest.checks.totalFinalExecutions, independentRerun: false },
	limits: ["Fingerprint and source audit only; developer browser/test evidence reviewed rather than rerun", "Capture predates coordinated future SD3-008 DeleteConfirmModal change", "External QC-STOCK-UI-001 remains OPEN and PM retains publication gate"],
};
result.status = Object.values(flags).every(Boolean) && [result.sourceHashes, result.contractHashes, result.artifactFingerprints].every((items) => items.every((item) => item.passed)) ? "PASS" : "FINDINGS";
fs.writeFileSync(path.join(__dirname, "source-reviewed.tsx.txt"), fs.readFileSync(targetSource));
fs.writeFileSync(path.join(__dirname, "audit.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ status: result.status, flags, hashes: Object.fromEntries(["sourceHashes", "contractHashes", "artifactFingerprints", "callerHashes", "inputHashes", "fixtureHashes"].map((name) => [name, { checked: result[name].length, failed: result[name].filter((item) => !item.passed) }])), manifestSha256: result.manifestSha256 }));
process.exitCode = result.status === "PASS" ? 0 : 1;
