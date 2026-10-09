// Existing Metro8088 only; output and transport fixtures belong to Senior6.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const output=__dirname,origin='http://127.0.0.1:8088';
const sourceFiles=[
 'app/(no-layout)/manage/printer/modify.tsx','app/(no-layout)/manage/pos-settings/rounding.tsx',
 'api/hooks/settings.ts','api/axios.ts','api/common.ts','api/factory.ts','hooks/usePostRequest.ts',
 'components/common/Wrapper.tsx','components/common/Card.tsx','components/common/Text.tsx','components/common/Form.tsx',
 'components/common/BottomActionButton.tsx','components/common/BouncyPressable.tsx','components/common/SingleSelect.tsx',
 'components/common/SearchBar.tsx','components/common/SuccessModal.tsx','components/common/AlertModal.tsx','components/common/Header.tsx',
 'components/custom/JSStack.tsx','components/ui/actionsheet/index.tsx','components/ui/modal/index.tsx','components/ui/button/index.tsx',
 'components/ui/gluestack-ui-provider/index.web.tsx','components/ui/gluestack-ui-provider/config.ts','hooks/useAlertModal.ts',
 'constants/data/other/printer.ts','constants/Colors.ts','constants/Fonts.ts','lib/utils/index.ts','lib/utils/styles.ts','global.css','tailwind.config.js',
 'assets/fonts/Inter_24pt-Regular.ttf','assets/fonts/Inter_24pt-Medium.ttf','assets/fonts/Inter_24pt-SemiBold.ttf','assets/fonts/Inter_24pt-Bold.ttf',
 '.expo/senior6-printer-pos-ui-entry.jsx',path.relative(process.cwd(),__filename),path.relative(process.cwd(),path.join(output,'web.css'))
];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fingerprints=()=>Object.fromEntries(sourceFiles.map(file=>[file,hash(file)]));
const before=fingerprints();
const checks=[],runtimeErrors=[],consoleErrors=[],warnings=[],blockedRequests=[],alerts=[],metrics=[];
const record=(name,detail={})=>{checks.push({name,passed:true,detail});console.log('PASS '+name);};
let browser,page,error;
(async()=>{
 try{
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  page=await browser.newPage({viewport:{width:320,height:640},colorScheme:'dark'});page.setDefaultTimeout(15000);
  page.on('pageerror',err=>runtimeErrors.push(err.message));page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());if(msg.type()==='warning')warnings.push(msg.text());});
  page.on('dialog',async dialog=>{alerts.push(dialog.message());await dialog.accept();});
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin===origin&&url.pathname==='/sd6-printer-pos')return route.fulfill({status:200,contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(output,'web.css'),'utf8')}</style></head><body><div id="root"></div><script src="${origin}/.expo/senior6-printer-pos-ui-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>`});
   if(url.origin===origin&&(url.pathname.includes('.bundle')||url.pathname.startsWith('/assets/')||url.pathname.endsWith('.css')))return route.continue();
   blockedRequests.push({method:route.request().method(),path:url.pathname});return route.abort();
  });
  console.log('Loading own UI entry on existing Metro8088');
  await page.goto(origin+'/sd6-printer-pos',{waitUntil:'commit',timeout:180000});
  const text=value=>page.getByText(value,{exact:true}).filter({visible:true});
  const save=()=>page.getByRole('button',{name:'Simpan',exact:true});
  const scenario=async(screen,record,params)=>{await page.evaluate(args=>window.sd6Scenario(...args),[screen,record,params]);await text(screen==='printer'?'Printer Terdeteksi':'Aktifkan Pembulatan').waitFor();if(screen==='rounding'&&record?.enabled!==false)await text(record?.decimal_places===3?'Ribuan (Rp1.000)':'Ratusan (Rp100)').waitFor();};
  const click=locator=>locator.click({noWaitAfter:true});
  const capture=async name=>{await page.waitForTimeout(500);await page.screenshot({path:path.join(output,name+'.png')});};
  const within=async locator=>{const box=await locator.boundingBox(),viewport=page.viewportSize();assert.ok(box&&box.x>=-1&&box.x+box.width<=viewport.width+1,JSON.stringify(box));return box;};
  const cta=async()=>{const box=await within(save()),viewport=page.viewportSize();assert.ok(box.y>=0&&box.y+box.height<=viewport.height+1&&box.height>=44,JSON.stringify(box));return box;};
  const scrollBottom=async locator=>{await locator.evaluate(node=>{for(let ancestor=node.parentElement;ancestor;ancestor=ancestor.parentElement){const css=getComputedStyle(ancestor);if(/auto|scroll/.test(css.overflowY)&&ancestor.scrollHeight>ancestor.clientHeight){ancestor.scrollTop=ancestor.scrollHeight;break;}}});await page.waitForTimeout(150);};
  const payload=()=>page.evaluate(()=>window.sd6Calls.filter(call=>call.method!=='get').at(-1)?.body);
  const dismiss=async(name='Mengerti')=>{await click(page.getByRole('button',{name,exact:true}));await page.getByRole('dialog').waitFor({state:'hidden'});};
  await text('Aktifkan Pembulatan').waitFor({timeout:180000});await text('Ratusan (Rp100)').waitFor({timeout:180000});
  for(const viewport of [{width:320,height:640},{width:360,height:780},{width:390,height:844},{width:768,height:1024}]){
   await page.setViewportSize(viewport);
   for(const screen of ['printer','rounding']){
    await scenario(screen);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);record(`${screen} ${viewport.width}: no horizontal overflow`);
    const action=await cta();record(`${screen} ${viewport.width}: save visible and target >=44`,action);
    if(screen==='printer'){await within(text('Epson'));await within(text('Canon C1012'));await text('USB').waitFor();await text('Network').waitFor();record(`printer ${viewport.width}: names and connection methods fit`);}
    else{for(const title of ['Pembulatan ke Atas','Pembulatan ke Bawah','Pembulatan Terdekat'])await within(text(title));record(`rounding ${viewport.width}: method labels fit`);}
    await capture(`${screen}-main-${viewport.width}`);
    if(screen==='rounding'){
     const label=text('Ratusan (Rp100)');await scrollBottom(label);const box=await within(label);assert.ok(box.y>=0&&box.y+box.height<=action.y+1,JSON.stringify(box));record(`rounding ${viewport.width}: bottom field reachable above CTA`,box);
     await click(label);await page.getByRole('dialog').waitFor();await page.waitForTimeout(650);
     const cancel=await within(text('Batal'));assert.ok(cancel.y>=0&&cancel.y+cancel.height<=viewport.height+1);record(`rounding ${viewport.width}: dropdown cancel fits`,cancel);
     for(const item of ['Ratusan (Rp100)','Ribuan (Rp1.000)','Puluhan (Rp10)'])await within(page.getByRole('dialog').getByText(item,{exact:true}));record(`rounding ${viewport.width}: dropdown option labels fit`);
     await capture(`rounding-picker-${viewport.width}`);await click(text('Batal'));await page.getByRole('dialog').waitFor({state:'hidden'});
    }
    metrics.push({screen,viewport,save:action});
   }
  }
  await page.setViewportSize({width:320,height:640});
  await scenario('rounding',{enabled:true,method:'up',decimal_places:3});await click(text('Pembulatan ke Bawah'));await click(text('Tunai Saja'));
  await scrollBottom(text('Ribuan (Rp1.000)'));await click(text('Ribuan (Rp1.000)'));await click(page.getByRole('dialog').getByText('Puluhan (Rp10)',{exact:true}));await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.evaluate(()=>window.sd6Refetch({enabled:true,method:'nearest',decimal_places:2}));await click(save());await text('Pengaturan Pembulatan Disimpan').waitFor();
  assert.deepEqual(await payload(),{enabled:true,method:'down',decimal_places:1});record('rounding edited method/exponent survive refetch; applyTo remains UI-only');
  await page.waitForTimeout(650);const success=await within(page.getByRole('button',{name:'Mengerti',exact:true}));assert.ok(success.y>=0&&success.y+success.height<=641);record('rounding success modal action visible at320x640',success);await capture('rounding-success-320');await dismiss();
  await page.evaluate(()=>window.sd6FailSave());await click(save());await text('Gagal Menyimpan Pembulatan').waitFor();await page.waitForTimeout(600);const failButton=await within(page.getByRole('button',{name:'Mengerti',exact:true}));assert.ok(failButton.y>=0&&failButton.y+failButton.height<=641);assert.deepEqual(await payload(),{enabled:true,method:'down',decimal_places:1});record('rounding failed save keeps draft and error action visible');await capture('rounding-error-320');await dismiss();
  await scenario('rounding',{enabled:false,method:'up',decimal_places:3});assert.equal(await text('Metode Pembulatan').count(),0);await click(save());await text('Pengaturan Pembulatan Disimpan').waitFor();assert.deepEqual(await payload(),{enabled:false,method:'up',decimal_places:3});record('rounding disabled controls hide while saved values stay intact');await dismiss();await capture('rounding-disabled-320');
  await page.evaluate(()=>window.sd6Scenario('rounding',{enabled:true,method:'up',decimal_places:10}));const largeLabel=/^Kelipatan \(Rp\s*10\.000\.000\.000\)$/;const large=text(largeLabel);await large.waitFor();await scrollBottom(large);await within(large);await click(large);await page.getByRole('dialog').getByText(largeLabel).waitFor();await click(page.getByRole('dialog').getByText(largeLabel));await page.getByRole('dialog').waitFor({state:'hidden'});await click(save());await text('Pengaturan Pembulatan Disimpan').waitFor();assert.deepEqual(await payload(),{enabled:true,method:'up',decimal_places:10});record('rounding exponent10 label and production dropdown preserve payload');await dismiss();await capture('rounding-exponent10-320');
  await scenario('printer');await click(save());await text('Printer Berhasil Ditambahkan!').waitFor();await page.waitForTimeout(650);const printerConfirm=await within(page.getByRole('button',{name:'Tutup',exact:true}));assert.ok(printerConfirm.y>=0&&printerConfirm.y+printerConfirm.height<=641);record('printer simulated save uses RHF and visible shared modal at320x640');await capture('printer-success-320');await dismiss('Tutup');
  await page.evaluate(()=>window.sd6Params({id:'1'}));await click(save());await text('Printer Berhasil Diubah!').waitFor();record('printer edit ID changes modal result');
  await page.evaluate(()=>window.sd6Params({}));await page.getByRole('dialog').waitFor({state:'hidden'});record('printer create-after-edit clears previous modal');
  await click(save());await page.evaluate(()=>window.sd6Params({id:'1'}));await page.waitForTimeout(1250);assert.equal(await page.getByRole('dialog').count(),0);record('printer pending old save cannot open modal for new ID');
  const backBefore=await page.evaluate(()=>window.sd6BackCount);await page.evaluate(()=>window.sd6Params({id:'missing'}));await page.waitForFunction(count=>window.sd6BackCount===count+1,backBefore);assert.equal(await save().count(),0);assert.equal(alerts.at(-1),'Printer tidak ditemukan');record('printer invalid ID alerts/back without save');
  assert.deepEqual(runtimeErrors,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(blockedRequests,[]);assert.ok(await page.evaluate(()=>document.documentElement.classList.contains('light')));record('runtime/console clean; dark OS uses light provider; no external API');
 }catch(err){error=err.message;console.error(err.message);process.exitCode=1;if(page)await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
 }finally{
  const after=fingerprints(),drift=sourceFiles.filter(file=>before[file]!==after[file]);
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({sourceHashes:before,afterHashes:after,drift,checks,runtimeErrors,consoleErrors,warnings,blockedRequests,alerts,metrics,error,calls:page?await page.evaluate(()=>window.sd6Calls||[]).catch(()=>[]):[],limitations:'Production screens/RHF/Query/Axios/NativeWind/UI/font/modal; local transport and navigation/params fixture, not full auth/router/native/Figma/backend persistence. Printer existing simulated save unchanged.'},null,2)+'\n');
  console.log(JSON.stringify({passed:checks.length,error,drift,runtimeErrors:runtimeErrors.length,consoleErrors:consoleErrors.length}));if(browser)await browser.close();if(error||drift.length||runtimeErrors.length||consoleErrors.length)process.exitCode=1;
 }
})().catch(err=>{console.error(err);process.exitCode=2;});
