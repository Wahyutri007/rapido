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
    if (auth) localStorage.setItem('auth_token', 'location-router-fixture-only');
    else localStorage.removeItem('auth_token');
  }, authenticated);
  await page.route('**/api/**', route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname.replace(/^\/api/, '');
    apiRequests.push({ method: request.method(), endpoint });
    const data = endpoint === '/user'
      ? { user: { id: 'location-router-owner', name: 'QA Tempat Preview', email: 'qa@example.test', phone: '081200000000', team_id: null, avatar: null }, roles: ['owner'], permissions: [] }
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
  await text(page,'Batal').waitFor({state:'hidden'});
}
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--disable-features=LocalNetworkAccessChecks'] });
  let page;
  const list = '/(cashier)/location', detail = '/(no-layout)/(cashier)/location/detail';
  const params = 'outletId=place-demo-1&areaId=place-demo-1-area-1&placeId=place-demo-1-area-1-place-1';
  try {
    ({ page } = await createPage(browser));
    await load(page, list, 'Tempat Kasir');
    await record('Cashier tab shows an explicit preview selector without choosing a fixture as active store', async () => {
      await text(page,'Pilih outlet untuk melihat tempat.').waitFor();
      assert.equal(await text(page,'Tempat Kasir').count(),1);
      assert.equal(await text(page,'Daftar Tempat · 18').count(),0);
      await page.screenshot({path:path.join(output,'initial-390.png')});
    });
    await record('Selecting preview outlet renders eighteen places and derived activity counts', async () => {
      await choose(page,'Pilih outlet pratinjau','Toko Sushiro');
      await text(page,'Daftar Tempat · 18').waitFor();
      await text(page,'Hasil filter: 17 aktif · 1 nonaktif').waitFor();
    });
    await record('Search trims case and reset restores the selected outlet', async () => {
      await page.getByPlaceholder('Cari nama, area, atau jenis tempat').filter({visible:true}).fill('  KASIR 01  ');
      await text(page,'Daftar Tempat · 1').waitFor();
      await text(page,'Kasir 01').waitFor();
      await button(page,'Reset Pencarian dan Filter').click();
      await text(page,'Daftar Tempat · 18').waitFor();
    });
    await record('Area and effective activity filters combine without cross-area records', async () => {
      await choose(page,'Semua Area','Lantai 1 - Indoor');
      await text(page,'Daftar Tempat · 7').waitFor();
      await choose(page,'Semua Status','Nonaktif');
      await text(page,'Daftar Tempat · 1').waitFor();
      await text(page,'Kursi Tunggu').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,'filtered-390.png')});
    });
    await record('Place detail preserves outlet, area and place IDs and recorded capacity', async () => {
      await text(page,'Kursi Tunggu').click();
      await text(page,'Detail Tempat').waitFor();
      await text(page,'10 kursi').waitFor();
      await page.waitForFunction(() => new URL(location.href).searchParams.get('placeId') === 'place-demo-1-area-1-place-5');
      await text(page,'Tempat dinonaktifkan pada pengaturan tempat. Status ini belum menunjukkan meja kosong, terisi, atau reservasi.').waitFor();
      await page.screenshot({path:path.join(output,'detail-390.png')});
    });
    await record('Back retains filters and tab navigation returns to the place list', async () => {
      await back(page,'Detail Tempat');
      await text(page,'Tempat Kasir').waitFor();
      await text(page,'Daftar Tempat · 1').waitFor();
      await button(page,'Reset Pencarian dan Filter').click();
      await text(page,'Daftar Tempat · 18').waitFor();
      await text(page,'Tagihan').last().click();
      await text(page,'Bill').waitFor();
      await text(page,'Tempat').last().click();
      await text(page,'Daftar Tempat · 18').waitFor();
      assert.equal(await text(page,'Tempat Kasir').count(),1);
    });
    await record('Changing outlet clears draft filters and does not retain a foreign area', async () => {
      await choose(page,'Semua Area','Lantai 1 - Indoor');
      await choose(page,'Toko Sushiro','Outlet Bandung');
      await text(page,'Daftar Tempat · 12').waitFor();
      await text(page,'Semua Area').waitFor();
      await text(page,'Semua Status').waitFor();
    });
    await record('Inactive outlet yields only inactive places and active filter empty state', async () => {
      await choose(page,'Outlet Bandung','Warehouse Pusat');
      await text(page,'Daftar Tempat · 4').waitFor();
      await text(page,'Hasil filter: 0 aktif · 4 nonaktif').waitFor();
      await choose(page,'Semua Status','Aktif');
      await text(page,'Daftar Tempat · 0').waitFor();
      await text(page,'Tidak ada tempat yang cocok dengan pencarian dan filter.').waitFor();
      await button(page,'Reset Pencarian dan Filter').click();
      await text(page,'Daftar Tempat · 4').waitFor();
    });
    await record('Direct invalid outlet stays unselected and can recover using the selector', async () => {
      await load(page,list+'?outletId=unknown','Outlet pratinjau tidak ditemukan. Pilih outlet yang tersedia.');
      await choose(page,'Pilih outlet pratinjau','Toko Sushiro');
      await text(page,'Daftar Tempat · 18').waitFor();
    });
    await record('Forged cross-outlet detail does not show a first-record fallback', async () => {
      await load(page,detail+'?'+params.replace('outletId=place-demo-1','outletId=place-demo-2'),'Tempat tidak ditemukan.');
      await button(page,'Kembali ke Daftar Tempat').click();
      await text(page,'Daftar Tempat · 12').waitFor();
    });
    await record('Fresh direct detail reload and header fallback return to the matching preview outlet', async () => {
      const fresh = await createPage(browser); page = fresh.page;
      await load(page,detail+'?'+params,'Detail Tempat');
      await text(page,'4 kursi').waitFor();
      await page.reload({waitUntil:'commit',timeout:600000});
      await text(page,'4 kursi').waitFor({timeout:600000});
      await back(page,'Detail Tempat');
      await text(page,'Tempat Kasir').waitFor();
      await text(page,'Daftar Tempat · 18').waitFor();
    });
    for(const viewport of [{width:320,height:640},{width:844,height:390}]) {
      await record(`List, bottom tab and missing action remain reachable at ${viewport.width}x${viewport.height}`,async () => {
        await page.setViewportSize(viewport);
        await load(page,list+'?outletId=place-demo-1','Daftar Tempat · 18');
        const search = page.getByPlaceholder('Cari nama, area, atau jenis tempat').filter({visible:true});
        await search.scrollIntoViewIfNeeded();
        const box=await search.boundingBox(); assert.ok(box.x>=15 && box.x+box.width<=viewport.width-15);
        await search.fill('toilet'); await text(page,'Daftar Tempat · 1').waitFor();
        const row=text(page,'Toilet'); await row.scrollIntoViewIfNeeded();
        await row.click(); await text(page,'2 unit').waitFor();
        await page.screenshot({path:path.join(output,`detail-${viewport.width}x${viewport.height}.png`)});
        await back(page,'Detail Tempat'); await text(page,'Daftar Tempat · 1').waitFor();
        await page.screenshot({path:path.join(output,`list-${viewport.width}x${viewport.height}.png`)});
        await load(page,detail+'?placeId=unknown','Tempat tidak ditemukan.');
        const action=button(page,'Kembali ke Daftar Tempat'); await action.scrollIntoViewIfNeeded();
        const ab=await action.boundingBox(); assert.ok(ab.x>=0 && ab.x+ab.width<=viewport.width+1 && ab.y>=0 && ab.y+ab.height<=viewport.height+1);
        await action.click(); await text(page,'Pilih outlet untuk melihat tempat.').waitFor();
      });
    }
    assert.deepEqual(errors,[]); assert.deepEqual(consoleErrors,[]);
    assert.equal(apiRequests.filter(request=>!['GET','OPTIONS'].includes(request.method)).length,0);
    const result={status:'PASS',passed:checks.length,checks,errors,consoleErrors,apiRequests,checkedAt:new Date().toISOString(),scope:'Production app entry/providers/Expo Router; isolated owner/token/API and HTML/CSS boot fixtures. Existing design store read-only; no backend mutations or native/Figma certification.'};
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));
  } catch(error) {
    fs.writeFileSync(path.join(output,'browser-failure.json'),JSON.stringify({status:'FAIL',checks,error:error.stack,currentUrl:page?.url(),errors,consoleErrors,apiRequests},null,2));
    if(page) await page.screenshot({path:path.join(output,'browser-failure.png')}).catch(()=>{});
    throw error;
  } finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1});


