// Run from the application root after verification. Checks source/payload drift.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const directory = "docs/qa/senior-6-2026-10-09";
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const sha256 = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const lifecycle = read("results.json");
const ui = read("ui-api-results.json");
const contract = read("rounding-contract-results.json");
const eslint = read("eslint.json");
assert.equal(lifecycle.checks.length, 42);
assert.ok(lifecycle.checks.every(check => check.passed));
assert.deepEqual(lifecycle.runtimeErrors, []);
assert.equal(ui.checks.length, 17);
assert.ok(ui.checks.every(check => check.passed));
assert.deepEqual(ui.runtimeErrors, []);
assert.deepEqual(ui.consoleErrors, []);
assert.equal(contract.cases.length, 16);
assert.equal(contract.passed, true);
assert.ok(contract.cases.every(test => test.valid && test.expectedMatches));
assert.equal(sha256(path.join(directory, "rounding-contract-payloads.json")), contract.payloadSha256);
for (const [file, expected] of Object.entries(lifecycle.sources)) assert.equal(sha256(file), expected, file);
for (const [file, expected] of Object.entries(ui.sourceHashes)) assert.equal(sha256(file), expected, file);
assert.equal(sha256(path.join(directory, "ui-entry.jsx")), ui.sourceHashes[".expo/senior6-ui-entry.jsx"]);
assert.equal(sha256(path.join(directory, "scoped-tsconfig.json")), sha256(".expo/senior6-tsconfig.json"));
assert.equal(eslint.length, 3);
assert.equal(eslint.reduce((total, file) => total + file.errorCount + file.warningCount, 0), 0);
const backendRoot = "C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev";
for (const [file, expected] of Object.entries(contract.backendSourceSha256)) assert.equal(sha256(path.join(backendRoot, file)), expected, file);
const evidenceFiles = ["HANDOFF.md", "lifecycle.cjs", "results.json", "printer-results.json", "rounding-contract.php", "rounding-contract-payloads.json", "rounding-contract-results.json", "eslint.json", "ui-api.cjs", "ui-api-results.json", "ui-entry.jsx", "scoped-tsconfig.json", "summarize-evidence.cjs", "rounding-390.png", "stock-390.png", "rounding-320.png", "stock-320.png", "stock-picker-320.png", "printer-320.png", "rounding-exponent-10-320.png"];
const manifest = {
	createdAt: new Date().toISOString(),
	owner: "Software Developer Senior 6",
	ticket: "SD6-001 / QC-SD6-001",
	status: "READY_FOR_PM_REVIEW_QC_PASS_DELTA",
	baseHead: "acba0d92460c1af3149abc3775f09888a2943cab",
	sources: lifecycle.sources,
	uiDependencyHashes: ui.sourceHashes,
	backendSourceHashes: contract.backendSourceSha256,
	qcDecision: { status: "P1_CLOSED_PASS_DELTA_FOR_PM_REVIEW", report: "docs/qa/qc-sd6-2026-10-09/recheck/REPORT.md", reportSha256: sha256("docs/qa/qc-sd6-2026-10-09/recheck/REPORT.md"), scope: "Three final source hashes; UI supplement remains developer evidence" },
	evidenceHashes: Object.fromEntries(evidenceFiles.map(file => [file, sha256(path.join(directory, file))])),
	checks: {
		lifecycle: { passed: 42, failed: 0, runtimeConsoleErrors: 0, result: "results.json" },
		productionRequestValidator: { passed: 16, failed: 0, result: "rounding-contract-results.json" },
		productionUIWithHTTPFixtures: { passed: 17, failed: 0, runtimeErrors: 0, consoleErrors: 0, result: "ui-api-results.json" },
		eslint: { files: 3, errors: 0, warnings: 0, result: "eslint.json" },
		observedCommands: [
			{ command: "node node_modules/typescript/bin/tsc --noEmit --project .expo/senior6-tsconfig.json", exitCode: 0, scope: "Three source roots and dependency closure; not full-project integration" },
			{ command: "node node_modules/@biomejs/biome/bin/biome check [three SD6-001 source files]", exitCode: 0 },
			{ command: "git diff --check -- [three SD6-001 source files]", exitCode: 0 },
		],
	},
	limitations: ["Listed developer checks are separate from the linked QC decision", "HTTP fixtures; real API/database persistence not tested", "Developer validated Request/formula; QC separately executed CartPricingService on fixtures", "Small test navigator; full auth/router and native not tested", "Figma unavailable", "Printer discovery/save remains simulation", "Rounding applyTo and Stock category contract remain separate legacy limitations"],
};
fs.writeFileSync(path.join(directory, "verification.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Evidence/source hashes stable; 42 lifecycle + 16 Request + 17 UI checks verified");
