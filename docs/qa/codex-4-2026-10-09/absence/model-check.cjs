const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const sourceFile = 'lib/manage/absence.ts';
const source = fs.readFileSync(sourceFile, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleObject = { exports: {} };
new Function('module', 'exports', 'require', compiled)(moduleObject, moduleObject.exports, require);
const api = moduleObject.exports, checks = [];
function check(name, operation) { operation(); checks.push(name); }
const record = (id, date, checkIn = '08:00', checkOut = '-', storeName = 'Pusat', locationName = 'Jakarta') => ({ id, date, checkIn, checkOut, storeName, locationName });
for (const [input, expected] of [['06 Maret 2026', '2026-03-06'], ['9 Oktober 2026', '2026-10-09'], [' 29 FEBRUARI 2024 ', '2024-02-29'], ['2026-10-09', '2026-10-09']]) {
  check(`Calendar parses ${input}`, () => assert.equal(api.attendanceDateKey(input), expected));
}
for (const input of ['29 Februari 2026', '31 April 2026', '2026-02-30', '00 Januari 2026', '1 Nopember 2026', '2026-13-01', '', '06 Maret 26']) {
  check(`Calendar rejects invalid source ${JSON.stringify(input)}`, () => assert.equal(api.attendanceDateKey(input), undefined));
}
for (const [time, valid] of [['00:00', true], ['23:59', true], [' 08:30 ', true], ['24:00', false], ['17:60', false], ['8:30', false], ['-', false]]) {
  check(`Time ${JSON.stringify(time)} is ${valid ? 'valid' : 'not recorded'}`, () => assert.equal(api.isAttendanceTime(time), valid));
}
check('Complete requires two valid times without inferring shift duration', () => assert.equal(api.attendanceStatus(record('x', '', '17:00', '01:00')), 'complete'));
check('A missing checkout marks an open record', () => assert.equal(api.attendanceStatus(record('x', '')), 'open'));
check('An empty checkout is also open', () => assert.equal(api.attendanceStatus(record('x', '', '08:00', '')), 'open'));
check('An invalid checkout is unknown rather than a finished shift', () => assert.equal(api.attendanceStatus(record('x', '', '08:00', '25:00')), 'unknown'));
check('Missing checkin remains unknown even with checkout', () => assert.equal(api.attendanceStatus(record('x', '', '-', '17:00')), 'unknown'));
check('Invalid time is not displayed as recorded', () => assert.equal(api.attendanceTimeLabel('25:00'), 'Belum dicatat'));
const records = [record('old', '06 Maret 2026'), record('new', '9 Oktober 2026', '08:00', '17:00', 'Cabang Timur', 'Surabaya'), record('same', '9 Oktober 2026'), record('unknown', 'tanggal lama', '-', '-', 'Pusat')];
const before = JSON.stringify(records), filters = { search: '', status: 'all' };
check('Latest valid calendar dates sort first; same-day source order is stable', () => assert.deepEqual(api.filterAttendance(records, filters).map(item => item.id), ['new', 'same', 'old', 'unknown']));
check('Search finds source location case-insensitively and trims input', () => assert.deepEqual(api.filterAttendance(records, { ...filters, search: '  SURABAYA ' }).map(item => item.id), ['new']));
check('Status, date and store filters combine', () => assert.deepEqual(api.filterAttendance(records, { ...filters, status: 'open', date: '9 Oktober 2026', storeName: 'Pusat' }).map(item => item.id), ['same']));
check('No matching store produces an empty list', () => assert.equal(api.filterAttendance(records, { ...filters, storeName: 'Tidak ada' }).length, 0));
check('Unknown status remains visible in its own filter', () => assert.deepEqual(api.filterAttendance(records, { ...filters, status: 'unknown' }).map(item => item.id), ['unknown']));
check('Unknown date is searchable without inventing a calendar date', () => assert.deepEqual(api.filterAttendance(records, { ...filters, search: 'tanggal lama' }).map(item => item.id), ['unknown']));
check('Summary counts only the supplied result set', () => assert.deepEqual(api.attendanceSummary(records), { complete: 1, open: 2, unknown: 1 }));
check('Empty result has zero counters', () => assert.deepEqual(api.attendanceSummary([]), { complete: 0, open: 0, unknown: 0 }));
check('Filtering never mutates records or creates replacements', () => { assert.equal(JSON.stringify(records), before); assert.equal(api.filterAttendance(records, filters)[0], records[1]); });
const result = { status: 'PASS', passed: checks.length, checks, source: sourceFile, sha256: crypto.createHash('sha256').update(source).digest('hex'), checkedAt: new Date().toISOString(), scope: 'Production pure helper executed with synthetic test records, not real employee attendance or backend.' };
fs.writeFileSync(path.join(__dirname, 'model-results.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ status: result.status, passed: result.passed }));
