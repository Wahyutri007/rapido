const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const local = file => path.join(__dirname, file), read = file => JSON.parse(fs.readFileSync(file, "utf8")), hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
assert(!fs.existsSync(local("verification.json")), "Preserve frozen review");
const primary = read(local("results.json")), baseline = read(local("baseline-results.json")), additional = read(local("additional-final-results.json")), inputs = read(local("baseline-capture.json"));
assert.equal(primary.summary.passed, 199); assert.equal(additional.summary.passed, 78);
for (const result of [primary, additional]) {
	assert.equal(result.summary.failed + result.summary.runtimeErrors + result.summary.warnings, 0);
	for (const [file, expected] of Object.entries(result.loadedSourceHashes)) assert.equal(hash(file), expected, file);
}
assert.deepEqual(baseline.checks.map(item => item.name), primary.checks.slice(0, baseline.checks.length).map(item => item.name));
assert.equal(baseline.summary.passed, 96); assert.equal(baseline.summary.failed, 84);
for (const [file, expected] of Object.entries(inputs.contractHashes)) assert.equal(hash(file), expected, file);
const edited = ["components/feature/manage/ManageListActions.tsx", ...Object.keys(inputs.sourceHashes)];
const reviewedSourceHashes = Object.fromEntries(edited.map(file => [file, primary.loadedSourceHashes[file]]));
for (const [file, expected] of Object.entries(reviewedSourceHashes)) assert.equal(hash(file), expected, file);
const artifacts = [];
function scan(directory, prefix = "") { for (const item of fs.readdirSync(directory, { withFileTypes: true })) { const file = prefix + item.name; if (item.isDirectory()) scan(path.join(directory, item.name), file + "/"); else if (item.name !== "verification.json") artifacts.push(file); } }
scan(__dirname);
const output = { status: "INTERNAL_QA_REVIEW_PASS", externalQcApproval: false, finishedAt: new Date().toISOString(), reviewedSourceHashes, productionContractHashes: inputs.contractHashes, loadedProductionSourceHashes: primary.loadedSourceHashes,
	baseline: baseline.summary, primary: primary.summary, supplemental: additional.summary,
	final: { assertions: 277, passed: 277, failed: 0, runtimeErrors: 0, warnings: 0 }, counts: { stateAndIntegration: 258, contractFingerprints: 19 },
	artifactHashes: Object.fromEntries(artifacts.map(file => [file, hash(local(file))])),
	sealedBy: "Codex-3 root: delegated reviewer completed primary/supplementary executions; its turn ended before report/manifest. Root verified existing results/source/contract/artifacts and sealed without rerunning or changing review tests.",
	limitations: "Actual List/helper/sheet/delete/mutation/factory/Common/QueryClient/Axios memory transport; GET/native/presentation/router adapters. Original supplemental74/4 remains archived, corrected unique search78/0 counted once. No external QC or geometry/native/backend/full-router approval." };
fs.writeFileSync(local("verification.json"), JSON.stringify(output, null, 2) + "\n"); console.log(JSON.stringify(output.final));
