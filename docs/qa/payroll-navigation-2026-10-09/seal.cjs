/* Run from the application root. --verify reads the sealed package without writing. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const source = 'app/(no-layout)/manage/payroll/_layout.tsx';
const manifestPath = path.join(__dirname, 'verification.json');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (process.argv.includes('--verify')) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const item of manifest.fingerprints) assert.equal(digest(item.file), item.sha256, item.file);
  console.log(`PASS: ${manifest.fingerprints.length} fingerprints match the sealed Payroll package.`);
} else {
  assert.ok(!fs.existsSync(manifestPath), 'Package already sealed; verify it instead of replacing history.');
  const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
  const browser = read('results.json'), layout = read('layout-results.json'), types = read('typecheck-results.json');
  const lint = read('eslint-results.json');
  assert.equal(browser.status, 'PASS');
  assert.equal(browser.passed, 21);
  assert.deepEqual(browser.errors, []);
  assert.deepEqual(browser.consoleErrors, []);
  assert.equal(browser.apiRequests.filter(item => !['GET', 'OPTIONS'].includes(item.method)).length, 0);
  assert.equal(layout.status, 'PASS');
  assert.equal(layout.passed, 20);
  assert.equal(digest(source), layout.sha256);
  assert.equal(types.status, 'PASS');
  assert.deepEqual(types.diagnostics, []);
  assert.ok(lint.every(item => item.errorCount === 0 && item.warningCount === 0));
  const files = [source, ...fs.readdirSync(__dirname).filter(name => name !== 'verification.json').map(name => path.relative(process.cwd(), path.join(__dirname, name)).replaceAll('\\', '/'))];
  const manifest = {
    owner: 'Software Developer Senior 4 / Codex-4', status: 'READY_FOR_QA',
    scope: 'Payroll navigation; exactly one application layout changed by this task.',
    baseHeadAtBrowserRun: browser.head,
    sourceSha256: layout.sha256,
    checkedAtBrowserRun: browser.checkedAt,
    sealedAt: new Date().toISOString(), timezone: 'Asia/Jakarta',
    verification: {
      browser: { status: 'PASS', scenarios: browser.passed, runtimeErrors: 0, consoleErrors: 0, apiMutations: 0, evidence: 'results.json' },
      layout: { status: 'PASS', assertions: layout.passed, evidence: 'layout-results.json' },
      typecheck: { status: 'PASS', sourceFiles: types.sourceFiles, diagnostics: 0, scope: types.scope, evidence: 'typecheck-results.json' },
      eslint: { status: 'PASS', errors: 0, warnings: 0, evidence: 'eslint-results.json' },
      biome: { observedExitCode: 0, command: 'node node_modules/@biomejs/biome/bin/biome check "app/(no-layout)/manage/payroll/_layout.tsx"' },
      diff: { observedExitCode: 0, command: 'git diff --check -- "app/(no-layout)/manage/payroll/_layout.tsx"' },
    },
    boundaries: [
      'Developer evidence from a shared working tree, not independent QA/QC approval or an isolated commit.',
      'Only the layout source has a tested source fingerprint; shared dependencies were not sealed at browser run time. Later shared changes require reviewer replay.',
      'Browser uses production app entry/providers/router with an HTML/CSS boot adapter and isolated API fixtures; SSR and real backend were not exercised.',
      'Payroll data is session-only fixture state. Reload restores fixtures; backend persistence/permissions, native Share, transfers and accounting integrations are outside this delta.',
      'Historical model/component checks in previews/payroll were not rerun and are not included in current counts.',
      'No new Figma visual parity or native device certification.',
      'Baseline before-pointer-fix files preserve a pre-fix failure; they are not final results.',
    ],
    fingerprints: files.map(file => ({ file, sha256: digest(file) })),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Sealed ${files.length} fingerprints; source matches the tested layout.`);
}
