// QC integration: production screen, period/type sheets, summary and Zustand.
// RN/common/actionsheet/formatter adapters; no server, device or real data.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
process.env.TZ = 'Asia/Jakarta';
const rendererTools = path.resolve('.expo/senior7-test-tools/node_modules');
const React = require(path.join(rendererTools, 'react'));
require('react');
require.cache[require.resolve('react')].exports = React;
const { create, act } = require(path.join(rendererTools, 'react-test-renderer'));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cache = new Map();
const checks = [];
const errors = [];
let now = new Date(2026, 9, 31, 23, 59, 59).getTime();
class ClockDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('react-test-renderer is deprecated')) return;
  errors.push(args.map(String).join(' '));
  originalError(...args);
};
const sheet = (props) => props.isOpen ? React.createElement('Actionsheet', props, props.children) : null;
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const module = { exports: {}, sha256: crypto.createHash('sha256').update(source).digest('hex') };
  cache.set(absolute, module);
  const localRequire = (name) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return require(path.join(rendererTools, name));
    if (name === 'react-native') return { View: 'View', Pressable: 'Pressable', TextInput: 'TextInput' };
    if (name === 'expo-router') return { useLocalSearchParams: () => ({ id: 'a' }) };
    if (name.startsWith('@expo/vector-icons')) return 'Icon';
    if (name === '@/lib/utils') return { cn: (...values) => values.filter(Boolean).join(' '), formatRp: (value) => `Rp${value}` };
    if (name === '@/components/ui/actionsheet') return { Actionsheet: sheet, ...Object.fromEntries(['ActionsheetBackdrop', 'ActionsheetContent', 'ActionsheetDragIndicator', 'ActionsheetDragIndicatorWrapper'].map((item) => [item, item])) };
    if (name === '@/components/feature/accounting/general-ledger') return {
      LedgerDetailHeaderCard: 'LedgerDetailHeaderCard', LedgerEntryCard: 'LedgerEntryCard',
      ...Object.fromEntries(['LedgerDetailSummaryCard', 'LedgerPeriodActionSheet', 'LedgerTypeActionSheet'].map((item) => [item, load(`components/feature/accounting/general-ledger/${item}.tsx`).default])),
    };
    if (name.startsWith('@/components/')) return name.split('/').at(-1);
    if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`);
    return require(name);
  };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, { module, exports: module.exports, require: localRequire, console, Date: ClockDate, setTimeout, clearTimeout }, { filename: absolute });
  return module.exports;
}
const Screen = load('app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx').default;
const Summary = load('components/feature/accounting/general-ledger/LedgerDetailSummaryCard.tsx').default;
const PeriodSheet = load('components/feature/accounting/general-ledger/LedgerPeriodActionSheet.tsx').default;
const TypeSheet = load('components/feature/accounting/general-ledger/LedgerTypeActionSheet.tsx').default;
const store = load('store/accountingStore.ts').useAccountingStore;
const row = (id, type, amount, date) => ({ id, accountId: 'a', title: id, description: 'QC isolated ledger', referenceNumber: `REF-${id}`, type, amount, date });
const account = { id: 'a', name: 'Kas fixture QC', code: '101', classification: 'Aset', subClassification: 'Cash', currency: 'IDR', totalDebit: 999, totalCredit: 888, balance: 777 };
const initialRows = [row('oct-start', 'debit', 100, '01-10-2026'), row('oct-end', 'credit', 20, '2026-10-31'), row('nov', 'debit', 30, '1 November 2026'), row('next-year', 'credit', 40, '2027-01-01'), row('invalid', 'debit', 1, '2026-02-30')];
let renderer;
const check = (name, actual, expected) => checks.push({ name, actual, expected, passed: JSON.stringify(actual) === JSON.stringify(expected) });
const text = (node) => typeof node === 'string' || typeof node === 'number' ? String(node) : node.children?.map(text).join('') || '';
const press = async (label) => {
  const active = renderer.root.findAllByType('Actionsheet');
  const context = active.length === 1 ? active[0] : renderer.root;
  const matches = context.findAllByType('Pressable').filter((node) => text(node) === label);
  if (matches.length !== 1) throw new Error(`Expected one production button ${label}, found ${matches.length}`);
  await act(async () => matches[0].props.onPress());
};
const rows = () => renderer.root.findAllByType('LedgerEntryCard').map((node) => node.props.entry.id);
const totals = () => { const props = renderer.root.findByType(Summary).props; return [props.totalDebit, props.totalCredit]; };
const ending = () => renderer.root.findByType(Summary).props.endingBalance;
const search = async (value) => act(async () => renderer.root.findByType('TextInput').props.onChangeText(value));
async function main() {
  store.setState({ ledgerAccounts: [account], ledgerEntries: { a: initialRows } });
  await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(Screen))); });
  check('StrictMode initial totals use rows instead of account metadata', totals(), [131, 60]);
  check('both production action sheets start closed', renderer.root.findAllByType('Actionsheet').length, 0);
  await press('Periode');
  check('period trigger opens production sheet', renderer.root.findByType(PeriodSheet).props.isOpen, true);
  await press('Bulan Ini');
  check('production month selection closes sheet', renderer.root.findByType(PeriodSheet).props.isOpen, false);
  check('month option filters both accepted date formats', rows(), ['oct-start', 'oct-end']);
  check('month totals follow visible entries', totals(), [100, 20]);
  check('account ending balance retains its metadata contract', ending(), 777);
  await search('absent');
  check('search with no result yields no rows', rows(), []);
  check('production summary receives zero totals for empty search', totals(), [0, 0]);
  check('production summary renders both zero values using formatter adapter', renderer.root.findAllByType('Text').filter((node) => text(node) === 'Rp0').length, 2);
  check('empty-state message appears', renderer.root.findAllByType('Text').some((node) => text(node) === 'Tidak ada rincian jurnal ditemukan'), true);
  check('empty search retains metadata ending balance', ending(), 777);
  await search('  ref-OCT-END  ');
  check('reference search ignores case and outer whitespace', rows(), ['oct-end']);
  await search('');
  await press('Jenis Transaksi');
  check('type trigger opens production sheet', renderer.root.findByType(TypeSheet).props.isOpen, true);
  await press('Kredit');
  check('production credit selection closes sheet', renderer.root.findByType(TypeSheet).props.isOpen, false);
  check('production type choice combines with month', rows(), ['oct-end']);
  check('one-sided summary retains zero debit', totals(), [0, 20]);
  await press('Kredit');
  await press('Reset');
  check('production type Reset returns all types', renderer.root.findByType(TypeSheet).props.selectedType, 'all');
  check('type Reset keeps period and closes', [renderer.root.findByType(TypeSheet).props.isOpen, rows()], [false, ['oct-start', 'oct-end']]);
  now = new Date(2026, 10, 1, 0, 0, 1).getTime();
  await act(async () => store.getState().addLedgerEntry(row('nov-new', 'credit', 50, '2026-11-01')));
  check('store update after midnight keeps selected October snapshot', rows(), ['oct-start', 'oct-end']);
  check('summary stays on October until a period is selected again', totals(), [100, 20]);
  await press('Bulan Ini');
  await press('Bulan Ini');
  check('reselecting production month refreshes local reference', rows().map((id) => id.startsWith('le-') ? 'new-entry' : id), ['new-entry', 'nov']);
  check('November sums refresh without account fallback', totals(), [30, 50]);
  await press('Bulan Ini');
  await press('Reset');
  check('production period Reset returns all periods and closes', [renderer.root.findByType(PeriodSheet).props.selectedPeriod, renderer.root.findByType(PeriodSheet).props.isOpen], ['all', false]);
  check('all periods preserves invalid legacy date row', rows().includes('invalid'), true);
  check('reset summary includes all actual rows', totals(), [131, 110]);
  await act(async () => store.setState({ ledgerAccounts: [{ ...account, totalDebit: 12345, totalCredit: 54321, balance: 555 }] }));
  check('metadata turnover update cannot overwrite filtered totals', totals(), [131, 110]);
  check('metadata ending balance update is reflected', ending(), 555);
  await act(async () => store.setState({ ledgerEntries: { a: [] } }));
  check('empty store summary stays zero with positive metadata', totals(), [0, 0]);
  await act(async () => renderer.unmount());
  check('no unexpected runtime or React errors', errors, []);
  const files = [...cache].map(([file, module]) => ({ file: path.relative(process.cwd(), file).replaceAll('\\', '/'), sha256: module.sha256 }));
  const result = { owner: 'QC', createdAt: new Date().toISOString(), passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, checks, errors, files, scope: 'Production screen/period and type sheets/summary/Zustand in StrictMode; RN, actionsheet primitives, common UI and currency formatter adapted. No native/browser/API/ID-store approval.' };
  fs.writeFileSync(path.join(__dirname, 'independent-results.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ passed: result.passed, failed: result.failed, errors: errors.length, failures: checks.filter((item) => !item.passed) }));
  process.exitCode = result.failed || errors.length ? 1 : 0;
}
main().catch((error) => { console.error(error); process.exitCode = 2; });
