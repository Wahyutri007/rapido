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
const proposal = false;
const candidate = path.join(__dirname, 'proposal/AuthContext.tsx');
if (proposal && !fs.existsSync(candidate)) throw new Error('Missing AuthProvider candidate');
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
  const requests = [], writes = [], errorWrites = [], routes = [], frames = new Map(), history = new Map(), loaded = new Map(), storage = new Map();
  let renderer, methods, api, authState, visible = true, guardVisible = true, nextFrame = 0;
  let segments = options.segments || ['(onboarding)', 'login'];
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
    getItemAsync: async key => storage.get(key) ?? null,
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
    const tested = file;
    const bytes = fs.readFileSync(tested);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    if (sourceHashes[file] && sourceHashes[file] !== hash) throw Error('Runtime source changed: ' + file);
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
    vm.runInNewContext(code, { module, exports: module.exports, require: request, console, Date, setTimeout, clearTimeout, requestAnimationFrame: fn => { const id = ++nextFrame; frames.set(id, fn); history.set(id, fn); return id; }, cancelAnimationFrame: id => frames.delete(id) }, { filename: path.resolve(file) });
    return module.exports;
  }
  const authModule = load('context/AuthContext.tsx');
  const guard = load('hooks/useProtectedRoute.ts');
  const Screen = load('app/(onboarding)/login.tsx').default;
  function Guard() { guard.useProtectedRoute(); return null; }
  function Capture() {
    authState = authModule.useAuth();
    return React.createElement(React.Fragment, null,
      guardVisible ? options.guardStrict ? React.createElement(React.StrictMode, null, React.createElement(Guard)) : React.createElement(Guard) : null,
      visible ? React.createElement(Screen) : null);
  }
  function App() { return React.createElement(query.QueryClientProvider, { client }, React.createElement(authModule.default, null, React.createElement(Capture))); }
  await act(async () => { renderer = create(React.createElement(App)); await pause(); });
  const flush = async () => { await act(async () => { await pause(); }); };
  const update = async () => { await act(async () => { renderer.update(React.createElement(App)); await pause(); }); };
  const button = () => renderer.root.findAllByType('Button').find(node => node.findAllByType('Text').some(text => text.children.includes('Masuk')));
  return {
    requests, writes, errorWrites, routes, storage, client, button, frames, history, form: () => methods, api: () => api, auth: () => authState,
    messages: () => renderer.root.findAllByType('Text').filter(node => node.props.id?.endsWith('-form-item-message')).map(node => node.children.join('')),
    input: async (name, value) => { await act(async () => { renderer.root.findAllByType('Input').find(node => node.props.id === name).findByType('InputField').props.onChangeText(value); await pause(); }); },
    begin: async (twice = false) => { let promises; await act(async () => { const press = button().props.onPress; promises = twice ? [press(), press()] : [press()]; await pause(); }); return { promises }; },
    beginHook: async (fn = api.call) => { let promise; await act(async () => { promise = fn(payload); await pause(); }); return { promise }; },
    reply: async (method, body, status = 200) => { await act(async () => { for (const request of requests.filter(item => item.method === method && !item.done)) { request.done = true; request.response.resolve({ data: body, status }); } await pause(); }); },
    store: async (error) => { await act(async () => { for (const write of writes.filter(item => !item.done)) { write.done = true; if (error) write.wait.reject(error); else write.wait.resolve(); } await pause(); }); },
    hide: async () => { visible = false; await update(); }, show: async () => { visible = true; await update(); },
    flush,
    go: async next => { segments = next; await update(); },
    hideGuard: async () => { guardVisible = false; await update(); },
    showGuard: async () => { guardVisible = true; await update(); },
    signOut: async () => { await act(async () => { await authState.signOut(); await pause(); }); },
    reload: async () => { let promise; await act(async () => { promise = authState.reloadAuth(); await pause(); }); return { promise }; },
    deliver: async id => { await act(async () => { const fn = history.get(id); if (!fn) throw Error('Unknown historical frame: ' + id); fn(); await pause(); }); },
    flushRaf: async () => { await act(async () => { const jobs = [...frames]; frames.clear(); for (const [, fn] of jobs) fn(); await pause(); }); },
    dispose: async () => { await act(async () => { renderer.unmount(); client.clear(); await pause(); }); },
  };
}
async function fill(f) { await f.input('email', payload.email); await f.input('password', payload.password); }

