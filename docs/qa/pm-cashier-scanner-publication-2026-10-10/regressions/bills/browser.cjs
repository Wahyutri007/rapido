const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(path.resolve('.expo/payroll-qa-tools/node_modules/playwright'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const packet=__dirname,output=path.join(packet,process.argv.includes('--output-name')?process.argv[process.argv.indexOf('--output-name')+1]:process.argv.includes('--retry')?'bills-review-final':'bills-review');
if(fs.existsSync(path.join(output,'results.json')))throw Error('Preserve completed review.');
fs.mkdirSync(output,{recursive:true});
const preview=path.resolve(process.argv[process.argv.indexOf('--preview')+1]),rawBuild=JSON.parse(fs.readFileSync(path.join(preview,'build.json')));
const build={before:{...rawBuild.sources,...rawBuild.transformedSources},inputs:Object.entries(rawBuild.transformedSources).map(([file,sha256])=>({file:path.resolve(file),sha256})),bundle:{path:path.join(preview,'bundle.js'),sha256:rawBuild.bundleHash},css:{path:path.join(preview,'style.css'),sha256:rawBuild.styleHash}};
const checks=[],errors=[],consoleErrors=[],blocked=[],geometry=[];
const check=(name,pass,details)=>{checks.push({name,pass:!!pass,details});};
for(const [file,sha]of Object.entries(build.before))if(hash(file)!==sha)throw Error('Source drift: '+file);
for(const input of build.inputs)if(hash(input.file)!==input.sha256)throw Error('Resolved dependency drift: '+input.file);
if(hash(build.bundle.path)!==build.bundle.sha256||hash(build.css.path)!==build.css.sha256)throw Error('Bundle/CSS drift.');
const productionAssets=['assets/images/cashier/bills/bell.svg','assets/images/cashier/bills/chevron-down.svg',...['home','catalog','report','bills','location'].map(name=>'assets/images/cashier/navigation/'+name+'.svg')];
const originals=JSON.parse(fs.readFileSync(path.join(packet,'QC_BILLS_BROWSER.json'))).originals;for(const asset of originals)assert.equal(hash(asset.file),asset.sha256,asset.file);
check('Seven rendered local SVG files match original archived Tagihan export bytes',originals.length===7,originals);
const allowed=new Set(build.inputs.map(input=>path.resolve(input.file).toLowerCase()));
for(const name of ['Regular','Medium','SemiBold','Bold'])allowed.add(path.resolve('assets/fonts/Inter_24pt-'+name+'.ttf').toLowerCase());
const extraFiles=[...productionAssets,'assets/images/figma/back-office/back.svg','node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf',...['Regular','Medium','SemiBold','Bold'].map(name=>'assets/fonts/Inter_24pt-'+name+'.ttf')];
const buildAssets=JSON.parse(fs.readFileSync(path.join(preview,'assets.json')));
const servedAssets=new Map(buildAssets.flatMap(asset=>(asset.files||[]).map(file=>[decodeURIComponent(new URL(asset.httpServerLocation+'/'+path.basename(file),'http://qc-bills-independent.test').pathname),file])));
const assetBindings=Object.fromEntries([...extraFiles,...buildAssets.flatMap(asset=>asset.files||[])].map(file=>[file,hash(file)]));
for(const file of extraFiles)allowed.add(path.resolve(file).toLowerCase());
let browser,page;
const origin='http://qc-bills-independent.test';
(async()=>{
 try{
  const privateTemp='D:/RapidoQCCache/cash-input-offline-layout-2026-10-09/bills-browser';fs.mkdirSync(privateTemp,{recursive:true});process.env.TEMP=privateTemp;process.env.TMP=privateTemp;
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin===origin&&url.pathname==='/entry.bundle.js')return route.fulfill({path:build.bundle.path,contentType:'text/javascript'});
   if(url.origin===origin&&servedAssets.has(decodeURIComponent(url.pathname)))return route.fulfill({path:servedAssets.get(decodeURIComponent(url.pathname))});
   if(url.origin===origin&&url.pathname.startsWith('/assets/')){
    const relative=url.searchParams.get('unstable_path')?path.join(url.searchParams.get('unstable_path'),path.basename(decodeURIComponent(url.pathname))):decodeURIComponent(url.pathname).slice('/assets/'.length);
    const file=path.resolve(relative);if(allowed.has(file.toLowerCase())&&fs.existsSync(file))return route.fulfill({path:file});
   }
   if(url.origin===origin&&url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}'+fs.readFileSync(build.css.path,'utf8')+'</style></head><body><div id="root"></div><script src="/entry.bundle.js"></script></body></html>'});
   blocked.push(route.request().url());return route.abort();
  });
  await page.goto(origin,{waitUntil:'commit',timeout:120000});await page.getByTestId('bill-preview-heading').first().waitFor({timeout:60000});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>[...document.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0));
  const decoded=await page.locator('img').evaluateAll(images=>images.filter(i=>i.getBoundingClientRect().width>0).map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height})));
  check('Eight visible reference SVG image instances decode',decoded.length>=8&&decoded.every(i=>i.loaded),decoded);
  const cards=page.locator('[data-testid^="bill-preview-29:"]');
  check('Exactly three Figma card examples render',await cards.count()===3);
  const reference=await cards.evaluateAll(elements=>elements.map(e=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};return{card:rect(e),header:rect(e.querySelector('[data-testid="bill-preview-heading"]')),detail:rect(e.querySelector('[data-testid="bill-preview-details"]')),actions:rect(e.querySelector('[data-testid="bill-preview-actions"]')),text:e.innerText};}));
  for(const [i,row]of reference.entries())check(`Reference card${i+1} has357x174 and exact row position`,row.card.x===16&&row.card.y===130+190*i&&row.card.width===357&&row.card.height===174&&row.header.height===50&&row.detail.height===66&&row.actions.height===58,row);
  check('Customer/table examples follow downloaded reference order',reference.every((row,i)=>row.text.includes(['Arif - Meja 01','Julian - Meja 02','Amek - Meja 03'][i])));
  const rect=async locator=>locator.evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};});
  const add=await rect(page.getByRole('button',{name:'Tambah pesanan Arif (pratinjau)',exact:true})),pay=await rect(page.getByRole('button',{name:'Bayar tagihan Arif (pratinjau)',exact:true}));
  check('Reference action sizes/gap103x34,87x34,12px',add.width===103&&add.height===34&&pay.width===87&&pay.height===34&&pay.x-add.right===12,{add,pay});
  await page.screenshot({path:path.join(output,'reference390.png')});
  const scenarios=[{width:320,height:568,bottom:0,fontScale:1},{width:360,height:640,bottom:24,fontScale:2},{width:390,height:844,bottom:48,fontScale:2.5},{width:844,height:390,bottom:24,fontScale:1.5}];
  for(const scenario of scenarios){
   await page.setViewportSize({width:scenario.width,height:scenario.height});await page.evaluate(s=>window.setBillEnvironment(s.bottom,s.fontScale),scenario);await page.waitForTimeout(100);
   const boxes=await cards.evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,right:r.right,width:r.width,client:e.clientWidth,scroll:e.scrollWidth};}));
   check(`${scenario.width}: cards fit available width`,boxes.every(box=>box.x>=0&&box.right<=scenario.width&&box.scroll<=box.client+1),boxes);
   await page.evaluate(()=>{const card=document.querySelector('[data-testid^="bill-preview-29:"]');let node=card.parentElement;while(node&&!(node.scrollHeight>node.clientHeight+2&&getComputedStyle(node).overflowY.match(/auto|scroll/)))node=node.parentElement;if(!node)throw Error('Scrollable ancestor absent');node.scrollTop=node.scrollHeight;});await page.waitForTimeout(100);
   const last=await rect(page.getByRole('button',{name:'Bayar tagihan Amek (pratinjau)',exact:true})),nav=await rect(page.getByRole('tab',{name:'Tagihan',exact:true})),notice=await rect(page.getByText('Pratinjau Figma · bukan transaksi toko.',{exact:true}));
   check(`${scenario.width} inset${scenario.bottom} scale${scenario.fontScale}: final action clears navbar`,last.y>=0&&last.bottom<=nav.y,{last,nav});
   check(`${scenario.width}: preview note clears navbar`,notice.y>=0&&notice.bottom<=nav.y,{notice,nav});
   geometry.push({scenario,boxes,last,nav,notice});await page.screenshot({path:path.join(output,`clearance-${scenario.width}.png`)});
  }
  function passed(name){check(name,true);}
  const filter=()=>page.getByRole('button',{name:/Filter contoh tagihan:/});
  async function scrollStart(){await page.evaluate(()=>{const card=document.querySelector('[data-testid^="bill-preview-29:"]');let node=card.parentElement;while(node&&!(node.scrollHeight>node.clientHeight+2&&getComputedStyle(node).overflowY.match(/auto|scroll/)))node=node.parentElement;if(node)node.scrollTop=0;});await page.waitForTimeout(150);}
  await page.evaluate(()=>window.setBillEnvironment(0,1));
  await page.setViewportSize({width:390,height:844});await scrollStart();await filter().click();
  const search=page.getByPlaceholder('Cari pelanggan atau meja');await search.fill('not-found-qc');await page.getByText('Tidak ada contoh tagihan sesuai filter.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Reset filter',exact:true}).click();await cards.first().waitFor();assert.equal(await search.inputValue(),'');
  await search.fill('  jUlIaN  ');await page.waitForTimeout(300);assert.equal(await cards.count(),1);assert.ok((await cards.first().innerText()).includes('Julian'));
  await page.getByRole('button',{name:'Reset filter',exact:true}).click();await page.waitForTimeout(200);
  await search.fill('pending-no-match');await page.getByRole('button',{name:'Reset filter',exact:true}).click();await page.waitForTimeout(300);assert.equal(await cards.count(),3);assert.equal(await search.inputValue(),'');
  passed('Actual debounced search, case/space normalization, empty state and Reset recover without stale query');
  await page.getByText('Semua meja',{exact:true}).first().click();await page.getByText('Meja 03',{exact:true}).last().click();await page.waitForTimeout(250);
  assert.equal(await cards.count(),1);assert.ok((await filter().getAttribute('aria-label')).includes('Meja 03'));assert.ok((await cards.first().innerText()).includes('Amek'));
  await page.getByRole('button',{name:'Reset filter',exact:true}).click();await page.waitForTimeout(200);assert.equal(await cards.count(),3);
  passed('Actual SingleSelect filters known table03 and Reset restores the three reference examples');
  await search.fill('Arif');await filter().click();await page.waitForTimeout(250);assert.equal(await search.isVisible(),false);assert.equal(await cards.count(),1);
  await filter().click();assert.equal(await search.inputValue(),'Arif');await page.getByRole('button',{name:'Reset filter',exact:true}).click();await page.waitForTimeout(250);await filter().click();await scrollStart();
  passed('Disclosure preserves the search draft while hiding filter controls');
  for(const item of [{button:'Tambah pesanan Arif (pratinjau)',title:'Pratinjau pesanan',customer:'Arif - Meja 01'},{button:'Bayar tagihan Julian (pratinjau)',title:'Pratinjau pembayaran',customer:'Julian - Meja 02'}]){
   await page.getByRole('button',{name:item.button,exact:true}).click();await page.getByText(item.title,{exact:true}).waitFor();
   await page.getByText(new RegExp(item.customer+'.*belum terhubung')).waitFor();
   if(item.title==='Pratinjau pembayaran')await page.screenshot({path:path.join(__dirname,'payment-preview.png')});
   await page.getByRole('button',{name:'Tutup',exact:true}).click();await page.getByText(item.title,{exact:true}).waitFor({state:'hidden'});
   assert.deepEqual(await page.evaluate(()=>window.billEvents),[]);assert.equal(await cards.count(),3);
   passed(`${item.title} opens honest selected-example information and closes without business navigation`);
  }
  await page.evaluate(()=>window.setBillPreviewMode('legacy'));
  const sm=await rect(page.getByRole('button',{name:'Default sm',exact:true})),md=await rect(page.getByRole('button',{name:'Default md',exact:true}));assert.equal(sm.height,36);assert.equal(md.height,40);assert.equal(await page.getByRole('button',{name:'Default disabled',exact:true}).isDisabled(),true);
  passed('Opt-in bill size preserves actual shared sm36/md40 sizes and disabled button behavior');
  for(const viewport of [{width:320,height:568},{width:844,height:390}]){
   await page.setViewportSize(viewport);await page.evaluate(()=>window.setBillPreviewMode('stress'));await page.getByText('Tanggal tidak tersedia',{exact:true}).waitFor();
   const stress=await cards.first().evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,text:e.innerText}));assert.ok(stress.scroll<=stress.width+1,JSON.stringify(stress));assert.ok(stress.text.includes('Rp9.007.199.254.740.991'));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(__dirname,`stress-${viewport.width}.png`)});passed(`Long reference props and largest valid amount wrap without horizontal overflow at ${viewport.width}px`);
  }
 }catch(error){check('Independent browser completes',false,{error:error.stack});}
 finally{
  const drift=Object.entries(build.before).filter(([file,sha])=>hash(file)!==sha).map(([file])=>file);
  check('Source stable throughout independent browser review',drift.length===0,{drift});
  const assetDrift=Object.entries(assetBindings).filter(([file,sha])=>hash(file)!==sha).map(([file])=>file);check('Served font/image asset bytes stable',assetDrift.length===0,{assetDrift});
  const result={checks,pass:checks.filter(c=>c.pass).length,fail:checks.filter(c=>!c.pass).length,geometry,originals,assetBindings,errors,consoleErrors,blocked,buildPacket:'docs/qa/senior-8-2026-10-09/cashier-bills-fidelity/build-results.json',bundle:build.bundle,css:build.css,scope:'Independently authored browser assertions replay the byte-verified developer bundle; candidate first-party build inputs and sources matched on intake. RNWeb/router/inset/fontScale layout adapters; fresh isolated candidate rebuild; no native/full-router/payment/pixel100 claim.'};
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({pass:result.pass,fail:result.fail,failures:checks.filter(c=>!c.pass),errors,consoleErrors,blocked}));if(browser)await browser.close();process.exitCode=result.fail||errors.length||consoleErrors.length||blocked.length?1:0;
 }
})();
