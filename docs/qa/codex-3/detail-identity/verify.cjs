const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const local = file => path.join(__dirname, file), manifestFile = local("verification.json");
if (process.argv.includes("--finalize")) {
	assert(!fs.existsSync(manifestFile), "Preserve frozen SD3-010 packet");
	const inputs = read(local("inputs-before.json")), baseline = read(local("baseline-results.json")), results = read(local("results.json")), quality = read(local("quality-results.json"));
	assert.equal(quality.status, "PASS"); assert.equal(quality.diagnostics.length, 0);
	assert.equal(results.passed, 75); assert.equal(results.failed + results.runtimeErrors.length, 0); assert.equal(results.productionModules, 24);
	assert.equal(baseline.passed, 34); assert.equal(baseline.failed, 41); assert.equal(baseline.runtimeErrors.length, 0);
	assert.deepEqual(results.checks.map(item => item.name), baseline.checks.map(item => item.name), "Keep identical baseline/final scenarios");
	const snapshots = ["role.before.tsx.txt", "worker.before.tsx.txt", "member.before.tsx.txt"];
	Object.entries(inputs.sourceHashes).forEach(([file, expected], index) => {
		assert.equal(hash(local(snapshots[index])), expected, file + " frozen baseline");
		assert.equal(baseline.sourceHashes[file], expected, file + " tested baseline");
		assert.equal(results.sourceHashes[file], hash(file), file + " tested final");
		assert.equal(quality.sourceHashes[file], hash(file), file + " checked final");
	});
	for (const [file, expected] of Object.entries(results.productionModuleHashes)) assert.equal(hash(file), expected, file);
	for (const [file, expected] of Object.entries(inputs.contractHashes)) assert.equal(hash(file), expected, file);
	const internalFile = "docs/qa/codex-3-internal-review/detail-identity-2026-10-09/verification.json", internal = read(internalFile);
	assert.equal(internal.status, "INTERNAL_QA_REVIEW_PASS"); assert.equal(internal.externalQcApproval, false);
	assert.deepEqual(internal.reviewedSourceHashes, results.sourceHashes);
	assert.equal(internal.final.passed, 195); assert.equal(internal.final.failed + internal.final.runtimeErrors + internal.final.warnings, 0);
	for (const [file, expected] of Object.entries({ ...internal.productionContractHashes, ...internal.runtimeInputHashes })) assert.equal(hash(file), expected, file);
	for (const [file, expected] of Object.entries(internal.artifactHashes)) assert.equal(hash(path.join(path.dirname(internalFile), file)), expected, file);
	const artifacts = [];
	function scan(directory, prefix = "") { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = prefix + entry.name; if (entry.isDirectory()) scan(path.join(directory, entry.name), file + "/"); else if (entry.name !== "verification.json") artifacts.push(file); } }
	scan(__dirname);
	const contractHashes = Object.fromEntries(Object.entries({ ...inputs.contractHashes, ...results.productionModuleHashes, ...internal.productionContractHashes }).filter(([file]) => !Object.hasOwn(results.sourceHashes, file)));
	const manifest = { owner: "Codex-3", ticket: "SD3-010", status: "READY_FOR_QA_QC", capturedAt: new Date().toISOString(), publicationApproval: false, publicationOwner: "PM", sourceHashes: results.sourceHashes, contractHashes, runtimeInputHashes: internal.runtimeInputHashes,
		baseline: { sourceHashes: baseline.sourceHashes, passed: baseline.passed, failed: baseline.failed, runtimeErrors: 0, firstRun: "Historical runner default-argument correction archived separately; not counted" },
		checks: { developerAssertions: results.passed, productionModules: results.productionModules, failures: 0, runtimeErrors: 0, focusedTypeDiagnostics: quality.diagnostics.length, quality: quality.status },
		internalReview: { kind: "Independent delegated parent-state/AST/contract review, not external QC", status: internal.status, independentAssertions: internal.final.passed, stateAssertions: internal.counts.state, staticAssertions: internal.counts.ast + internal.counts.contractFingerprints, manifest: internalFile, manifestSha256: hash(internalFile), externalQcApproval: false },
		artifactFingerprints: Object.fromEntries(artifacts.map(file => [file, hash(local(file))])),
		limits: ["Three detail sources only; original full body/public params/imports/JSX/copy/query/endpoint/route/error/loading preserved", "Developer executes production delete mutation through local Axios; GET/presentation/router/RoleWorkers/avatar adapters; reviewer isolates parent with query/child-dialog adapters", "No native/browser/full-router/root-auth/Figma/backend/full-project approval; no transport abort claim", "SD3-006/007/008/009 and accepted editor QC packets remain historical; new detail caller hashes belong to this overlay", "Internal QA review does not replace external QC or PM publication approval"] };
	fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
}
const manifest = read(manifestFile), matches = [
	...Object.entries({ ...manifest.sourceHashes, ...manifest.contractHashes, ...manifest.runtimeInputHashes }).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.artifactFingerprints).map(([file, expected]) => ({ file, passed: hash(local(file)) === expected })),
	{ file: manifest.internalReview.manifest, passed: hash(manifest.internalReview.manifest) === manifest.internalReview.manifestSha256 },
];
assert(matches.every(item => item.passed), JSON.stringify(matches.filter(item => !item.passed)));
if (process.argv.includes("--update-main")) {
	const file = "docs/qa/codex-3/verification.json", main = read(file);
	main.currentSupplements.detailIdentity = { ticket: manifest.ticket, status: manifest.status, handoff: "docs/qa/codex-3/detail-identity/HANDOFF.md", manifest: "docs/qa/codex-3/detail-identity/verification.json", manifestSha256: hash(manifestFile), sourceHashes: manifest.sourceHashes, checks: manifest.checks, internalReview: manifest.internalReview, limits: manifest.limits };
	const callerUpdate = { sourceHashes: manifest.sourceHashes, evidence: "docs/qa/codex-3/detail-identity/HANDOFF.md", status: manifest.status, scope: "Own three detail caller identity boundaries only; earlier modal caller inventories remain frozen history" };
	for (const key of ["deleteLifecycle", "sharedSuccessModalSize", "sharedDeleteModalSize", "sharedAlertModalSize"]) if (main.currentSupplements[key]) main.currentSupplements[key].detailCallerUpdate = callerUpdate;
	if (!main.status.includes("SD3-010")) main.status += " SD3-010 detail identity READY_FOR_QA_QC; 75 developer assertions and 195 independent internal checks PASS, external QC/PM pending.";
	fs.writeFileSync(file, JSON.stringify(main, null, 2) + "\n");
}
console.log(JSON.stringify({ status: manifest.status, sources: Object.keys(manifest.sourceHashes).length, contracts: Object.keys(manifest.contractHashes).length, runtimeInputs: Object.keys(manifest.runtimeInputHashes).length, artifacts: Object.keys(manifest.artifactFingerprints).length, checks: manifest.checks, internalReview: manifest.internalReview.independentAssertions }));
