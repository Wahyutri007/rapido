const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "../../..");
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
const digest = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const before = read("review-before.json");
for (const [file, hash] of Object.entries(before.fingerprints)) assert.equal(digest(path.join(root, file)), hash, `final fingerprint ${file}`);
assert.deepEqual(read("review-after.json").fingerprints, before.fingerprints);
const suites = ["initializer-results.json", "guard-boundaries-results.json", "queue-boundaries-results.json", "route-warning-results.json"].map(read);
for (const suite of suites) assert.equal(suite.status, "PASS");
assert.equal(suites.reduce((total, suite) => total + suite.count, 0), 51);
const style = read("style-findings.json");
assert.equal(style.summary.errors, 4);
const lint = read("eslint-results.json");
assert.equal(lint.reduce((total, file) => total + file.errorCount + file.warningCount, 0), 0);
const patch = read("patch-results.json");
assert.equal(patch.status, "PASS");
assert.equal(patch.appliedToAppSource, false);
const proposalTest = read("style-proposal-initializer-results.json");
assert.equal(proposalTest.count, 10);
const log = fs.readFileSync(path.join(root, ".expo/senior7-startup/metro.out.log"), "utf8");
const warningMessages = [...new Set([...log.matchAll(/^\s*WARN\s+(.*)$/gm)].map(match => match[1]))];
const logResult = {
  recordedAt: new Date().toISOString(),
  file: ".expo/senior7-startup/metro.out.log",
  metroPidReported: fs.readFileSync(path.join(root, ".expo/senior7-startup/metro.pid"), "utf8").trim(),
  warningMessages,
  themeErrorPresent: /Unable to manually set color scheme/.test(log),
  errorEntries: [...log.matchAll(/^\s*ERROR\b/gm)].length,
};
assert.equal(logResult.themeErrorPresent, false);
assert.equal(logResult.errorEntries, 0);
fs.writeFileSync(path.join(__dirname, "metro-observation.json"), JSON.stringify(logResult, null, 2) + "\n");
const observation = read("device-observation.json");
observation.qcCurrentCapture = { rapidoForeground: false, warningTextConfirmed: false, noDeviceNavigation: true };
observation.qcDeveloperCaptureReview = { file: ".expo/senior7-startup/second-device.png", screen: "Beranda Back Office", redThemeErrorVisible: false, collapsedYellowWarningVisible: true, warningTextConfirmed: false, fullScreenshotPublished: false };
fs.writeFileSync(path.join(__dirname, "device-observation.json"), JSON.stringify(observation, null, 2) + "\n");
const baseMetro = execFileSync("git", ["show", "HEAD:metro.config.js"], { cwd: root, encoding: "utf8", windowsHide: true });
fs.writeFileSync(path.join(__dirname, "metro-head-baseline.js.txt"), baseMetro);
const decision = {
  id: "QC-NATIVEWIND-CACHE-20261009-CHANGES-REQUESTED",
  recordedAt: new Date().toISOString(),
  status: "CHANGES_REQUESTED",
  approvedForPublication: false,
  reviewComplete: true,
  behavior: { status: "PASS_DELTA", cacheConfigChecks: 41, routeChecks: 10, totalCurrentChecks: 51, unexpectedRuntimeErrors: 0 },
  gates: { eslint: "PASS_4_FILES_0_ERROR_WARNING", scopedDiffCheck: "PASS", biome: "FAIL_4_ERROR_1_WARNING_1_INFO", fingerprints: "PASS_17_STABLE" },
  findings: [
    { id: "QC-STARTUP-CACHE-001", severity: "P3", status: "OPEN", blocksStartupPackageApproval: true, reason: "3 formatter errors and noUnsafeFinally in source/harness gate" },
    { id: "QC-HP-WARNING-001", severity: "P3", status: "OPEN", scope: "routing", reason: "3 stale Screen registrations produce native warning", patch: "routing-warning.patch", applied: false },
    { id: "QC-HP-WARNING-002", severity: "P3", status: "OPEN", scope: "dependency integration", reason: "InteractionManager deprecation; installed router stack source accesses API, exact banner stack unconfirmed" },
  ],
  styleProposal: { patch: "startup-style.patch", applied: false, biomeErrors: 0, biomeWarnings: 1, biomeInfos: 1, initializerChecks: 10, successful: true },
  sourceFiles: Object.fromEntries(Object.entries(before.fingerprints).filter(([file]) => file === "metro.config.js" || file.startsWith("scripts/"))),
  activeAndroidCache: read("review-after.json").currentAndroidCache,
  nativeEvidence: "developer two cold launches reviewed; QC screenshot/ADB observation only, no independent restart/navigation",
  warningBannerExactTextConfirmed: false,
  handoff: "workspace SESSION_COORDINATION; developer corrections then QC recheck, PM integration/publication gate",
  appSourceEdited: false,
  nativeRuntimeRestarted: false,
  gitPublished: false,
};
fs.writeFileSync(path.join(__dirname, "DECISION.json"), JSON.stringify(decision, null, 2) + "\n");
const artifactFiles = fs.readdirSync(__dirname).filter(file => fs.statSync(path.join(__dirname, file)).isFile() && file !== "artifact-manifest.json");
fs.writeFileSync(path.join(__dirname, "artifact-manifest.json"), JSON.stringify({ recordedAt: new Date().toISOString(), files: artifactFiles.map(file => ({ file, sha256: digest(path.join(__dirname, file)) })) }, null, 2) + "\n");
console.log(JSON.stringify({ id: decision.id, status: decision.status, checks: 51, styleErrors: 4, patchApplyChecks: patch.patchApplyChecks, fingerprintsStable: 17 }));
