const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const sourceFiles = [
  'app/(no-layout)/manage/absence/_layout.tsx',
  'app/(no-layout)/manage/absence/index.tsx',
  'app/(no-layout)/manage/absence/detail.tsx',
  'components/feature/manage/absence/AbsenceCommon.tsx',
  'components/feature/manage/absence/AbsenceListScreen.tsx',
  'components/feature/manage/absence/AbsenceDetailScreen.tsx',
  'lib/manage/absence.ts', 'types/ui/manage/absence.ts',
];
const manifestPath = path.join(__dirname, 'verification.json');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (process.argv.includes('--verify')) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const item of manifest.fingerprints) assert.equal(digest(item.file), item.sha256, item.file);
  console.log(`PASS: ${manifest.fingerprints.length} fingerprints match the sealed SD4-002 package.`);
} else {
  assert.ok(!fs.existsSync(manifestPath), 'Package already sealed; use --verify instead of rewriting history.');
  const head = process.env.RAPIDO_QA_HEAD;
  assert.ok(/^[a-f0-9]{40}$/.test(head || ''), 'Supply the current git rev-parse HEAD as RAPIDO_QA_HEAD when sealing.');
  const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
  const model = read('model-results.json'), browser = read('browser-results.json'), types = read('typecheck-results.json'), capture = read('capture-results.json'), lint = read('eslint-results.json');
  assert.equal(model.status, 'PASS'); assert.equal(model.passed, 34);
  assert.equal(digest(model.source), model.sha256);
  assert.equal(browser.status, 'PASS'); assert.equal(browser.passed, 10);
  assert.deepEqual(browser.errors, []); assert.deepEqual(browser.consoleErrors, []);
  assert.equal(browser.apiRequests.filter(item => !['GET', 'OPTIONS'].includes(item.method)).length, 0);
  assert.equal(types.status, 'PASS'); assert.deepEqual(types.diagnostics, []);
  assert.equal(capture.status, 'PASS');
  assert.equal(lint.length, 8);
  assert.ok(lint.every(item => item.errorCount === 0 && item.warningCount === 0));
  function artifacts(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(item => {
      const file = path.join(directory, item.name);
      return item.isDirectory() ? artifacts(file) : item.name === 'verification.json' ? [] : [path.relative(process.cwd(), file).replaceAll('\\', '/')];
    });
  }
  const readOnlyContracts = ['store/useAbsenceStore.ts', 'components/common/Header.tsx', 'components/common/Wrapper.tsx', 'components/common/SingleSelect.tsx', 'components/common/SearchBar.tsx', 'components/custom/JSStack.tsx'];
  const files = [...sourceFiles, ...readOnlyContracts, ...artifacts(__dirname)];
  const manifest = {
    owner: 'Software Developer Senior 4 / Codex-4', ticket: 'SD4-002', status: 'READY_FOR_QA',
    head,
    sourceFiles, readOnlyContracts, sealedAt: new Date().toISOString(), timezone: 'Asia/Jakarta',
    checks: { model: 34, browser: 10, runtimeErrors: 0, consoleErrors: 0, apiMutations: 0, typecheckDiagnostics: 0, typecheckSourceFiles: types.sourceFiles, lintSourceFiles: 8, lintErrors: 0, lintWarnings: 0, biomeObservedExitCode: 0, sourceDiffObservedExitCode: 0, stableInitialScreenshot: 'PASS' },
    hp: { launcherExitCode: 0, expoGo: '57.0.9', foreground: 'host.exp.exponent/.experience.ExperienceActivity', initialAndroidBundle: 'completed', scope: 'Launcher/app opening only; new Absensi native flow is not certified.' },
    boundaries: [
      'Developer evidence on shared working tree, not independent QA/QC approval or isolated commit.',
      'Read-only existing useAbsenceStore session records; no new seed/API/mutation/backend persistence/employee attribution/shift computation.',
      'Browser uses actual app entry/providers/router with isolated API fixtures and HTML/CSS boot adapter; SSR/backend/native flow were not verified.',
      'These selected shared contract hashes were recorded at seal time. Other shared dependencies were not sealed at browser build time; subsequent shared changes require reviewer replay.',
      'No full Figma parity certification. Initial-source and pre-focus failure snapshots are preserved as history.',
      'Backend8001 and Metro8088 remain running for the user; CI server requires explicit restart for future source changes.',
      'Cold start:hp SDK57 --offline+--localhost option conflict remains reported to SDK/PM owner. Warm launcher succeeded after separately starting Metro.',
    ],
    fingerprints: files.map(file => ({ file, sha256: digest(file) })),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Sealed ${files.length} fingerprints, including eight application sources.`);
}
