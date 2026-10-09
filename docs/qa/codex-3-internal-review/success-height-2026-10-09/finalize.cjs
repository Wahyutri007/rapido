const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "audit.json"), "utf8"));
const destination = path.join(__dirname, "verification.json");
assert(!fs.existsSync(destination), "Preserve final internal capture");
assert.equal(audit.status, "HISTORICAL_PROPOSAL_EVIDENCE_VALID_WITH_LIMITS");
assert.equal(audit.qcArtifactManifest.matching, 139);
assert.equal(audit.proposalTotalExecutions, 270);
assert.equal(audit.proposalFailedExecutions, 0);
assert.equal(sha(audit.source.file), audit.source.currentSha256);
const artifacts = fs.readdirSync(__dirname).filter((name) => name !== "verification.json");
const result = {
	kind: audit.kind,
	status: audit.status,
	date: new Date().toISOString(),
	ticket: "SD3-012",
	owner: "Codex-3 delegated internal reviewer / review_success_modal",
	reviewedSourceHashes: { [audit.source.file]: audit.source.currentSha256 },
	qcDecisionSha256: audit.qcDecision.sha256,
	qcArtifactManifestSha256: audit.qcArtifactManifest.sha256,
	qcArtifactsVerified: audit.qcArtifactManifest.matching,
	historicalQCProposalExecutionsReviewed: 270,
	newRuntimeExecutions: 0,
	geometryReuse: audit.geometryReuse,
	externalFinding: audit.externalFinding,
	publicationApproval: false,
	publicationOwner: "PM",
	limits: audit.limits,
	artifactFingerprints: Object.fromEntries(artifacts.map((name) => [name, sha(path.join(__dirname, name))])),
};
fs.writeFileSync(destination, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ status: result.status, artifacts: artifacts.length, historicalExecutions: 270, newRuntimeExecutions: 0 }));
