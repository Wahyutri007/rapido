/* Run from the app root with Metro on ORIGIN (default port 8097).
 * Uses production app entry/providers/router and isolated browser API fixtures.
 * No real login, payments, backend mutations or app-store test hooks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.resolve('.expo/payroll-qa-tools/node_modules/playwright'));
const origin = process.env.ORIGIN || 'http://127.0.0.1:8097';
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
    if (auth) localStorage.setItem('auth_token', 'target-router-fixture-only');
    else localStorage.removeItem('auth_token');
  }, authenticated);
  await page.route('**/api/**', route => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname.replace(/^\/api/, '');
    apiRequests.push({ method: request.method(), endpoint });
    const data = endpoint === '/user'
      ? { user: { id: 'target-router-owner', name: 'QA Absensi Preview', email: 'qa@example.test', phone: '081200000000', team_id: null, avatar: null }, roles: ['owner'], permissions: [] }
      : [];
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ success: true, status: 200, message: 'OK', data }) });
  });
  return { page, context };
}
async function load(page, pathname, readyText) {
  console.log('LOAD ' + pathname);
  await page.goto(origin + pathname, { waitUntil: 'commit', timeout: 600000 });
  const diagnostic = setTimeout(() => page.locator('body').innerText().then(body => console.log(JSON.stringify({startupBody:body.slice(-1800),apiRequests}))).catch(() => {}), 20000);
  try { await text(page, readyText).first().waitFor({ timeout: 300000 }); }
  finally { clearTimeout(diagnostic); }
}
async function choose(page, current, option) {
  await text(page, current).first().click();
  await text(page, option).last().click();
}

async function main() {
  console.log('START Target router check');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--disable-features=LocalNetworkAccessChecks'] });
  console.log('Browser launched');
  let page;
  const field = label => page.getByLabel(label, { exact: true }).filter({ visible: true });
  const firstId = 'target-demo-1', secondId = 'target-demo-2';
  try {
    ({ page } = await createPage(browser));
    await load(page, '/manage', 'Kelola');
    await record('Kelola opens production Target Penjualan list with one active header', async () => {
      await button(page, 'Target Penjualan').click();
      await text(page, 'Target Sushiro').waitFor();
      await locationIs(page, '/manage/sales-target');
      assert.equal(await text(page, 'Target Penjualan').count(), 1);
      await page.screenshot({ path: path.join(output, 'list-390.png') });
    });
    await record('Trimmed search selects one target without changing its record', async () => {
      await page.getByPlaceholder('Cari target penjualan...').filter({visible:true}).fill('  Sushiro  ');
      await text(page, 'Target Warung Jul Panam').waitFor({ state: 'hidden' });
      await text(page, 'Target Sushiro').waitFor();
    });
    await record('List opens detail with correct target ID and product totals', async () => {
      await text(page, 'Target Sushiro').click();
      await text(page, 'Detail Target').waitFor();
      await locationIs(page, '/manage/sales-target/detail', firstId);
      await text(page, '200 unit dari 2 produk').waitFor();
      await text(page, 'Rp 8.000.000').waitFor();
      await page.screenshot({ path: path.join(output, 'detail-390.png') });
    });
    await record('Detail opens edit form with correct title, ID and original draft', async () => {
      await button(page, 'Edit Target').click();
      await text(page, 'Edit Target').waitFor();
      await locationIs(page, '/manage/sales-target/modify', firstId);
      assert.equal(await field('Nama Target').inputValue(), 'Target Sushiro');
      assert.equal(await field('Kuantitas 1').inputValue(), '120');
    });
    await record('Saving preview edit updates same target then header returns to its detail', async () => {
      await field('Nama Target').fill('Target Sushiro QA Navigasi');
      await button(page, 'Simpan Target').click();
      await text(page, 'Target Disimpan').waitFor();
      await button(page, 'Mengerti').click();
      await button(page, 'Mengerti').waitFor({ state: 'hidden' });
      await back(page, 'Edit Target');
      await locationIs(page, '/manage/sales-target/detail', firstId);
      await text(page, 'Target Sushiro QA Navigasi').waitFor();
    });
    await record('Detail back restores list search and saved target once', async () => {
      await back(page, 'Detail Target');
      await locationIs(page, '/manage/sales-target');
      assert.equal(await page.getByPlaceholder('Cari target penjualan...').filter({visible:true}).inputValue(), '  Sushiro  ');
      assert.equal(await text(page, 'Target Sushiro QA Navigasi').count(), 1);
      await page.getByPlaceholder('Cari target penjualan...').filter({visible:true}).fill('');
      await text(page, 'Target Warung Jul Panam').waitFor();
    });
    await record('Add after editing has empty ID, correct title and fresh draft', async () => {
      await button(page, 'Tambah Target').click();
      await text(page, 'Tambah Target').waitFor();
      await locationIs(page, '/manage/sales-target/modify');
      assert.equal(new URL(page.url()).searchParams.has('id'), false);
      assert.equal(await field('Nama Target').inputValue(), '');
      await field('Nama Target').fill('Draft belum disimpan');
      await back(page, 'Tambah Target');
      await text(page, 'Target Sushiro QA Navigasi').waitFor();
      assert.equal(await text(page, 'Draft belum disimpan').count(), 0);
    });
    await record('Second target opens category detail and prefill without first ID leaking', async () => {
      await text(page, 'Target Warung Jul Panam').click();
      await text(page, 'Detail Target').waitFor();
      await locationIs(page, '/manage/sales-target/detail', secondId);
      await text(page, 'Per Kategori').waitFor();
      await button(page, 'Edit Target').click();
      await text(page, 'Edit Target').waitFor();
      await locationIs(page, '/manage/sales-target/modify', secondId);
      assert.equal(await field('Nama Target').inputValue(), 'Target Warung Jul Panam');
      assert.equal(await field('Kuantitas 1').count(), 0);
      await back(page, 'Edit Target');
      await back(page, 'Detail Target');
      await back(page, 'Target Penjualan');
      await locationIs(page, '/manage');
    });
    await record('Direct detail reload preserves target ID then exits through list to Kelola', async () => {
      await load(page, '/manage/sales-target/detail?id='+firstId, 'Detail Target');
      await text(page, 'Target Sushiro').waitFor();
      await page.reload({waitUntil:'commit',timeout:600000});
      await text(page, 'Detail Target').waitFor({timeout:600000});
      await locationIs(page, '/manage/sales-target/detail', firstId);
      await back(page, 'Detail Target');
      await locationIs(page, '/manage/sales-target');
      await back(page, 'Target Penjualan');
      await locationIs(page, '/manage');
    });
    await record('Direct edit reload retains edit title, ID and prefill', async () => {
      await load(page, '/manage/sales-target/modify?id='+secondId, 'Edit Target');
      assert.equal(await field('Nama Target').inputValue(), 'Target Warung Jul Panam');
      await page.reload({waitUntil:'commit',timeout:600000});
      await text(page, 'Edit Target').waitFor({timeout:600000});
      await locationIs(page, '/manage/sales-target/modify', secondId);
      assert.equal(await field('Nama Target').inputValue(), 'Target Warung Jul Panam');
      await page.screenshot({path:path.join(output,'edit-390.png')});
      await back(page, 'Edit Target');
      await locationIs(page, '/manage/sales-target');
    });
    await record('Direct add has empty draft and a working list fallback', async () => {
      await load(page, '/manage/sales-target/modify', 'Tambah Target');
      assert.equal(await field('Nama Target').inputValue(), '');
      await back(page, 'Tambah Target');
      await locationIs(page, '/manage/sales-target');
    });
    for(const screen of ['detail','modify']) {
      await record(`Unknown ID on ${screen} is guarded with a reachable header back`, async () => {
        await load(page, '/manage/sales-target/'+screen+'?id=missing', 'Target penjualan tidak ditemukan.');
        if(screen==='modify') assert.equal(await field('Nama Target').count(),0);
        await back(page, screen==='modify'?'Edit Target':'Detail Target');
        await locationIs(page, '/manage/sales-target');
      });
    }
    await record('Browser back and forward preserve target identity and usable headers', async () => {
      await text(page,'Target Sushiro').click();
      await locationIs(page,'/manage/sales-target/detail',firstId);
      await page.goBack();
      await locationIs(page,'/manage/sales-target');
      await page.goForward();
      await locationIs(page,'/manage/sales-target/detail',firstId);
      await text(page,'Target Sushiro').waitFor();
      await back(page,'Detail Target');
      await back(page,'Target Penjualan');
      await locationIs(page,'/manage');
    });
    for(const viewport of [{width:320,height:844},{width:844,height:390}]) {
      await record(`List and form actions stay clickable at ${viewport.width}x${viewport.height}`,async()=>{
        await page.setViewportSize(viewport);
        await load(page,'/manage/sales-target','Target Sushiro');
        await button(page,'Tambah Target').click({trial:true});
        const searchBox=await page.getByPlaceholder('Cari target penjualan...').filter({visible:true}).boundingBox();
        assert.ok(searchBox.x>=15 && searchBox.x+searchBox.width<=viewport.width-15);
        await page.screenshot({path:path.join(output,`list-${viewport.width}x${viewport.height}.png`)});
        await button(page,'Tambah Target').click();
        await text(page,'Tambah Target').waitFor();
        await button(page,'Simpan Target').click({trial:true});
        const box=await button(page,'Simpan Target').boundingBox();
        assert.ok(box.x>=0 && box.x+box.width<=viewport.width+1 && box.y>=0 && box.y+box.height<=viewport.height+1);
        await page.screenshot({path:path.join(output,`add-${viewport.width}x${viewport.height}.png`)});
        await back(page,'Tambah Target');
        await locationIs(page,'/manage/sales-target');
      });
    }
    await record('Unauthenticated direct target route redirects to login without feature access',async()=>{
      const guest=await createPage(browser,false);
      await load(guest.page,'/manage/sales-target/detail?id='+firstId,'Masuk');
      await locationIs(guest.page,'/login');
      assert.equal(await text(guest.page,'Target Sushiro').count(),0);
      await guest.context.close();
    });
    assert.deepEqual(errors,[]); assert.deepEqual(consoleErrors,[]);
    assert.equal(apiRequests.filter(r=>!['GET','OPTIONS'].includes(r.method)).length,0);
    const result={status:'PASS',passed:checks.length,checks,errors,consoleErrors,apiRequests,checkedAt:new Date().toISOString(),scope:'Production app entry/providers/guard/ExpoRouter with isolated auth/API fixtures and HTML/CSS boot adapter. Target fixture/session store, no backend/native/SSR/Figma certification.'};
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2)+'\n'); console.log(JSON.stringify(result));
  }catch(error){
    fs.writeFileSync(path.join(output,'browser-failure.json'),JSON.stringify({status:'FAIL',passed:checks.length,checks,errors,consoleErrors,error:String(error),url:page?.url(),body:await page?.locator('body').innerText().catch(()=>''),checkedAt:new Date().toISOString()},null,2));
    await page?.screenshot({path:path.join(output,'browser-failure.png')}).catch(()=>{}); throw error;
  }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});


