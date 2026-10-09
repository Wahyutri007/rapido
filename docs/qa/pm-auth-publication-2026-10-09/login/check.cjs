// Production LoginScreen/shared Form/auth hook/AuthProvider/Query/Common; memory-only IO.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ts = require('typescript');
const toolRoot = path.resolve('.expo/senior7-test-tools/node_modules');
const React = require(path.join(toolRoot, 'react'));
require.cache[require.resolve('react')] = { id: require.resolve('react'), filename: require.resolve('react'), loaded: true, exports: React };
const { act, create } = require(path.join(toolRoot, 'react-test-renderer'));
const RHF = require('react-hook-form');
const query = require('@tanstack/react-query');
const axiosLibrary = require('axios');
const baseline = process.argv.includes('--baseline');
const snapshot = path.join(__dirname, 'AuthContext.before.tsx.txt');
const sourceHashes = {}, checks = [], observations = [], runtimeErrors = [], unhandledRejections = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => { if (String(args[0]).includes('react-test-renderer is deprecated')) return; runtimeErrors.push(args.map(String).join(' ')); originalError(...args); };
const onUnhandled = error => unhandledRejections.push(String(error));
process.on('unhandledRejection', onUnhandled);
const check = (name, actual, expected) => { try { assert.deepEqual(actual, expected); checks.push({ name, passed: true }); } catch { checks.push({ name, passed: false, actual: actual ?? null, expected }); } };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const pause = () => new Promise(resolve => setTimeout(resolve, 20));
const host = (...names) => Object.fromEntries(names.map(name => [name, name]));
const defaultHost = name => ({ __esModule: true, default: name });
const payload = { email: 'qc-login@example.test', password: 'qc-fixture-password' };
const loginData = { token: 'qc-memory-session' };
const userData = { user: { id: 'qc-user', team_id: null }, roles: ['owner'], permissions: [] };
const success = data => ({ success: true, status: 200, message: 'QC memory response', data });
async function fixture(options = {}) {
  const requests = [], writes = [], reads = [], errorWrites = [], routes = [], loaded = new Map(), storage = new Map(), raf = new Map();
  let frameId = 0;
  if (options.token) storage.set('auth_token', options.token);
  let renderer, methods, api, authState, visible = true;
  const segments = ['(onboarding)', 'login'];
  const wrappedForms = new WeakSet();
  const client = new query.QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  const transport = axiosLibrary.create({ adapter: async config => {
    const response = deferred();
    const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    requests.push({ method: config.method, url: config.url, data, response, config });
    const body = await response.promise;
    const result = { data: body.data, status: body.status, statusText: body.status === 200 ? 'OK' : 'Error', headers: {}, config };
    if (body.status >= 400) throw new axiosLibrary.AxiosError('QC memory rejection', 'ERR_BAD_RESPONSE', config, undefined, result);
    return result;
  } });
  const memoryStorage = {
    getItemAsync: key => { const wait = deferred(); reads.push({ key, wait }); if (!options.deferStorage) wait.resolve(storage.get(key) ?? null); return wait.promise; },
    setItemAsync: async (key, value) => { const wait = deferred(); writes.push({ key, value, wait }); await wait.promise; storage.set(key, value); },
    deleteItemAsync: async key => { storage.delete(key); },
    getItem: key => storage.get(key) ?? null,
  };
  function resolve(name, parent) {
    const base = name.startsWith('@/') ? name.slice(2) : path.relative(process.cwd(), path.resolve(path.dirname(parent), name)).replaceAll('\\', '/');
    return [base, base + '.ts', base + '.tsx', base + '/index.ts'].find(file => fs.existsSync(file));
  }
  function load(file) {
    if (loaded.has(file)) return loaded.get(file).exports;
    const tested = baseline && file === 'context/AuthContext.tsx' ? snapshot : file;
    const bytes = fs.readFileSync(tested);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (sourceHashes[file] && sourceHashes[file] !== hash) throw Error('Mixed runtime bytes: ' + file);
    sourceHashes[file] = hash;
    const code = ts.transpileModule(bytes.toString('utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
    const module = { exports: {} }; loaded.set(file, module);
    const request = name => {
      if (name === 'react') return React;
      if (name === 'react-native') return { ...host('View', 'Pressable', 'Image'), Platform: { OS: 'web' } };
      if (name === 'expo-router') return { useRouter: () => ({ push: route => routes.push(route), replace: route => routes.push(route) }), router: { replace: route => routes.push(route) }, useSegments: () => segments, Link: 'Link' };
      if (name === '@/lib/storage') return memoryStorage;
      if (name === './axios' && file === 'api/common.ts') return { axios: transport };
      if (name === '@/api/hooks/auth' && file.startsWith('app/')) {
        const actual = load('api/hooks/auth.ts');
        return { ...actual, __esModule: true, default: form => {
          methods = form;
          if (!wrappedForms.has(form)) { const original = form.setError; form.setError = (...args) => { errorWrites.push(args); return original(...args); }; wrappedForms.add(form); }
          api = actual.default(form); return api;
        } };
      }
      if (name === '@/assets/images') return { IMAGES: { step_1: 1, step_2: 2, step_3: 3 } };
      if (name === '@/components/icons') return host('EFeather');
      if (name === '@expo/vector-icons/Entypo') return defaultHost('Entypo');
      if (name === '@react-native-community/datetimepicker' || name === 'expo-document-picker') return {};
      if (name === '@/lib/utils') return { cn: (...items) => items.filter(Boolean).join(' '), tw: value => value * 4 };
      const uiName = name.match(/(?:^|\/)ui\/([^/]+)$/)?.[1];
      const uis = { input: host('Input', 'InputField', 'InputIcon'), button: host('Button', 'ButtonText', 'ButtonGroup'), checkbox: host('Checkbox', 'CheckboxGroup', 'CheckboxIcon', 'CheckboxIndicator', 'CheckboxLabel'), radio: host('Radio', 'RadioCircleIndicator', 'RadioGroup', 'RadioLabel'), modal: host('ModalBody', 'ModalFooter', 'ModalHeader'), actionsheet: { ...host('ActionsheetBackdrop', 'ActionsheetContent'), Actionsheet: props => React.createElement('Actionsheet', props, props.isOpen ? props.children : null) } };
      if (uiName && uis[uiName]) return uis[uiName];
      if (name === '@/components/feature/auth/shared') return host('AuthBackgroundImage', 'AuthContainer', 'KasikooLogo');
      if (name === '@/components/common/Text' || name === './Text') return defaultHost('Text');
      if (name === '@/components/common/Wrapper') return defaultHost('Wrapper');
      if (name.includes('SingleSelect')) return defaultHost('SingleSelect');
      if (name.includes('icons/camera')) return defaultHost('CameraIcon');
      if (name.startsWith('@/') || name.startsWith('.')) { const target = resolve(name, file); if (!target) throw Error('Unmapped source: ' + name); return load(target); }
      return require(name);
    };
    vm.runInNewContext(code, { module, exports: module.exports, require: request, console, Date, setTimeout, clearTimeout, requestAnimationFrame: fn => { const id = ++frameId; raf.set(id, fn); return id; }, cancelAnimationFrame: id => raf.delete(id) }, { filename: path.resolve(file) });
    return module.exports;
  }
  const authModule = load('context/AuthContext.tsx');
  const guard = load('hooks/useProtectedRoute.ts');
  const Screen = load('app/(onboarding)/login.tsx').default;
  function Capture() { authState = authModule.useAuth(); guard.useProtectedRoute(); return visible ? options.strict ? React.createElement(React.StrictMode, null, React.createElement(Screen)) : React.createElement(Screen) : null; }
  function App() { return React.createElement(query.QueryClientProvider, { client }, React.createElement(authModule.default, null, React.createElement(Capture))); }
  await act(async () => { renderer = create(options.providerStrict ? React.createElement(React.StrictMode, null, React.createElement(App)) : React.createElement(App)); await pause(); });
  const flush = async () => { await act(async () => { await pause(); }); };
  const update = async () => { await act(async () => { renderer.update(options.providerStrict ? React.createElement(React.StrictMode, null, React.createElement(App)) : React.createElement(App)); await pause(); }); };
  const button = () => renderer.root.findAllByType('Button').find(node => node.findAllByType('Text').some(text => text.children.includes('Masuk')));
  return {
    requests, writes, reads, errorWrites, routes, storage, client, button, form: () => methods, api: () => api, auth: () => authState,
    messages: () => renderer.root.findAllByType('Text').filter(node => node.props.id?.endsWith('-form-item-message')).map(node => node.children.join('')),
    input: async (name, value) => { await act(async () => { renderer.root.findAllByType('Input').find(node => node.props.id === name).findByType('InputField').props.onChangeText(value); await pause(); }); },
    begin: async (twice = false) => { let promises; await act(async () => { const press = button().props.onPress; promises = twice ? [press(), press()] : [press()]; await pause(); }); return { promises }; },
    beginHook: async (fn = api.call) => { let promise; await act(async () => { promise = fn(payload); await pause(); }); return { promise }; },
    reply: async (method, body, status = 200) => { await act(async () => { for (const request of requests.filter(item => item.method === method && !item.done)) { request.done = true; request.response.resolve({ data: body, status }); } await pause(); }); },
    store: async (error) => { await act(async () => { for (const write of writes.filter(item => !item.done)) { write.done = true; if (error) write.wait.reject(error); else write.wait.resolve(); } await pause(); }); },
    hide: async () => { visible = false; await update(); }, show: async () => { visible = true; await update(); },
    rerender: update,
    read: async (index, value, error) => { await act(async () => { if (error) reads[index].wait.reject(error); else reads[index].wait.resolve(value); await pause(); }); },
    reload: async () => { let promise; await act(async () => { promise = authState.reloadAuth(); await pause(); }); return { promise }; },
    signOut: async () => { await act(async () => { await authState.signOut(); await pause(); }); },
    flush, flushRaf: async () => { await act(async () => { const jobs = [...raf.values()]; raf.clear(); for (const fn of jobs) fn(); }); },
    dispose: async () => { await act(async () => { renderer.unmount(); client.clear(); await pause(); }); },
  };
}
async function fill(f) { await f.input('email', payload.email); await f.input('password', payload.password); }

const genericError = 'Terdapat kesalahan. Silakan coba lagi.';
const staffData = { user: { id: 'qc-staff', team_id: 'qc-team' }, roles: ['staff'], permissions: ['view-sales', 'edit-sales'] };
async function completeLogin(f, attempt) {
  await f.reply('post', success(loginData)); await f.store();
  await f.reply('get', success(userData)); await act(async () => Promise.all(attempt.promises)); await f.flush();
}
async function scenarios() {
  let f = await fixture(); await fill(f); const failed = await f.begin();
  await f.reply('post', success(loginData)); await f.store();
  check('P2 reproduction: successful POST then user GET pending', f.requests.map(x => [x.method, x.url]), [['post', '/login'], ['get', '/user']]);
  check('P2 reproduction: validation pending keeps actual button disabled', f.button().props.isDisabled, true);
  await f.reply('get', { success: false, message: 'QC validation unavailable' }, 500);
  await act(async () => Promise.all(failed.promises)); await f.flush();
  check('QC-LOGIN-001: actual button path sets generic form error', f.form().getFieldState('email').error?.message, genericError);
  check('QC-LOGIN-001: production FormMessage renders the error', f.messages().includes(genericError), true);
  check('QC-LOGIN-001: actual button permits retry after validation failure', f.button().props.isDisabled, false);
  check('QC-LOGIN-001: credentials retained for retry', f.form().getValues(), payload);
  check('validation failure: provider is anonymous and no route replaced', [f.auth().authenticated, f.routes], [false, []]);
  check('validation failure: actual Query status/error and fetch settled', [f.client.getQueryState(['user-data']).status, f.client.getQueryState(['user-data']).fetchStatus], ['error', 'idle']);
  check('existing contract: validation failure does not roll back saved token', f.storage.has('auth_token'), true);
  const retry = await f.begin(true);
  check('retry after validation failure: same-event double press adds one POST', f.requests.filter(x => x.method === 'post').length, 2);
  check('retry after validation failure: button becomes busy', f.button().props.isDisabled, true);
  await f.reply('post', success(loginData));
  check('retry after validation failure: exactly one new token write', f.writes.length, 2);
  await f.store();
  check('retry after validation failure: exactly one new user GET', f.requests.filter(x => x.method === 'get').length, 2);
  await f.reply('get', success(userData)); await act(async () => Promise.all(retry.promises)); await f.flush();
  check('retry succeeds: authenticated and actual button released', [f.auth().authenticated, f.button().props.isDisabled], [true, false]);
  check('retry succeeds: previous generic error cleared from form', f.form().getFieldState('email').error?.message ?? null, null);
  await f.flushRaf();
  check('retry succeeds: actual current guard replaces home once', f.routes, ['/(back-office)/home']);
  observations.push({ case: 'validation-failure-retry', requests: f.requests.map(x => ({ method: x.method, url: x.url })), writes: f.writes.length, routes: f.routes });
  await f.dispose();

  f = await fixture(); await fill(f); const hookAttempt = await f.beginHook();
  await f.reply('post', success(loginData)); await f.store();
  await f.reply('get', { success: false, message: 'QC user expired' }, 401);
  let hookResult; await act(async () => { hookResult = await hookAttempt.promise; }); await f.flush();
  check('QC-LOGIN-001: hook caller receives user-validation error tuple', Boolean(hookResult[1]), true);
  check('hook caller user error: local loading released', f.api().isLoading, false);
  check('hook caller user error: no authenticated redirect', f.routes, []);
  await f.dispose();

  f = await fixture({ deferStorage: true, providerStrict: true });
  check('StrictMode reverse completion: two storage reads', f.reads.length, 2);
  await f.read(1, 'qc-current-strict-token');
  check('StrictMode reverse completion: current read starts one GET', f.requests.filter(x => x.method === 'get').length, 1);
  await f.read(0, null);
  check('retired missing-token result while current GET pending: loading preserved', [f.auth().isLoading, f.auth().isLoaded, f.auth().authenticated], [true, false, false]);
  await f.reply('get', success(staffData)); await f.flush();
  check('retired missing-token result: current authenticated state preserved', [f.auth().authenticated, f.auth().isLoaded, f.auth().isLoading], [true, true, false]);
  await f.rerender(); await f.rerender();
  check('StrictMode current completion/rerenders: no extra bootstrap or GET', [f.reads.length, f.requests.length], [2, 1]);
  await f.flushRaf();
  check('StrictMode reverse completion: current guard reaches home once', f.routes, ['/(back-office)/home']);
  await f.dispose();

  f = await fixture({ deferStorage: true, providerStrict: true });
  await f.read(1, 'qc-valid-current-token'); await f.reply('get', success(userData)); await f.flush();
  check('StrictMode active effect completes before retired read', [f.auth().authenticated, f.auth().isLoading], [true, false]);
  await f.read(0, null);
  check('retired missing-token result after current completion: auth retained', [f.auth().authenticated, f.auth().isLoaded, f.auth().isLoading], [true, true, false]);
  check('retired result after current completion: no additional user request', f.requests.length, 1);
  await f.flushRaf();
  check('retired result after current completion: live home redirect retained', f.routes, ['/(back-office)/home']);
  await f.dispose();

  f = await fixture({ deferStorage: true, providerStrict: true });
  await f.read(0, null, Error('QC retired storage rejection'));
  check('retired storage rejection: current bootstrap still loading', [f.auth().isLoading, f.auth().isLoaded], [true, false]);
  check('retired storage rejection: no API request', f.requests.length, 0);
  await f.read(1, null);
  check('active missing-token result settles bootstrap', [f.auth().isLoading, f.auth().isLoaded, f.auth().authenticated], [false, true, false]);
  await f.dispose();

  const old = await fixture({ deferStorage: true }); await old.dispose();
  f = await fixture({ deferStorage: true });
  await old.read(0, 'qc-unmounted-provider-token');
  check('old provider after remount: late storage starts no GET', old.requests.length, 0);
  check('new provider after old result: its own bootstrap stays pending', [f.reads.length, f.requests.length, f.auth().isLoading, f.auth().isLoaded], [1, 0, true, false]);
  await f.read(0, null);
  check('new provider: its own missing-token read finishes independently', [f.auth().authenticated, f.auth().isLoading, f.auth().isLoaded], [false, false, true]);
  // Drain a possible baseline-only late request; final source starts none.
  await old.reply('get', success(userData)); old.client.clear();
  await f.dispose();

  f = await fixture({ deferStorage: true, token: 'qc-staff-bootstrap-token' });
  check('anonymous helpers before validation: all deny', [f.auth().hasPermission('view-sales'), f.auth().hasAnyPermission(['view-sales']), f.auth().hasAllPermissions(['view-sales']), f.auth().hasRole('staff')], [false, false, false, false]);
  await f.read(0, 'qc-staff-bootstrap-token'); await f.reply('get', success(staffData)); await f.flush();
  check('staff helpers: single permission grants and denies accurately', [f.auth().hasPermission('view-sales'), f.auth().hasPermission('delete-sales')], [true, false]);
  check('staff helpers: any-permission grants and denies accurately', [f.auth().hasAnyPermission(['delete-sales', 'edit-sales']), f.auth().hasAnyPermission(['delete-sales'])], [true, false]);
  check('staff helpers: all-permissions grants and denies accurately', [f.auth().hasAllPermissions(['view-sales', 'edit-sales']), f.auth().hasAllPermissions(['view-sales', 'delete-sales'])], [true, false]);
  check('staff helpers: role scalar/array and owner denial preserved', [f.auth().hasRole('staff'), f.auth().hasRole(['owner', 'staff']), f.auth().hasRole('owner')], [true, true, false]);
  await f.signOut();
  check('actual staff signOut: token and user cache cleared', [f.storage.has('auth_token'), f.client.getQueryData(['user-data']) ?? null, f.auth().authenticated], [false, null, false]);
  check('helpers after signOut: all deny', [f.auth().hasPermission('view-sales'), f.auth().hasAnyPermission(['view-sales']), f.auth().hasAllPermissions(['view-sales']), f.auth().hasRole('staff')], [false, false, false, false]);
  const reload = await f.reload();
  check('reload after signOut: loading starts and one explicit read added', [f.auth().isLoading, f.reads.length], [true, 2]);
  await f.read(1, null); let result; await act(async () => { result = await reload.promise; }); await f.flush();
  check('reload after signOut: false/anonymous/settled', [result, f.auth().authenticated, f.auth().isLoading], [false, false, false]);
  check('reload after signOut missing token: no additional GET', f.requests.length, 1);
  await f.flushRaf();
  check('signOut/reload on public login: canceled home frame never navigates', f.routes, []);
  await f.dispose();
}
(async () => {
  await scenarios();
  check('final: no runtime/React/act errors', runtimeErrors, []);
  check('final: no unhandled rejection', unhandledRejections, []);
  const result = { owner: 'QC', ticket: 'SD5-005', tested: baseline ? 'BASELINE_PROVIDER_CURRENT_GUARD' : 'CURRENT_PROVIDER_CURRENT_GUARD', sourceHashes, checks, observations, runtimeErrors, unhandledRejections, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length };
  fs.writeFileSync(path.join(__dirname, baseline ? 'independent-baseline-results.json' : 'independent-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ tested: result.tested, passed: result.passed, failed: result.failed, runtimeErrors, unhandledRejections, failures: checks.filter(x => !x.passed) }));
  process.exitCode = result.failed || runtimeErrors.length || unhandledRejections.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { console.error = originalError; process.removeListener('unhandledRejection', onUnhandled); });
