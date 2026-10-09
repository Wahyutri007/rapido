const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const results = JSON.parse(fs.readFileSync(path.join(__dirname, "results.json"), "utf8"));
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "audit-before.json"), "utf8"));
if (results.failed || results.outcome !== "PASS_WITH_SCOPE_LIMITS") throw new Error("Independent checks did not pass");
if (hash(path.join(appRoot, results.source.path)) !== results.source.sha256) throw new Error("Final source changed after review");
for (const caller of audit.callers) if (hash(path.join(appRoot, caller.file)) !== caller.sha256) throw new Error(`Caller changed after review: ${caller.file}`);
for (const loaded of results.loadedProductionModules) if (hash(path.join(appRoot, loaded.path)) !== loaded.sha256) throw new Error(`Dependency changed after review: ${loaded.path}`);
fs.copyFileSync(path.join(appRoot, results.source.path), path.join(__dirname, "DeleteConfirmModal.final.tsx.txt"));
const artifactNames = ["README.md", "REPORT.md", "audit.cjs", "audit-before.json", "DeleteConfirmModal.before.tsx.txt", "DeleteConfirmModal.final.tsx.txt", "check.cjs", "results.json", "manifest.cjs"];
const output = path.join(__dirname, "verification.json");
if (fs.existsSync(output)) throw new Error("Internal manifest already frozen");
const verification = {
	status: "INTERNAL_QA_REVIEW_PASS",
	internalReviewOnly: true,
	externalQcApproval: false,
	reviewer: "/root/audit_delete_modal",
	developerScope: "SD3-008",
	date: "2026-10-09",
	source: results.source,
	baselineSource: audit.source,
	checks: { passed: results.passed, failed: results.failed, runtimeErrors: results.runtimeErrors.length, runtimeWarnings: results.runtimeWarnings.length },
	resultsSchema: { status: results.status, outcome: results.outcome },
	callerInventory: { files: audit.files, usages: audit.usages, fingerprintMatchCount: audit.callers.length, path: "audit-before.json" },
	loadedProductionModules: results.loadedProductionModules,
	artifacts: artifactNames.map((file) => ({ path: file, sha256: hash(path.join(__dirname, file)) })),
	adapters: results.adapters,
	limits: results.limits,
	reviewConclusion: "No actionable final-source issue found; geometry-only AST comparison and targeted contracts passed. Browser/native/external QC gates are separate.",
};
fs.writeFileSync(output, `${JSON.stringify(verification, null, 2)}\n`);
console.log(JSON.stringify({ status: verification.status, sourceHash: verification.source.sha256, passed: verification.checks.passed, failed: verification.checks.failed, callerFingerprints: verification.callerInventory.fingerprintMatchCount, artifacts: verification.artifacts.length }));
