const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = file => JSON.parse(fs.readFileSync(file, "utf8")), local = file => path.join(__dirname, file);
const manifestFile = local("verification.json"), source = "components/common/SuccessModal.tsx";
const expected = "7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8";
if (process.argv.includes("--finalize")) {
	assert(!fs.existsSync(manifestFile), "Preserve frozen SD3-012 packet");
	const before = read(local("inputs-before.json")), quality = read(local("quality-results.json"));
	const deletion = read(local("delete-replay/results.json")), lists = read(local("list-replay/results.json")), browser = read(local("baseline/results.json"));
	assert.equal(hash(source), expected); assert.equal(hash(local("SuccessModal.before.tsx.txt")), before.sourceBeforeHash);
	assert.equal(quality.status, "PASS"); assert.equal(quality.sourceHash, expected); assert.equal(quality.diagnostics.length, 0);
	assert(quality.contractUnchangedOutsideHeightScroll && quality.exactReviewedProposal);
	for (const [result, count] of [[deletion, 156], [lists, 165]]) {
		assert.equal(result.passed, count); assert.equal(result.failed + result.runtimeErrors.length, 0);
		assert.equal(result.productionModuleHashes[source], expected);
		for (const [file, value] of Object.entries(result.productionModuleHashes)) assert.equal(hash(file), value, file);
	}
	for (const [file, value] of Object.entries(before.files)) assert.equal(hash(file), file === source ? expected : value, file);
	assert.equal(browser.sourceHash, before.sourceBeforeHash); assert.equal(browser.checks.length, 0); assert.equal(browser.bundleReceipts.length, 0); assert(browser.exception.includes("Timeout"));
	const reviewFile = "docs/qa/codex-3-internal-review/success-height-2026-10-09/verification.json", review = read(reviewFile);
	assert.equal(review.status, "HISTORICAL_PROPOSAL_EVIDENCE_VALID_WITH_LIMITS"); assert.equal(review.newRuntimeExecutions, 0);
	assert.equal(review.reviewedSourceHashes[source], expected); assert.equal(review.externalFinding.closedByThisAudit, false);
	for (const [file, value] of Object.entries(review.artifactFingerprints)) assert.equal(hash(path.join(path.dirname(reviewFile), file)), value, file);
	const qcRoot = "docs/qa/qc-success-modal-2026-10-09/";
	const evidence = ["DECISION.json", "artifact-manifest.json", "proposal/SuccessModal.tsx", "proposal/success-modal-height.patch", "orientation-proposal/results.json", "proposal/modal-browser-results.json", "proposal/stock-final/browser-results.json", "proposal/delete-lifecycle/results.json"];
	assert.equal(hash(qcRoot + "DECISION.json"), review.qcDecisionSha256); assert.equal(hash(qcRoot + "artifact-manifest.json"), review.qcArtifactManifestSha256);
	for (const [file, count] of [["orientation-proposal/results.json", 27], ["proposal/modal-browser-results.json", 51], ["proposal/stock-final/browser-results.json", 36], ["proposal/delete-lifecycle/results.json", 156]]) {
		const result = read(qcRoot + file); assert.equal(result.passed, count); assert.equal(result.failed, 0);
	}
	const frozen = ["delete-lifecycle", "success-modal-size", "delete-modal-size", "alert-modal-size", "detail-identity", "list-actions"].map(folder => `docs/qa/codex-3/${folder}/verification.json`);
	for (const file of frozen) assert(fs.existsSync(file), file);
	const artifacts = [];
	function scan(directory, prefix = "") {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const file = prefix + entry.name;
			if (entry.isDirectory()) scan(path.join(directory, entry.name), file + "/");
			else if (file !== "verification.json") artifacts.push(file);
		}
	}
	scan(__dirname);
	const dependencies = { ...before.files, ...deletion.productionModuleHashes, ...lists.productionModuleHashes }; delete dependencies[source];
	const result = {
		owner: "Software Developer Senior / Codex-3", ticket: "SD3-012", status: "READY_FOR_QC_RECHECK", externalQcApproval: false, publicationApproval: false, publicationOwner: "PM",
		sourceHashes: { [source]: expected }, beforeSourceHash: before.sourceBeforeHash, contractHashes: dependencies,
		checks: { currentDeveloperAssertions: 321, deleteLifecycleAssertions: 156, listAssertions: 165, failures: 0, runtimeErrors: 0, lintErrors: 0, lintWarnings: 0, focusedTypeDiagnostics: 0, quality: quality.status, contractUnchangedOutsideHeightScroll: true, exactReviewedProposal: true, coverageNote: "Current-source renderer executions with overlapping lifecycle coverage; not geometry/native certification" },
		ownBrowserAttempt: { sourceHash: browser.sourceHash, kind: "BASELINE_SOURCE_SNAPSHOT", assertions: 0, receipts: 0, status: "INCONCLUSIVE_PREVIEW_READY_TIMEOUT", result: "baseline/results.json", finalSourceBrowserReplayed: false },
		internalReview: { status: review.status, manifest: reviewFile, manifestSha256: hash(reviewFile), report: reviewFile.replace("verification.json", "REPORT.md"), newRuntimeExecutions: 0, historicalQcArtifactsVerified: review.qcArtifactsVerified, externalQcApproval: false },
		historicalQcProposalEvidence: { sourceHash: expected, orientation: 27, sharedBrowser: 51, historicalStock: 36, lifecycle: 156, total: 270, countedAsNewDeveloperExecutions: false, hashes: Object.fromEntries(evidence.map(file => [qcRoot + file, hash(qcRoot + file)])), scope: "Historical proposal proof with archived fixtures/CSS; generated runtime inputs changed, latest Stock/native/live source runtime not certified" },
		openExternalFindings: [{ id: "QC-SUCCESS-001", status: "OPEN_PENDING_ACTUAL_SOURCE_FINAL_RECHECK", correctedSourceHash: expected }],
		frozenHistoricalManifests: Object.fromEntries(frozen.map(file => [file, hash(file)])),
		artifactFingerprints: Object.fromEntries(artifacts.sort().map(file => [file, hash(local(file))])),
		limits: ["Applied exact reviewed height/scroll proposal only; public props/callbacks/copy unchanged", "Shared caller replay via native/router/presentation/GET adapters, DELETE uses local Axios/QueryClient fixture without HTTP", "Own baseline browser setup timed out with zero assertions; no current final browser run or generated CSS/native certification", "Historical QC270 proposal proof explicitly separate from current developer321 renderer executions", "QC-SUCCESS-001 remains OPEN; no QA/QC external or PM publication approval", "Previous F90 source/manifests frozen history, only mutable parent overlay updated", "No API/dependency/server/Metro/HP/ADB/rootconfig/globalTS/Git publication changes"]
	};
	fs.writeFileSync(manifestFile, JSON.stringify(result, null, 2) + "\n");
}
const manifest = read(manifestFile);
for (const [file, value] of Object.entries({ ...manifest.sourceHashes, ...manifest.contractHashes, ...manifest.historicalQcProposalEvidence.hashes, ...manifest.frozenHistoricalManifests })) assert.equal(hash(file), value, file);
for (const [file, value] of Object.entries(manifest.artifactFingerprints)) assert.equal(hash(local(file)), value, file);
assert.equal(hash(manifest.internalReview.manifest), manifest.internalReview.manifestSha256);
console.log(JSON.stringify({ status: manifest.status, sources: Object.keys(manifest.sourceHashes).length, contracts: Object.keys(manifest.contractHashes).length, artifacts: Object.keys(manifest.artifactFingerprints).length, currentDeveloperAssertions: manifest.checks.currentDeveloperAssertions, ownBaselineBrowserAssertions: 0, externalFinding: manifest.openExternalFindings }));
