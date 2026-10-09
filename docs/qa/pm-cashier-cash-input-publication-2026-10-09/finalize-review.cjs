const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../../..");
const relative = (file) => path.relative(root, file).replaceAll("\\", "/");
const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const decode = (file) => {
	const bytes = fs.readFileSync(file);
	return (bytes[0] === 255 && bytes[1] === 254 ? bytes.toString("utf16le") : bytes.toString("utf8")).replace(/^\uFEFF/, "");
};
const read = (file) => JSON.parse(decode(path.join(__dirname, file)));
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]);
const git = (args) => cp.execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const setup = read("CANDIDATE_SETUP.json");
const qa = read("independent-qa/independent-results.json");
const qc = read("independent-qc/source-verification-v2.json");
const quality = read("quality-results.json");
for (const [file, expected] of Object.entries(setup.productionHashes)) {
	assert.equal(digest(path.join(root, file)), expected, file);
	assert.equal(qa.candidateOwnedSourceHashesBefore[file], expected, file);
	assert.equal(qa.candidateOwnedSourceHashesAfter[file], expected, file);
	assert.equal(qc.sourceHashes[file], expected, file);
}
assert.equal(qa.counts.passed, 35); assert.equal(qa.counts.failed, 0);
assert.deepEqual(qa.runtimeErrors, []); assert.deepEqual(qa.actionRejections, []);
assert.equal(qc.checks.length, 10); assert.ok(qc.checks.every((row) => row.result === "PASS"));
assert.equal(quality.roots.length, 6); assert.equal(quality.diagnosticCount, 0);
assert.equal(quality.eslint.errors, 0); assert.equal(quality.eslint.warnings, 0);
for (const name of ["eslint", "biome", "diff"]) assert.equal(quality[name].exit, 0);
for (const [file, expected] of Object.entries(quality.sourceHashes)) assert.equal(digest(path.join(root, file)), expected, file);
for (const row of setup.candidateDependencies) assert.equal(digest(path.join(root, row.file)), row.candidateHash, row.file);
assert.deepEqual(setup.productionDependencyDifferences, []);
const implementationManifest = read("implementation/artifacts.json");
const implementationFiles = walk(path.join(__dirname, "implementation"));
assert.equal(implementationFiles.length, 19);
for (const file of implementationFiles) {
	const key = path.relative(path.join(__dirname, "implementation"), file).replaceAll("\\", "/");
	if (key === "artifacts.json") continue;
	assert.equal(digest(file), implementationManifest.hashes[key], key);
}
for (const [file, expected] of Object.entries(setup.referenceHashes)) {
	const key = file.replace("docs/figma/cashier/sd5-20261009/cash-input/", "reference/");
	assert.equal(digest(path.join(__dirname, key)), expected, key);
}
const ownPrefix = relative(__dirname) + "/";
const allowed = new Set(Object.keys(setup.productionHashes));
const changed = git(["-c", "core.quotepath=false", "diff", "--name-only", "-z", setup.baseCommit]).split("\0").filter(Boolean);
const untracked = git(["-c", "core.quotepath=false", "ls-files", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
for (const file of [...changed, ...untracked]) assert.ok(allowed.has(file) || file.startsWith(ownPrefix), "Out-of-scope candidate file: " + file);
let jsonCount = 0;
for (const file of walk(__dirname)) if (file.endsWith(".json")) { JSON.parse(decode(file)); jsonCount++; }
if (process.argv.includes("--seal")) {
	assert.equal(git(["rev-parse", "HEAD"]), setup.baseCommit);
	assert.equal(git(["branch", "--show-current"]), setup.moduleBranch);
	const write = (file, value) => fs.writeFileSync(path.join(__dirname, file), JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
	write("independent-qa/PM_CONTINUATION.json", { status: "QA_EXECUTION_COMPLETE_SCOPED_BY_PM", suiteAuthor: "/root/cashier_pricing_qa", finalExecutor: "Projek Manager", agentCompletion: "WORKSPACE_OUT_OF_CREDITS_NO_FINAL_AGENT_SIGNATURE", counts: qa.counts, resultHash: digest(path.join(__dirname, "independent-qa/independent-results.json")), sourceHashes: setup.productionHashes, limitation: qa.limits });
	write("independent-qc/PM_INTAKE.json", { status: "PM_ACCEPTS_SOURCE_QC_AND_FINAL_QA_FOR_SCOPED_PUBLICATION", sourceReviewer: "/root/cashier_navbar_qc", finalGateReviewer: "Projek Manager", agentCompletion: "WORKSPACE_OUT_OF_CREDITS_BEFORE_QA_INTAKE_FINAL_SIGNATURE", sourceQcGroupsPassed: 10, finalQaChecksPassed: 35, sourceQcHash: digest(path.join(__dirname, "independent-qc/source-verification-v2.json")), sourceHashes: setup.productionHashes, limitation: ["No final QC agent signature claimed", "Native/full-router/payment/Figma pixel100 excluded", "Developer captures independently inspected, not independently browser-replayed"] });
	const artifactHashes = Object.fromEntries(walk(__dirname).map((file) => [path.relative(__dirname, file).replaceAll("\\", "/"), digest(file)]));
	write("PUBLICATION_REVIEW.json", { ticket: setup.ticket, status: "APPROVED_FOR_SCOPED_MODULE_PUBLICATION", recordedAtUtc: new Date().toISOString(), reviewer: "Projek Manager", baseCommit: setup.baseCommit, moduleBranch: setup.moduleBranch, productionHashes: setup.productionHashes, qa: qa.counts, qcSourceGroups: 10, quality: { roots: quality.roots, closure: quality.filesInClosure, diagnosticCount: quality.diagnosticCount, eslintErrors: quality.eslint.errors, eslintWarnings: quality.eslint.warnings, biomeExit: quality.biome.exit, diffExit: quality.diff.exit }, selectedDeveloperFiles: 19, selectedDeveloperArtifactsVerified: 18, totalOriginalDeveloperArtifactsVerifiedDuringSetup: 39, archivedOriginalManifestIsSubsetReceipt: true, referenceFilesVerified: Object.keys(setup.referenceHashes).length, dependenciesVerified: setup.candidateDependencies.length, jsonFilesValidatedBeforeSeal: jsonCount, artifactHashes, gatesExcluded: ["Full Figma pixel100/native/full router/PIN-refund navigator", "Authorized server quote and real checkout/payment", "Laporan/Transaksi/Shift and peer source review"] });
}
const final = read("PUBLICATION_REVIEW.json");
for (const [file, expected] of Object.entries(final.artifactHashes)) assert.equal(digest(path.join(__dirname, file)), expected, file);
console.log(JSON.stringify({ status: final.status, sourceFiles: allowed.size, artifactFiles: Object.keys(final.artifactHashes).length, selectedDeveloperFiles: implementationFiles.length, officialReferences: Object.keys(setup.referenceHashes).length, qaPassed: qa.counts.passed, qcSourceGroupsPassed: qc.checks.length, outOfScopeFiles: 0, jsonFilesValidated: jsonCount }));
