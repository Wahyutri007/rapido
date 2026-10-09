// Verify the calendar of the device, using fixed instants that fall in different
// months/years depending on timezone. Expected calendar values are explicit.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const zones = [
  { name: 'Asia/Jakarta', month: '10', year: '2027' },
  { name: 'America/Los_Angeles', month: '09', year: '2026' },
  { name: 'Pacific/Honolulu', month: '09', year: '2026' },
  { name: 'Pacific/Kiritimati', month: '10', year: '2027' },
];
if (!process.argv.includes('--child')) {
  const runs = zones.map((zone) => {
    const result = spawnSync(process.execPath, [__filename, '--child', zone.name], { encoding: 'utf8', env: { ...process.env, TZ: zone.name } });
    return { zone: zone.name, exitCode: result.status, result: result.status === 0 ? JSON.parse(result.stdout) : { error: result.stderr, output: result.stdout } };
  });
  const passed = runs.every((run) => run.exitCode === 0);
  const count = runs.reduce((sum, run) => sum + (run.result.passed || 0), 0);
  fs.writeFileSync(path.join(__dirname, 'timezone-results.json'), `${JSON.stringify({ createdAt: new Date().toISOString(), status: passed ? 'PASS' : 'FAILED', passed: count, runs }, null, 2)}\n`);
  console.log(JSON.stringify({ zones: runs.length, passed: count, failedRuns: runs.filter((run) => run.exitCode !== 0) }));
  process.exitCode = passed ? 0 : 1;
} else {
  const zone = zones.find((item) => item.name === process.argv.at(-1));
  const files = [];
  const load = (file) => {
    const source = fs.readFileSync(file, 'utf8');
    files.push({ file, sha256: crypto.createHash('sha256').update(source).digest('hex') });
    const module = { exports: {} };
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module, exports: module.exports, Date, require: (name) => load(`${name.slice(2)}.ts`) });
    return module.exports;
  };
  const matches = load('lib/accounting/ledger-filter.ts').ledgerEntryMatchesPeriod;
  const checks = [];
  const check = (name, actual, expected) => checks.push({ name, actual, expected, passed: actual === expected });
  const monthReference = new Date('2026-10-01T00:00:00.000Z');
  const yearReference = new Date('2027-01-01T00:00:00.000Z');
  check('runtime uses expected local month at the fixed instant', monthReference.getMonth() + 1, Number(zone.month));
  check('local month start matches', matches(`2026-${zone.month}-01`, 'month', monthReference), true);
  check('opposite UTC-neighbor month is excluded', matches(`2026-${zone.month === '10' ? '09' : '10'}-01`, 'month', monthReference), false);
  check('calendar quarter uses the local month', matches(zone.month === '10' ? '2026-12-31' : '2026-07-01', 'quarter', monthReference), true);
  check('opposite quarter at UTC boundary is excluded', matches(zone.month === '10' ? '2026-09-30' : '2026-10-01', 'quarter', monthReference), false);
  check('runtime uses expected local year at the fixed instant', yearReference.getFullYear(), Number(zone.year));
  check('full local year includes December', matches(`${zone.year}-12-31`, 'year', yearReference), true);
  check('neighbor UTC year is excluded', matches(zone.year === '2027' ? '2026-12-31' : '2027-01-01', 'year', yearReference), false);
  const result = { zone: zone.name, passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, checks, files };
  console.log(JSON.stringify(result));
  process.exitCode = result.failed ? 1 : 0;
}
