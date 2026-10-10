const fs = require('node:fs'), path = require('node:path');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.cwd(),packet="D:\\Rapido-QC-temp\\pm-catalog-bills-final-candidate-2026-10-10",preview='D:/Rapido-QC-temp/pm-catalog-bills-final-build-2026-10-10',output='D:/Rapido-QC-temp/pm-catalog-bills-final-browser-2026-10-10';
if(fs.existsSync(path.join(output,'browser-results.json')))throw Error('Preserve results');fs.mkdirSync(output,{recursive:true});process.env.TEMP=process.env.TMP=path.join(output,'tmp');fs.mkdirSync(process.env.TEMP,{recursive:true});
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),build=JSON.parse(fs.readFileSync(path.join(preview,'build.json'))),intake=JSON.parse(fs.readFileSync(path.join(packet,'intake.json')));
function verify(){for(const group of [build.compiledInputs,build.assetBindings,build.sources,intake.sources,intake.guards])for(const[f,h]of Object.entries(group))assert.equal(sha(path.resolve(root,f)),h,'Drift '+f);assert.equal(sha(path.join(preview,'bundle.js')),build.bundleHash);assert.equal(sha(path.join(preview,'style.css')),build.styleHash);}verify();
const assetMap=new Map();for(const a of JSON.parse(fs.readFileSync(path.join(preview,'assets.json'))))for(const f of a.files||[])assetMap.set(decodeURIComponent(new URL((a.httpServerLocation+'/'+path.basename(f)).replaceAll('\\','/'),'http://sd7-catalog-bills.local').pathname),f);
const { chromium } = require(path.join(root, '.expo/payroll-qa-tools/node_modules/playwright'));
const origin = 'http://sd7-catalog-bills.local', errors = [];
(async () => {
 const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
 try {
  const page = await browser.newPage({ viewport: { width: 390, height: 947 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await page.route('**/*', route => {
   const url = new URL(route.request().url());
   if (url.origin === origin && url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}#root{display:flex}' + fs.readFileSync(path.join(preview,'style.css'), 'utf8') + '</style></head><body><div id="root"></div><script>window.__routes=[];window.__paramsEvents=[];window.__selectEvents=[];</script><script src="/entry.bundle.js"></script></body></html>' });
   if (url.origin === origin && url.pathname === '/entry.bundle.js') return route.fulfill({ path: path.join(preview,'bundle.js'), contentType: 'text/javascript' });
   if(url.origin===origin&&assetMap.has(decodeURIComponent(url.pathname))){const file=assetMap.get(decodeURIComponent(url.pathname));if(file&&fs.existsSync(file))return route.fulfill({path:file});}
   errors.push('Blocked request: ' + route.request().url()); return route.abort();
  });
  await page.goto(origin, { waitUntil: 'commit' });
  await page.getByText('Arif - Meja 01', { exact: true }).waitFor({timeout:60000});
  await page.evaluate(() => document.fonts.ready);
  const checks = [], geometry = [];
  const check = (name, pass, detail) => { checks.push({name,pass:!!pass,detail}); if(!pass) console.log('FAIL: '+name); };
  const cards = () => page.locator('[data-testid^="catalog-bill-29:"]');
  const mode = async value => { await page.evaluate(v=>window.__setPreviewMode(v),value); await page.waitForTimeout(200); };
  const input = () => page.getByPlaceholder('Cari pelanggan atau meja',{exact:true});
  const filter = () => page.getByRole('button',{name:/^Filter contoh tagihan katalog:/});
  const openFilters = async () => { await filter().scrollIntoViewIfNeeded(); await filter().click(); await input().waitFor(); };
  const reset = async () => { await page.getByRole('button',{name:'Reset filter',exact:true}).first().click(); await page.waitForTimeout(100); };
  const selectTable = async label => {
   await page.getByText(/^(Semua meja|Meja 0[123])$/).last().click();
   await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor();
   await page.getByText(label,{exact:true}).last().click();
   await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor({state:'hidden'});
  };
  check('Three archived examples have distinct nested node IDs',await cards().count()===3 && JSON.stringify(await cards().evaluateAll(ns=>ns.map(n=>n.dataset.testid)))===JSON.stringify(['catalog-bill-29:48158','catalog-bill-29:48170','catalog-bill-29:48181']));
  check('Figma count13, quantities5/15/5, paid3 and totals are retained',await page.getByText('13 Tagihan belum dibayar',{exact:true}).count()===1 && await page.getByText('Sudah dibayar: 3 Item',{exact:true}).count()===1 && await page.getByText('Total : Rp150.000',{exact:true}).count()===1 && await page.getByText('Total : Rp250.000',{exact:true}).count()===1 && await page.getByText('Total : Rp350.000',{exact:true}).count()===1 && await page.getByText('Jumlah pesanan: 15 Item',{exact:true}).count()===1);
  check('Alternate variant exposes three Add controls and no Pay action',await page.getByRole('button',{name:/^Tambah pesanan/}).count()===3 && await page.getByRole('button',{name:/Bayar/}).count()===0);
  const actual = await cards().evaluateAll(ns=>ns.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,bg:getComputedStyle(n.firstElementChild).backgroundColor}}));
  check('390px reference card width, positions, gaps and grey headings',actual.every(c=>c.x===16 && c.width===357 && c.bg==='rgb(245, 245, 245)') && Math.abs(actual[0].y-142)<0.7 && Math.abs(actual[1].y-394.4)<1 && Math.abs(actual[2].y-622.8)<1,actual);
  const colors=await page.getByText('Total : Rp150.000',{exact:true}).evaluate(n=>({color:getComputedStyle(n).color,size:getComputedStyle(n).fontSize}));
  check('Reference total is red with14px type',colors.color==='rgb(233, 92, 92)' && colors.size==='14px',colors);
  const assets=await page.locator('img').evaluateAll(ns=>ns.map(n=>{const b=n.getBoundingClientRect();return {src:n.getAttribute('src'),x:b.x,y:b.y,w:b.width,h:b.height,loaded:n.complete&&n.naturalWidth>0}}));
  check('All three original assets decode at intrinsic slots',assets.length===3 && assets.every(a=>a.loaded) && assets.some(a=>a.w===24&&a.h===24&&Math.abs(a.x-16)<0.7&&Math.abs(a.y-32)<0.7) && assets.some(a=>a.w===14&&a.h===14&&Math.abs(a.x-21)<0.7&&Math.abs(a.y-94)<0.7) && assets.some(a=>a.w===12&&a.h===12&&Math.abs(a.x-357)<0.7&&Math.abs(a.y-95)<0.7),assets);
  const footer = await page.getByRole('button',{name:'Kembali Katalog',exact:true}).boundingBox();
  check('Reference footer is358x48 at883 on947px page',footer.x===16&&footer.width===358&&footer.height===48&&Math.abs(footer.y-883)<0.7,footer);
  await page.screenshot({path:path.join(output,'final-390.png')});
  for (const customer of ['Arif','Julian','Amek']) {
   await page.getByRole('button',{name:`Tambah pesanan ${customer} (pratinjau)`,exact:true}).click();
   await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor();
   const text = await page.getByText(/adalah contoh Figma\. Penambahan pesanan/).innerText();
   check('Physical Add identifies '+customer+' and explains unavailable storage',text.startsWith(customer+' - Meja')&&text.includes('belum tersedia')&&await page.evaluate(()=>window.__routes.length)===0,text);
   await page.getByRole('button',{name:'Tutup',exact:true}).click();
   await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor({state:'hidden'});
  }
  await openFilters();
  check('First physical filter opens with expanded semantics',await filter().getAttribute('aria-expanded')==='true');
  await input().fill('  jULIaN  ');await page.waitForTimeout(100);
  check('Search trims whitespace and ignores case',await cards().count()===1&&(await cards().innerText()).startsWith('Julian'));
  await input().fill('Meja 03');await page.waitForTimeout(100);
  check('Search matches table labels',await cards().count()===1&&(await cards().innerText()).startsWith('Amek'));
  await input().fill('2026-02-20');await page.waitForTimeout(100);
  check('Search matches archived date and retains paid count',await cards().count()===1&&(await cards().innerText()).startsWith('Arif')&&await page.getByText('Sudah dibayar: 3 Item',{exact:true}).count()===1);
  await input().fill('');await selectTable('Meja 02');await page.waitForTimeout(100);
  check('Physical table selection shows only Julian',await cards().count()===1&&(await cards().innerText()).startsWith('Julian')&&await filter().getAttribute('aria-label')==='Filter contoh tagihan katalog: Meja 02');
  await input().fill('Arif');await page.getByText('Tidak ada contoh tagihan sesuai filter.',{exact:true}).waitFor();
  check('Search and table combine to an honest empty state',await cards().count()===0);
  await reset();check('Reset clears search and table and restores three examples',await cards().count()===3 && await input().inputValue()==='' && await filter().getAttribute('aria-label')==='Filter contoh tagihan katalog: Semua');
  await input().fill('zz-no-customer');await page.getByText('Tidak ada contoh tagihan sesuai filter.',{exact:true}).waitFor();
  await filter().click();await input().waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Reset filter',exact:true}).click();await page.waitForTimeout(100);
  check('Empty-state reset works with filter panel closed',await cards().count()===3);
  await openFilters();await selectTable('Meja 01');
  await page.getByText('Meja 01',{exact:true}).last().click();await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor();
  await page.getByText('Batal',{exact:true}).click();await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor({state:'hidden'});
  check('Picker cancel retains applied table',await cards().count()===1&&(await cards().innerText()).startsWith('Arif'));
  await page.getByRole('button',{name:'Tambah pesanan Arif (pratinjau)',exact:true}).click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor();
  await page.keyboard.press('Escape');await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor({state:'hidden'});
  check('Escape closes the Add information',true);
  await page.getByRole('button',{name:'Tambah pesanan Arif (pratinjau)',exact:true}).click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor();
  await page.evaluate(()=>window.__setFocused(false));await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor({state:'hidden'});
  await page.evaluate(()=>window.__setFocused(true));await page.waitForTimeout(150);
  check('Blur/refocus retires information and closes filters',await page.getByText('Pratinjau penambahan pesanan',{exact:true}).count()===0 && await filter().getAttribute('aria-expanded')==='false');
  await openFilters();await page.getByText('Meja 01',{exact:true}).last().click();await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor();
  await page.evaluate(()=>window.__setFocused(false));await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor({state:'hidden'});
  await page.evaluate(()=>window.__setFocused(true));await page.waitForTimeout(150);
  check('Blur also retires the nested picker portal',await page.getByText('Meja pada contoh Figma',{exact:true}).count()===0);
  await mode('bills');check('Remount starts with all three examples and closed filters',await cards().count()===3&&await filter().getAttribute('aria-expanded')==='false');
  const ports=[{w:320,h:640,side:0,bottom:0},{w:280,h:400,side:0,bottom:0},{w:240,h:320,side:24,bottom:48},{w:844,h:320,side:8,bottom:48}];
  for(const port of ports){
   await page.setViewportSize({width:port.w,height:port.h});await page.evaluate(p=>window.__setInsets({top:24,bottom:p.bottom,left:p.side,right:p.side}),port);await mode('bills');
   await openFilters();const bounds=await input().evaluate(n=>{const p=n.parentElement.getBoundingClientRect(),b=n.getBoundingClientRect();return {parent:p.toJSON(),input:b.toJSON()}});
   check('Search fits available width at '+port.w+' with side'+port.side,bounds.input.width>0&&bounds.input.right<=bounds.parent.right-14,bounds);
   await filter().click();
   for(const customer of ['Arif','Amek']){
    const add=page.getByRole('button',{name:`Tambah pesanan ${customer} (pratinjau)`,exact:true});await add.scrollIntoViewIfNeeded();
    const b=await add.boundingBox(),f=await page.getByRole('button',{name:'Kembali Katalog',exact:true}).boundingBox();
    check('Whole '+customer+' Add stays visible above footer at '+port.w,b.x>=port.side+16&&b.x+b.width<=port.w-port.side-16&&b.y>=0&&b.y+b.height<=f.y-16+0.7,{b,f});
    await add.click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor();
    const close=page.getByRole('button',{name:'Tutup',exact:true});await close.scrollIntoViewIfNeeded();const cb=await close.boundingBox();
    check('Information close is fully reachable at '+port.w,cb.height>=48&&cb.y>=24&&cb.y+cb.height<=port.h+0.7,cb);
    await close.click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor({state:'hidden'});
   }
   const footer=page.getByRole('button',{name:'Kembali Katalog',exact:true}), fb=await footer.boundingBox();geometry.push({port,footer:fb});
   check('Sticky footer accounts for side and bottom safe area at '+port.w,fb.x===16+port.side&&Math.abs(fb.width-(port.w-32-port.side*2))<0.7&&Math.abs(fb.y+fb.height-(port.h-port.bottom-16))<0.7,fb);
   await footer.click();check('Physical footer returns to canonical catalog at '+port.w,JSON.stringify(await page.evaluate(()=>window.__routes.at(-1)))===JSON.stringify({kind:'replace',href:'/(no-layout)/(cashier)/catalog'}));
   await page.screenshot({path:path.join(output,'final-'+port.w+'.png')});
  }
  await page.setViewportSize({width:240,height:320});await page.evaluate(()=>window.__setInsets({top:24,bottom:48,left:24,right:24}));await mode('bills');
  const large=await page.addStyleTag({content:'[dir="auto"]{font-size:28px!important;line-height:1.3!important}'});
  await page.waitForTimeout(250);
  const add=page.getByRole('button',{name:'Tambah pesanan Amek (pratinjau)',exact:true});await add.scrollIntoViewIfNeeded();const ab=await add.boundingBox(),fb=await page.getByRole('button',{name:'Kembali Katalog',exact:true}).boundingBox();
  check('Large text grows Add and measured footer without obscuring last card',ab.height>=36&&ab.x>=40&&ab.x+ab.width<=200&&ab.y+ab.height<=fb.y-16+0.7,{ab,fb});
  await add.click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor();const close=page.getByRole('button',{name:'Tutup',exact:true});await close.scrollIntoViewIfNeeded();await close.click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor({state:'hidden'});
  check('Large text information remains scrollable and closable',true);
  await page.screenshot({path:path.join(output,'final-large-240.png')});await large.evaluate(n=>n.remove());
  await page.setViewportSize({width:390,height:947});await page.evaluate(()=>window.__setInsets({top:24,bottom:0,left:0,right:0}));await mode('bills');
  await page.evaluate(()=>{window.__routes=[];window.__canGoBack=false});await page.getByRole('button',{name:'Kembali',exact:true}).click();
  check('Header fallback recovers to Catalog on direct entry',JSON.stringify(await page.evaluate(()=>window.__routes.at(-1)))===JSON.stringify({kind:'replace',href:'/(no-layout)/(cashier)/catalog'}));
  await page.evaluate(()=>window.__canGoBack=true);await page.getByRole('button',{name:'Kembali',exact:true}).click();check('Header preserves available history',await page.evaluate(()=>window.__routes.at(-1).kind)==='back');
  await mode('catalog');const entry=page.getByRole('button',{name:'Lihat contoh tagihan dari katalog',exact:true});await entry.waitFor();await entry.click();
  check('Real Catalog entry opens the new route',JSON.stringify(await page.evaluate(()=>window.__routes.at(-1)))===JSON.stringify({kind:'push',href:'/(no-layout)/(cashier)/catalog/bills'}));
  check('Published legacy Catalog Total Harga and original Checkout remain present',await page.getByText('Total Harga',{exact:true}).count()===1&&await page.getByRole('button',{name:'Checkout',exact:true}).count()===1);
  await page.getByRole('button',{name:'Checkout',exact:true}).click();check('Original Catalog cart destination is preserved',await page.evaluate(()=>window.__routes.at(-1).href)==='/(no-layout)/(cashier)/cart');
  await page.setViewportSize({width:240,height:400});await page.getByRole('button',{name:'Lihat contoh tagihan dari katalog',exact:true}).scrollIntoViewIfNeeded();
  const eb=await entry.boundingBox();check('New Catalog entry fits a240px screen',eb.x>=16&&eb.x+eb.width<=224,eb);await entry.click();
  check('Catalog entry also works at narrow width',await page.evaluate(()=>window.__routes.at(-1).href)==='/(no-layout)/(cashier)/catalog/bills');
  async function whole(locator,v){
   const e=locator.locator('xpath=ancestor-or-self::*[self::button or @tabindex="0"][1]');await e.scrollIntoViewIfNeeded();await page.waitForTimeout(450);
   const measure=()=>e.evaluate((e,v)=>{
    const b=e.getBoundingClientRect(),glyphs=[],walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let l=v.side,r=v.w-v.side,t=24,bt=v.h-v.bottom;const clips=[];
    for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowX)){l=Math.max(l,b.left);r=Math.min(r,b.right);}if(/auto|scroll|hidden|clip/.test(s.overflowY)){t=Math.max(t,b.top);bt=Math.min(bt,b.bottom);clips.push({box:b.toJSON(),scrollTop:p.scrollTop,clientHeight:p.clientHeight,scrollHeight:p.scrollHeight});}}
    for(let n=walker.nextNode();n;n=walker.nextNode())for(let i=0;i<n.textContent.length;i++)if(n.textContent[i].trim()){const range=document.createRange();range.setStart(n,i);range.setEnd(n,i+1);for(const q of range.getClientRects())if(q.width&&q.height)glyphs.push({char:n.textContent[i],...q.toJSON()});}
    const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return {box:b.toJSON(),glyphs,l,r,t,bt,clips,hit:hit===e||e.contains(hit)};
   },v);let g=await measure();const delta=g.box.top<g.t-.7?g.box.top-g.t-4:g.box.bottom>g.bt+.7?g.box.bottom-g.bt+4:0;
   if(delta&&g.hit){await page.mouse.move(g.box.x+g.box.width/2,Math.max(g.t+2,Math.min(g.bt-2,g.box.y+g.box.height/2)));await page.mouse.wheel(0,delta);await page.waitForTimeout(450);g=await measure();g.physicalWheel=true;}
   assert.ok(g.box.left>=g.l-.7&&g.box.right<=g.r+.7&&g.box.top>=g.t-.7&&g.box.bottom<=g.bt+.7,JSON.stringify(g));assert.equal(g.hit,true,JSON.stringify(g));assert.ok(g.glyphs.length>0);
   for(const q of g.glyphs)assert.ok(q.left>=Math.max(g.l,g.box.left)-.7&&q.right<=Math.min(g.r,g.box.right)+.7&&q.top>=Math.max(g.t,g.box.top)-.7&&q.bottom<=Math.min(g.bt,g.box.bottom)+.7,JSON.stringify({g,q}));return g;
  }
  const natural=async()=>page.evaluate(()=>[...document.querySelectorAll('[data-testid^="catalog-bill-29:"],[dir="auto"],button')].map(e=>({text:e.textContent,tag:e.tagName,box:e.getBoundingClientRect().toJSON()})));
  for(const v of [{w:390,h:947,side:0,bottom:0},{w:320,h:640,side:0,bottom:0}]){
   await page.setViewportSize({width:v.w,height:v.h});await page.evaluate(p=>window.__setInsets({top:24,bottom:p.bottom,left:p.side,right:p.side}),v);await mode('bills-before');await page.waitForTimeout(450);const before=await natural();await mode('bills');await page.waitForTimeout(450);const current=await natural();
   assert.equal(before.length,current.length);for(let i=0;i<before.length;i++){assert.equal(before[i].tag,current[i].tag);assert.equal(before[i].text,current[i].text);for(const k of ['x','y','width','height'])assert.ok(Math.abs(before[i].box[k]-current[i].box[k])<=.7,JSON.stringify({v,k,before:before[i],current:current[i]}));}
   geometry.push({normalComparison:v,before,current});check('Samebundle exact738/current every normal card/text/target/scroll/footer position preserved '+v.w,true);
  }
  const negativePort={w:844,h:240,side:48,bottom:48};await page.setViewportSize({width:844,height:240});await page.evaluate(()=>window.__setInsets({top:24,bottom:48,left:48,right:48}));await mode('bills-before');const oldLarge=await page.addStyleTag({content:'[dir="auto"]{font-size:28px!important;line-height:40px!important}'});let failure;
  try{await whole(page.getByRole('button',{name:'Tambah pesanan Arif (pratinjau)',exact:true}),negativePort);}catch(e){failure=JSON.parse(e.message);}
  assert.ok(failure);assert.equal(failure.box.height,42);assert.equal(failure.bt-failure.t,31);geometry.push({exactBeforeNegative:failure});check('Samebundle exact738 Before42target cannotfit31viewport CSS28/40 at844x240',true,failure);await page.screenshot({path:path.join(output,'samebundle-before-clipped844.png')});await oldLarge.evaluate(e=>e.remove());

  const extra=[];
  for(const v of [{w:320,h:640,side:8,bottom:48},{w:240,h:320,side:24,bottom:48},{w:844,h:240,side:48,bottom:48}]){
   await page.setViewportSize({width:v.w,height:v.h});await page.evaluate(p=>window.__setInsets({top:24,bottom:p.bottom,left:p.side,right:p.side}),v);await mode('bills');
   for(const css of [false,true]){
    const style=css?await page.addStyleTag({content:'[dir="auto"]{font-size:28px!important;line-height:40px!important}'}):null;
    const detail={v,css,targets:[]};
    for(const customer of ['Arif','Amek']){
     const add=page.getByRole('button',{name:`Tambah pesanan ${customer} (pratinjau)`,exact:true});detail.targets.push(await whole(add,v));await add.click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor();
     const close=page.getByRole('button',{name:'Tutup',exact:true});detail.targets.push(await whole(close,v));await close.click();await page.getByText('Pratinjau penambahan pesanan',{exact:true}).waitFor({state:'hidden'});
    }
    const footer=page.getByRole('button',{name:'Kembali Katalog',exact:true});detail.targets.push(await whole(footer,v));await footer.click();assert.deepEqual(await page.evaluate(()=>window.__routes.at(-1)),{kind:'replace',href:'/(no-layout)/(cashier)/catalog'});
    extra.push(detail);check('Independent everyglyph/ancestorclip/fulltarget/AddCloseFooter OS48 '+v.w+'x'+v.h+' CSS'+css,true,detail);
    if(css)await page.screenshot({path:path.join(output,'own-large-'+v.w+'x'+v.h+'.png')});if(style)await style.evaluate(e=>e.remove());
   }
   await mode('bills');await openFilters();await page.getByText('Semua meja',{exact:true}).last().click();await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor();
   const cancel=await whole(page.getByText('Batal',{exact:true}),v);await page.getByText('Batal',{exact:true}).click();await page.getByText('Meja pada contoh Figma',{exact:true}).waitFor({state:'hidden'});check('Independent actual tablepicker firstBatal safe '+v.w+'x'+v.h,true,cancel);
  }
  const selectNormal={w:390,h:947,side:0,bottom:0};await page.setViewportSize({width:390,height:947});await page.evaluate(()=>window.__setInsets({top:24,bottom:0,left:0,right:0}));await mode('select');
  async function configure(config){await page.evaluate(c=>{window.__selectEvents=[];window.__configureSelect(c);},config);await page.waitForTimeout(250);}
  async function selectTrigger(){await page.getByText('Alpha',{exact:true}).click();await page.getByText('Pilihan privat',{exact:true}).waitFor();await page.waitForTimeout(450);}
  for(const appearance of ['default','figma']){
   const samples=[];
   for(const variant of ['before','current']){
    await configure({appearance,variant,viewportSafe:false,showConfirmButton:true});await selectTrigger();
    const measures=[];for(const label of ['Batal','Alpha','Beta','Gamma','Disabled','Selesai']){const e=page.getByText(label,{exact:true}).last();measures.push({label,box:await e.boundingBox()});}
    samples.push({variant,measures});await page.getByText('Batal',{exact:true}).click();await page.getByText('Pilihan privat',{exact:true}).waitFor({state:'hidden'});
   }
   for(let i=0;i<samples[0].measures.length;i++)for(const k of ['x','y','width','height'])assert.ok(Math.abs(samples[0].measures[i].box[k]-samples[1].measures[i].box[k])<=.7,JSON.stringify(samples));
   check('ActualBefore/current Select defaultfalse normal popup preserves everylabel geometry '+appearance,true,samples);
   await configure({appearance,variant:'current',viewportSafe:false,showConfirmButton:true});await selectTrigger();const search=page.getByPlaceholder('Cari pilihan privat...', {exact:true});await search.fill('bEtA');await page.waitForTimeout(200);assert.equal(await page.getByText('Alpha',{exact:true}).count(),1);assert.equal(await page.getByText('Gamma',{exact:true}).count(),0);await page.getByText('Beta',{exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.__selectEvents),[]);await page.getByText('Batal',{exact:true}).click();await selectTrigger();assert.equal(await search.inputValue(),'');assert.equal(await page.evaluate(()=>window.__selectValue),'alpha');await page.getByText('Beta',{exact:true}).click();await page.getByText('Selesai',{exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.__selectEvents),['beta']);check('Select defaultfalse search/draft/Batal/reopen/one explicitcommit '+appearance,true);
  }
  for(const v of [{w:240,h:320,side:24,bottom:48},{w:844,h:240,side:48,bottom:48}]){
   await page.setViewportSize({width:v.w,height:v.h});await page.evaluate(p=>window.__setInsets({top:24,bottom:p.bottom,left:p.side,right:p.side}),v);
   await configure({variant:'current',appearance:'default',viewportSafe:true,showConfirmButton:true});await selectTrigger();const firstCancel=await whole(page.getByText('Batal',{exact:true}),v);await page.getByText('Batal',{exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.__selectEvents),[]);check('Shared Select optin firstphysical Batal safe OS48 '+v.w,true,firstCancel);
   await selectTrigger();await whole(page.getByText('Gamma',{exact:true}),v);await page.getByText('Gamma',{exact:true}).click();await whole(page.getByText('Selesai',{exact:true}),v);await page.getByText('Selesai',{exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.__selectEvents),['gamma']);check('Shared Select optin whole lastoption+confirm onecommit '+v.w,true);
  }
  check('Independent main-based body and compatibility fixtures leave localStorage empty',JSON.stringify(await page.evaluate(()=>Object.keys(localStorage)))==='[]');
  geometry.push({independentExtras:extra});verify();

  check('No runtime or network errors',errors.length===0,errors);
  const renderedCss=await page.locator('style').evaluateAll(ns=>ns.map(n=>n.textContent).find(t=>t.startsWith('html,body,#root')));
  check('Rendered CSS matches final completed CSS artifact',renderedCss==='html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}#root{display:flex}'+fs.readFileSync(path.join(preview,'style.css'),'utf8'));
  const build=JSON.parse(fs.readFileSync(path.join(preview,'build.json')));verify();
  const drift=Object.entries(build.compiledInputs).filter(([f,h])=>require('node:crypto').createHash('sha256').update(fs.readFileSync(f)).digest('hex')!==h).map(([f])=>f);
  check('All compiled source bindings remain unchanged',drift.length===0,drift);
  const result={status:checks.every(c=>c.pass)?'PASS':'FAIL',checks,geometry,errors,sourceBindings:build.sources,compiledInputs:build.compiledInputs,limits:'Actual new route/body/cards/shared controls/fonts/original SVGs and real Catalog/layout registered Header. Private router/JSStack/params/focus/haptics adapters, safe-area injection and CSS large-text stress; no native/fullRouter/backend/wholeFigma certification.'};
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({status:result.status,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass)}));
  if(result.status!=='PASS')process.exitCode=1;

 } finally { await browser.close(); }
})().catch(e=>{fs.writeFileSync(path.join(output,'fatal.json'),JSON.stringify({status:'FAIL',message:e.message,stack:e.stack,errors},null,2));console.error(e.stack);console.error(JSON.stringify(errors));process.exitCode=1});
