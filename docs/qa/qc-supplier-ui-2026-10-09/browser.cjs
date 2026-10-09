const fs = require('node:fs'), path = require('node:path');
const { chromium } = require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const origin = 'http://127.0.0.1:8088', output = __dirname;
const checks = [], errors = [], consoleErrors = [], warnings = [], blockedRequests = [], metrics = [];
const check = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });
const fits = (rect, viewport, vertical = true) => rect && rect.x >= -1 && rect.x + rect.width <= viewport.width + 1 && (!vertical || (rect.y >= -1 && rect.y + rect.height <= viewport.height + 1));
let browser, page, exception, mode = 'long';
const html = () => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(output, 'web-before.css'), 'utf8')}</style></head><body><div id="root"></div><script>window.qcSupplierUiMode='${mode}';</script><script src="${origin}/.expo/qc-supplier-ui-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>`;
(async () => {
  try {
    browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
    page = await browser.newPage({ viewport: { width: 320, height: 640 }, colorScheme: 'dark' }); page.setDefaultTimeout(12000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); if (message.type() === 'warning') warnings.push(message.text()); });
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin && (url.pathname === '/inventory/suppliers' || url.pathname.startsWith('/inventory/suppliers/'))) return route.fulfill({ status: 200, contentType: 'text/html', body: html() });
      if (url.origin === origin && (url.pathname.includes('.bundle') || url.pathname.startsWith('/assets/') || url.pathname.endsWith('.css'))) return route.continue();
      blockedRequests.push({ path: url.pathname, method: route.request().method() }); return route.abort();
    });
    const go = async (route, nextMode = 'long') => { mode = nextMode; await page.goto(origin + route, { waitUntil: 'commit', timeout: 180000 }); await page.waitForFunction(() => Boolean(window.qcSupplierUi), null, { timeout: 180000 }); };
    const capture = async name => { await page.waitForTimeout(700); await page.screenshot({ path: path.join(output, name + '.png') }); metrics.push({ name, viewport: page.viewportSize(), page: await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, light: document.documentElement.classList.contains('light') })) }); };
    const rect = element => element.getBoundingClientRect().toJSON();
    console.log('Loading actual Supplier components/layout on existing Metro8088');
    for (const viewport of (process.argv.includes('--remaining-only') ? [] : [{ width: 320, height: 640 }, { width: 360, height: 780 }, { width: 390, height: 844 }, { width: 768, height: 1024 }])) {
      await page.setViewportSize(viewport); await go('/inventory/suppliers');
      await page.getByRole('button', { name: 'Tambah Pemasok', exact: true }).waitFor(); await page.waitForTimeout(650);
      const add = await page.getByRole('button', { name: 'Tambah Pemasok', exact: true }).boundingBox();
      check(`list${viewport.width}: CTA visible and height>=44`, fits(add, viewport) && add.height >= 44, add);
      check(`list${viewport.width}: page has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const totals = await page.getByText('Total Pembelian', { exact: true }).evaluateAll(elements => elements.map(element => {
        const row = element.parentElement.parentElement, left = row.firstElementChild, right = row.lastElementChild;
        const rect = node => node.getBoundingClientRect().toJSON();
        return { row: rect(row), label: rect(left), amount: rect(right), text: right.textContent };
      }));
      check(`list${viewport.width}: totals fit their card rows`, totals.length === 2 && totals.every(({ row, amount, label }) => amount.x + amount.width <= row.x + row.width + 1 && label.x + label.width <= amount.x + 1), totals);
      const names = await page.getByRole('button', { name: /^Detail / }).evaluateAll(elements => elements.map(element => {
        const text = Array.from(element.querySelectorAll('div')).find(node => node.textContent === 'Pemasok Distribusi Bahan Baku dan Perlengkapan Usaha dengan Nama Panjang');
        return text ? { rect: text.getBoundingClientRect().toJSON(), scrollWidth: text.scrollWidth, clientWidth: text.clientWidth, textOverflow: getComputedStyle(text).textOverflow } : null;
      }).filter(Boolean));
      check(`list${viewport.width}: long name keeps readable width`, names.length === 1 && names[0].rect.width >= 40, names);
      await capture('list-' + viewport.width);
      await page.getByRole('button', { name: 'Aksi Pemasok Distribusi Bahan Baku dan Perlengkapan Usaha dengan Nama Panjang', exact: true }).click();
      await page.getByText('Edit Pemasok', { exact: true }).waitFor(); await page.waitForTimeout(700);
      const sheetAction = await page.getByText('Hapus Pemasok', { exact: true }).boundingBox();
      check(`actions${viewport.width}: last action fits viewport`, fits(sheetAction, viewport), sheetAction); await capture('actions-' + viewport.width);

      await go('/inventory/suppliers/detail?id=qc-long'); await page.getByText('Informasi Pemasok', { exact: true }).waitFor(); await page.waitForTimeout(650);
      const edit = await page.getByRole('button', { name: 'Edit', exact: true }).boundingBox(), remove = await page.getByRole('button', { name: 'Hapus', exact: true }).boundingBox();
      check(`detail${viewport.width}: both actions fit viewport`, fits(edit, viewport) && fits(remove, viewport), { edit, remove });
      const rowMetrics = [];
      for (const label of ['Nama Pemasok', 'Alamat', 'No. Telepon', 'Email', 'Provinsi', 'Kota', 'Kecamatan', 'Kode Pos']) {
        const locator = page.getByText(label, { exact: true }); await locator.scrollIntoViewIfNeeded();
        rowMetrics.push(await locator.evaluate(element => {
          const row = element.parentElement.parentElement, left = row.firstElementChild, value = row.lastElementChild;
          const rect = node => node.getBoundingClientRect().toJSON();
          return { label: element.textContent, row: rect(row), left: rect(left), value: rect(value), valueText: value.textContent };
        }));
      }
      check(`detail${viewport.width}: values stay inside rows without overlap`, rowMetrics.every(({ row, left, value }) => left.x + left.width <= value.x + 1 && value.x + value.width <= row.x + row.width + 1), rowMetrics);
      await page.getByText('Informasi Pemasok', { exact: true }).scrollIntoViewIfNeeded(); await capture('detail-' + viewport.width);

      await go('/inventory/suppliers/modify'); await page.getByPlaceholder('Masukkan nama pemasok').waitFor();
      const save = await page.getByRole('button', { name: 'Simpan', exact: true }).boundingBox();
      check(`form${viewport.width}: sticky save fits viewport`, fits(save, viewport), save);
      const fields = await page.locator('input,textarea').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()));
      check(`form${viewport.width}: text inputs fit width`, fields.length >= 4 && fields.every(field => field.x >= 0 && field.x + field.width <= viewport.width + 1), fields);
      await page.getByPlaceholder('Masukkan kode pos').scrollIntoViewIfNeeded();
      const postal = await page.getByPlaceholder('Masukkan kode pos').boundingBox();
      check(`form${viewport.width}: last input scrolls above sticky save`, postal && postal.y >= 0 && postal.y + postal.height <= save.y + 1, { postal, save });
      await capture('form-bottom-' + viewport.width); await page.getByPlaceholder('Masukkan nama pemasok').scrollIntoViewIfNeeded(); await capture('form-top-' + viewport.width);
      console.log(`Viewport${viewport.width} checked`);
    }

    await page.setViewportSize({ width: 320, height: 640 });
    if (!process.argv.includes('--remaining-only')) {
    await go('/inventory/suppliers', 'normal'); await page.getByPlaceholder('Cari...').waitFor(); await page.getByPlaceholder('Cari...').fill('qa-pemasok-tidak-ada');
    await page.getByText('Tidak ada pemasok ditemukan', { exact: true }).waitFor(); check('search320: no result message visible', true); await capture('search-empty-320');
    await go('/inventory/suppliers', 'empty'); await page.getByText('Tidak ada pemasok ditemukan', { exact: true }).waitFor(); check('list320: truly empty state visible', true); await capture('empty-320');
    await go('/inventory/suppliers/modify?id=missing'); await page.getByText('Pemasok tidak ditemukan', { exact: true }).waitFor(); check('edit missing ID: explicit placeholder', true); await capture('edit-missing-320');
    await go('/inventory/suppliers/detail?id=missing'); await page.getByText('Pemasok tidak ditemukan', { exact: true }).waitFor(); check('detail missing ID: explicit placeholder', true);
    await go('/inventory/suppliers/modify'); await page.getByPlaceholder('Masukkan nama pemasok').waitFor(); await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page.getByText('Nama pemasok wajib diisi', { exact: true }).waitFor();
    const missing = ['Nama pemasok wajib diisi', 'Alamat wajib diisi', 'No. telepon wajib diisi', 'Alamat email wajib diisi', 'Provinsi wajib diisi', 'Kota wajib diisi', 'Kecamatan wajib diisi'];
    check('form320: required fields each have visible error copy', (await Promise.all(missing.map(text => page.getByText(text, { exact: true }).count()))).every(count => count === 1)); await capture('required-errors-320');
    await page.getByPlaceholder('Masukkan alamat email').fill('salah-email'); await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page.getByText('Masukkan alamat email yang valid', { exact: true }).waitFor(); check('form320: malformed email feedback rendered', true);
    }

    await go('/inventory/suppliers/modify?id=qc-long'); await page.getByPlaceholder('Masukkan nama pemasok').waitFor();
    const seed = await page.evaluate(() => window.qcSupplierUi.long);
    check('edit320: all contact values are prefilled', await page.getByPlaceholder('Masukkan nama pemasok').inputValue() === seed.name && await page.getByPlaceholder('Masukkan alamat pemasok').inputValue() === seed.address && await page.getByPlaceholder('Masukkan nomor telepon').inputValue() === seed.phone && await page.getByPlaceholder('Masukkan alamat email').inputValue() === seed.email);
    await page.getByText('Riau', { exact: true }).scrollIntoViewIfNeeded(); await page.getByText('Riau', { exact: true }).click();
    await page.getByText('Provinsi', { exact: true }).last().waitFor(); await page.waitForTimeout(650);
    // This production SingleSelect commits immediately on item tap; confirmationMode is off.
    const done = await page.getByText('Batal', { exact: true }).boundingBox(); check('region picker320: cancel action fits viewport', fits(done, page.viewportSize()), done); await capture('region-picker-320');
    await page.getByText('Batal', { exact: true }).click();
    await page.getByRole('button', { name: 'Simpan', exact: true }).click(); await page.getByText('Pemasok Berhasil Diperbarui', { exact: true }).waitFor(); await page.waitForTimeout(700);
    const success = await page.getByRole('button', { name: 'Lihat Detail', exact: true }).boundingBox(); check('success320: detail action visible inside viewport', fits(success, page.viewportSize()), success); await capture('success-320');
    const recordModal = async name => {
      const state = await page.getByRole('dialog').evaluate(element => {
        const content = element.querySelector('[class*="max-w-"]');
        const images = Array.from(element.querySelectorAll('img,[role="img"]')).map(node => ({ tag: node.tagName, rect: node.getBoundingClientRect().toJSON(), style: node.getAttribute('style') }));
        return { content: content ? content.getBoundingClientRect().toJSON() : null, images };
      }); fs.writeFileSync(path.join(output, name + '-dom.json'), JSON.stringify(state, null, 2) + '\n');
    };
    await recordModal('success');
    // For clipped buttons, a DOM click continues the callback checks; it does not certify touch access.
    const clickAction = async locator => { const box = await locator.boundingBox(); if (fits(box, page.viewportSize())) await locator.click(); else await locator.evaluate(element => element.click()); };
    await clickAction(page.getByRole('button', { name: 'Lihat Detail', exact: true })); await page.getByText('Informasi Pemasok', { exact: true }).waitFor(); check('success callback: detail route rendered', true);
    await page.getByRole('button', { name: 'Hapus', exact: true }).click(); await page.getByText('Data ini akan dihapus dan tidak dapat digunakan lagi.', { exact: true }).waitFor(); await page.waitForTimeout(700);
    const confirm = page.getByRole('dialog').getByRole('button', { name: 'Hapus', exact: true });
    const confirmBox = await confirm.boundingBox(); check('delete320: confirm button inside viewport', fits(confirmBox, page.viewportSize()), confirmBox); await capture('delete-long-name-320');
    await recordModal('delete');
    await clickAction(page.getByRole('dialog').getByRole('button', { name: 'Batal', exact: true }));
    check('delete cancel: supplier retained', (await page.evaluate(() => window.qcSupplierUi.suppliers())).some(item => item.id === 'qc-long'));
    await page.evaluate(() => window.qcSupplierUi.seed('protected')); await page.getByRole('button', { name: 'Hapus', exact: true }).click();
    await clickAction(page.getByRole('dialog').getByRole('button', { name: 'Hapus', exact: true })); await page.getByText('Pemasok belum dapat dihapus', { exact: true }).waitFor(); await page.waitForTimeout(650);
    const alert = await page.getByRole('button', { name: 'Mengerti', exact: true }).boundingBox(); check('protected delete320: error button fits viewport', fits(alert, page.viewportSize()), alert); check('protected delete: reason text shown', await page.getByText('Pemasok masih digunakan pada pesanan pembelian', { exact: true }).count() === 1); await capture('protected-delete-320');
    check('no browser exceptions', errors.length === 0, errors); check('no console errors', consoleErrors.length === 0, consoleErrors); check('no HTTP API attempts', blockedRequests.length === 0, blockedRequests);
  } catch (error) {
    exception = error.message; process.exitCode = 1; console.error(error.message);
    if (page) { await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {}); fs.writeFileSync(path.join(output, 'failure.txt'), await page.locator('body').innerText().catch(() => '')); }
  } finally {
    const result = { executionMode: 'APPLICATION_SOURCES', scope: 'Supplier UI with actual feature/routes/layout/JSStack/store/RHF/Zod and browser-local sample state', checks, passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length, errors, consoleErrors, warnings, blockedRequests, exception, metrics, limitations: 'Backend deferred. No native/Figma/global root auth/all shared callers/API persistence/accessibility/OS keyboard certification.' };
    fs.writeFileSync(path.join(output, process.argv.includes('--remaining-only') ? 'browser-remainder-results.json' : 'browser-results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ passed: result.passed, failed: result.failed, errors, consoleErrors: consoleErrors.length, exception }));
    if (browser) await browser.close(); if (result.failed || errors.length || exception) process.exitCode = 1;
  }
})().catch(error => { console.error(error); process.exitCode = 2; });
