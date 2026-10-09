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
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--disable-features=LocalNetworkAccessChecks']});
 try {
  const {page}=await createPage(browser);
  await load(page,'/(cashier)/location?outletId=place-demo-1','Daftar Tempat · 18');
  await page.getByPlaceholder('Cari nama, area, atau jenis tempat').fill('tunggu');
  await text(page,'Daftar Tempat · 1').waitFor();
  const row=text(page,'Kursi Tunggu'); await row.scrollIntoViewIfNeeded();
  await row.evaluate(element=>{for(let parent=element.parentElement;parent;parent=parent.parentElement){const style=getComputedStyle(parent);if(['auto','scroll'].includes(style.overflowY)&&parent.scrollHeight>parent.clientHeight){parent.scrollTop=parent.scrollHeight;break;}}});
  await page.waitForFunction(()=>{const nodes=[...document.querySelectorAll('[tabindex="0"]')];return nodes.some(node=>node.textContent.includes('Kursi Tunggu')&&node.getBoundingClientRect().bottom<=innerHeight-80);});
  const card=row.locator('xpath=ancestor::*[@tabindex="0"][1]'); const box=await card.boundingBox(); assert.ok(box.y>=64&&box.y+box.height<=844-80); assert.ok(box.x>=15&&box.x+box.width<=375);
  await page.screenshot({path:path.join(output,'list-row-390.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
  fs.writeFileSync(path.join(output,'capture-results.json'),JSON.stringify({status:'PASS',cardBox:box,viewport:{width:390,height:844},checks:['Full place row scrolls above fixed bottom tabs with sixteen-pixel horizontal margins'],errors,consoleErrors,checkedAt:new Date().toISOString()},null,2));
  console.log('PASS: full row visible above bottom tabs');
 } finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1});
