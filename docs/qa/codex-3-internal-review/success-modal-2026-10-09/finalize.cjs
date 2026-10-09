const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const destination = path.join(__dirname, "verification.json");
assert(!fs.existsSync(destination), "Preserve final review manifest");
const audit = read("audit.json"), results = read("independent-results.json"), provenance = read("provenance.json");
assert.equal(audit.status, "PASS");
assert.equal(provenance.status, "PASS");
assert.equal(results.passed, 45);
assert.equal(results.failed, 0);
assert.equal(results.runtimeErrors.length, 0);
assert(!results.exception);
const sourceHash = sha("components/common/SuccessModal.tsx");
assert.equal(sourceHash, results.sourceHash);
assert.equal(sourceHash, sha(path.join(__dirname, "source-reviewed.tsx.txt")));
const files = fs.readdirSync(__dirname).filter((name) => name !== "verification.json");
const result = {
	kind: "INTERNAL_QA_REVIEW",
	status: "PASS",
	date: new Date().toISOString(),
	ticket: "SD3-007",
	owner: "Codex-3 delegated internal reviewer / review_success_modal",
	reviewedSourceHashes: { "components/common/SuccessModal.tsx": sourceHash },
	developerManifestSha256: audit.manifestSha256,
	dependencyCaptureAt: audit.capturedAt,
	developerEvidenceReviewedExecutions: 243,
	independentReviewerExecutions: 45,
	independentReviewerFailures: 0,
	runtimeErrors: 0,
	findings: [],
	externalFinding: { id: "QC-STOCK-UI-001", status: "OPEN_PENDING_EXTERNAL_QC_RECHECK", closedByThisReview: false },
	publicationApproval: false,
	publicationOwner: "PM",
	limits: ["Internal scoped review, not external QC approval", "Frozen developer browser/lifecycle/quality evidence audited, no browser replay", "45 new React renderer checks use presentation/dimension adapters", "Dependency fingerprint capture predates coordinated SD3-008 DeleteConfirmModal changes; later delta needs its own gate"],
	artifactFingerprints: Object.fromEntries(files.map((name) => [name, sha(path.join(__dirname, name))])),
};
fs.writeFileSync(destination, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ status: result.status, kind: result.kind, reviewerExecutions: result.independentReviewerExecutions, artifactFingerprints: files.length }));
