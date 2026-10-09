// Build a separate guard integration runner from the frozen QC Login fixture.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
let code = fs.readFileSync('docs/qa/qc-login-2026-10-09/integration.cjs', 'utf8').split('async function scenarios() {')[0];
function replace(before, after) {
  if (!code.includes(before) || code.indexOf(before) !== code.lastIndexOf(before)) throw Error('Fixture anchor missing or ambiguous: ' + before);
  code = code.replace(before, after);
}
replace("const proposal = process.argv.includes('--proposal');", 'const proposal = false;');
replace('routes = [], raf = [], loaded = new Map()', 'routes = [], frames = new Map(), history = new Map(), loaded = new Map()');
replace('let renderer, methods, api, authState, visible = true;', 'let renderer, methods, api, authState, visible = true, guardVisible = true, nextFrame = 0;');
replace("const segments = ['(onboarding)', 'login'];", "let segments = options.segments || ['(onboarding)', 'login'];");
replace("const reviewedGuard = path.join(__dirname, 'fixtures/useProtectedRoute.ts.txt');\n    const tested = file === 'hooks/useProtectedRoute.ts' && fs.existsSync(reviewedGuard) ? reviewedGuard : proposal && file === 'context/AuthContext.tsx' ? candidate : file;", "const tested = file === 'context/AuthContext.tsx' ? path.join(__dirname, 'fixtures/AuthContext.tsx.txt') : file;");
replace("sourceHashes[file] = crypto.createHash('sha256').update(bytes).digest('hex');", "const hash = crypto.createHash('sha256').update(bytes).digest('hex');\n    if (sourceHashes[file] && sourceHashes[file] !== hash) throw Error('Runtime source changed: ' + file);\n    sourceHashes[file] = hash;");
replace('requestAnimationFrame: fn => { raf.push(fn); }', 'requestAnimationFrame: fn => { const id = ++nextFrame; frames.set(id, fn); history.set(id, fn); return id; }, cancelAnimationFrame: id => frames.delete(id)');
replace('function Capture() { authState = authModule.useAuth(); guard.useProtectedRoute(); return visible ? options.strict ? React.createElement(React.StrictMode, null, React.createElement(Screen)) : React.createElement(Screen) : null; }', `function Guard() { guard.useProtectedRoute(); return null; }
  function Capture() {
    authState = authModule.useAuth();
    return React.createElement(React.Fragment, null,
      guardVisible ? options.guardStrict ? React.createElement(React.StrictMode, null, React.createElement(Guard)) : React.createElement(Guard) : null,
      visible ? React.createElement(Screen) : null);
  }`);
replace('requests, writes, errorWrites, routes, storage, client, button,', 'requests, writes, errorWrites, routes, storage, client, button, frames, history,');
replace('flush, flushRaf: async () => { await act(async () => { for (const fn of raf.splice(0)) fn(); }); },', `flush,
    go: async next => { segments = next; await update(); },
    hideGuard: async () => { guardVisible = false; await update(); },
    showGuard: async () => { guardVisible = true; await update(); },
    signOut: async () => { await act(async () => { await authState.signOut(); await pause(); }); },
    reload: async () => { let promise; await act(async () => { promise = authState.reloadAuth(); await pause(); }); return { promise }; },
    deliver: async id => { await act(async () => { const fn = history.get(id); if (!fn) throw Error('Unknown historical frame: ' + id); fn(); await pause(); }); },
    flushRaf: async () => { await act(async () => { const jobs = [...frames]; frames.clear(); for (const [, fn] of jobs) fn(); await pause(); }); },`);
code += `
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
  const result = { owner: 'QC', ticket: 'SD5-004', tested: 'CURRENT_GUARD_WITH_PINNED_HANDOFF_PROVIDER', sourceHashes, checks, observations, runtimeErrors, unhandledRejections, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length };
  fs.writeFileSync(path.join(__dirname, 'independent-results.json'), JSON.stringify(result, null, 2) + '\\n');
  console.log(JSON.stringify({ tested: result.tested, passed: result.passed, failed: result.failed, runtimeErrors, unhandledRejections, failures: checks.filter(x => !x.passed) }));
  process.exitCode = result.failed || runtimeErrors.length || unhandledRejections.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { console.error = originalError; process.removeListener('unhandledRejection', onUnhandled); });
`;
const target = path.join(__dirname, 'independent-runner.cjs');
fs.writeFileSync(target, code);
const run = spawnSync(process.execPath, [target], { encoding: 'utf8' });
fs.writeFileSync(path.join(__dirname, 'independent.out'), run.stdout || '');
fs.writeFileSync(path.join(__dirname, 'independent.err'), run.stderr || '');
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
if (run.error) throw run.error;
process.exitCode = run.status ?? 1;
