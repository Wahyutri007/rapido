// Reuse the audited real-library fixture; the scenario body below is new QC work.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const original = fs.readFileSync('docs/qa/senior-5-2026-10-09/auth-refetch/check.cjs', 'utf8');
if (original.split('async function scenarios() {').length !== 2) throw Error('Fixture boundary changed');
let code = original.split('async function scenarios() {')[0];
const hashAnchor = "sourceHashes[file] = crypto.createHash('sha256').update(bytes).digest('hex');";
if (code.split(hashAnchor).length !== 2) throw Error('Runtime fingerprint seam changed');
code = code.replace(hashAnchor, "const hash = crypto.createHash('sha256').update(bytes).digest('hex');\n    if (sourceHashes[file] && sourceHashes[file] !== hash) throw Error('Mixed runtime bytes: ' + file);\n    sourceHashes[file] = hash;");
code += `
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
  fs.writeFileSync(path.join(__dirname, baseline ? 'independent-baseline-results.json' : 'independent-results.json'), JSON.stringify(result, null, 2) + '\\n');
  console.log(JSON.stringify({ tested: result.tested, passed: result.passed, failed: result.failed, runtimeErrors, unhandledRejections, failures: checks.filter(x => !x.passed) }));
  process.exitCode = result.failed || runtimeErrors.length || unhandledRejections.length ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { console.error = originalError; process.removeListener('unhandledRejection', onUnhandled); });
`;
const target = path.join(__dirname, 'independent-runner.cjs');
fs.writeFileSync(target, code);
const baseline = process.argv.includes('--baseline');
const run = spawnSync(process.execPath, [target, ...(baseline ? ['--baseline'] : [])], { encoding: 'utf8' });
fs.writeFileSync(path.join(__dirname, baseline ? 'independent-baseline.out' : 'independent.out'), run.stdout || '');
fs.writeFileSync(path.join(__dirname, baseline ? 'independent-baseline.err' : 'independent.err'), run.stderr || '');
process.stdout.write(run.stdout || ''); process.stderr.write(run.stderr || '');
if (run.error) throw run.error;
process.exitCode = run.status ?? 1;
