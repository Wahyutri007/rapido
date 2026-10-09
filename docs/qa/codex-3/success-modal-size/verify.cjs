const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const local = (file) => path.join(__dirname, file), manifestFile = local("verification.json");
if (process.argv.includes("--finalize")) {
	assert(!fs.existsSync(manifestFile), "Preserve frozen final manifest");
	const source = "components/common/SuccessModal.tsx", sourceHash = hash(source), quality = read(local("quality-results.json")), modal = read(local("modal-browser-results.json")), lifecycle = read(local("delete-lifecycle/results.json")), stock = read(local("stock-final/browser-results.json")), baseline = read(local("stock-baseline/browser-results.json")), callers = read(local("callers.json")), inputs = read(local("inputs-before.json"));
	assert.equal(quality.status, "PASS"); assert.equal(quality.sourceHash, sourceHash); assert.equal(modal.sourceHash, sourceHash); assert.equal(lifecycle.productionModuleHashes[source], sourceHash);
	assert.equal(stock.passed, 36); assert.equal(stock.failed, 0); assert.equal(stock.errors.length + stock.consoleErrors.length, 0); assert(!stock.exception);
	assert.equal(modal.passed, 51); assert.equal(modal.failed, 0); assert.equal(modal.errors.length + modal.consoleErrors.length + modal.blocked.length, 0); assert(!modal.exception);
	assert.equal(lifecycle.passed, 156); assert.equal(lifecycle.failed, 0); assert.equal(lifecycle.runtimeErrors.length + lifecycle.controlFallbacks.length, 0);
	assert.equal(baseline.passed, 35); assert.equal(baseline.failed, 1);
	const sourceHashes = { [source]: sourceHash, ...lifecycle.sourceHashes };
	for (const [file, expected] of Object.entries(sourceHashes)) assert.equal(hash(file), expected);
	const callerMatches = callers.entries.map((entry) => ({ file: entry.file, expected: entry.sha256, actual: hash(entry.file), passed: hash(entry.file) === entry.sha256 }));
	const inputMatches = Object.entries(inputs.files).filter(([file]) => file !== source).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: hash(file) === expected }));
	assert(inputMatches.every((entry) => entry.passed), "Recorded preview/runtime inputs changed; review before finalizing");
	const contractHashes = Object.fromEntries(Object.entries(lifecycle.productionModuleHashes).filter(([file]) => !Object.hasOwn(sourceHashes, file)));
	for (const [file, expected] of Object.entries(contractHashes)) assert.equal(hash(file), expected);
	for (const [from, to] of [[".expo/codex-3-success-modal-entry.jsx", "modal-entry.fixture.jsx"], [".expo/codex-3-success-stock-entry.jsx", "stock-entry.fixture.jsx"]]) fs.copyFileSync(from, local(to));
	const artifacts = [];
	function scan(directory, prefix = "") { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = prefix + entry.name; if (entry.isDirectory()) scan(path.join(directory, entry.name), file + "/"); else if (entry.name !== "verification.json") artifacts.push(file); } }
	scan(__dirname);
	const manifest = { owner: "Codex-3", ticket: "SD3-007", status: "READY_FOR_QC_RECHECK", finding: { id: "QC-STOCK-UI-001", severity: "P2", status: "OPEN_PENDING_QC_RECHECK" }, date: new Date().toISOString(), publicationApproval: false, publicationOwner: "PM", sourceHashes,
		baselineHash: hash(local("SuccessModal.before.tsx.txt")), interimProposalHash: hash(local("image-only/SuccessModal.tsx.txt")), baseline: { stock: { passed: baseline.passed, failed: baseline.failed }, interimModal: { passed: 47, failed: 1 } },
		checks: { stockBrowser: 36, modalBrowser: 51, lifecycleReplay: 156, totalFinalExecutions: 243, failures: 0, runtimeErrors: 0, focusedTypeDiagnostics: quality.diagnostics.length, quality: quality.status },
		callerReview: { files: callers.files, usages: callers.usages, matches: callerMatches, changedDuringReview: callerMatches.filter((entry) => !entry.passed), scope: "Static props/hash inventory; representative browser cases, not execution of every screen" }, inputMatches, contractHashes,
		fixtureHashes: Object.fromEntries([".expo/codex-3-success-modal-entry.jsx", ".expo/codex-3-success-stock-entry.jsx"].map((file) => [file, hash(file)])), artifactFingerprints: Object.fromEntries(artifacts.map((file) => [file, hash(local(file))])),
		limits: ["One shared component source change; no source caller/backend/HTTP/native/root auth/SSR/Figma/full-app approval", "Old SD3-006 evidence remains historical with prior shared dependency; latest replay lives here", "PM final gate and QC recheck still required; P2 not developer-closed"] };
	fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
}
const manifest = read(manifestFile), checks = [
	...Object.entries(manifest.sourceHashes).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.contractHashes).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.artifactFingerprints).map(([file, expected]) => ({ file, passed: hash(local(file)) === expected })),
];
assert(checks.every((entry) => entry.passed), JSON.stringify(checks.filter((entry) => !entry.passed)));
console.log(JSON.stringify({ status: manifest.status, sourceMatches: Object.keys(manifest.sourceHashes).length, contractMatches: Object.keys(manifest.contractHashes).length, artifacts: Object.keys(manifest.artifactFingerprints).length, stableCallers: manifest.callerReview.matches.filter((entry) => entry.passed).length, inputMatches: manifest.inputMatches.length }));
if (process.argv.includes("--update-main")) {
	const file = "docs/qa/codex-3/verification.json", main = read(file);
	main.currentSupplements.sharedSuccessModalSize = { ticket: manifest.ticket, status: manifest.status, handoff: "docs/qa/codex-3/success-modal-size/HANDOFF.md", manifest: "docs/qa/codex-3/success-modal-size/verification.json", manifestSha256: hash(manifestFile), finding: manifest.finding, sourceHashes: manifest.sourceHashes, checks: manifest.checks, limits: manifest.limits };
	main.currentSupplements.deleteLifecycle.sharedDependencyUpdate = { source: "components/common/SuccessModal.tsx", sourceHash: manifest.sourceHashes["components/common/SuccessModal.tsx"], evidence: "docs/qa/codex-3/success-modal-size/HANDOFF.md", originalPacket: "Frozen historical snapshot before shared modal delta; no hashes/results retrofitted" };
	if (!main.status.includes("SD3-007")) main.status += " SD3-007 shared modal size READY_FOR_QC_RECHECK (QC-STOCK-UI-001 still OPEN).";
	fs.writeFileSync(file, JSON.stringify(main, null, 2) + "\n");
}
