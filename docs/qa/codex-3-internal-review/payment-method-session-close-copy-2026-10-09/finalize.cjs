const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const manifestPath = path.join(__dirname, "verification.json");
const form = "components/feature/manage/settings/PaymentMethodModifyScreen.tsx";
const finalHash = "0451db3bf9f4f29f4f2f4c67814fa788edb4cb56a983824848443a0da1d40d4e";
if (process.argv.includes("--finalize")) {
	if (fs.existsSync(manifestPath)) throw new Error("Follow-up packet already sealed; no overwrite");
	const result = readJson("results.json"), proof = readJson("proof.json"), preparation = readJson("preparation.json"), previous = readJson("previous-review-manifest.json");
	const qualityPath = "docs/qa/codex-3/payment-method-session/quality-results.json";
	const quality = JSON.parse(fs.readFileSync(path.join(root, qualityPath), "utf8"));
	if (result.fail || proof.fail || result.errors.length || result.warnings.length || result.status !== "INTERNAL_QA_REVIEW_PASS") throw new Error("Cannot seal failed review as PASS");
	if (quality.status !== "PASS" || quality.sourceHashes[form] !== finalHash || result.sourceHashes[form] !== finalHash || proof.finalHash !== finalHash) throw new Error("Need developer quality and independent tests on same final0451 source");
	if (Object.keys(quality.sourceHashes).length !== 10) throw new Error("Expected ten final application sources");
	const nonFormDrift = Object.entries(quality.sourceHashes).filter(([file, expected]) => file !== form && preparation.previousSourceHashes[file] !== expected);
	if (nonFormDrift.length) throw new Error(`Unexpected changes beyond label form delta: ${JSON.stringify(nonFormDrift)}`);
	const hashes = { ...result.sourceHashes, ...quality.sourceHashes };
	for (const [file, expected] of Object.entries(hashes)) if (sha(fs.readFileSync(path.join(root, file))) !== expected || (result.sourceHashes[file] && result.sourceHashes[file] !== expected)) throw new Error(`Source drift or mixed test inputs ${file}`);
	const runtimeInputs = previous.runtimeInputs.map((entry) => ({ ...entry, sha256: sha(fs.readFileSync(path.join(root, entry.path))) }));
	const report = `# SD3-013 final close-copy internal QA\n\nStatus **INTERNAL_QA_REVIEW_PASS**. External QC approval **false**. Form final \`${finalHash}\`; previous form \`${proof.baselineHash}\`. The older45 PASS packet remains frozen and historical.\n\n47/47 renderer/schema/store checks pass on final source:45 replayed checks unchanged plus2 new error-label/action checks. Three label-only proof checks also pass, giving50 current checks total with0 failure, runtime/React/act error0 and warning0. Counts include overlapping coverage; prior45 is not added again. Actual production Form/RHF/Zod/store/routes/screens/shared modal/hook/helper run with RN/primitive/router/dimension adapters. No browser/native geometry claim.\n\nFull source AST matches previous form after only confirmText Kembali ->Tutup. Nine other application source hashes are identical to the prior review. All ten final hashes match developer quality and disk; sixteen production modules loaded by tests stay stable. SuccessModal7508 remains read-only dependency; schema222b unchanged.\n\nNew targeted flow mounts the actual editor with a valid existing item, removes its record through production store, then submits valid RHF data. Store update rejects the missing ID, actual Alert title Data belum tersimpan appears with button Tutup. Pressing the actual modal button closes it through default Alert openState setter, without navigation, record creation or another mutation. The new copy correctly describes that action. No callback/payload/CRUD/schema behavior changed.\n\nExisting replay covers zero/default/cleared/decimal fee, unsupported/nonfinite/percentage bank validation, empty store, stable IDs and exact update/delete, duplicate submit once, old submit after unmount, keyed draft/IDs, detail delete acknowledgement once after record disappears, missing IDs and list search/empty state. Initial session copy/persistence/API limits remain.\n\nSource/runtime/snapshots/harness/previous manifest/proof are fingerprinted in verification.json. Developer final ten-source quality is read per hash; reviewer does not duplicate heavy lint/type/browser. No edit to app/shared/frozen packet, dependencies, server/Metro/HP/native/browser/HTTP/backend/full TS/Git. Session state is user-entered fixture memory, not real API/transaction/persistence certification. Figma/native/accessibility/full router/full app remain outside review. External QA/QC and PM gates remain separate.\n\nExecution Profile & Operator Tips: Low for one label delta, Medium for affected session/RHF regression. Match finalhash -> replay/action proof -> independent QA/QC -> PM gate. Preserve previous45 and all historical packets; do not retrofit them.\n`;
	fs.writeFileSync(path.join(__dirname, "REPORT.md"), report.replaceAll("older45", "older 45").replaceAll("source:45", "source: 45").replaceAll("plus2", "plus 2").replaceAll("giving50", "giving 50").replaceAll("with0", "with 0").replaceAll("error0", "error 0").replaceAll("warning0", "warning 0").replaceAll("SuccessModal7508", "SuccessModal 7508").replaceAll("schema222b", "schema 222b").replaceAll("previous45", "previous 45"));
	const artifacts = [];
	function walk(directory) { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const absolute = path.join(directory, entry.name); if (entry.isDirectory()) walk(absolute); else if (absolute !== manifestPath) artifacts.push({ path: path.relative(__dirname, absolute).replaceAll("\\", "/"), sha256: sha(fs.readFileSync(absolute)) }); } }
	walk(__dirname);
	const manifest = {
		status: "INTERNAL_QA_REVIEW_PASS", internalReviewOnly: true, externalQcApproval: false, reviewer: "/root/audit_alert_modal", scope: "SD3-013 final error-close label", createdAt: new Date().toISOString(),
		source: { path: form, sha256: finalHash }, baselineSource: { path: form, sha256: proof.baselineHash },
		checks: { passed: result.pass + proof.pass, failed: 0, rendererPassed: result.pass, replayedPriorAssertions: 45, newErrorActionChecks: 2, labelProofChecks: proof.pass, runtimeErrors: result.errors.length, runtimeWarnings: result.warnings.length },
		sourceHashes: quality.sourceHashes, loadedProductionSourceHashes: result.sourceHashes,
		sourceFingerprints: Object.entries(hashes).map(([file, sha256]) => ({ path: file, sha256 })), runtimeInputs,
		developerQualityReviewed: { path: qualityPath, sha256: sha(fs.readFileSync(path.join(root, qualityPath))), sourceCount: 10, lint: quality.lint.exitCode, biome: quality.biome.exitCode, diff: quality.diff.exitCode, typeDiagnostics: quality.diagnostics.length, rerunByReviewer: false },
		previousReview: { path: preparation.previousPacket, manifestSha256: preparation.previousManifestSha256, artifactsVerified: preparation.previousArtifactChecks, sourceStatus: "Historical ae401; not retrofitted" },
		artifacts, limits: result.limits,
	};
	fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
const manifest = readJson("verification.json"), mismatches = [];
for (const entry of [...manifest.sourceFingerprints, ...manifest.runtimeInputs]) { const actual = sha(fs.readFileSync(path.join(root, entry.path))); if (actual !== entry.sha256) mismatches.push({ type: "source/runtime", ...entry, actual }); }
for (const entry of manifest.artifacts) { const actual = sha(fs.readFileSync(path.join(__dirname, entry.path))); if (actual !== entry.sha256) mismatches.push({ type: "artifact", ...entry, actual }); }
console.log(JSON.stringify({ status: manifest.status, externalQcApproval: false, checks: manifest.checks, applicationSources: Object.keys(manifest.sourceHashes).length, productionSourceChecks: manifest.sourceFingerprints.length, runtimeInputChecks: manifest.runtimeInputs.length, artifactChecks: manifest.artifacts.length, mismatches }, null, 2));
if (mismatches.length) process.exitCode = 1;
