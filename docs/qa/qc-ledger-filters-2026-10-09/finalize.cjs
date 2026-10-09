const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const replay = read('verification.json');
const component = read('independent-results.json');
const timezones = read('timezone-results.json');
const after = Object.fromEntries(Object.keys(replay.sourceBefore).map((file) => [file, hash(file)]));
const stable = Object.entries(replay.sourceBefore).every(([file, expected]) => after[file] === expected);
const testedFiles = [...component.files, ...timezones.runs.flatMap((item) => item.result.files || [])];
const testHashesMatchCurrent = testedFiles.every((item) => hash(item.file) === item.sha256);
const lint = read('eslint.out.txt');
const errors = lint.reduce((sum, item) => sum + item.errorCount, 0);
const warnings = lint.reduce((sum, item) => sum + item.warningCount, 0);
const passed = replay.status === 'PASS_FOCUSED_REPLAY' && component.failed === 0 && component.errors.length === 0 && timezones.status === 'PASS' && stable && testHashesMatchCurrent && errors === 0 && warnings === 0;
const sources = ['app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx', 'lib/accounting/ledger-filter.ts'];
const result = {
  signal: passed ? 'QC-LEDGER-FILTERS-20261009-PASS-DELTA' : 'QC-LEDGER-FILTERS-20261009-CHECK-FAILED',
  date: '2026-10-09', timezone: 'Asia/Jakarta', createdAt: new Date().toISOString(), owner: 'QC', status: passed ? 'PASS_DELTA' : 'CHECK_FAILED',
  findings: ['QC-S8-LEGACY-001', 'QC-S8-LEGACY-002'].map((id) => ({ id, status: passed ? 'CLOSED' : 'OPEN' })),
  reviewedSourceHashes: Object.fromEntries(sources.map((file) => [file, after[file]])),
  trackedHashesAfterIndependentChecks: after, stableThroughoutReview: stable, actualTestHashesMatchCurrent: testHashesMatchCurrent,
  quality: { eslintErrors: errors, eslintWarnings: warnings, gates: replay.gates },
  checks: { developerComponentReplay: replay.checks.componentPassed, developerDateReplay: replay.checks.datePassed, qcProductionSheetsAndSummary: component.passed, qcTimezoneBoundary: timezones.passed, totalExecutions: replay.checks.componentPassed + replay.checks.datePassed + component.passed + timezones.passed, note: 'Execution count includes overlapping regression coverage.', runtimeErrors: replay.checks.runtimeErrors + component.errors.length },
  dependencyChangesSinceDeveloperTest: replay.dependencyChangesSinceDeveloperTest,
  publication: passed ? 'QC_APPROVED_TWO_SOURCE_DELTA_PM_FINAL_INTEGRATION_GATE_REQUIRED' : 'HOLD_QC_APPROVAL',
  limitations: ['RN, actionsheet primitives, common UI, currency formatter and navigation adapters', 'No native/browser/keyboard/geometric/Figma/API/full-application certification', 'Ending balance remains metadata; no period closing balance derivation', 'Current accountingStore ID patch was dependency only; no QC approval for LEDGER-ID-001', 'Existing invalid-account fallback and UI legacy remain outside delta'],
  report: 'REPORT.md',
};
fs.writeFileSync(path.join(__dirname, 'DECISION.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ signal: result.signal, closed: result.findings, total: result.checks.totalExecutions, stable, testHashesMatchCurrent, lintErrors: errors, lintWarnings: warnings }));
process.exitCode = passed ? 0 : 1;
