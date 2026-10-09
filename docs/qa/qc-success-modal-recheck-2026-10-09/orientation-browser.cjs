const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const origin = 'http://127.0.0.1:8088', checks = [], errors = [], consoleErrors = [], blocked = [], measurements = [], bundleReceipts = [], pendingReceipts = [];
const proposal = false;
const output = path.join(__dirname, proposal ? 'orientation-proposal' : 'orientation-current');
const entry = 'qc-success-recheck-entry';
const source = proposal ? '.expo/qc-success-modal-candidate.tsx' : 'components/common/SuccessModal.tsx';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (proposal && !fs.existsSync(source)) throw Error('Missing proposal; never fall back to production');
fs.mkdirSync(output, { recursive: true });
const check = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });
const inside = (box, view) => box && box.x >= 0 && box.y >= 0 && box.x + box.width <= view.width + 1 && box.y + box.height <= view.height + 1;
const transport=require("./offline-transport.cjs")(__dirname);
const settle=require("./settle.cjs");
let browser, page, exception;
async function measure(label, viewport) {
  await page.waitForTimeout(650); await settle(page);
  const modal = await page.getByRole('dialog').boundingBox();
  const action = await page.getByRole('button', { name: 'Tutup', exact: true }).boundingBox();
  const detail = await page.getByRole('button', { name: 'Tutup', exact: true }).evaluate(element => {
    const rect = element.getBoundingClientRect();
    let top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    const ancestors = [];
    for (let node = element.parentElement; node; node = node.parentElement) {
      const box = node.getBoundingClientRect(), style = getComputedStyle(node);
      ancestors.push({ tag: node.tagName, overflowY: style.overflowY, clientHeight: node.clientHeight, scrollHeight: node.scrollHeight, top: box.top, bottom: box.bottom });
      if (['hidden', 'auto', 'scroll', 'clip'].includes(style.overflowY)) { top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
    }
    return { visibleHeight: Math.max(0, bottom - top), ancestors };
  });
  check(label + ': whole modal fits viewport', inside(modal, viewport), modal);
  check(label + ': action fully inside viewport', inside(action, viewport), action);
  check(label + ': visible action target at least44px', detail.visibleHeight >= 44, detail);
  measurements.push({ label, viewport, modal, action, ...detail });
  await page.screenshot({ path: path.join(output, label + '.png') });
}
(async () => {
  try {
    browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
    page = await browser.newPage({ viewport: { width: 320, height: 640 }, screen: { width: 844, height: 390 }, colorScheme: 'dark' });
    page.setDefaultTimeout(12000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('response', response => {
      if (response.url().includes(entry + '.bundle')) pendingReceipts.push(response.body().then(bytes => bundleReceipts.push({ path: new URL(response.url()).pathname, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') })));
    });
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin && url.pathname === '/qc-success-orientation') return route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(__dirname, 'web.css'), 'utf8')}</style></head><body><div id="root"></div><script src="${origin}/.expo/${entry}.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>` });
      if (await transport.serve(route,url)) return;
      blocked.push({ path: url.pathname, method: route.request().method() }); return route.abort();
    });
    console.log('Loading current SuccessModal orientation offline; no server');
    await page.goto(origin + '/qc-success-orientation', { waitUntil: 'commit', timeout: 180000 });
    await page.getByTestId('preview-ready').waitFor({ timeout: 180000 });
    for (const kind of ['direct', 'long']) {
      for (const viewport of [{ width: 640, height: 360 }, { width: 844, height: 390 }]) {
        await page.setViewportSize(viewport);
        await page.evaluate(kind => window.codexShowModal(kind), kind);
        await page.getByRole('button', { name: 'Tutup', exact: true }).waitFor();
        await measure(kind + '-' + viewport.width + 'x' + viewport.height, viewport);
        if (kind === 'long') {
          const description = page.getByText('Perubahan pengaturan yang Anda pilih sudah disimpan. Silakan periksa kembali daftar dan detail pada halaman sebelumnya. Jika ingin menyesuaikan data lainnya, tutup pemberitahuan ini lalu lanjutkan dari daftar.', { exact: true });
          const beforeScroll = await page.getByRole('button', { name: 'Tutup', exact: true }).boundingBox();
          const region = await description.evaluate(node => {
            for (let parent = node.parentElement; parent; parent = parent.parentElement) {
              if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight + 2) {
                parent.scrollTop = parent.scrollHeight; window.qcSuccessScrollRegion = parent;
                return { found: true, clientHeight: parent.clientHeight, scrollHeight: parent.scrollHeight };
              }
            }
            return { found: false };
          });
          await page.waitForTimeout(100);
          const reachable = await description.evaluate(node => {
            const region = window.qcSuccessScrollRegion;
            if (!region || !region.contains(node)) return false;
            const box = node.getBoundingClientRect(), area = region.getBoundingClientRect();
            return region.scrollTop > 0 && box.bottom <= area.bottom + 1 && box.bottom >= area.top;
          });
          const afterScroll = await page.getByRole('button', { name: 'Tutup', exact: true }).boundingBox();
          check(kind + '-' + viewport.width + ': scroll region exists for clipped content', region.found, region);
          check(kind + '-' + viewport.width + ': last description line reachable by scrolling', reachable);
          check(kind + '-' + viewport.width + ': footer stays visible and stationary while content scrolls', inside(afterScroll, viewport) && Math.abs(afterScroll.y - beforeScroll.y) <= 1, { beforeScroll, afterScroll });
          await page.screenshot({path:path.join(output,kind+'-'+viewport.width+'x'+viewport.height+'-scrolled.png')});
        }
        // Restore portrait before teardown so clipping cannot turn cleanup into a timeout.
        await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400);
        await page.getByRole('button', { name: 'Tutup', exact: true }).click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
      }
    }
    await page.evaluate(() => window.codexShowModal('long'));
    await page.getByText('Data berhasil diperbarui untuk seluruh pengaturan yang dipilih pada halaman ini', { exact: true }).waitFor();
    await page.getByText('Data berhasil diperbarui untuk seluruh pengaturan yang dipilih pada halaman ini', { exact: true }).evaluate(node => { window.qcOriginalTitleNode = node; });
    const callbacksBefore = await page.evaluate(() => window.codexModalCallbacks.length);
    await page.setViewportSize({ width: 640, height: 360 });
    await measure('long-live-rotate-640x360', { width: 640, height: 360 });
    check('live orientation: same modal/title DOM instance', await page.getByText('Data berhasil diperbarui untuk seluruh pengaturan yang dipilih pada halaman ini', { exact: true }).evaluate(node => node === window.qcOriginalTitleNode));
    check('live orientation: no implicit close callback', await page.evaluate(() => window.codexModalCallbacks.length) === callbacksBefore);
    await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Tutup', exact: true }).click();
    check('live orientation: restored portrait close notifies once', await page.evaluate(() => window.codexModalCallbacks.length) === callbacksBefore + 1);
    check('final: no runtime errors', errors.length === 0, errors);
    check('final: no console errors', consoleErrors.length === 0, consoleErrors);
    check('final: no API/HTTP attempts', blocked.length === 0, blocked);
  } catch (error) { exception = error.message; console.error(exception); if (page) await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {}); }
  finally {
    const receipts = await Promise.allSettled(pendingReceipts);
    const receiptErrors = receipts.filter(x => x.status === 'rejected').map(x => String(x.reason));
    const result = { owner: 'QC', scope: 'SuccessModal horizontal orientation and live resize', tested: proposal ? 'PROPOSAL_ONLY_NOT_APPLIED' : 'CURRENT_PRODUCTION_SOURCE', sourceHash: hash(source), fixtureHash: hash(path.join(__dirname,'modal-entry.fixture.jsx')), offlineBuild:transport.record,offlineReceipts:transport.receipts, checks, passed: checks.filter(x => x.passed).length, failed: checks.filter(x => !x.passed).length, errors, consoleErrors, blocked, exception: exception ?? null, measurements, bundleReceipts, receiptErrors };
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ tested: result.tested, passed: result.passed, failed: result.failed, errors, consoleErrors, blocked, exception, failures: checks.filter(x => !x.passed) }));
    if (browser) await browser.close();
    process.exitCode = result.failed || errors.length || consoleErrors.length || blocked.length || exception || receiptErrors.length ? 1 : 0;
  }
})().catch(error => { console.error(error); process.exitCode = 2; });
