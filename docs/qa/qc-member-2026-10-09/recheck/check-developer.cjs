// Developer regression adapted from QC runner. Run from app root. Writes only this developer packet.
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
  for (const [name, patch, expected] of [
    ['required name', {name: '   '}, false], ['required phone', {phone: ' '}, false],
    ['valid leap day', {date_of_birth: '2000-02-29'}, true], ['invalid leap day', {date_of_birth: '1900-02-29'}, false],
    ['invalid month', {date_of_birth: '2000-13-01'}, false], ['email validation', {email: 'not-email'}, false],
    ['gender validation', {gender: 'unknown'}, false], ['database address limit', {address: 'a'.repeat(256)}, false],
  ]) check(name, schema.safeParse({...helpers.MEMBER_DEFAULTS, name: 'QC', phone: '0812', ...patch}).success, expected);
  const parsed = schema.parse({...helpers.MEMBER_DEFAULTS, name: ' QC ', phone: ' 0812 ', notes: ' '});
  check('trim and nullable payload', helpers.memberPayload(parsed), {name: 'QC', phone: '0812', email: null, id_number: null, address: null, date_of_birth: null, gender: null, notes: null});
  await render('a', member('a', 'Member A'));
  check('edit hydrates correct member', form().getValues('name'), 'Member A');
  await act(async () => form().setValue('name', 'Draft A'));
  await render('a', member('a', 'Server A refreshed'));
  check('same-ID refetch preserves draft', form().getValues('name'), 'Draft A');
  await render('b', member('b', 'Member B'));
  check('different ID hydrates new member', form().getValues('name'), 'Member B');
  await render(undefined, undefined);
  check('edit to create clears previous member', form().getValues('name'), '');
  await act(async () => save().onPress());
  check('create without user input cannot clone previous member', requests.length, 0);
  await reset(); await render('a', member('a', 'Member A'));
  await act(async () => save().onPress());
  check('successful edit targets correct ID', requests.map(r => [r.method, r.id]), [['PUT', 'a']]);
  check('successful edit blocks repeated submission', save().isDisabled, true);
  await render('b', member('b', 'Member B'));
  check('changing ID clears saved lock', save().isDisabled, false);
  await render(undefined, undefined);
  await act(async () => form().setValue('name', 'New draft'));
  await render('b', member('b', 'Member B'));
  check('return to edit after create restores entity values', form().getValues('name'), 'Member B');
  for (const [kind, problem] of [['success', null], ['error', {status: 422, errors: {phone: ['Old request error']}}]]) {
    await reset(); await render('a', member('a', 'Member A'));
    let finish, submission;
    pendingResponse = new Promise(resolve => { finish = resolve; });
    await act(async () => { submission = save().onPress(); await Promise.resolve(); await Promise.resolve(); });
    check('pending '+kind+' request targets old entity', requests.map(r => [r.method, r.id]), [['PUT','a']]);
    await render('b', member('b', 'Member B'));
    await act(async () => form().setValue('name', 'Draft B'));
    await act(async () => { finish([null, problem]); await submission; });
    check('late '+kind+' response preserves new entity draft', form().getValues('name'), 'Draft B');
    check('late '+kind+' response leaves new save enabled', save().isDisabled, false);
    check('late '+kind+' response cannot open new success modal', renderer.root.findByType('SuccessModal').props.openState[0], false);
    check('late '+kind+' response cannot open new error modal', renderer.root.findByType('AlertModal').props.openState[0], false);
    check('late '+kind+' response cannot attach old field errors', Boolean(form().getFieldState('phone').error), false);
  }

  await reset(); await render('missing', undefined, {isError: true});
  check('unknown edit cannot submit', save().isDisabled, true);
  check('unknown edit hides form', renderer.root.findAllByType('Form').length, 0);
  await render('missing', member('missing', 'Recovered'));
  check('query retry hydrates recovered member', form().getValues('name'), 'Recovered');
  await reset(); await render('a', member('a', 'Member A'));
  await act(async () => form().setValue('name', 'Draft unchanged'));
  responseError = {status: 422, errors: {phone: ['Nomor tidak valid']}};
  await act(async () => save().onPress());
  check('422 retains draft', form().getValues('name'), 'Draft unchanged');
  check('422 can retry', save().isDisabled, false);
  check('422 attaches field error', form().getFieldState('phone').error?.message, 'Nomor tidak valid');
  await reset();
  for (const [name, permit, loading, expected] of [['denied permission blocks child navigator', false, false, 0], ['loading auth blocks child navigator', true, true, 0], ['allowed permission renders navigator', true, false, 1]]) {
    allowed = permit; authLoading = loading;
    await act(async () => {renderer = create(React.createElement(Layout));});
    check(name, renderer.root.findAllByType('Stack').length, expected);
    await reset();
  }
  check('no unexpected React runtime errors', errors, []);
  const files = ['api/hooks/customers.ts','api/factory.ts','api/common.ts','schema/add/customer.ts','types/api/customer.ts','lib/manage/members.ts','context/AuthContext.tsx','components/common/Form.tsx','components/common/SingleSelect.tsx','components/common/Wrapper.tsx', ...fs.readdirSync('components/feature/manage/member').map(f=>'components/feature/manage/member/'+f), ...fs.readdirSync('app/(no-layout)/manage/member').map(f=>'app/(no-layout)/manage/member/'+f)];
  const hashes = Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
  const result = {date:'2026-10-09 Asia/Jakarta', head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), scope:'Developer regression adapted from QC; React lifecycle/schema test; actual route/form/RHF/Zod, mocked API/query and native primitives. Not browser, real router navigation, backend or native runtime.', passed: checks.filter(c=>c.passed).length, failed:checks.filter(c=>!c.passed).length, checks, errors, hashes};
  fs.writeFileSync(path.join(__dirname,'developer-rerun-results.json'), JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed: result.passed, failed: result.failed, failures: checks.filter(c=>!c.passed)}));
  process.exitCode = result.failed ? 1 : 0;
})().catch(e => {console.error(e);process.exitCode=2;});
