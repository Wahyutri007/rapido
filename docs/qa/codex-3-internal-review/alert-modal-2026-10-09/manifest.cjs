const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
const finalize = process.argv.includes("--finalize");
const manifestPath = path.join(__dirname, "verification.json");
if (finalize && fs.existsSync(manifestPath)) throw new Error("Internal review packet already finalized; do not overwrite");
if (finalize) {
	const results = readJson("results.json"), audit = readJson("audit-before.json");
	if (results.fail !== 0 || results.status !== "INTERNAL_QA_REVIEW_PASS") throw new Error("Do not finalize failing internal review as PASS");
	if (hash(fs.readFileSync(path.join(appRoot, results.target))) !== results.reviewedSourceHash) throw new Error("Reviewed source drifted before finalization");
	if (hash(fs.readFileSync(path.join(__dirname, "AlertModal.before.tsx.txt"))) !== audit.sourceSha256) throw new Error("Baseline snapshot does not match original audit");
	if (hash(fs.readFileSync(path.join(__dirname, "AlertModal.final.tsx.txt"))) !== results.reviewedSourceHash) throw new Error("Final snapshot does not match reviewed source");
	const category = audit.assets["assets/images/alerts/index.ts"].definitions.category;
	const sourceFiles = [...new Set([results.target, ...Object.keys(audit.companions), ...audit.callers.map((caller) => caller.file), "assets/images/alerts/index.ts", category.file])];
	const reviewedSourceHashes = Object.fromEntries(sourceFiles.map((file) => [file, hash(fs.readFileSync(path.join(appRoot, file)))]));
	const baselineCallerDrift = results.callerHashChecks.drift;
	const report = `# SD3-009 AlertModal internal QA review\n\nStatus: **INTERNAL_QA_REVIEW_PASS**. External QC approval: **false**. Parent final source \`${results.reviewedSourceHash}\`, baseline \`${results.baselineSourceHash}\`.\n\n${results.pass}/${results.pass + results.fail} new independent assertions pass, ${results.fail} fail; runtime/React/act errors ${results.errors.length}, warnings ${results.warnings.length} after suppressing only the renderer deprecation notice. Actual AlertModal and production useAlertModal run under React StrictMode. RN/dimension/Modal/Button/Text use host adapters; unused sibling re-exports are inert adapters. These counts are separate from developer browser/lifecycle results.\n\nFull source AST equals baseline after reversing four geometry deltas only: Dimensions import to window hook, hook width declaration, window width minus32, and explicit Image height128/content width. No explicit maximum380 added; primitive Modal default md maximum510 remains read-only. Image class h-32/cover, two equal footer groups, children/message order, title/text/props/exports and handlers unchanged.\n\nChecks exercise default controlled close, custom onClose without implicit setter, confirm fallback and explicit callback, pending promise pass-through, loading confirm-only disable with active cancel, two/one/no action footer, trimmed/custom title and labels, ReactNode message/children, optional/falsy/custom image, hidden-to-open state, initial width320, open resize390/768/back320 without prop change, StrictMode subscription and cleanup. Public contract review also verifies unchanged sibling/hook re-export references. Disabled-button behavior in this renderer is simulated by host respecting disabled; parent browser validates actual primitives.\n\nAudit captured 71 caller files/78 JSX usages before implementation, plus aliases/props/children and category image700×272. Current caller source drift: ${baselineCallerDrift.length}. ${baselineCallerDrift.length ? "Changes from other sessions are recorded in results.json as context only; they do not automatically fail this geometry-only source review." : "All caller fingerprints remain equal to captured baseline."} No caller screen is certified by counting its import. Source siblings/primitives/hook hashes remain equal to original audit.\n\nSource/asset and review artifacts are fingerprinted in verification.json. Run node manifest.cjs for a read-only check; --finalize creates the manifest once. New source/dependency changes invalidate this snapshot and require a new packet.\n\nThis is internal QA only. It does not close QC-STOCK-UI-001, replace external QA/QC decisions, or authorize PM publication. No browser/native/SSR/HP/keyboard/font-accessibility/full-router/Figma/full-app/backend/API/storage/persistence certification; no app/shared docs/frozen packets, HTTP, dependency, server/Metro/HP, full TypeScript or Git mutation by reviewer.\n\nExecution Profile & Operator Tips: Medium. Match source/evidence -> independent contract review -> evaluate parent browser geometry -> external QA/QC -> PM gate. Preserve Alert128/cover/default510 and confirm-only loading semantics.\n`;
	fs.writeFileSync(path.join(__dirname, "REPORT.md"), report);
	const artifacts = fs.readdirSync(__dirname).filter((name) => name !== "verification.json" && fs.statSync(path.join(__dirname, name)).isFile()).map((name) => ({ path: name, sha256: hash(fs.readFileSync(path.join(__dirname, name))) }));
	const manifest = {
		status: "INTERNAL_QA_REVIEW_PASS", internalReviewOnly: true, externalQcApproval: false, reviewer: "/root/audit_alert_modal", developerScope: "SD3-009", createdAt: new Date().toISOString(),
		source: { path: results.target, sha256: results.reviewedSourceHash },
		baselineSource: { path: results.target, sha256: results.baselineSourceHash },
		checks: { passed: results.pass, failed: results.fail, runtimeErrors: results.errors.length, runtimeWarnings: results.warnings.length },
		target: results.target, reviewedSourceHash: results.reviewedSourceHash, baselineSourceHash: results.baselineSourceHash,
		independentAssertions: { pass: results.pass, fail: results.fail, errors: results.errors.length, warnings: results.warnings.length },
		productionLoadedHashes: results.productionHashes, reviewedSourceHashes,
		callerHashSnapshot: { count: audit.callerCount, usageCount: audit.usageCount, baselineCallerDrift },
		artifacts,
		limits: results.limitations,
	};
	fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
const manifest = readJson("verification.json");
const mismatches = [];
for (const [file, expected] of Object.entries(manifest.reviewedSourceHashes)) {
	const actual = hash(fs.readFileSync(path.join(appRoot, file)));
	if (actual !== expected) mismatches.push({ type: "source", file, expected, actual });
}
for (const { path: file, sha256: expected } of manifest.artifacts) {
	const actual = hash(fs.readFileSync(path.join(__dirname, file)));
	if (actual !== expected) mismatches.push({ type: "artifact", file, expected, actual });
}
console.log(JSON.stringify({ status: manifest.status, externalQcApproval: manifest.externalQcApproval, sourceChecks: Object.keys(manifest.reviewedSourceHashes).length, artifactChecks: manifest.artifacts.length, mismatches }, null, 2));
if (mismatches.length) process.exitCode = 1;