const privateRoute = ['(cashier)', 'transaction'];
const queued = f => [...f.frames.keys()];
async function login(f, twice = false) {
  await fill(f); const attempt = await f.begin(twice);
  await f.reply('post', success(loginData)); await f.store();
  await f.reply('get', success(userData));
  await act(async () => Promise.all(attempt.promises)); await f.flush();
}
async function scenarios() {
  let f = await fixture({ segments: privateRoute });
  check('anonymous private route: login frame queued', f.frames.size, 1);
  const anonymousFrame = queued(f)[0];
  await fill(f); const attempt = await f.begin(true);
  check('production Login/Form/Common/Axios: double press sends one POST', f.requests.filter(x => x.method === 'post').length, 1);
  check('production request: login path and payload preserved', [f.requests[0].url, f.requests[0].data], ['/login', payload]);
  await f.reply('post', success(loginData));
  check('provider handoff: one memory token write', f.writes.length, 1);
  check('provider handoff: user fetch waits for token storage', f.requests.filter(x => x.method === 'get').length, 0);
  await f.store();
  check('production Query/Common: user GET after storage commit', f.requests.filter(x => x.method === 'get').map(x => x.url), ['/user']);
  await f.reply('get', success(userData)); await act(async () => Promise.all(attempt.promises)); await f.flush();
  check('production provider/Query: current user authenticated', f.auth().authenticated, true);
  check('login succeeds on private page: obsolete anonymous frame canceled', f.frames.size, 0);
  await f.deliver(anonymousFrame);
  check('late anonymous callback after authentication: no login redirect', f.routes, []);
  await f.dispose();

  f = await fixture(); await login(f);
  check('authenticated onboarding: one home frame queued', f.frames.size, 1);
  const homeFrame = queued(f)[0];
  await f.go(privateRoute);
  check('explicit cashier route change: pending home frame canceled', f.frames.size, 0);
  await f.deliver(homeFrame);
  check('late home callback: explicit cashier route is not overwritten', f.routes, []);
  check('route change: authenticated user retained', f.auth().authenticated, true);
  await f.dispose();

  f = await fixture(); await login(f);
  const signOutFrame = queued(f)[0];
  await f.signOut();
  check('actual provider sign-out: anonymous state', f.auth().authenticated, false);
  check('actual provider sign-out: memory token removed', f.storage.has('auth_token'), false);
  check('actual provider sign-out: user query data removed', f.client.getQueryData(['user-data']) ?? null, null);
  check('sign-out on public login: home frame canceled', f.frames.size, 0);
  await f.deliver(signOutFrame);
  check('late home callback after sign-out: no protected redirect', f.routes, []);
  await f.dispose();

  f = await fixture(); await login(f);
  const beforeReload = queued(f)[0];
  const reload = await f.reload();
  check('actual provider reload: loading is active', f.auth().isLoading, true);
  check('reload/loading transition: obsolete home frame canceled', f.frames.size, 0);
  check('actual Query reload: exactly two user GETs total', f.requests.filter(x => x.method === 'get').length, 2);
  await f.deliver(beforeReload);
  check('late home callback while loading: no navigation', f.routes, []);
  await f.reply('get', success(userData));
  let validated; await act(async () => { validated = await reload.promise; }); await f.flush();
  check('actual provider reload: successful user validation', validated, true);
  check('actual provider reload: loading completes', f.auth().isLoading, false);
  check('reload completion: one current home frame queued', f.frames.size, 1);
  await f.deliver(beforeReload);
  check('retired frame after reload completion: remains inert', f.routes, []);
  await f.flushRaf();
  check('current frame after reload: one home redirect', f.routes, ['/(back-office)/home']);
  await f.dispose();

  f = await fixture({ segments: privateRoute });
  const privateFrame = queued(f)[0];
  await f.go(['maintenance']);
  check('anonymous private -> public maintenance: frame canceled', f.frames.size, 0);
  await f.deliver(privateFrame);
  check('late private callback on public maintenance: no login redirect', f.routes, []);
  check('public route transition: no user API request', f.requests.length, 0);
  await f.dispose();

  f = await fixture({ segments: privateRoute });
  const oldMountFrame = queued(f)[0];
  await f.hideGuard();
  check('guard subtree unmount: frame canceled', f.frames.size, 0);
  await f.deliver(oldMountFrame);
  check('callback delivered after subtree unmount: no navigation', f.routes, []);
  await f.showGuard();
  check('guard remount: one new current login frame', f.frames.size, 1);
  const currentMountFrame = queued(f)[0];
  check('guard remount: new frame identity', currentMountFrame !== oldMountFrame, true);
  await f.deliver(oldMountFrame);
  check('remount: old instance cannot redirect', f.routes, []);
  await f.flushRaf();
  check('remount: current instance redirects once', f.routes, ['/(onboarding)/login']);
  await f.dispose();
  await f.deliver(currentMountFrame);
  check('root disposed after current delivery: callback remains inert', f.routes, ['/(onboarding)/login']);

  f = await fixture({ segments: privateRoute, guardStrict: true });
  await f.hideGuard(); const historyBefore = new Set(f.history.keys());
  await f.showGuard();
  const strictFrames = [...f.history.keys()].filter(id => !historyBefore.has(id));
  check('StrictMode guard remount: setup-cleanup-setup produces two frame IDs', strictFrames.length, 2);
  check('StrictMode guard remount: one active frame after cleanup', f.frames.size, 1);
  const retiredStrictFrames = strictFrames.filter(id => !f.frames.has(id));
  check('StrictMode guard remount: one retired frame', retiredStrictFrames.length, 1);
  for (const id of retiredStrictFrames) await f.deliver(id);
  check('StrictMode retired callbacks: no navigation', f.routes, []);
  await f.flushRaf();
  check('StrictMode current frame: one login redirect', f.routes, ['/(onboarding)/login']);
  await f.dispose();

  f = await fixture(); await login(f);
  const disposedFrame = queued(f)[0];
  await f.dispose();
  check('root unmount with pending authenticated frame: canceled', f.frames.size, 0);
  await f.deliver(disposedFrame);
  check('detached callback delivered after root unmount: no navigation', f.routes, []);
}
(async () => {
  await scenarios();
  check('final: no runtime/React/act errors', runtimeErrors, []);
  check('final: no unhandled rejection', unhandledRejections, []);
  const result = { owner: 'QC', ticket: 'SD5-004', tested: 'CURRENT_GUARD_WITH_CURRENT_PROVIDER', sourceHashes, checks, observations, runtimeErrors, unhandledRejections, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length };
  fs.writeFileSync(path.join(__dirname, 'independent-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ tested: result.tested, passed: result.passed, failed: result.failed, runtimeErrors, unhandledRejections, failures: checks.filter(x => !x.passed) }));
  process.exitCode = result.failed || runtimeErrors.length || unhandledRejections.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { console.error = originalError; process.removeListener('unhandledRejection', onUnhandled); });
