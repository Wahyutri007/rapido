// Run from application root: node docs/qa/qc-member-2026-10-09/check.cjs
// Uses existing test renderer installed by Senior 7; installs nothing.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const React = require(path.resolve('.expo/senior7-test-tools/node_modules/react'));
require('react');
require.cache[require.resolve('react')].exports = React;
const { act, create } = require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer'));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [], errors = [], loaded = new Map();
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('react-test-renderer is deprecated')) return;
  errors.push(args.map(String).join(' ')); originalError(...args);
};
const check = (name, actual, expected) => checks.push({name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected});
const query = { data: undefined, isLoading: false, isError: false };
let currentId, requests = [], responseError = null, pendingResponse = null, allowed = true, authLoading = false;
const member = (id, name) => ({ id, name, phone: '081234', email: null, id_number: null, address: null, date_of_birth: null, gender: null, notes: null, user_id: 'qc-owner', created_at: '2026-10-08T10:00:00Z', updated_at: '2026-10-08T10:00:00Z' });
const Stack = Object.assign(p => React.createElement('Stack', p), {Screen: 'Screen'});
const load = file => {
  const absolute = path.resolve(file);
  if (loaded.has(absolute)) return loaded.get(absolute);
  const source = fs.readFileSync(absolute, 'utf8');
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText;
  const exports = {};
  const customRequire = name => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return require(path.resolve('.expo/senior7-test-tools/node_modules/react/jsx-runtime'));
    if (name === 'react-native') return {View: 'View'};
    if (name === 'expo-router') return {useLocalSearchParams: () => ({id: currentId}), useGlobalSearchParams: () => ({id: currentId})};
    if (name === '@/api/hooks/customers') return {
      useCustomerQuery: () => query,
      useCustomerRequest: () => ({isLoading: false, call: async payload => {requests.push({method: 'POST', payload}); return pendingResponse ? await pendingResponse : [null, responseError];}}),
      useCustomerUpdateRequest: (_, id) => ({isLoading: false, call: async payload => {requests.push({method: 'PUT', id, payload}); return pendingResponse ? await pendingResponse : [null, responseError];}}),
    };
    if (name === '@/api/common') return {handleFormError: (error, form) => {if (error?.status === 422) for (const [field, messages] of Object.entries(error.errors)) form.setError(field, {message: messages[0], type: 'server'});}};
    if (name === '@/components/common/AlertModal') return {__esModule: true, default: 'AlertModal', useAlertModal: () => {const state = React.useState(false); return {openState: state, open: () => state[1](true), close: () => state[1](false)};}};
    if (name === '@/components/common/Form') return Object.fromEntries(['Form', 'FormControl', 'FormField', 'FormInput', 'FormItem', 'FormLabel', 'FormMessage', 'FormSelect'].map(n => [n, n]));
    if (name === '@/components/common/DataPlaceholder') return {LoadingPlaceholder: 'LoadingPlaceholder'};
    if (name === '@/components/custom/JSStack') return {delayedBack() {}, JSStack: Stack, ScaleBackTransition: {}};
    if (name === '@/context/AuthContext') return {useAuth: () => ({isLoading: authLoading, hasPermission: () => allowed})};
    if (name === '@/constants/Permissions') return {Permissions: {MANAGE_CUSTOMERS: 'manage customers'}};
    if (name === '@/components/feature/manage/member/MemberModifyScreen') return load('components/feature/manage/member/MemberModifyScreen.tsx');
    if (name.startsWith('@/components/') || name.startsWith('./Member')) return name.split('/').at(-1);
    if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
    return require(name);
  };
  vm.runInNewContext(output, {exports, require: customRequire, console, setTimeout, clearTimeout}, {filename: absolute});
  loaded.set(absolute, exports); return exports;
};
const schema = load('schema/add/customer.ts').customerSchema;
const helpers = load('lib/manage/members.ts');
const Route = load('app/(no-layout)/manage/member/modify.tsx').default;
const Layout = load('app/(no-layout)/manage/member/_layout.tsx').default;
let renderer;
const render = async (id, data, extra = {}) => {
  currentId = id; Object.assign(query, {data, isLoading: false, isError: false}, extra);
  await act(async () => {if (renderer) renderer.update(React.createElement(Route)); else renderer = create(React.createElement(Route));});
};
const reset = async () => {if (renderer) await act(async () => renderer.unmount()); renderer = null; requests = []; responseError = null; pendingResponse = null;};
const form = () => renderer.root.findByType('Form').props;
const save = () => renderer.root.findByType('BottomActionButton').props;

(async () => {
  for (const [kind, problem] of [
    ['success', null],
    ['validation error', {status: 422, errors: {phone: ['Old A error']}}],
    ['server error', {status: 500, message: 'Old A server error'}],
  ]) {
    await reset();
    await render('a', member('a', 'Member A'));
    await act(async () => form().setValue('name', 'First A draft'));
    let finish, submission;
    pendingResponse = new Promise(resolve => { finish = resolve; });
    await act(async () => {
      submission = save().onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    check(kind + ' pending request retains original ID/payload', requests.map(r => [r.method, r.id, r.payload.name]), [['PUT', 'a', 'First A draft']]);
    await render('b', member('b', 'Member B'));
    await render('a', member('a', 'Member A reopened'));
    await act(async () => form().setValue('name', 'Reopened A draft'));
    await act(async () => { finish([null, problem]); await submission; });
    check(kind + ' old A cannot replace reopened A draft', form().getValues('name'), 'Reopened A draft');
    check(kind + ' old A cannot lock reopened A save', save().isDisabled, false);
    check(kind + ' old A cannot open reopened A success', renderer.root.findByType('SuccessModal').props.openState[0], false);
    check(kind + ' old A cannot open reopened A error', renderer.root.findByType('AlertModal').props.openState[0], false);
    check(kind + ' old A cannot attach reopened A field error', Boolean(form().getFieldState('phone').error), false);
  }

  await reset();
  currentId = 'strict';
  Object.assign(query, {data: member('strict', 'Strict Member'), isLoading: false, isError: false});
  await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(Route))); });
  check('StrictMode setup/cleanup replay hydrates editor', form().getValues('name'), 'Strict Member');
  await act(async () => save().onPress());
  check('StrictMode submit reaches original ID once', requests.map(r => [r.method, r.id]), [['PUT', 'strict']]);
  check('StrictMode replay keeps mounted guard active for success', renderer.root.findByType('SuccessModal').props.openState[0], true);
  check('StrictMode successful editor locks repeated save', save().isDisabled, true);
  await reset();
  check('no unexpected React errors', errors, []);

  const files = ['components/feature/manage/member/MemberModifyScreen.tsx', 'app/(no-layout)/manage/member/modify.tsx', 'schema/add/customer.ts', 'lib/manage/members.ts'];
  const result = {date: '2026-10-09', scope: 'Independent QC additional request-lifetime cases: A -> B -> reopened A and StrictMode. Production route/editor/RHF/Zod; API/query/modal/native primitives adapted. Not browser/native/backend.', passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length, checks, errors, hashes: Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))};
  fs.writeFileSync(path.join(__dirname, 'independent-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({passed: result.passed, failed: result.failed, failures: checks.filter(c => !c.passed)}));
  process.exitCode = result.failed ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 2; });
