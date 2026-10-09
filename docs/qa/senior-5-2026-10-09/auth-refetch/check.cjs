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
    sourceHashes[file] = crypto.createHash('sha256').update(bytes).digest('hex');
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
async function scenarios() {
  let f = await fixture();
  check('provider: anonymous bootstrap finishes before login', f.auth().isLoading, false);
  check('provider: missing token does not request user', f.requests.length, 0);
  await fill(f); const attempt = await f.begin(true);
  check('real form/Common/Axios: double press sends one POST', f.requests.filter(x => x.method === 'post').length, 1);
  check('real Common/Axios: login endpoint/payload', [f.requests[0].url, f.requests[0].data], ['/login', payload]);
  check('real form: request keeps button disabled', f.button().props.isDisabled, true);
  await f.reply('post', success(loginData));
  check('real provider: successful POST starts one storage write', f.writes.length, 1);
  check('real provider: storage uses expected key/token', [f.writes[0].key, f.writes[0].value], ['auth_token', loginData.token]);
  check('real provider: user refetch waits for storage commit', f.requests.filter(x => x.method === 'get').length, 0);
  check('real form: storage phase keeps button disabled', f.button().props.isDisabled, true);
  const blocked = await f.beginHook(); await blocked.promise;
  check('real provider: storage phase prevents second POST', f.requests.filter(x => x.method === 'post').length, 1);
  await f.store();
  check('real provider: committed token requests user', f.requests.some(x => x.method === 'get' && x.url === '/user'), true);
  check('real form: user refetch phase keeps button disabled', f.button().props.isDisabled, true);
  await f.reply('get', success(userData)); await act(async () => Promise.all(attempt.promises)); await f.flush();
  check('real provider: successful validation authenticates user', f.auth().authenticated, true);
  check('real form: successful auth releases button', f.button().props.isDisabled, false);
  await f.flushRaf();
  check('real login guard: validated user reaches home', f.routes, ['/(back-office)/home']);
  check('real form: success preserves entered draft', f.form().getValues(), payload);
  await f.dispose();

  for (const [status, errors, expected] of [[401, { attempts: 3, max_attempts: 5 }, 'Email atau password salah (2 percobaan lagi)'], [429, { seconds: 25 }, 'Terlalu banyak percobaan masuk. Coba lagi dalam 25 detik.']]) {
    f = await fixture(); await fill(f); const failed = await f.begin();
    await f.reply('post', { success: false, message: 'QC rejected', errors }, status); await act(async () => Promise.all(failed.promises));
    check(`real HTTP ${status}: error mapper/form retains message`, f.form().getFieldState('email').error?.message, expected);
    check(`real HTTP ${status}: FormMessage renders mapped error`, f.messages().includes(expected), true);
    check(`real HTTP ${status}: credentials remain`, f.form().getValues(), payload);
    check(`real HTTP ${status}: no auth storage write`, f.writes.length, 0);
    const retry = await f.begin();
    check(`real HTTP ${status}: retry sends next POST`, f.requests.filter(x => x.method === 'post').length, 2);
    await f.reply('post', { success: false, message: 'QC rejected' }, 500); await act(async () => Promise.all(retry.promises)); await f.dispose();
  }

  f = await fixture(); await fill(f); const storageFailure = await f.begin();
  await f.reply('post', success(loginData)); await f.store(Error('QC memory storage failed')); await act(async () => Promise.all(storageFailure.promises));
  check('real provider storage failure: generic form error', f.form().getFieldState('email').error?.message, 'Terdapat kesalahan. Silakan coba lagi.');
  check('real provider storage failure: user GET does not start', f.requests.filter(x => x.method === 'get').length, 0);
  check('real provider storage failure: button can retry', f.button().props.isDisabled, false);
  check('real provider storage failure: token remains absent', f.storage.size, 0);
  await f.dispose();

  f = await fixture(); await fill(f); const refetchFailure = await f.beginHook();
  await f.reply('post', success(loginData)); await f.store();
  await f.reply('get', { success: false, message: 'QC user unavailable' }, 500);
  let result; await act(async () => { result = await refetchFailure.promise; }); await f.flush();
  const queryState = f.client.getQueryState(['user-data']);
  observations.push({ case: 'user-refetch-failure', methods: f.requests.map(item => ({ method: item.method, url: item.url })), storedTokenPresent: f.storage.has('auth_token'), query: { status: queryState.status, fetchStatus: queryState.fetchStatus, error: queryState.error }, authenticated: f.auth().authenticated, result, formError: f.form().getFieldState('email').error?.message ?? null, loading: f.api().isLoading });
  check('real Query refetch failure: provider remains anonymous', f.auth().authenticated, false);
  check('real Query refetch failure: no authenticated navigation', f.routes, []);
  check('real Query refetch failure: form receives generic error', f.form().getFieldState('email').error?.message, 'Terdapat kesalahan. Silakan coba lagi.');
  check('real Query refetch failure: call returns an error', Boolean(result[1]), true);
  check('real Query refetch failure: local loading released', f.api().isLoading, false);
  await f.dispose();

  f = await fixture(); await fill(f); const buttonRefetchFailure = await f.begin();
  await f.reply('post', success(loginData)); await f.store();
  await f.reply('get', { success: false, message: 'QC user unavailable' }, 500);
  await act(async () => Promise.all(buttonRefetchFailure.promises)); await f.flush();
  check('real button user-query failure: generic error appears in FormMessage', f.messages().includes('Terdapat kesalahan. Silakan coba lagi.'), true);
  check('real button user-query failure: draft retained', f.form().getValues(), payload);
  check('real button user-query failure: button allows retry', f.button().props.isDisabled, false);
  const recovered = await f.begin(true);
  check('real user-query failure retry: double press adds exactly one POST', f.requests.filter(x => x.method === 'post').length, 2);
  check('real user-query failure retry: button busy', f.button().props.isDisabled, true);
  await f.reply('post', success(loginData));
  check('real user-query failure retry: one new storage commit', f.writes.length, 2);
  await f.store();
  check('real user-query failure retry: one new user validation', f.requests.filter(x => x.method === 'get').length, 2);
  check('real user-query failure retry: validation keeps button busy', f.button().props.isDisabled, true);
  await f.reply('get', success(userData)); await act(async () => Promise.all(recovered.promises)); await f.flush(); await f.flushRaf();
  check('real user-query failure retry: authenticated and button released', [f.auth().authenticated, f.button().props.isDisabled], [true, false]);
  check('real user-query failure retry: actual guard reaches home once', f.routes, ['/(back-office)/home']);
  check('real user-query failure retry: retained credentials', f.form().getValues(), payload);
  await f.dispose();

  f = await fixture(); await fill(f); const old = await f.begin(); const retained = f.api().call;
  await f.hide(); await f.reply('post', success(loginData)); await act(async () => Promise.all(old.promises));
  check('real provider: response after login unmount starts no storage write', f.writes.length, 0);
  await f.show(); await fill(f); const active = await f.begin(); const count = f.requests.length;
  await f.beginHook(retained);
  check('remount: retained old hook dispatches no extra request', f.requests.length, count);
  check('remount: new login remains busy independently', f.api().isLoading, true);
  await f.reply('post', { success: false, message: 'QC rejected' }, 401); await act(async () => Promise.all(active.promises));
  check('remount: current form alone receives error', f.form().getFieldState('email').error?.message, 'Email atau password salah');
  await f.dispose();

  f = await fixture({ strict: true }); await fill(f); const strict = await f.begin(true);
  check('strict real form/provider: double press sends one POST', f.requests.length, 1);
  await f.reply('post', success(loginData)); await f.store(); await f.reply('get', success(userData)); await act(async () => Promise.all(strict.promises)); await f.flush();
  check('strict real form/provider: one token write', f.writes.length, 1);
  check('strict real form/provider: user authenticated', f.auth().authenticated, true);
  await f.dispose();
  f = await fixture({ deferStorage: true, token: 'bootstrap-token' });
  check('bootstrap pending storage: loading true and not loaded', [f.auth().isLoading, f.auth().isLoaded], [true, false]);
  check('bootstrap storage uses auth key once', f.reads.map(x => x.key), ['auth_token']);
  check('bootstrap pending storage: no user request', f.requests.length, 0);
  await f.read(0, 'bootstrap-token');
  check('bootstrap stored token: one user request', f.requests.map(x => [x.method, x.url]), [['get', '/user']]);
  check('bootstrap pending user: loading remains true', f.auth().isLoading, true);
  await f.reply('get', success(userData)); await f.flush();
  check('bootstrap validated token: authenticated and loaded', [f.auth().authenticated, f.auth().isLoaded, f.auth().isLoading], [true, true, false]);
  await f.rerender(); await f.rerender();
  check('provider rerenders: bootstrap reads remain one', f.reads.length, 1);
  check('provider query completion/rerenders: user requests remain one', f.requests.length, 1);
  check('owner role and permission helpers preserved', [f.auth().hasRole('owner'), f.auth().hasRole(['staff', 'owner']), f.auth().hasPermission('fixture-permission'), f.auth().hasAnyPermission(['fixture-permission']), f.auth().hasAllPermissions(['fixture-permission'])], [true, true, true, true, true]);
  await f.signOut();
  check('signOut: anonymous and stored token removed', [f.auth().authenticated, f.storage.has('auth_token')], [false, false]);
  check('signOut: user cache cleared', f.client.getQueryData(['user-data']) ?? null, null);
  await f.dispose();

  f = await fixture({ deferStorage: true });
  await f.read(0, null, Error('bootstrap storage rejected'));
  check('bootstrap storage rejection: loading settles and loaded true', [f.auth().isLoading, f.auth().isLoaded, f.auth().authenticated], [false, true, false]);
  check('bootstrap storage rejection: no user request', f.requests.length, 0);
  await f.dispose();

  f = await fixture({ deferStorage: true }); await f.read(0, 'expired-token');
  await f.reply('get', { success: false, message: 'expired' }, 401); await f.flush();
  check('bootstrap user rejection: anonymous with settled loading', [f.auth().authenticated, f.auth().isLoading, f.auth().isLoaded], [false, false, true]);
  await f.dispose();

  f = await fixture({ deferStorage: true }); await f.read(0, null);
  let reload = await f.reload();
  check('reloadAuth: loading begins immediately', f.auth().isLoading, true);
  check('reloadAuth: explicit caller adds exactly one storage read', f.reads.length, 2);
  await f.read(1, 'reload-token');
  check('reloadAuth stored token: requests user once', f.requests.length, 1);
  await f.reply('get', success(userData));
  let reloaded; await act(async () => { reloaded = await reload.promise; }); await f.flush();
  check('reloadAuth success: returns true and authenticates', [reloaded, f.auth().authenticated, f.auth().isLoaded, f.auth().isLoading], [true, true, true, false]);
  await f.rerender(); check('reloadAuth success: no bootstrap rerun', [f.reads.length, f.requests.length], [2, 1]);
  reload = await f.reload(); await f.read(2, null);
  await act(async () => { reloaded = await reload.promise; });
  check('reloadAuth missing token: false and anonymous', [reloaded, f.auth().authenticated, f.auth().isLoading], [false, false, false]);
  check('reloadAuth missing token: no extra user request', f.requests.length, 1);
  await f.dispose();

  f = await fixture({ deferStorage: true }); await f.read(0, null); reload = await f.reload();
  await f.read(1, 'rejected-reload-token'); await f.reply('get', { success: false, message: 'reload failed' }, 500);
  await act(async () => { reloaded = await reload.promise; }); await f.flush();
  check('reloadAuth user error: false/anonymous and settled', [reloaded, f.auth().authenticated, f.auth().isLoading, f.auth().isLoaded], [false, false, false, true]);
  await f.dispose();

  f = await fixture({ deferStorage: true }); await f.read(0, null); reload = await f.reload();
  await f.read(1, null, Error('reload storage rejected'));
  await act(async () => { reloaded = await reload.promise; });
  check('reloadAuth storage rejection: false and loading settles', [reloaded, f.auth().isLoading, f.auth().isLoaded], [false, false, true]);
  check('reloadAuth storage rejection: no user validation request', f.requests.length, 0);
  await f.dispose();

  f = await fixture({ deferStorage: true, providerStrict: true });
  check('StrictMode provider: two effect storage reads', f.reads.length, 2);
  await f.read(0, 'discarded-effect-token');
  check('StrictMode provider: discarded storage result starts no GET', f.requests.length, 0);
  check('StrictMode provider: discarded storage result keeps bootstrap pending', [f.auth().isLoading, f.auth().isLoaded, f.auth().authenticated], [true, false, false]);
  await f.read(1, 'active-effect-token');
  check('StrictMode provider: active storage result starts one GET', f.requests.length, 1);
  await f.reply('get', success(userData)); await f.flush();
  check('StrictMode provider: current bootstrap authenticates', [f.auth().authenticated, f.auth().isLoaded, f.auth().isLoading], [true, true, false]);
  await f.dispose();

  f = await fixture({ deferStorage: true }); await f.dispose(); await f.read(0, 'unmounted-effect-token');
  check('provider unmount before storage: no user request starts', f.requests.length, 0);

}
(async () => {
  await scenarios();
  check('final: no runtime/React/act errors', runtimeErrors, []);
  check('final: no unhandled rejection', unhandledRejections, []);
  const result = { owner: 'Senior5', ticket: 'SD5-005', basedOn: 'QC SD5-003 integration runner; adapted/new lifecycle cases; developer replay, not independent QC', tested: baseline ? 'BASELINE_PROVIDER_WITH_CURRENT_GUARD' : 'CURRENT_PRODUCTION_SOURCE', sourceHashes, checks, observations, runtimeErrors, unhandledRejections, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length };
  fs.writeFileSync(path.join(__dirname, baseline ? 'baseline-results.json' : 'final-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ tested: result.tested, passed: result.passed, failed: result.failed, runtimeErrors, unhandledRejections, failures: checks.filter(x => !x.passed) }));
  process.exitCode = result.failed || runtimeErrors.length || unhandledRejections.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { console.error = originalError; process.removeListener('unhandledRejection', onUnhandled); });
