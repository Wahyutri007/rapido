const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const {owned,shared,read}=require('./sources.cjs');
const origin='http://sd6.fixture.local',bundle=path.resolve('.expo/senior6-absence-history-offline/entry.bundle.js');
const sources=[...owned,...shared,...read,'components/common/Card.tsx','components/common/Text.tsx','components/common/Wrapper.tsx','components/common/Header.tsx','components/common/SingleSelect.tsx','components/common/SearchBar.tsx','components/common/DataPlaceholder.tsx','components/custom/CatalogItemCard.tsx','components/custom/DetailRow.tsx','components/ui/button/index.tsx','components/ui/gluestack-ui-provider/config.ts','tailwind.config.js','global.css',path.relative(process.cwd(),path.join(__dirname,'ui-entry.jsx')),path.relative(process.cwd(),path.join(__dirname,'web.css')),path.relative(process.cwd(),bundle)];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fingerprints=()=>Object.fromEntries(sources.map(file=>[file,hash(file)]));
const before=fingerprints(),checks=[],metrics=[],runtime=[],consoleErrors=[],blocked=[];
let browser,page,error;
const pass=(name,detail={})=>{checks.push({name,detail});console.log('PASS '+name);};
(async()=>{
 try{
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  page=await browser.newPage({viewport:{width:320,height:640}});page.setDefaultTimeout(15000);
  page.on('pageerror',e=>runtime.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin===origin&&url.pathname==='/history')return route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(__dirname,'web.css'),'utf8')}</style></head><body><div id="root"></div><script src="${origin}/history.bundle.js"></script></body></html>`});
   if(url.origin===origin&&url.pathname==='/history.bundle.js')return route.fulfill({path:bundle,contentType:'text/javascript'});
   if(url.origin===origin&&url.pathname.startsWith('/assets/')){
    const relative=url.searchParams.get('unstable_path')?path.join(url.searchParams.get('unstable_path'),path.basename(decodeURIComponent(url.pathname))):decodeURIComponent(url.pathname).slice('/assets/'.length);
    const file=path.resolve(relative);
    if(file.toLowerCase().startsWith((process.cwd()+path.sep).toLowerCase())&&fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file});
   }
   blocked.push({method:route.request().method(),url:route.request().url()});return route.abort();
  });
  await page.goto(origin+'/history',{waitUntil:'commit',timeout:180000});
  const text=value=>page.getByText(value,{exact:true}).filter({visible:true}).first();
  const capture=async name=>{await page.waitForTimeout(200);await page.screenshot({path:path.join(__dirname,name+'.png')});};
  const click=locator=>locator.click({noWaitAfter:true});
  const scenario=async(screen,params={})=>{await page.evaluate(args=>window.sd6Scenario(...args),[screen,params]);await text(screen==='list'?'Riwayat Absensi':'Detail Riwayat Absensi').waitFor();};
  const choose=async(label,option)=>{await click(text(label));const dialog=page.getByRole('dialog');await dialog.waitFor();await click(dialog.getByText(option,{exact:true}));await dialog.waitFor({state:'hidden'});};
  const overflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  const within=async locator=>{const b=await locator.boundingBox(),v=page.viewportSize();assert.ok(b&&b.x>=-1&&b.x+b.width<=v.width+1,JSON.stringify(b));return b;};
  await text('Catatan Absensi · 4').waitFor({timeout:45000});await text('Pratinjau Riwayat Absensi').waitFor();pass('Existing production preview records and truthful source notice render');
  await page.evaluate(()=>{
   window.sd6Fixture=[
    {id:'001 / masuk',date:'9 Oktober 2026',checkIn:'08:00',checkOut:'-',storeName:'Toko Pusat',locationName:'Jakarta'},
    {id:'done',date:'2026-10-09',checkIn:'08:00',checkOut:'17:00',storeName:'Toko Timur',locationName:'Surabaya'},
    {id:'old',date:'06 Maret 2026',checkIn:'09:00',checkOut:'18:00',storeName:'Toko Lama',locationName:'Lokasi dengan keterangan yang sangat panjang untuk diuji pada layar kecil'},
    {id:'unknown',date:'',checkIn:'-',checkOut:'25:00'}
   ];window.sd6Data(window.sd6Fixture);
  });
  for(const v of [{width:320,height:640},{width:390,height:844},{width:844,height:390}]){
   await page.setViewportSize(v);await scenario('list');await text('Catatan Absensi · 4').waitFor();await overflow();await within(text('Pratinjau Riwayat Absensi'));
   const row=text('Toko Pusat').locator('xpath=ancestor::*[@tabindex="0"][1]');await row.scrollIntoViewIfNeeded();const box=await within(row);assert.ok(box.height>=44&&box.y>=64&&box.y+box.height<=v.height+1,JSON.stringify(box));await capture('list-'+v.width);pass(`List ${v.width}x${v.height}: full row and >=44px tap target reachable, no horizontal overflow`,box);
   await scenario('detail',{id:'old'});await text('Lokasi dengan keterangan yang sangat panjang untuk diuji pada layar kecil').scrollIntoViewIfNeeded();await overflow();await within(text('Lokasi dengan keterangan yang sangat panjang untuk diuji pada layar kecil'));await capture('detail-'+v.width);pass(`Detail ${v.width}x${v.height}: long source value wraps and scrolls`);metrics.push({viewport:v});
  }
  await page.setViewportSize({width:320,height:640});await scenario('list');
  const search=page.getByPlaceholder('Cari tanggal, toko, lokasi, atau jam');await search.fill('  SURABAYA  ');await text('Catatan Absensi · 1').waitFor();await text('Toko Timur').scrollIntoViewIfNeeded();pass('Actual search trims input and matches recorded location');
  await search.fill('no matching record');await text('Tidak ada catatan yang cocok dengan pencarian dan filter.').waitFor();pass('Unmatched search shows clear empty result');
  await click(page.getByRole('button',{name:'Reset Pencarian dan Filter',exact:true}));await text('Catatan Absensi · 4').waitFor();assert.equal(await search.inputValue(),'');pass('Reset restores controlled search and all records');
  await choose('Semua Status','Belum Keluar');await text('Catatan Absensi · 1').waitFor();await text('Toko Pusat').scrollIntoViewIfNeeded();pass('Status picker isolates open records');
  await choose('Semua Toko','Toko Timur');await text('Tidak ada catatan yang cocok dengan pencarian dan filter.').waitFor();pass('Combined status/store filters use intersection');
  await click(page.getByRole('button',{name:'Reset Pencarian dan Filter',exact:true}));await text('Catatan Absensi · 4').waitFor();await text('Semua Status').waitFor();await text('Semua Toko').waitFor();pass('Combined filters reset to their actual displayed defaults');
  await choose('Semua Toko','Toko Pusat');await text('Catatan Absensi · 1').waitFor();await text('Toko Pusat').scrollIntoViewIfNeeded();await click(text('Toko Pusat'));await text('Detail Riwayat Absensi').waitFor();await page.evaluate(()=>window.sd6Scenario('list'));await text('Toko Pusat').waitFor();await text('Catatan Absensi · 1').waitFor();pass('Returning to still-mounted list preserves its search/filter state');await click(page.getByRole('button',{name:'Reset Pencarian dan Filter',exact:true}));await text('Catatan Absensi · 4').waitFor();
  await text('Toko Pusat').scrollIntoViewIfNeeded();await click(text('Toko Pusat'));await text('Detail Riwayat Absensi').waitFor();assert.equal(new URL(await page.evaluate(()=>window.sd6Routes.at(-1).href),origin).searchParams.get('id'),'001 / masuk');await text('08:00').waitFor();await text('Belum dicatat').waitFor();pass('List navigation safely preserves opaque ID and recorded/missing time');
  await page.evaluate(()=>window.sd6Params({id:'done'}));await text('Toko Timur').waitFor();await text('17:00').waitFor();pass('Mounted detail responds to a new route ID');
  await page.evaluate(()=>window.sd6Data(window.sd6Fixture.map(r=>r.id==='done'?{...r,checkOut:'18:30'}:r)));await text('18:30').waitFor();pass('Live detail reads updated source without reopening');
  await page.evaluate(()=>window.sd6Data(window.sd6Fixture.filter(r=>r.id!=='done')));await text('Catatan absensi tidak ditemukan.').waitFor();await click(page.getByRole('button',{name:'Kembali ke Riwayat Absensi',exact:true}));await text('Riwayat Absensi').waitFor();assert.equal(await page.evaluate(()=>window.sd6Routes.at(-1).href),'/(absence)/history');await text('Catatan Absensi · 3').waitFor();pass('Live deletion invalidates detail and missing action returns within Absensi');
  await page.evaluate(()=>window.sd6Data([]));await text('Belum ada catatan absensi pada sesi ini.').waitFor();pass('Live empty source uses session-empty message');
  await page.evaluate(()=>window.sd6Data(window.sd6Fixture));await text('Catatan Absensi · 4').waitFor();pass('Live additions refresh list');
  await choose('Semua Toko','Toko Timur');await text('Catatan Absensi · 1').waitFor();await page.evaluate(()=>window.sd6Data(window.sd6Fixture.filter(r=>r.id!=='done')));await text('Tidak ada catatan yang cocok dengan pencarian dan filter.').waitFor();await click(page.getByRole('button',{name:'Reset Pencarian dan Filter',exact:true}));await text('Catatan Absensi · 3').waitFor();pass('Removed filter option preserves filtering until explicit reset');
  for(const params of [{id:'missing'},{id:''},{id:['one','two']},{}]){await scenario('detail',params);await text('Catatan absensi tidak ditemukan.').waitFor();}pass('Absent/empty/array/missing IDs cannot expose another record');await capture('missing-320');
  await scenario('detail',{id:'unknown'});await text('Toko tidak dicatat').waitFor();await text('Tidak dicatat').waitFor();await text('Belum Lengkap').waitFor();pass('Unknown date/store/time remain disclosed without invented identity or schedule');
  assert.deepEqual(runtime,[]);assert.deepEqual(consoleErrors,[]);assert.deepEqual(blocked,[]);pass('Zero runtime/console errors and zero external/business requests');
  assert.deepEqual(fingerprints(),before);pass('Production and harness fingerprints stable throughout browser run');
 }catch(e){error={message:e.message,stack:e.stack};console.error(e);process.exitCode=1;if(page)await page.screenshot({path:path.join(__dirname,'failure.png')}).catch(()=>{});}
 finally{if(browser)await browser.close();fs.writeFileSync(path.join(__dirname,'browser-results.json'),JSON.stringify({status:error?'FAIL':'PASS',passed:checks.length,checks,metrics,runtime,consoleErrors,blocked,before,after:fingerprints(),error,limitations:'Production React Native Web screens, store, helpers, shared inputs/status/rows/providers/fonts; browser-local navigation/params and data fixture, not full app router/auth/native/Figma/backend/persistence.'},null,2)+'\n');}
})();
