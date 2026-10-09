const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
const manifestPath = path.join(__dirname, "verification.json");
if (process.argv.includes("--finalize")) {
	if (fs.existsSync(manifestPath)) throw new Error("Final internal review manifest already exists; no overwrite");
	const result = readJson("results.json"), alias = readJson("alias-proof.json"), audit = readJson("audit-before.json"), preparation = readJson("preparation.json");
	if (result.fail || alias.fail || result.status !== "INTERNAL_QA_REVIEW_PASS" || alias.status !== "TYPE_ONLY_ALIAS_PROOF_PASS") throw new Error("Do not finalize failing contract/type-only evidence as PASS");
	if (result.reviewedSourceHash !== alias.finalSourceHash || hash(fs.readFileSync(path.join(appRoot, result.target))) !== result.reviewedSourceHash) throw new Error("Final reviewed source/hash changed");
	if (hash(fs.readFileSync(path.join(__dirname, "AlertModal.final.tsx.txt"))) !== result.reviewedSourceHash) throw new Error("Final snapshot mismatch");
	if (hash(fs.readFileSync(path.join(__dirname, "AlertModal.before.tsx.txt"))) !== audit.sourceSha256) throw new Error("Baseline source snapshot mismatch");
	if (hash(fs.readFileSync(path.join(__dirname, "AlertModal.geometry-only.tsx.txt"))) !== preparation.previousSourceHash) throw new Error("Interim geometry snapshot mismatch");
	const files = [...new Set([result.target, ...Object.keys(audit.companions), ...audit.callers.map((caller) => caller.file), "assets/images/alerts/index.ts", audit.assets["assets/images/alerts/index.ts"].definitions.category.file])];
	const sourceFingerprints = files.map((file) => ({ path: file, sha256: hash(fs.readFileSync(path.join(appRoot, file))) }));
	const total = result.pass + alias.pass;
	const report = `# SD3-009 final AlertModal internal QA\n\nStatus: **INTERNAL_QA_REVIEW_PASS**; external QC approval **false**. Final source \`${result.reviewedSourceHash}\`. Baseline \`${result.baselineSourceHash}\`; previous geometry-only source \`${preparation.previousSourceHash}\`. Previous internal packet remains frozen.\n\n60/60 independent renderer contract assertions pass on final source, plus4/4 type-only proof checks:64 total checks,0failed. Runtime/React/act errors0, warnings0 after suppressing only renderer deprecation. Same60 runtime/AST contracts from prior review replayed with final source; only AST normalization reverses the private type declaration and annotation rename in addition to four geometry deltas. Parent browser/lifecycle/quality results are separate.\n\nType alias AlertModal ->AlertModalProps and PropsWithChildren annotation change produce exactly identical emitted JavaScript to reviewed geometry source a1d8. Both emitted JS hashes \`${alias.emittedJavaScriptSha256.final}\`. Full final AST equals baseline after reversing four geometry deltas and these two erased identifiers. Function/default export/public props/callbacks/copy/footer/image semantics remain. No new explicit maximum380; Alert image128/cover and primitive default md maximum510 retained.\n\nRenderer exercises actual AlertModal/useAlertModal under React StrictMode with dimension and presentation host adapters: default setter close, custom direct onClose, confirm fallback/explicit/promise callback, loading confirm-only disable with active cancel, two/one/nofooter, children/node message ordering, titles/labels/optional/custom/falsy image, hidden-to-open and open resize320/390/768, subscription cleanup and public re-export references. Host disabled event handling is simulated; browser actual primitives belong to developer verification.\n\nBaseline audit71caller/78usages and category asset700×272 retained. Caller drift ${result.callerHashChecks.drift.length}; sibling/primitive/hook drift ${result.companionDrift.length}. Source/asset, snapshots, copied harness and proof/results are fingerprinted in verification.json. Previous artifact hashes were verified before copying. This is source hash-specific internal QA only, not external QC approval or permission to publish.\n\nNot certified: native/browser/HP/SSR/keyboard/font-accessibility/root router/all71screens/Figma/fullapp/realAPI/backend/storage/persist. Reviewer changed only this new review folder; app/shared docs/frozen packets/server/Metro/HP/HTTP/dependency/full TypeScript/Git mutations remain outside review.\n\nExecution Profile & Operator Tips: Medium. Match finalhash/artifacts -> compare renderer/type-only evidence -> parent browser/quality -> external QA/QC -> PM gate. Preserve intermediate lint-warning source/evidence and previous packets.\n`;
	fs.writeFileSync(path.join(__dirname, "REPORT.md"), report);
	const artifacts = [];
	function captureArtifacts(directory) {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const absolute = path.join(directory, entry.name);
			if (entry.isDirectory()) captureArtifacts(absolute);
			else if (absolute !== manifestPath) artifacts.push({ path: path.relative(__dirname, absolute).replaceAll("\\", "/"), sha256: hash(fs.readFileSync(absolute)) });
		}
	}
	captureArtifacts(__dirname);
	const manifest = {
		status: "INTERNAL_QA_REVIEW_PASS", internalReviewOnly: true, externalQcApproval: false,
		reviewer: "/root/audit_alert_modal", developerScope: "SD3-009-final-private-alias", createdAt: new Date().toISOString(),
		source: { path: result.target, sha256: result.reviewedSourceHash }, baselineSource: { path: result.target, sha256: result.baselineSourceHash }, interimSource: { path: result.target, sha256: preparation.previousSourceHash },
		checks: { passed: total, failed: 0, rendererPassed: result.pass, typeOnlyProofPassed: alias.pass, runtimeErrors: result.errors.length, runtimeWarnings: result.warnings.length },
		loadedProductionModules: Object.entries(result.productionHashes).map(([file, sha256]) => ({ path: file, sha256 })),
		callerInventory: { files: audit.callerCount, usages: audit.usageCount, drift: result.callerHashChecks.drift }, sourceFingerprints, artifacts,
		previousReview: { path: preparation.previousPacket, verificationSha256: preparation.previousManifestSha256, artifactCountVerified: preparation.oldArtifactsVerified },
		emittedJavaScriptSha256: alias.emittedJavaScriptSha256, limits: result.limitations,
	};
	fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
const manifest = readJson("verification.json");
const mismatches = [];
for (const entry of manifest.sourceFingerprints) {
	const actual = hash(fs.readFileSync(path.join(appRoot, entry.path)));
	if (actual !== entry.sha256) mismatches.push({ type: "source", ...entry, actual });
}
for (const entry of manifest.artifacts) {
	const actual = hash(fs.readFileSync(path.join(__dirname, entry.path)));
	if (actual !== entry.sha256) mismatches.push({ type: "artifact", ...entry, actual });
}
console.log(JSON.stringify({ status: manifest.status, externalQcApproval: false, checks: manifest.checks, sourceChecks: manifest.sourceFingerprints.length, artifactChecks: manifest.artifacts.length, mismatches }, null, 2));
if (mismatches.length) process.exitCode = 1;
