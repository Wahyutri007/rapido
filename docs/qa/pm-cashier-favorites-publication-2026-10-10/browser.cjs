const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),output=path.resolve(process.argv[process.argv.indexOf('--build')+1]),stage=process.argv[process.argv.indexOf('--stage')+1]||'first';
const {chromium}=require(path.join(root,'.expo/payroll-qa-tools/node_modules/playwright'));
const origin='http://pm-favorites.fixture.local',checks=[],errors=[],external=[],captures=[];
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const labels=['Transaksi','Member','Stok','Riwayat Shift','Printer','Scanner','Laci Kasir','Pengaturan'];
const routes=['/transaction','/(no-layout)/manage/member','/stock','/shift','/(no-layout)/manage/printer','/scanner','/cash-drawer','/(no-layout)/manage/pos-settings'];
(async()=>{let browser,page;try{
 const build=JSON.parse(fs.readFileSync(path.join(output,'build.json'),'utf8'));for(const [file,hash]of Object.entries({...build.sources,...build.transformedSources}))assert.equal(sha(path.join(root,file)),hash,file);
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.route('**/*',async route=>{const url=new URL(route.request().url());
  if(url.origin===origin&&url.pathname==='/bundle.js')return route.fulfill({path:path.join(output,'bundle.js'),contentType:'text/javascript'});
  if(url.origin===origin&&url.pathname.startsWith('/assets/')){const relative=url.searchParams.get('unstable_path')?path.join(url.searchParams.get('unstable_path'),path.basename(decodeURIComponent(url.pathname))):decodeURIComponent(url.pathname).slice(8);const file=path.resolve(root,relative);if(file.toLowerCase().startsWith((root+path.sep).toLowerCase())&&fs.existsSync(file))return route.fulfill({path:file});}
  if(url.origin===origin&&url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}'+fs.readFileSync(path.join(output,'style.css'),'utf8')+'</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>'});
  external.push(url.href);return route.abort();
 });
 await page.goto(origin,{waitUntil:'commit'});await page.getByRole('button',{name:'Transaksi',exact:true}).waitFor({timeout:90000});await page.evaluate(()=>document.fonts.ready);
 const grid=()=>page.getByTestId('cashier-favorites-grid');
 async function geometry(name){const rectangles=await Promise.all(labels.map(async label=>({label,...await page.getByRole('button',{name:label,exact:true}).boundingBox()})));
  check(name+' fixed two rows of four',rectangles.slice(0,4).every(r=>Math.abs(r.y-rectangles[0].y)<.5)&&rectangles.slice(4).every(r=>Math.abs(r.y-rectangles[4].y)<.5)&&rectangles[4].y>rectangles[0].y,rectangles);
  check(name+' equal columns and16px gaps',rectangles.every(r=>Math.abs(r.width-rectangles[0].width)<.5)&&[0,1,2,4,5,6].every(i=>Math.abs(rectangles[i+1].x-rectangles[i].x-rectangles[i].width-16)<.5),rectangles);
  check(name+' all eight targets inside viewport',rectangles.every(r=>r.x>=0&&r.x+r.width<=innerWidthSafe()&&r.y>=0),rectangles);
  check(name+' labels do not clip or overflow horizontally',await grid().locator('[dir="auto"]').evaluateAll(nodes=>nodes.length===8&&nodes.every(n=>n.scrollWidth<=n.clientWidth+1&&n.scrollHeight<=n.clientHeight+1)),await grid().boundingBox());
  check(name+' no document horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  return rectangles;
 }
 function innerWidthSafe(){return page.viewportSize().width+.5;}
 async function capture(name){const file='browser-'+stage+'-'+name+'.png';await page.screenshot({path:path.join(__dirname,file)});captures.push({file,sha256:sha(path.join(__dirname,file))});}
 const initial=await geometry('390');const card=grid().locator('..').locator('..');const cardRect=await card.boundingBox();
 check('390 Figma Menu Wrapper width358 and height168',Math.abs(cardRect.width-358)<.5&&Math.abs(cardRect.height-168)<.5,cardRect);
 check('390 Figma71.5 column and64 row with80 row offset',initial.every(r=>Math.abs(r.width-71.5)<.5&&Math.abs(r.height-64)<.5)&&Math.abs(initial[4].y-initial[0].y-80)<.5,initial);
 check('Preserved original illustrations load',await grid().locator('img').evaluateAll(nodes=>nodes.length===8&&nodes.every(n=>n.complete&&n.naturalWidth>0)),await grid().locator('img').count());
 check('Member original SVG remains20 inside40 tile',await page.getByRole('button',{name:'Member',exact:true}).evaluate(n=>{const image=n.querySelector('img');if(!image)return false;const rectangles=[];for(let e=image;e&&e!==n;e=e.parentElement)rectangles.push(e.getBoundingClientRect());return rectangles.some(r=>Math.abs(r.width-20)<.5&&Math.abs(r.height-20)<.5)&&rectangles.some(r=>Math.abs(r.width-40)<.5&&Math.abs(r.height-40)<.5);}));
 await capture('390');for(const viewport of [{width:360,height:640},{width:320,height:568},{width:280,height:640},{width:844,height:390}]){await page.setViewportSize(viewport);await geometry(String(viewport.width));await capture(String(viewport.width));}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>globalThis.__narrow(280));await geometry('280 container in390 viewport');await capture('narrow');await page.evaluate(()=>globalThis.__narrow(null));
 const scale=await page.addStyleTag({content:'[data-testid="cashier-favorites-grid"] [dir="auto"]{font-size:24px!important;line-height:32px!important}'});await geometry('2x label-size adapter');await capture('large-labels');await scale.evaluate(n=>n.remove());
 for(const label of labels)await page.getByRole('button',{name:label,exact:true}).click();const events=await page.evaluate(()=>__fixture.routes);check('All eight navigation callbacks unchanged',JSON.stringify(events)===JSON.stringify(routes),events);
 }catch(error){checks.push({name:'Browser execution',pass:false,error:error.stack});}finally{if(browser)await browser.close();}
const result={recordedAtUtc:new Date().toISOString(),pass:checks.filter(c=>c.pass).length,fail:checks.filter(c=>!c.pass).length,checks,errors,external,captures,build:path.join(output,'build.json'),scope:'Actual MainMenu/Card/fonts/illustrations and exact favorite section extracted from candidate Home; isolated RNWeb/router adapter, no native/fullHome/fullrouter/100% artwork claim.'};fs.writeFileSync(path.join(__dirname,'browser-'+stage+'.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,checks:checks.filter(c=>!c.pass),captures:undefined}));process.exitCode=result.fail||errors.length||external.length?1:0;})();
