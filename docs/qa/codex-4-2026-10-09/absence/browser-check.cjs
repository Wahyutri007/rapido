/* Run from the app root with Metro on PORT (default 8088).
 * Uses production app entry/providers/router and isolated browser API fixtures.
 * No real login, payments, backend mutations or app-store test hooks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.resolve('.expo/payroll-qa-tools/node_modules/playwright'));
const origin = process.env.ORIGIN || 'http://127.0.0.1:8088';
const output = __dirname;
const checks = [], errors = [], consoleErrors = [], apiRequests = [];

const cssPath = path.resolve('node_modules/react-native-css-interop/.cache/web.css');
const text = (page, label) => page.getByText(label, { exact: true }).filter({ visible: true });
const button = (page, label) => page.getByRole('button', { name: label, exact: true }).filter({ visible: true });
async function locationIs(page, screen, id) {
  await page.waitForFunction(({ pathname, id }) => location.pathname === pathname && (id === undefined || new URL(location.href).searchParams.get('id') === id), { pathname: screen, id });
}
async function back(page, title) {
  await text(page, title).first().locator('..').locator('[tabindex="0"]').first().click();
}
async function record(name, operation) {
  await operation();
  checks.push(name);
  console.log(`PASS ${checks.length}: ${name}`);
}
async function createPage(browser, authenticated = true) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  page.on('pageerror', error => { errors.push(error.message); console.log('Runtime: ' + error.message); });
  page.on('requestfailed', request => console.log('Request failed: ' + request.url().split('?')[0] + ' ' + request.failure()?.errorText));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', async response => {
    if (response.url().includes('.bundle?') && response.status() >= 400) {
      const body = await response.text();
      console.log('Bundle error: ' + body.slice(0, 1800));
    }
  });
  await page.route('**/*', route => {
    if (!route.request().isNavigationRequest() || !route.request().url().startsWith(origin)) return route.continue();
    const css = fs.readFileSync(cssPath, 'utf8');
    return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}</style><style>${css}</style></head><body><div id="root"></div><script src="${origin}/node_modules/expo-router/entry.bundle?platform=web&amp;dev=false&amp;hot=false&amp;transform.routerRoot=app&amp;transform.engine=hermes&amp;transform.bytecode=0&amp;unstable_transformProfile=hermes-stable"></script></body></html>` });
  });
  await page.addInitScript(auth => {
    localStorage.setItem('onboarding_completed', 'true');
    if (auth) localStorage.setItem('auth_token', 'absence-router-fixture-only');
    else localStorage.removeItem('auth_token');
  }, authenticated);
  await page.route('**/api/**', route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname.replace(/^\/api/, '');
    apiRequests.push({ method: request.method(), endpoint });
    const data = endpoint === '/user'
      ? { user: { id: 'absence-router-owner', name: 'QA Absensi Preview', email: 'qa@example.test', phone: '081200000000', team_id: null, avatar: null }, roles: ['owner'], permissions: [] }
      : [];
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ success: true, status: 200, message: 'OK', data }) });
  });
  return { page, context };
}
async function load(page, pathname, readyText) {
  await page.goto(origin + pathname, { waitUntil: 'commit', timeout: 600000 });
  await text(page, readyText).first().waitFor({ timeout: 600000 });
}
async function choose(page, current, option) {
  await text(page, current).first().click();
  await text(page, option).last().click();
}
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--disable-features=LocalNetworkAccessChecks'] });
  let page;
  try {
    ({ page } = await createPage(browser));
    await load(page, '/manage', 'Kelola');
    await record('Kelola opens the real Absensi list with four existing preview records', async () => {
      await button(page, 'Absensi').click();
      await text(page, 'Catatan Absensi · 4').waitFor();
      await locationIs(page, '/manage/absence');
      assert.equal(await text(page, 'Absensi').count(), 1);
      await page.screenshot({ path: path.join(output, 'list-390.png') });
    });
    await record('Search no-result and clearing search preserve source records', async () => {
      const search = page.getByPlaceholder('Cari toko, tanggal, atau lokasi').filter({ visible: true });
      await search.fill('lokasi tidak ditemukan');
      await text(page, 'Tidak ada catatan yang cocok dengan pencarian dan filter.').waitFor();
      await text(page, 'Catatan Absensi · 0').waitFor();
      await search.fill('');
      await text(page, 'Catatan Absensi · 4').waitFor();
    });
    await record('Unknown-status filter and reset restore all records', async () => {
      await choose(page, 'Semua Status', 'Belum Lengkap');
      await text(page, 'Catatan Absensi · 0').waitFor();
      await button(page, 'Reset Pencarian dan Filter').click();
      await text(page, 'Catatan Absensi · 4').waitFor();
    });
    await record('Combined complete/store/date filters select the matching record only', async () => {
      await choose(page, 'Semua Status', 'Masuk & Keluar');
      await text(page, 'Catatan Absensi · 1').waitFor();
      await choose(page, 'Semua Toko', 'Cabang Utama');
      await choose(page, 'Semua Tanggal', '06 Maret 2026');
      await text(page, 'Catatan Absensi · 1').waitFor();
    });
    await record('Detail navigation retains the selected record ID and recorded values', async () => {
      await text(page, 'Cabang Utama').last().click();
      await text(page, 'Detail Absensi').waitFor();
      await locationIs(page, '/manage/absence/detail', '3');
      await text(page, 'Jam Masuk').waitFor();
      await text(page, 'Jam Keluar').waitFor();
      assert.equal(await text(page, '17:00').count(), 2);
      await page.screenshot({ path: path.join(output, 'detail-390.png') });
    });
    await record('Back restores filters, reset restores list, and list back returns to Kelola', async () => {
      await back(page, 'Detail Absensi');
      await locationIs(page, '/manage/absence');
      await text(page, 'Catatan Absensi · 1').waitFor();
      await button(page, 'Reset Pencarian dan Filter').click();
      await text(page, 'Catatan Absensi · 4').waitFor();
      await back(page, 'Absensi');
      await locationIs(page, '/manage');
    });
    await record('Unknown direct ID has a reachable list fallback', async () => {
      await load(page, '/manage/absence/detail?id=unknown', 'Catatan absensi tidak ditemukan.');
      await button(page, 'Kembali ke Daftar Absensi').click();
      await text(page, 'Catatan Absensi · 4').waitFor();
      await locationIs(page, '/manage/absence');
    });
    await record('Fresh direct detail survives reload and has usable header back', async () => {
      await load(page, '/manage/absence/detail?id=1', 'Detail Absensi');
      await text(page, 'Belum Keluar').waitFor();
      await page.reload({ waitUntil: 'commit', timeout: 600000 });
      await text(page, 'Detail Absensi').waitFor({ timeout: 600000 });
      await locationIs(page, '/manage/absence/detail', '1');
      await back(page, 'Detail Absensi');
      await text(page, 'Catatan Absensi · 4').waitFor();
      await back(page, 'Absensi');
      await locationIs(page, '/manage');
    });
    for (const viewport of [{ width: 320, height: 844 }, { width: 844, height: 390 }]) {
      await record(`List and missing-record action stay reachable at ${viewport.width}x${viewport.height}`, async () => {
        await page.setViewportSize(viewport);
        await load(page, '/manage/absence', 'Catatan Absensi · 4');
        const search = await page.getByPlaceholder('Cari toko, tanggal, atau lokasi').boundingBox();
        assert.ok(search.x >= 15 && search.x + search.width <= viewport.width - 15);
        await text(page, 'Cabang Utama').last().scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `list-${viewport.width}x${viewport.height}.png`) });
        await load(page, '/manage/absence/detail?id=unknown', 'Catatan absensi tidak ditemukan.');
        const action = button(page, 'Kembali ke Daftar Absensi');
        await action.scrollIntoViewIfNeeded();
        const box = await action.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= viewport.width + 1 && box.y >= 0 && box.y + box.height <= viewport.height + 1);
        await action.click();
        await text(page, 'Catatan Absensi · 4').waitFor();
      });
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    assert.equal(apiRequests.filter(request => !['GET', 'OPTIONS'].includes(request.method)).length, 0);
    const result = { status: 'PASS', passed: checks.length, checks, errors, consoleErrors, apiRequests, checkedAt: new Date().toISOString(), scope: 'Production app entry/providers/Expo Router with isolated API fixtures and HTML/CSS boot adapter. Uses existing store preview records; not SSR/backend/native certification.' };
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    fs.writeFileSync(path.join(output, 'browser-failure.json'), JSON.stringify({ status: 'FAIL', passed: checks.length, checks, errors, consoleErrors, error: String(error), url: page?.url(), body: await page?.locator('body').innerText().catch(() => ''), checkedAt: new Date().toISOString() }, null, 2));
    await page?.screenshot({ path: path.join(output, 'browser-failure.png') }).catch(() => {});
    throw error;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
