const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.resolve('.expo/qc-startup-tools/node_modules/playwright-core'));
const root = path.resolve(__dirname, '../../..');
fs.copyFileSync(path.join(__dirname,'preview-entry.fixture.jsx'),path.join(root,'.expo/qc-manage-forms-entry.jsx'));
const output = __dirname;
fs.mkdirSync(output, { recursive: true });
const checks = [], errors = [], writes = [];
const configs = [
  { name: 'extra', title: 'Biaya Tambahan', original: 'Biaya Layanan', selected: ['Layanan','Persentase'], message: 'Nama biaya tambahan tidak boleh kosong' },
  { name: 'order-type', title: 'Tipe Pesanan', original: 'Dine-In', selected: ['Dine-In','Tidak ada'], message: 'Nama tipe pesanan tidak boleh kosong' },
  { name: 'payment-method', title: 'Metode Pembayaran', original: 'Transfer Bank', selected: ['Transfer Bank','Persentase','BCA'], message: 'Nama metode pembayaran tidak boleh kosong' },
  { name: 'tax', title: 'Pajak', original: 'PPN', selected: ['PPN','Harga Produk Sudah Termasuk Pajak','Tidak Dibulatkan'], message: 'Nama pajak tidak boleh kosong' },
];
function check(name, passed) { checks.push({ name, passed: Boolean(passed) }); if (!passed) throw new Error(name); }
const sourceFiles = configs.map(c => `app/(no-layout)/manage/${c.name}/modify.tsx`)
  .concat(fs.readdirSync(path.join(root,'components/feature/manage/settings')).filter(n=>n.endsWith('.tsx')).map(n=>`components/feature/manage/settings/${n}`));
const sourceHashes = Object.fromEntries(sourceFiles.map(name => [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]));
let browser, page;
async function go(name, id) { await page.evaluate(({name,id})=>window.manageNavigate(name,id),{name,id}); await page.waitForTimeout(250); }
(async () => {
  try {
    browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args:['--disable-features=LocalNetworkAccessChecks'] });
    page = await browser.newPage({ viewport:{width:390,height:844}, deviceScaleFactor:1 });
    page.setDefaultTimeout(30000);
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
    page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push({method:r.method(),url:r.url()});});
    page.on('response',r=>{if(r.url().includes('.bundle')&&r.status()>=400)errors.push(`Bundle HTTP ${r.status()}`);});
    await page.route('http://127.0.0.1:8111/forms-preview', async route => {
      const css = fs.readFileSync(path.join(root,'node_modules/react-native-css-interop/.cache/web.css'),'utf8');
      const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}'+css+'</style></head><body><div id="root"></div><script src="http://127.0.0.1:8111/.expo/qc-manage-forms-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>';
      await route.fulfill({status:200,contentType:'text/html',body:html});
    });
    await page.goto('http://127.0.0.1:8111/forms-preview',{waitUntil:'commit',timeout:600000});
    await page.getByText('Pilih form',{exact:true}).waitFor({timeout:600000});

    const params = async id => {
      await page.evaluate(id => window.qcManageSetParams(id), id);
      await page.waitForTimeout(250);
    };
    const values = () => page.locator('input').evaluateAll(inputs => inputs.map(input => input.value));
    for (const c of configs) {
      console.log('QC params '+c.name);
      await go(c.name, '1');
      const name = page.locator('input').first();
      await page.waitForFunction(expected => document.querySelector('input')?.value === expected, c.original);
      check(c.name+': initial snapshot uses record 1', await name.inputValue() === c.original);
      await name.fill('QC '+c.name);
      const numeric = c.name === 'extra' ? 1 : c.name === 'payment-method' ? 1 : c.name === 'tax' ? 2 : null;
      if (numeric !== null) await page.locator('input').nth(numeric).fill('17');
      const draft = await values();
      await page.evaluate(() => window.manageRerender());
      check(c.name+': same-ID params preserve every text/numeric draft', JSON.stringify(await values()) === JSON.stringify(draft));
      await page.getByRole('button', {name:'Periksa Data',exact:true}).click();
      await page.getByText('Data '+c.title.toLowerCase()+' valid',{exact:true}).waitFor();
      check(c.name+': preview result states changes are unsaved', await page.getByText('Data form telah diperiksa. Perubahan pada pratinjau ini belum disimpan.',{exact:true}).count() === 1);
      await params(undefined);
      await page.waitForFunction(() => document.querySelector('input')?.value === '');
      check(c.name+': setParams edit to create resets every draft field', (await values()).every(value => value === '' || value === '0'));
      check(c.name+': identity change disposes previous result modal', await page.getByText('Data '+c.title.toLowerCase()+' valid',{exact:true}).count() === 0);
      await page.getByRole('button', {name:'Periksa Data',exact:true}).click();
      await page.getByText(c.message,{exact:true}).first().waitFor();
      await params(['1', 'missing']);
      await page.waitForFunction(expected => document.querySelector('input')?.value === expected, c.original);
      check(c.name+': array parameter uses first supplied ID', await name.inputValue() === c.original);
      check(c.name+': identity change clears previous required-field errors', await page.getByText(c.message,{exact:true}).count() === 0);
      await params('');
      await page.getByText('Data '+c.title.toLowerCase()+' tidak ditemukan',{exact:true}).waitFor();
      check(c.name+': empty setParams ID blocks form and action', await page.locator('input').count() === 0 && await page.getByRole('button',{name:'Periksa Data',exact:true}).count() === 0);
      await params('1');
      await page.waitForFunction(expected => document.querySelector('input')?.value === expected, c.original);
      check(c.name+': valid ID recovers from not-found state', await name.inputValue() === c.original);
      await page.screenshot({path:path.join(output,'qc-'+c.name+'-params.png')});
    }
    check('Preview does not write to an API',writes.length===0);
    check('No runtime exceptions or console errors',errors.length===0);
  } catch (error) {
    errors.push(error.message);
    if (page) { await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{}); fs.writeFileSync(path.join(output,'failure.txt'),await page.locator('body').innerText().catch(()=>'')); }
    process.exitCode=1;
  } finally {
    fs.writeFileSync(path.join(output,'independent-results.json'),JSON.stringify({owner:'QC',scope:'Independent QC setParams, scalar draft, modal/error reset and array-ID cases on four production routes with isolated Expo Router and list fixtures',sdk:57,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,writes,sourceHashes,limitations:['No full application auth/root navigation or SSR response tested','No API integration/persistence in these four existing fixture forms','No native device or full Figma screenshot comparison']},null,2)+'\n');
    console.log(JSON.stringify({passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,errors}));
    if(browser)await browser.close();
  }
})();
