const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const local = file => path.join(__dirname, file), manifestFile = local("verification.json");
if (process.argv.includes("--finalize")) {
	assert(!fs.existsSync(manifestFile), "Preserve frozen SD3-011 packet");
	const inputs = read(local("inputs-before.json")), baseline = read(local("baseline-results.json")), results = read(local("results.json")), quality = read(local("quality-results.json"));
	assert.equal(quality.status, "PASS"); assert.equal(quality.diagnostics.length, 0); assert.equal(quality.layoutChecks.every(item => item.passed), true);
	assert.equal(results.passed, 165); assert.equal(results.failed + results.runtimeErrors.length, 0); assert.equal(results.productionModules, 26);
	assert.equal(baseline.passed, 81); assert.equal(baseline.failed, 84); assert.equal(baseline.runtimeErrors.length, 0);
	assert.deepEqual(results.checks.map(item => item.name), baseline.checks.map(item => item.name));
	const snapshots = ["role.before.tsx.txt", "worker.before.tsx.txt", "member.before.tsx.txt"];
	Object.entries(inputs.sourceHashes).forEach(([file, expected], index) => { assert.equal(hash(local(snapshots[index])), expected, file); assert.equal(baseline.sourceHashes[file], expected, file); });
	assert.deepEqual(quality.sourceHashes, Object.fromEntries(Object.keys(quality.sourceHashes).map(file => [file, results.sourceHashes[file]])));
	for (const [file, expected] of Object.entries({ ...inputs.contractHashes, ...results.productionModuleHashes })) assert.equal(hash(file), expected, file);
	const internalFile = "docs/qa/codex-3-internal-review/list-actions-2026-10-09/verification.json", internal = read(internalFile);
	assert.equal(internal.status, "INTERNAL_QA_REVIEW_PASS"); assert.equal(internal.externalQcApproval, false);
	assert.equal(internal.final.passed, 277); assert.equal(internal.final.failed + internal.final.runtimeErrors + internal.final.warnings, 0);
	for (const [file, expected] of Object.entries({ ...internal.productionContractHashes, ...internal.loadedProductionSourceHashes })) assert.equal(hash(file), expected, file);
	for (const [file, expected] of Object.entries(internal.artifactHashes)) assert.equal(hash(path.join(path.dirname(internalFile), file)), expected, file);
	for (const [file, expected] of Object.entries(results.sourceHashes)) assert.equal(internal.reviewedSourceHashes[file], expected, file);
	const artifacts = [];
	function scan(directory, prefix = "") { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = prefix + entry.name; if (entry.isDirectory()) scan(path.join(directory, entry.name), file + "/"); else if (entry.name !== "verification.json") artifacts.push(file); } }
	scan(__dirname);
	const manifest = { owner: "Codex-3", ticket: "SD3-011", status: "READY_FOR_QA_QC", capturedAt: new Date().toISOString(), publicationApproval: false, publicationOwner: "PM", sourceHashes: results.sourceHashes,
		contractHashes: Object.fromEntries(Object.entries({ ...inputs.contractHashes, ...results.productionModuleHashes }).filter(([file]) => !Object.hasOwn(results.sourceHashes, file))),
		baseline: { sourceHashes: baseline.sourceHashes, passed: baseline.passed, failed: baseline.failed, runtimeErrors: 0, productionModules: baseline.productionModules },
		checks: { developerAssertions: results.passed, productionModules: results.productionModules, failures: 0, runtimeErrors: 0, focusedTypeDiagnostics: quality.diagnostics.length, quality: quality.status },
		internalReview: { kind: "Independent production list/sheet/delete mutation fixture review, root sealed completed executions; not external QC", status: internal.status, independentAssertions: internal.final.passed, stateAndIntegration: internal.counts.stateAndIntegration, staticFingerprints: internal.counts.contractFingerprints, manifest: internalFile, manifestSha256: hash(internalFile), externalQcApproval: false },
		artifactFingerprints: Object.fromEntries(artifacts.map(file => [file, hash(local(file))])),
		limits: ["Three list sources plus one owned manage helper; list/card/search/loading/error/refresh/empty/add CTA AST preserved except selection event", "Production DELETE through local Axios/QueryClient; GET/presentation/FlatList/router/native adapters, list has no onDeleted callback", "Confirmation/sheet retires on missing canonical/loading/error; retained child owns already-dispatched request/notice, no transport abort claim", "SD3-006 through SD3-010 and accepted editor QC packets remain frozen history; new list caller hashes belong to this overlay", "External QC-SUCCESS-001 landscape finding remains OPEN for shared SuccessModalF90; list review is not shared geometry approval", "No browser/native/full-router/root-auth/Figma/backend/full-project/publication approval"] };
	fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
}
const manifest = read(manifestFile), matches = [
	...Object.entries({ ...manifest.sourceHashes, ...manifest.contractHashes }).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.artifactFingerprints).map(([file, expected]) => ({ file, passed: hash(local(file)) === expected })),
	{ file: manifest.internalReview.manifest, passed: hash(manifest.internalReview.manifest) === manifest.internalReview.manifestSha256 },
];
assert(matches.every(item => item.passed), JSON.stringify(matches.filter(item => !item.passed)));
if (process.argv.includes("--update-main")) {
	const file = "docs/qa/codex-3/verification.json", main = read(file);
	main.currentSupplements.listActions = { ticket: manifest.ticket, status: manifest.status, handoff: "docs/qa/codex-3/list-actions/HANDOFF.md", manifest: "docs/qa/codex-3/list-actions/verification.json", manifestSha256: hash(manifestFile), sourceHashes: manifest.sourceHashes, checks: manifest.checks, internalReview: manifest.internalReview, limits: manifest.limits };
	const callerUpdate = { sourceHashes: manifest.sourceHashes, evidence: "docs/qa/codex-3/list-actions/HANDOFF.md", status: manifest.status, scope: "Own three list selection lifetimes and new helper; previous modal caller inventories remain frozen history" };
	for (const key of ["sharedSuccessModalSize", "sharedDeleteModalSize", "sharedAlertModalSize"]) main.currentSupplements[key].listCallerUpdate = callerUpdate;
	if (!main.status.includes("SD3-011")) main.status += " SD3-011 list actions READY_FOR_QA_QC; 165 developer checks PASS and independent internal QA; external QC/PM pending.";
	const qcFile = "docs/qa/qc-success-modal-2026-10-09/DECISION.json", qc = read(qcFile);
	main.currentSupplements.sharedSuccessModalSize.externalQcReview = { signal: qc.signal, status: qc.status, decision: qcFile, decisionSha256: hash(qcFile), reviewedSourceHashes: qc.reviewedSourceHashes, closedFindings: qc.closedFindings, newOpenFindings: qc.newOpenFindings.map(item => ({ id: item.id, severity: item.severity, status: item.status, title: item.title })) };
	main.status += main.status.includes("QC-SUCCESS-001") ? "" : " QC-STOCK-UI-001 portrait CLOSED_BY_RECHECK; QC-SUCCESS-001 landscape OPEN / SuccessModal CHANGES_REQUESTED at F90, older statuses historical.";
	fs.writeFileSync(file, JSON.stringify(main, null, 2) + "\n");
}
console.log(JSON.stringify({ status: manifest.status, sources: Object.keys(manifest.sourceHashes).length, contracts: Object.keys(manifest.contractHashes).length, artifacts: Object.keys(manifest.artifactFingerprints).length, checks: manifest.checks }));
