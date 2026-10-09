const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const out = __dirname;
const read = file => JSON.parse(fs.readFileSync(path.join(out, file), "utf8"));
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const before = read("source-before.json");
for (const [file, expected] of Object.entries(before.sourceHashes)) {
	if (hash(file) !== expected) throw Error("Reviewed form source changed: " + file);
}
const suites = [["results.json", 54], ["independent-results.json", 38]];
for (const [file, count] of suites) {
	const result = read(file);
	if (result.passed !== count || result.failed !== 0 || result.errors.length || result.writes.length) throw Error("Browser evidence failed: " + file);
}
const quality = read("quality-results.json");
if (quality.scopedEslint.exitCode !== 0 || quality["biome-format"].exitCode !== 0 || quality["diff-check"].exitCode !== 0 || quality["biome-check"].exitCode !== 1) throw Error("Quality result differs from review");
const style = read("style-findings.json");
if (style.findings.length !== 7 || style.appliedToApplication) throw Error("Unexpected style proposal state");
execFileSync("git", ["apply", "--check", path.join(out, "organize-imports.patch")], { stdio: "pipe" });
const files = fs.readdirSync(out).filter(file => /\.(cjs|json|md|patch|txt|png)$/.test(file) && file !== "DECISION.json");
const drift = Object.entries(before.dependencyHashes).filter(([file, expected]) => hash(file) !== expected).map(([file, expected]) => ({ file, before: expected, current: hash(file) }));
const decision = {
	signal: "QC-MANAGE-FORMS-20261009-CHANGES-REQUESTED",
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	status: "CHANGES_REQUESTED",
	functionalStatus: "PASS_FOCUSED_BROWSER",
	publication: "HOLD_QC_APPROVAL_PENDING_IMPORT_ORDER_FIX_AND_FINAL_HASHES",
	findings: [{ id: style.finding, severity: "P3", category: "assist/source/organizeImports", diagnostics: 7, patch: "organize-imports.patch", applied: false }],
	reviewedSourceHashes: before.sourceHashes,
	sourceStableThroughoutReview: true,
	gitHeadAtDecision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
	quality,
	suites: suites.map(([file, passed]) => ({ file, passed, failed: 0, runtimeErrors: 0, apiWrites: 0 })),
	assertionExecutions: 92,
	dependencyDrift: drift,
	runtime: { ownMetroPort: 8111, ownMetroPid: 24080, ownProcessesStopped: [24080, 40388], portVerifiedClosed: true, browsersClosed: true, currentSharedMetroConfigApproved: false },
	artefacts: Object.fromEntries(files.map(file => [file, hash(path.join(out, file))])),
	limitations: ["Isolated layout/list fixtures, production routes/form/pickers/fonts", "Forms remain preview with no persistence/API", "No full auth/root/SSR/native/Figma verification", "Shared Metro cache fix changed during review and needs separate gate", "Full TypeScript/integration remain with PM"],
	handoff: "Codex-3 fixes import order and hands off final fingerprints; PM owns publication. No application source, Git index/branch, commit or push changed by this QC batch.",
};
fs.writeFileSync(path.join(out, "DECISION.json"), JSON.stringify(decision, null, 2) + "\n");
console.log(JSON.stringify({ signal: decision.signal, passed: 92, functionalFailed: 0, styleDiagnostics: 7, reviewedFiles: Object.keys(before.sourceHashes).length, dependencyDrift: drift.map(item => item.file) }));
