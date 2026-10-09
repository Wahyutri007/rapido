const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(value, null, 2) + '\n');
const tests = read('launcher-results.json');
const quality = read('quality-results.json');
const native = read('native-interrupted.json');
const currentMatches = Object.entries(quality.sourceHashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
if (quality.status !== 'PASS' || tests.passed !== 49 || tests.failed !== 0 || currentMatches.some((item) => !item.passed) || tests.sourceHashes['scripts/start-hp.cjs'] !== quality.sourceHashes['scripts/start-hp.cjs']) throw new Error('HP launcher evidence/source gate failed');
const decision = {
  owner: 'QC', signal: 'QC-HP-RUN-20261009-PASS-DELTA', status: 'PASS_DELTA', completedAt: new Date().toISOString(), publicationApproval: false, publicationOwner: 'PM', scope: 'Android USB launcher, npm alias and instructions only',
  userConfirmation: { message: 'sudah bisa', result: 'User confirms application opens on HP after connection/launcher repair', furtherDeviceOperations: 'Stopped after user confirmation' },
  approvedSourceHashes: quality.sourceHashes, currentMatches, checks: { launcher: { passed: tests.passed, failed: tests.failed }, lintErrors: quality.eslintErrors, lintWarnings: quality.eslintWarnings, biomeExit: quality.biome.exitCode, diffExit: quality.diff.exitCode },
  nativeObservation: { firstOpening: 'Actual production Karyawan UI and ExperienceActivity observed; PID7768 targeted ReactNativeJS/AndroidRuntime errors0', coldRelaunch: { status: 'OBSERVATION_INTERRUPTED_DEVICE_LEFT_EXPO_FOREGROUND', passed: native.passed, incompleteUiAssertions: native.failed, runtimeErrorLines: 0, cacheUnchanged: true, certifiedFullColdUiPass: false } },
  unchangedContracts: quality.unchangedContracts, externalWorkspaceChanges: quality.externalWorkspaceChanges, reportSha256: hash(path.join(__dirname, 'REPORT.md')),
  limitations: ['No full-app/feature/native APK/iOS/auth persistence/navigation certification', 'Cold UI observation remains incomplete; user confirms usability separately', 'Existing root/router/cache/yellow warnings belong to separate scopes; PM owns final integration/publication'],
};
write('DECISION.json', decision);
const files = fs.readdirSync(__dirname).filter((name) => name !== 'artifact-manifest.json' && fs.statSync(path.join(__dirname, name)).isFile()).sort();
write('artifact-manifest.json', { owner: 'QC', signal: decision.signal, createdAt: new Date().toISOString(), files: Object.fromEntries(files.map((name) => [name, { bytes: fs.statSync(path.join(__dirname, name)).size, sha256: hash(path.join(__dirname, name)) }])) });
console.log(JSON.stringify({ signal: decision.signal, sourceFiles: currentMatches.length, launcherChecks: tests.passed, userConfirmed: true, artifacts: files.length, appOrServerFurtherOperation: false }));
