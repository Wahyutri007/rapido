const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const root = process.cwd(), packet = path.resolve("docs/qa/qc-success-modal-2026-10-09");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const source = "components/common/SuccessModal.tsx";
const proposal = path.join(packet, "proposal/SuccessModal.tsx");
const decision = read(path.join(packet, "DECISION.json"));
const manifest = read(path.join(packet, "artifact-manifest.json"));
const quality = read(path.join(packet, "quality-results.json"));
const frozenArtifacts = manifest.artifacts.map((item) => {
	const file = path.join(packet, item.file), actual = fs.existsSync(file) ? sha(file) : null;
	return { file: item.file, expected: item.sha256, actual, passed: actual === item.sha256 };
});
const evidenceFiles = {
	orientation: "orientation-proposal/results.json",
	sharedBrowser: "proposal/modal-browser-results.json",
	stockBrowser: "proposal/stock-final/browser-results.json",
	lifecycle: "proposal/delete-lifecycle/results.json",
};
const evidence = Object.fromEntries(Object.entries(evidenceFiles).map(([name, relative]) => {
	const file = path.join(packet, relative), data = read(file);
	return [name, {
		path: path.relative(root, file).replaceAll("\\", "/"),
		sha256: sha(file),
		passed: data.passed,
		failed: data.failed,
		sourceHash: data.sourceHash ?? data.productionModuleHashes?.[source] ?? null,
		tested: data.tested ?? data.mode ?? data.executionMode ?? null,
		fixtureHash: data.fixtureHash ?? null,
		assertionEntries: data.checks?.length ?? null,
		errors: Object.fromEntries(["errors", "consoleErrors", "runtimeErrors", "blocked", "blockedRequests", "receiptErrors", "controlFallbacks"].filter((key) => Array.isArray(data[key])).map((key) => [key, data[key].length])),
		exception: data.exception ?? null,
		bundleReceipts: data.bundleReceipts ?? [],
	}];
}));
const baselinePath = path.resolve("docs/qa/codex-3/success-modal-height/baseline/results.json");
const currentAttempt = fs.existsSync(baselinePath) ? read(baselinePath) : null;
const dependencies = (quality.trackedFilesStable ?? []).map((item) => {
	const target = path.resolve(item.testedPath ?? item.file);
	const actual = fs.existsSync(target) ? sha(target) : null;
	return { file: item.file, testedPath: item.testedPath, expected: item.expected, actual, passed: actual === item.expected };
});
const productionContract = Object.entries(decision.exercisedContractHashes).map(([file, expected]) => {
	const actual = sha(file);
	return { file, expected, actual, passed: actual === expected, intentionalSourceChange: file === source && actual === decision.proposal.candidateHash };
});
const now = new Date().toISOString();
const result = {
	kind: "INTERNAL_QA_EVIDENCE_AUDIT",
	status: "HISTORICAL_PROPOSAL_EVIDENCE_VALID_WITH_LIMITS",
	capturedAt: now,
	source: { file: source, currentSha256: sha(source), proposalSha256: sha(proposal), sourceByteIdenticalToProposal: fs.readFileSync(source).equals(fs.readFileSync(proposal)), expectedCandidateSha256: decision.proposal.candidateHash },
	qcDecision: { file: path.relative(root, path.join(packet, "DECISION.json")).replaceAll("\\", "/"), sha256: sha(path.join(packet, "DECISION.json")), signal: decision.signal, status: decision.status, approvedSourceHashes: decision.approvedSourceHashes, proposalAppliedAtQCReview: decision.proposal.applied, finding: decision.newOpenFindings.find((item) => item.id === "QC-SUCCESS-001")?.status },
	qcArtifactManifest: { file: path.relative(root, path.join(packet, "artifact-manifest.json")).replaceAll("\\", "/"), sha256: sha(path.join(packet, "artifact-manifest.json")), total: frozenArtifacts.length, matching: frozenArtifacts.filter((item) => item.passed).length, mismatches: frozenArtifacts.filter((item) => !item.passed) },
	frozenArtifacts,
	evidence,
	proposalTotalExecutions: Object.values(evidence).reduce((sum, item) => sum + item.passed, 0),
	proposalFailedExecutions: Object.values(evidence).reduce((sum, item) => sum + item.failed, 0),
	currentProductionContract: productionContract,
	trackedHistoricalInputComparisons: dependencies,
	proposalFixture: { file: "proposal/modal-entry.fixture.jsx", sha256: sha(path.join(packet, "proposal/modal-entry.fixture.jsx")), orientationMatches: evidence.orientation.fixtureHash === sha(path.join(packet, "proposal/modal-entry.fixture.jsx")), sharedMatches: evidence.sharedBrowser.fixtureHash === sha(path.join(packet, "proposal/modal-entry.fixture.jsx")) },
	currentBrowserAttempt: currentAttempt ? { file: path.relative(root, baselinePath).replaceAll("\\", "/"), sha256: sha(baselinePath), tested: currentAttempt.tested, sourceHash: currentAttempt.sourceHash, passed: currentAttempt.passed, failed: currentAttempt.failed, exception: currentAttempt.exception, checks: currentAttempt.checks?.length ?? null, bundleReceipts: currentAttempt.bundleReceipts?.length ?? null, fields: Object.keys(currentAttempt), note: "Saved baseline f90 attempt, not a final7508 browser result. 0 executed assertions is not a geometry PASS." } : null,
	geometryReuse: "Valid to cite as historical QC proposal geometry proof at byte-identical source and reviewed fixture contracts; not a new browser run, external approval, native proof or certification of changed runtime inputs/current Stock.",
	externalFinding: { id: "QC-SUCCESS-001", status: "OPEN_PENDING_ACTUAL_SOURCE_FINAL_RECHECK", closedByThisAudit: false },
	publicationApproval: false,
	publicationOwner: "PM",
	limits: ["Lightweight fingerprint/source/evidence audit only; no new runtime assertions", "QC proposal proof remains labelled PROPOSAL_ONLY_NOT_APPLIED in immutable historical files", "Current browser timeout with no assertions remains inconclusive", "Input/runtime changes are reported separately and not certified by source equality", "No source/frozen packet edit, server/build/heavy typecheck/Metro/HP/API/Git actions"],
};
if (!result.source.sourceByteIdenticalToProposal || frozenArtifacts.some((item) => !item.passed) || result.proposalTotalExecutions !== 270 || result.proposalFailedExecutions !== 0 || !result.proposalFixture.orientationMatches || !result.proposalFixture.sharedMatches) result.status = "FINDINGS";
fs.writeFileSync(path.join(__dirname, "audit.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ status: result.status, source: result.source, qcArtifactManifest: result.qcArtifactManifest, evidence: Object.fromEntries(Object.entries(evidence).map(([name, item]) => [name, { passed: item.passed, failed: item.failed, sourceHash: item.sourceHash, errors: item.errors, exception: item.exception }])), productionContractMismatches: productionContract.filter((item) => !item.passed), trackedHistoricalInputMismatches: dependencies.filter((item) => !item.passed), currentBrowserAttempt: result.currentBrowserAttempt, proposalTotalExecutions: result.proposalTotalExecutions }));
process.exitCode = result.status === "FINDINGS" ? 1 : 0;
