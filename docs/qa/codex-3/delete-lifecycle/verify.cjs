const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const local = (name) => path.join(__dirname, name);
const manifestPath = local("verification.json");
if (process.argv.includes("--finalize")) {
	if (fs.existsSync(manifestPath)) throw new Error("Final manifest already exists; preserve the frozen packet");
	const results = read(local("results.json")), baseline = read(local("baseline.json")), quality = read(local("quality-results.json")), types = read(local("typecheck-results.json"));
	if (results.mode !== "current-source" || results.failed || results.runtimeErrors.length || results.controlFallbacks.length || quality.status !== "PASS" || types.exitCode) throw new Error("Required checks are not passing");
	const sourceMatches = Object.entries(results.sourceHashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) && quality.sourceHashes[file] === expected && types.sourceHashes[file] === expected }));
	if (!sourceMatches.every((item) => item.passed)) throw new Error("Tested source changed or quality/type evidence mismatch");
	const snapshotFiles = ["role.before.tsx.txt", "worker.before.tsx.txt", "member.before.tsx.txt"];
	const snapshotMatches = Object.entries(baseline.sourceHashes).map(([file, expected], i) => ({ file: snapshotFiles[i], expected, actual: hash(local(snapshotFiles[i])), passed: hash(local(snapshotFiles[i])) === expected }));
	if (!snapshotMatches.every((item) => item.passed)) throw new Error("Baseline source/snapshot mismatch");
	const contracts = results.productionModules.filter((file) => !Object.hasOwn(results.sourceHashes, file));
	if (!contracts.every((file) => results.productionModuleHashes[file] === hash(file))) throw new Error("Production test dependency changed");
	const artifacts = ["HANDOFF.md", "check.cjs", "baseline.json", "results.json", "quality.cjs", "quality-results.json", "typecheck.cjs", "typecheck-results.json", "verify.cjs", ...snapshotFiles];
	const manifest = { owner: "Codex-3", ticket: "SD3-006", status: "READY_FOR_QA", date: new Date().toISOString(), publicationApproval: false, publicationOwner: "PM",
		sourceHashes: results.sourceHashes, sourceMatches, baselineSourceHashes: baseline.sourceHashes, snapshotMatches,
		checks: { baseline: { passed: baseline.passed, failed: baseline.failed, runtimeErrors: baseline.runtimeErrors.length }, final: { passed: results.passed, failed: results.failed, runtimeErrors: results.runtimeErrors.length }, quality: quality.status, focusedTypeDiagnostics: types.diagnostics.length },
		contractHashes: Object.fromEntries(contracts.map((file) => [file, results.productionModuleHashes[file]])),
		artifactFingerprints: Object.fromEntries(artifacts.map((file) => [file, hash(local(file))])),
		limits: results.adapters.concat(["No HTTP/backend DELETE, native/browser/router/list/detail/root auth/Figma/full-app gate", "Local instance lock; already-dispatched DELETE is not cancelled; cross-remount/per-device idempotency is backend scope"]),
		qaRequest: "Independent behavior review, then QC delta decision and PM final gate; preserve developer artifacts and existing reviewed packets" };
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
const manifest = read(manifestPath);
const checks = [
	...Object.entries(manifest.sourceHashes).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.contractHashes).map(([file, expected]) => ({ file, passed: hash(file) === expected })),
	...Object.entries(manifest.artifactFingerprints).map(([file, expected]) => ({ file, passed: hash(local(file)) === expected })),
];
if (!checks.every((item) => item.passed)) { console.log(JSON.stringify(checks.filter((item) => !item.passed))); process.exitCode = 1; }
else console.log(JSON.stringify({ status: manifest.status, sourceMatches: Object.keys(manifest.sourceHashes).length, contractMatches: Object.keys(manifest.contractHashes).length, artifactMatches: Object.keys(manifest.artifactFingerprints).length }));
if (process.argv.includes("--update-main") && !process.exitCode) {
	const mainFile = "docs/qa/codex-3/verification.json", main = read(mainFile);
	main.currentSupplements.deleteLifecycle = { ticket: "SD3-006", status: manifest.status, handoff: "docs/qa/codex-3/delete-lifecycle/HANDOFF.md", manifest: "docs/qa/codex-3/delete-lifecycle/verification.json", manifestSha256: hash(manifestPath), sourceHashes: manifest.sourceHashes, checks: manifest.checks, limits: manifest.limits };
	if (!main.status.includes("SD3-006")) main.status += " SD3-006 delete dialogs READY_FOR_QA.";
	main.currentSupplements.date = new Date().toISOString();
	fs.writeFileSync(mainFile, JSON.stringify(main, null, 2) + "\n");
}
