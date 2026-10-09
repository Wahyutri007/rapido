const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const local = (file) => path.join(__dirname, file), manifestFile = local("verification.json");
if (process.argv.includes("--finalize")) {
	assert(!fs.existsSync(manifestFile), "Preserve final frozen packet");
	const source = "components/common/DeleteConfirmModal.tsx", quality = read(local("quality-results.json")), browser = read(local("final/browser-results.json")), baseline = read(local("baseline/browser-results.json")), lifecycle = read(local("delete-lifecycle/results.json")), callers = read(local("callers.json")), inputs = read(local("inputs-before.json"));
	assert.equal(quality.status, "PASS"); assert.equal(quality.sourceHash, hash(source)); assert.equal(browser.sourceHash, hash(source)); assert.equal(lifecycle.productionModuleHashes[source], hash(source));
	assert.equal(browser.passed, 115); assert.equal(browser.failed, 0); assert(!browser.exception); assert.equal(browser.errors.length + browser.consoleErrors.length + browser.blocked.length, 0);
	assert.equal(baseline.passed, 72); assert.equal(baseline.failed, 43); assert(!baseline.exception); assert.equal(baseline.errors.length + baseline.consoleErrors.length + baseline.blocked.length, 0);
	assert.equal(lifecycle.passed, 156); assert.equal(lifecycle.failed, 0); assert.equal(lifecycle.runtimeErrors.length + lifecycle.controlFallbacks.length, 0);
	const sourceHashes = { [source]: hash(source), ...lifecycle.sourceHashes }, contractHashes = Object.fromEntries(Object.entries(lifecycle.productionModuleHashes).filter(([file]) => !Object.hasOwn(sourceHashes, file)));
	for (const [file, expected] of Object.entries({ ...sourceHashes, ...contractHashes })) assert.equal(hash(file), expected, file);
	const inputMatches = Object.entries(inputs.files).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: hash(file) === expected }));
	assert(inputMatches.every((item) => item.passed), "Preview/runtime input changed; review before freezing");
	const callerMatches = callers.entries.map((entry) => ({ file: entry.file, expected: entry.sha256, actual: hash(entry.file), passed: hash(entry.file) === entry.sha256 }));
	fs.copyFileSync(".expo/codex-3-delete-modal-entry.jsx", local("preview-entry.fixture.jsx"));
	const internalFile = "docs/qa/codex-3-internal-review/delete-modal-2026-10-09/verification.json", internal = read(internalFile);
	assert.equal(internal.status, "INTERNAL_QA_REVIEW_PASS");
	assert.equal(internal.source.sha256, hash(source)); assert.equal(internal.checks.passed, 53); assert.equal(internal.checks.failed + internal.checks.runtimeErrors + internal.checks.runtimeWarnings, 0); assert.equal(internal.externalQcApproval, false);
	for (const item of internal.artifacts) assert.equal(hash(path.join(path.dirname(internalFile), item.path)), item.sha256, item.path);
	const internalReview = { kind: "Internal delegated review; does not replace external QA/QC decision", status: internal.status, independentAssertions: internal.checks.passed, manifest: internalFile, manifestSha256: hash(internalFile) };
	const artifacts = [];
	function scan(directory, prefix = "") { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = prefix + entry.name; if (entry.isDirectory()) scan(path.join(directory, entry.name), file + "/"); else if (entry.name !== "verification.json") artifacts.push(file); } }
	scan(__dirname);
	const manifest = { owner: "Codex-3", ticket: "SD3-008", status: "READY_FOR_QA_QC", capturedAt: new Date().toISOString(), publicationApproval: false, publicationOwner: "PM", sourceHashes, contractHashes,
		baseline: { sourceHash: hash(local("DeleteConfirmModal.before.tsx.txt")), passed: baseline.passed, failed: baseline.failed, runtimeErrors: 0 },
		checks: { browser: browser.passed, lifecycleReplay: lifecycle.passed, totalDeveloperExecutions: browser.passed + lifecycle.passed, failures: 0, runtimeErrors: 0, focusedTypeDiagnostics: quality.diagnostics.length, quality: quality.status }, internalReview,
		callerReview: { files: callers.files, usages: callers.usages, matches: callerMatches, changedDuringReview: callerMatches.filter((item) => !item.passed), scope: "Static usage/props snapshot; representative browser cases, not all63 screens" }, inputMatches,
		fixtureHashes: { ".expo/codex-3-delete-modal-entry.jsx": hash(".expo/codex-3-delete-modal-entry.jsx") }, artifactFingerprints: Object.fromEntries(artifacts.map((file) => [file, hash(local(file))])),
		limits: ["One shared delete-confirmation source changed; public handlers/props/copy/two-button JSX preserved", "Older SD3-006/007 packets remain frozen historical snapshots with prior DeleteConfirmModal dependency; latest156 replay is here", "Internal review is separate from external QA/QC and PM publication approval", "No native/SSR/keyboard/font-accessibility/full-router/root-auth/63-screen/Figma/backend/full-app certification; browser transport is a local fixture"] };
	fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
}
const manifest = read(manifestFile), checks = [
	...Object.entries(manifest.sourceHashes).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.contractHashes).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.artifactFingerprints).map(([file, expected]) => ({ file, passed: hash(local(file)) === expected })),
	...manifest.inputMatches.map(({ file, expected }) => ({ file, passed: hash(file) === expected })),
	{ file: manifest.internalReview.manifest, passed: hash(manifest.internalReview.manifest) === manifest.internalReview.manifestSha256 },
];
assert(checks.every((item) => item.passed), JSON.stringify(checks.filter((item) => !item.passed)));
console.log(JSON.stringify({ status: manifest.status, sources: Object.keys(manifest.sourceHashes).length, contracts: Object.keys(manifest.contractHashes).length, artifacts: Object.keys(manifest.artifactFingerprints).length, inputs: manifest.inputMatches.length, callerDrift: manifest.callerReview.changedDuringReview }));
if (process.argv.includes("--update-main")) {
	const file = "docs/qa/codex-3/verification.json", main = read(file);
	main.currentSupplements.sharedDeleteModalSize = { ticket: manifest.ticket, status: manifest.status, handoff: "docs/qa/codex-3/delete-modal-size/HANDOFF.md", manifest: "docs/qa/codex-3/delete-modal-size/verification.json", manifestSha256: hash(manifestFile), sourceHashes: manifest.sourceHashes, checks: manifest.checks, internalReview: manifest.internalReview, limits: manifest.limits };
	const update = { sources: { "components/common/DeleteConfirmModal.tsx": manifest.sourceHashes["components/common/DeleteConfirmModal.tsx"], "components/common/SuccessModal.tsx": manifest.contractHashes["components/common/SuccessModal.tsx"] }, evidence: "docs/qa/codex-3/delete-modal-size/HANDOFF.md", originalPackets: "SD3-006 and007 frozen; prior dependency hashes retained as history", status: manifest.status };
	main.currentSupplements.deleteLifecycle.sharedDependencyUpdate = update;
	main.currentSupplements.sharedSuccessModalSize.sharedDependencyUpdate = update;
	const successReview = "docs/qa/codex-3-internal-review/success-modal-2026-10-09/verification.json";
	main.currentSupplements.sharedSuccessModalSize.internalReview = { status: "INTERNAL_QA_REVIEW_PASS", manifest: successReview, manifestSha256: hash(successReview), independentAssertions: 45, externalFindingStatus: "OPEN_PENDING_EXTERNAL_QC_RECHECK" };
	if (!main.status.includes("SD3-008")) main.status += " SD3-008 shared delete modal size READY_FOR_QA_QC with internal review; external QC/PM pending.";
	fs.writeFileSync(file, JSON.stringify(main, null, 2) + "\n");
}
