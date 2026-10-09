const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../..");
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
const digest = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const before = read("snapshot-before.json");
const after = read("snapshot-after.json");
assert.deepEqual(before.fingerprints, after.fingerprints);
for (const [file, sha] of Object.entries(before.fingerprints)) assert.equal(digest(path.join(root, file)), sha, `final stable input ${file}`);
const lifecycle = read("lifecycle-results.json");
const rhf = read("integration-results.json");
const own = read("independent-results.json");
for (const suite of [lifecycle, rhf, own]) assert.equal(suite.status, "PASS");
assert.equal(lifecycle.passed, 28); assert.equal(rhf.passed, 15); assert.equal(own.count, 50);
assert.equal(lifecycle.failed + rhf.failed, 0);
assert.deepEqual(own.unexpectedErrors, []);
assert.equal(read("eslint-results.json").reduce((total, item) => total + item.errorCount + item.warningCount, 0), 0);
const callers = read("caller-contract.json");
assert.equal(callers.callers.length, 9);
assert.equal(callers.callers.reduce((total, entry) => total + entry.count, 0), 11);
const decision = {
  id: "QC-MULTISELECT-20261009-PASS-DELTA",
  recordedAt: new Date().toISOString(),
  status: "PASS_DELTA_FOR_PM_REVIEW",
  qaBehaviorPassed: true,
  qcContractPassed: true,
  approvedScope: [{ file: "components/common/MultiSelect.tsx", sha256: before.fingerprints["components/common/MultiSelect.tsx"] }],
  tests: { developerRerunLifecycle: 28, developerRerunRHF: 15, independentQC: 50, total: 93, unexpectedRuntimeErrors: 0 },
  publicPropsUnchanged: true,
  returnedJSXUnchanged: true,
  callerFiles: 9,
  callerUses: 11,
  inputFingerprintsStable: Object.keys(before.fingerprints).length,
  quality: read("quality-results.json"),
  newBlockingFindings: [],
  existingStartupGate: "CHANGES_REQUESTED on separate cache/warning packet; not closed here",
  approvalsNotIncluded: ["native/browser full-screen", "full caller routes", "API/backend/auth/persistence/domain ownership", "final target submit", "Figma/UI alignment", "Metro/cache/runtime startup", "global TypeScript/app integration"],
  appSourceEdited: false,
  developerEvidenceOverwritten: false,
  runtimeServersOrDeviceOperated: false,
  gitPublished: false,
  publicationGateOwner: "Project Manager after final integration checks",
};
fs.writeFileSync(path.join(__dirname, "DECISION.json"), JSON.stringify(decision, null, 2) + "\n");
const files = fs.readdirSync(__dirname).filter(file => fs.statSync(path.join(__dirname, file)).isFile() && file !== "artifact-manifest.json");
fs.writeFileSync(path.join(__dirname, "artifact-manifest.json"), JSON.stringify({ recordedAt: new Date().toISOString(), files: files.map(file => ({ file, sha256: digest(path.join(__dirname, file)) })) }, null, 2) + "\n");
console.log(JSON.stringify({ id: decision.id, status: decision.status, tests: decision.tests.total, fingerprints: decision.inputFingerprintsStable }));
