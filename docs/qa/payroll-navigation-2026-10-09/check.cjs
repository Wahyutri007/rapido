/* Run from the app root with Metro on PORT (default 8096).
 * Uses production app entry/providers/router and isolated browser API fixtures.
 * No real login, payments, backend mutations or app-store test hooks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.resolve('.expo/payroll-qa-tools/node_modules/playwright'));
const origin = process.env.ORIGIN || `http://localhost:${process.env.PORT || 8096}`;
const output = __dirname;
const checks = [], errors = [], consoleErrors = [], apiRequests = [];
const budi = 'payroll-budi-oct', dewi = 'payroll-dewi-oct';
const cssPath = path.resolve('node_modules/react-native-css-interop/.cache/web.css');
const text = (page, label) => page.getByText(label, { exact: true }).filter({ visible: true });
const button = (page, label) => page.getByRole('button', { name: label, exact: true }).filter({ visible: true });
const field = (page, label) => page.getByLabel(label, { exact: true }).filter({ visible: true });
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
    if (auth) localStorage.setItem('auth_token', 'payroll-routing-fixture-only');
    else localStorage.removeItem('auth_token');
  }, authenticated);
  await page.route('**/api/**', route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname.replace(/^\/api/, '');
    apiRequests.push({ method: request.method(), endpoint });
    const data = endpoint === '/user'
      ? { user: { id: 'payroll-routing-owner', name: 'QA Payroll Preview', email: 'qa@example.test', phone: '081200000000', team_id: null, avatar: null }, roles: ['owner'], permissions: [] }
      : [];
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ success: true, status: 200, message: 'OK', data }) });
  });
  return { page, context };
}
async function load(page, pathname, readyText) {
  await page.goto(origin + pathname, { waitUntil: 'commit', timeout: 600000 });
  await text(page, readyText).first().waitFor({ timeout: 600000 });
}
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--disable-features=LocalNetworkAccessChecks'] });
  let page;
  const progress = setInterval(async () => console.log(JSON.stringify({ running: true, passed: checks.length, url: page?.url(), errors, requests: apiRequests.slice(-8), body: (await page?.locator('body').innerText().catch(() => '') || '').slice(0, 400) })), 30000);
  try {
    ({ page } = await createPage(browser));
    await load(page, '/manage', 'Kelola');
    await record('Kelola opens Payroll list with correct URL and one visible layout header', async () => {
      await button(page, 'Penggajian').click();
      await text(page, 'Daftar Karyawan · 4').waitFor();
      await locationIs(page, '/manage/payroll');
      assert.equal(await text(page, 'Penggajian').count(), 1);
      await page.screenshot({ path: path.join(output, 'list-router.png') });
    });
    await record('Payroll list header returns to Kelola', async () => {
      await back(page, 'Penggajian');
      await locationIs(page, '/manage');
      await button(page, 'Penggajian').waitFor();
      await button(page, 'Penggajian').click();
      await text(page, 'Daftar Karyawan · 4').waitFor();
    });
    await record('List opens employee detail with matching route ID', async () => {
      await text(page, 'Budi Santoso').click();
      await text(page, 'Rincian Penggajian').waitFor();
      await locationIs(page, '/manage/payroll/detail', budi);
      assert.equal(await text(page, 'Budi Santoso').count(), 1);
    });
    await record('Settings hydrate the selected employee and preserve its route ID', async () => {
      await button(page, 'Atur Gaji').click();
      await field(page, 'Gaji Pokok (Bulanan)').waitFor();
      await locationIs(page, '/manage/payroll/modify', budi);
      assert.equal(await field(page, 'Gaji Pokok (Bulanan)').inputValue(), '6000000');
    });
    await record('Saving settings updates the same record then header returns to its detail', async () => {
      await field(page, 'Catatan').fill('Catatan tersimpan lewat router');
      await button(page, 'Simpan Pengaturan Gaji').click();
      await text(page, 'Pengaturan Gaji Disimpan').waitFor();
      await button(page, 'Mengerti').click();
      await button(page, 'Mengerti').waitFor({ state: 'hidden' });
      await back(page, 'Atur Gaji');
      await locationIs(page, '/manage/payroll/detail', budi);
      await text(page, 'Catatan tersimpan lewat router').waitFor();
    });
    await record('Payment opens the same employee and rejects missing required inputs', async () => {
      await button(page, 'Catat Pembayaran').click();
      await field(page, 'Nominal Dibayar').waitFor();
      await locationIs(page, '/manage/payroll/payment', budi);
      assert.equal(await field(page, 'Nominal Dibayar').inputValue(), '7500000');
      await button(page, 'Catat Pembayaran').click();
      await text(page, 'Pilih rekening asal atau kas.').waitFor();
    });
    await record('Full preview payment reaches slip and exports the same reference without API mutation', async () => {
      await field(page, 'Kas Asal').fill('Kas Uji Navigasi');
      await field(page, 'Tanggal Pembayaran').fill('2026-10-09');
      await field(page, 'No. Referensi').fill('QA-ROUTER-PAYROLL-1');
      await button(page, 'Catat Pembayaran').click();
      await text(page, 'Pembayaran Dicatat').waitFor();
      await button(page, 'Mengerti').click();
      await button(page, 'Mengerti').waitFor({ state: 'hidden' });
      await button(page, 'Lihat Slip Gaji').click();
      await text(page, 'Slip Gaji · Pratinjau').waitFor();
      await locationIs(page, '/manage/payroll/slip', budi);
      await text(page, 'Lunas').waitFor();
      await page.screenshot({ path: path.join(output, 'slip-router.png') });
      const pendingDownload = page.waitForEvent('download');
      await button(page, 'Unduh Slip Gaji').click();
      const download = await pendingDownload;
      const html = fs.readFileSync(await download.path(), 'utf8');
      assert.ok(html.includes('QA-ROUTER-PAYROLL-1'));
      assert.ok(html.includes('Budi Santoso'));
      assert.equal(download.suggestedFilename(), 'slip-gaji-budi-2026-10.html');
      assert.equal(apiRequests.filter(item => !['GET', 'OPTIONS'].includes(item.method)).length, 0);
    });
    await record('Back from paid slip keeps payment saved once and locks paid employee settings', async () => {
      await back(page, 'Slip Gaji');
      await locationIs(page, '/manage/payroll/payment', budi);
      await button(page, 'Lihat Slip Gaji').waitFor();
      assert.equal(await field(page, 'No. Referensi').inputValue(), 'QA-ROUTER-PAYROLL-1');
      await back(page, 'Catat Pembayaran');
      await locationIs(page, '/manage/payroll/detail', budi);
      assert.equal(await button(page, 'Atur Gaji').isDisabled(), true);
      assert.equal(await button(page, 'Catat Pembayaran').count(), 0);
      assert.equal(await text(page, 'Referensi: QA-ROUTER-PAYROLL-1').count(), 1);
      await page.screenshot({ path: path.join(output, 'paid-detail-after-back.png') });
    });
    await record('Back to list updates paid status and opening another employee changes ID', async () => {
      await back(page, 'Rincian Penggajian');
      await locationIs(page, '/manage/payroll');
      await text(page, 'Dewi Anggraini').click();
      await locationIs(page, '/manage/payroll/detail', dewi);
      await text(page, '77').waitFor();
    });
    await record('History opens prior period detail and back restores original employee context', async () => {
      await button(page, 'Riwayat Penghasilan').click();
      await locationIs(page, '/manage/payroll/history', dewi);
      await text(page, 'Agustus 2026').click();
      await locationIs(page, '/manage/payroll/detail', 'payroll-dewi-aug');
      await text(page, 'Rp 500.000').waitFor();
      await back(page, 'Rincian Penggajian');
      await locationIs(page, '/manage/payroll/history', dewi);
      await back(page, 'Riwayat Penghasilan');
      await locationIs(page, '/manage/payroll/detail', dewi);
    });
    await record('Reload retains edit pathname and ID using documented initial local fixture', async () => {
      await load(page, `/manage/payroll/modify?id=${budi}`, 'Atur Gaji');
      await field(page, 'Gaji Pokok (Bulanan)').waitFor();
      await page.reload({ waitUntil: 'commit', timeout: 600000 });
      await field(page, 'Gaji Pokok (Bulanan)').waitFor({ timeout: 600000 });
      await locationIs(page, '/manage/payroll/modify', budi);
      assert.equal(await field(page, 'Gaji Pokok (Bulanan)').inputValue(), '6000000');
    });
    for (const screen of ['detail', 'modify', 'payment', 'history', 'slip']) {
      await record(`Unknown ID is handled on real ${screen} route`, async () => {
        await load(page, `/manage/payroll/${screen}?id=unknown`, 'Penggajian tidak ditemukan.');
        assert.equal(await button(page, 'Catat Pembayaran').count(), 0);
        assert.equal(await button(page, 'Simpan Pengaturan Gaji').count(), 0);
      });
    }
    await record('Paid fixture deep links block settings and repeat payment', async () => {
      await load(page, `/manage/payroll/modify?id=${dewi}`, 'Pengaturan periode yang sudah dibayar tidak dapat diubah.');
      await load(page, `/manage/payroll/payment?id=${dewi}`, 'Gaji periode ini sudah lunas.');
    });
    await page.context().close();
    ({ page } = await createPage(browser));
    await record('Fresh direct detail link has a usable header back to Payroll list', async () => {
      await load(page, `/manage/payroll/detail?id=${budi}`, 'Rincian Penggajian');
      await back(page, 'Rincian Penggajian');
      await locationIs(page, '/manage/payroll');
      await text(page, 'Daftar Karyawan · 4').waitFor();
    });
    await record('Browser back/forward retains settings ID and restores a usable Payroll list anchor', async () => {
      await text(page, 'Budi Santoso').click();
      await button(page, 'Atur Gaji').click();
      await field(page, 'Gaji Pokok (Bulanan)').waitFor();
      await page.goBack();
      await locationIs(page, '/manage/payroll/detail', budi);
      await page.goForward();
      await field(page, 'Gaji Pokok (Bulanan)').waitFor();
      await locationIs(page, '/manage/payroll/modify', budi);
      assert.equal(await field(page, 'Gaji Pokok (Bulanan)').inputValue(), '6000000');
      await back(page, 'Atur Gaji');
      await locationIs(page, '/manage/payroll');
    });
    await record('A direct-link list anchor can return to Kelola when its own history is empty', async () => {
      await back(page, 'Penggajian');
      await locationIs(page, '/manage');
      await button(page, 'Penggajian').waitFor();
    });
    await page.context().close();
    ({ page } = await createPage(browser, false));
    await record('Unauthenticated direct Payroll link redirects through the app login guard', async () => {
      await page.goto(origin + `/manage/payroll/detail?id=${budi}`, { waitUntil: 'commit', timeout: 600000 });
      await page.waitForURL('**/login', { timeout: 600000 });
      await button(page, 'Masuk').waitFor();
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    const result = { status: 'PASS', passed: checks.length, checks, errors, consoleErrors, apiRequests, head: cp.execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checkedAt: new Date().toISOString(), timezone: 'Asia/Jakarta', scope: 'SDK57 production app entry/auth providers/Expo Router with fixture responses and HTML/CSS boot adapter. SSR, real API/native, backend Payroll permissions and persistence are not verified.' };
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    const hitStack = await page?.evaluate(() => document.elementsFromPoint(36, 32).slice(0, 8).map(element => {
      const ancestors = []; let current = element;
      for (let index = 0; current && index < 5; index++, current = current.parentElement) {
        const style = getComputedStyle(current), box = current.getBoundingClientRect();
        ancestors.push({ tag: current.tagName, class: current.className, inline: current.getAttribute('style'), text: current.textContent?.slice(0, 100), pointerEvents: style.pointerEvents, opacity: style.opacity, zIndex: style.zIndex, position: style.position, box: { x: box.x, y: box.y, w: box.width, h: box.height } });
      }
      return ancestors;
    })).catch(() => []);
    const result = { status: 'FAIL', passed: checks.length, checks, errors, consoleErrors, error: String(error), url: page?.url(), body: await page?.locator('body').innerText().catch(() => ''), hitStack, checkedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify(result, null, 2));
    await page?.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
    throw error;
  } finally {
    clearInterval(progress);
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
