// Developer replay of the QC UI runner; outputs remain in this developer folder.
const fs = require('node:fs'), path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const origin='http://127.0.0.1:8088';
const output=__dirname;
const fingerprintPaths = [...Object.keys(JSON.parse(fs.readFileSync('docs/qa/qc-stock-ui-2026-10-09/fingerprints-before.json', 'utf8')).files),
  'constants/Colors.ts','lib/utils/index.ts','lib/utils/styles.ts','hooks/useAlertModal.ts','.expo/senior6-stock-ui-entry.jsx',
  path.relative(process.cwd(), path.join(output,'web-before.css')),path.relative(process.cwd(),__filename)];
const fingerprint = () => Object.fromEntries(fingerprintPaths.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before = fingerprint();
fs.writeFileSync(path.join(output,'fingerprints-before.json'),JSON.stringify({capturedAt:new Date().toISOString(),files:before},null,2)+'\n');
const checks=[],errors=[],consoleErrors=[],warnings=[],blockedRequests=[],metrics=[];
const check=(name,passed,detail)=>{checks.push({name,passed:Boolean(passed),detail});};
const html=()=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(output,'web-before.css'),'utf8')}</style></head><body><div id="root"></div><script src="${origin}/.expo/senior6-stock-ui-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>`;
let browser,page,exception;
(async()=>{
  try {
    browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
    page=await browser.newPage({viewport:{width:360,height:780},screen:{width:360,height:780},colorScheme:'dark'});
    page.setDefaultTimeout(12000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text()); if(message.type()==='warning')warnings.push(message.text());});
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin===origin && url.pathname==='/manage/pos-settings/stock-limit') return route.fulfill({status:200,contentType:'text/html',body:html()});
      if(url.origin===origin && (url.pathname.includes('.bundle')||url.pathname.startsWith('/assets/')||url.pathname.endsWith('.css'))) return route.continue();
      blockedRequests.push({url:url.pathname,method:route.request().method()}); return route.abort();
    });
    console.log('Loading production UI on existing Metro8088');
    await page.goto(origin+'/manage/pos-settings/stock-limit',{waitUntil:'commit',timeout:180000});
    await page.getByText('Aktifkan Batas Stock',{exact:true}).waitFor({timeout:180000});
    await page.getByRole('button',{name:'Simpan',exact:true}).waitFor({timeout:180000});
    console.log('Production UI ready');
    const scenario=async mode=>{
      await page.evaluate(mode=>window.qcUiScenario(mode),mode);
      await page.getByText('Aktifkan Batas Stock',{exact:true}).waitFor();
      if(!['settings-loading','settings-error'].includes(mode)) await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button,[role="button"]')).find(x=>x.textContent==='Simpan')?.disabled);
    };
    const capture=async name=>{
      await page.waitForTimeout(350);
      await page.screenshot({path:path.join(output,name+'.png')});
      metrics.push({name,viewport:page.viewportSize(),layout:await page.evaluate(()=>({viewportWidth:innerWidth,screenWidth:screen.width,bodyScrollWidth:document.documentElement.scrollWidth,bodyScrollHeight:document.documentElement.scrollHeight,light:document.documentElement.classList.contains('light')}))});
    };
    for(const viewport of [{width:320,height:640},{width:360,height:780},{width:390,height:844},{width:768,height:1024}]) {
      await page.setViewportSize(viewport); await scenario('item');
      const save=await page.getByRole('button',{name:'Simpan',exact:true}).boundingBox();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      check(`main ${viewport.width}: no horizontal page overflow`,!overflow);
      check(`main ${viewport.width}: CTA stays within viewport`,save&&save.x>=0&&save.y>=0&&save.x+save.width<=viewport.width+1&&save.y+save.height<=viewport.height+1,save);
      check(`main ${viewport.width}: primary target height at least44`,save&&save.height>=44,save);
      await page.getByText('Kecuali Produk (Opsional)',{exact:true}).click({noWaitAfter:true});
      await page.getByText('Pilih Produk',{exact:true}).waitFor();
      await page.getByPlaceholder('Cari...').fill('PANJANG');
      await page.getByText('Kopi Susu',{exact:true}).waitFor({state:'hidden'});
      // Wait for the actual sheet spring to finish before geometry assertions.
      await page.waitForTimeout(650);
      const option=page.getByText('Produk dengan nama panjang untuk memeriksa pembungkusan teks pada layar kecil dan pilihan kategori',{exact:true});
      const box=await option.boundingBox();
      check(`picker ${viewport.width}: long filtered label within width`,box&&box.x>=0&&box.x+box.width<=viewport.width+1,box);
      const done=await page.getByText('Selesai',{exact:true}).boundingBox();
      check(`picker ${viewport.width}: confirm text within viewport`,done&&done.x>=0&&done.y>=0&&done.x+done.width<=viewport.width+1&&done.y+done.height<=viewport.height+1,done);
      await capture('picker-'+viewport.width);
      await page.getByText('Batal',{exact:true}).click({noWaitAfter:true});
      await page.getByText('Pilih Produk',{exact:true}).waitFor({state:'hidden'});
      if(viewport.width<=390) await capture('main-'+viewport.width);
      console.log(`Viewport ${viewport.width} checked`);
    }
    await page.setViewportSize({width:320,height:640});
    for(const [mode,message,openPicker] of [
      ['settings-loading','Memuat pengaturan batas stok...',false],
      ['settings-error','Pengaturan batas stok belum dapat dimuat.',false],
      ['empty','Belum ada produk.',true],
      ['list-loading','Memuat produk...',true],
      ['list-error','Daftar produk belum dapat dimuat.',true],
      ['category','Pilih Kategori',true],
    ]) {
      await scenario(mode);
      if(openPicker) await page.getByText(/Kecuali (Produk|Kategori) \(Opsional\)/).click({noWaitAfter:true});
      await page.getByText(message,{exact:true}).waitFor();
      check(`${mode}: correct visible UI copy`,true);
      if(mode.startsWith('settings-')) check(`${mode}: save disabled`,await page.getByRole('button',{name:'Simpan',exact:true}).isDisabled());
      await capture(mode+'-320');
      if(mode==='category') {
        const label=page.getByText('Kategori dengan nama panjang untuk memeriksa tampilan daftar dan pilihan pada layar kecil',{exact:true});
        const box=await label.boundingBox(); check('category320: long label fits',box&&box.x>=0&&box.x+box.width<=321,box);
      }
    }
    await scenario('item');
    await page.getByRole('button',{name:'Simpan',exact:true}).click({noWaitAfter:true});
    await page.getByText('Pengaturan Batas Stok Disimpan',{exact:true}).waitFor();
    await page.waitForTimeout(700);
    const dialog=page.getByRole('dialog');
    const box=await dialog.boundingBox();
    check('success modal after viewport resize: within width320',box&&box.x>=0&&box.x+box.width<=321,box);
    const buttonBox=await page.getByRole('button',{name:'Mengerti',exact:true}).boundingBox();
    check('success modal320: confirm button visible inside viewport',buttonBox&&buttonBox.x>=0&&buttonBox.y>=0&&buttonBox.x+buttonBox.width<=321&&buttonBox.y+buttonBox.height<=641,buttonBox);
    const successDom=await page.getByText('Pengaturan Batas Stok Disimpan',{exact:true}).evaluate(element=>{
      const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
      const ancestors=[]; for(let node=element,count=0;node&&count<7;node=node.parentElement,count++) {const css=getComputedStyle(node);ancestors.push({tag:node.tagName,className:node.className,style:node.getAttribute('style'),rect:rect(node),overflow:css.overflow,height:css.height});}
      const images=Array.from(document.querySelectorAll('img,[role="img"]')).map(node=>({tag:node.tagName,className:node.className,style:node.getAttribute('style'),rect:rect(node),computedHeight:getComputedStyle(node).height}));
      return {ancestors,images};
    });
    fs.writeFileSync(path.join(output,'success-dom.json'),JSON.stringify(successDom,null,2)+'\n');
    await capture('success-resize-320');
    await page.getByRole('button',{name:'Mengerti',exact:true}).click({noWaitAfter:true});
    await page.evaluate(()=>window.qcUiScenario('item',true));
    await page.getByRole('button',{name:'Simpan',exact:true}).click({noWaitAfter:true});
    await page.getByText('Gagal Menyimpan Batas Stok',{exact:true}).waitFor();
    await page.waitForTimeout(600);
    const errorBox=await page.getByRole('button',{name:'Mengerti',exact:true}).boundingBox();
    check('error modal320: confirm button visible inside viewport',errorBox&&errorBox.x>=0&&errorBox.y>=0&&errorBox.x+errorBox.width<=321&&errorBox.y+errorBox.height<=641,errorBox);
    await capture('save-error-320');
    check('fixture-only save error uses production dialog',await page.getByText('Pengaturan belum tersimpan. Periksa koneksi dan coba lagi.',{exact:true}).count()===1);
    check('no runtime exceptions',errors.length===0,errors);
    check('light UI follows fixed provider despite dark OS',await page.evaluate(()=>document.documentElement.classList.contains('light')));
    check('no HTTP API attempts',blockedRequests.length===0,blockedRequests);
  } catch(error) {
    exception=error.message; console.error(error.message); process.exitCode=1;
    if(page) {await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});fs.writeFileSync(path.join(output,'failure.txt'),await page.locator('body').innerText().catch(()=>''));}
  } finally {
    const after=fingerprint();
    const fingerprintDrift=Object.keys(before).filter(file=>before[file]!==after[file]);
    fs.writeFileSync(path.join(output,'fingerprints-after.json'),JSON.stringify({capturedAt:new Date().toISOString(),files:after,drift:fingerprintDrift},null,2)+'\n');
    const result={executionMode:'APPLICATION_SOURCES',sourceHashes:before,fingerprintDrift,scope:'UI only: production screen/RN-web/primitives/modal/SearchBar/font/providers and isolated Expo Router, browser-local transport fixtures',checks,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,errors,consoleErrors,warnings,blockedRequests,exception,metrics,fixtureCalls:page?await page.evaluate(()=>window.qcUiCalls||[]).catch(()=>[]):[],limitations:'No backend/native-current-screen/root-auth/Figma/API persistence certification; physical phone not foreground. Actual window/screen metrics recorded; spring animations settle before final geometry checks.'};
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,exception,consoleErrors:consoleErrors.length}));
    if(browser) await browser.close();
    if(result.failed||errors.length||consoleErrors.length||exception||fingerprintDrift.length) process.exitCode=1;
  }
})().catch(e=>{console.error(e);process.exitCode=2;});
