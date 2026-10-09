const fs=require('node:fs'),path=require('node:path'),{launch,delay}=require('./browser.cjs');
const css=fs.readFileSync(process.argv.includes('--offline')||process.argv.includes('--own-style')?__dirname+'/generated-web-style.css':'node_modules/react-native-css-interop/.cache/web.css','utf8');
fs.writeFileSync(__dirname+'/generated-web-style.css',css);
const html='<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><style>html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}#root{display:flex}</style></head><body><div id="root"></div><script src="/.expo/sd5-closing-preview/browser-entry.bundle?platform=web&dev=true&hot=false&lazy=false&transform.engine=hermes&transform.bytecode=0"></script></body></html>';
(async()=>{
const own='.expo/sd5-closing-offline';
const offline=process.argv.includes('--offline')?{bundle:fs.readFileSync(own+'/entry.bundle.js'),files:JSON.parse(fs.readFileSync(own+'/assets.json','utf8')).flatMap(a=>a.files)}:undefined;
const page=await launch(html,offline),checks=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log(JSON.stringify(checks.at(-1)));if(!pass)throw Error(name);};
const evalFn=(fn,arg)=>page.evaluate(`(${fn.toString()})(${JSON.stringify(arg)??'undefined'})`);
const text=()=>page.evaluate('document.body.innerText');
const wait=async predicate=>{for(let i=0;i<720;i++){if(page.errors.length)throw Error(page.errors.join('\n'));if(page.consoleErrors.length)throw Error(page.consoleErrors.join('\n'));if(await predicate())return;if(i%80===0)console.log('Waiting for preview, elapsed '+i/4+'s');await delay(250);}throw Error('UI wait timeout');};
const visibleElements=(label)=>evalFn(label=>[...document.querySelectorAll('*')].filter(e=>e.textContent===label&&e.children.length===0&&e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};}),label);
const click=async label=>{await evalFn(label=>{const e=[...document.querySelectorAll('*')].filter(e=>e.textContent===label&&e.children.length===0&&e.getBoundingClientRect().width>0).at(-1);e?.scrollIntoView({block:'center',inline:'nearest'});},label);await delay(80);const rects=await visibleElements(label);if(!rects.length)throw Error('Visible text missing: '+label);const r=rects.at(-1);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x,y:r.y,button:'left',clickCount:1});await delay(800);};
const fill=async value=>{const r=await evalFn(()=>{const e=[...document.querySelectorAll('input')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight&&!e.closest('[aria-hidden="true"],[inert],[hidden]');}).at(-1);if(!e)return null;e.focus();e.select();const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});if(!r)throw Error('Input missing');await page.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});await page.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});if(value)await page.send('Input.insertText',{text:value});await delay(350);};
const screenshot=async name=>{const r=await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(r.data,'base64'));};
const scroll=async bottom=>evalFn(bottom=>{const nodes=[...document.querySelectorAll('div')].filter(e=>e.scrollHeight>e.clientHeight+10&&/auto|scroll/.test(getComputedStyle(e).overflowY));for(const e of nodes)e.scrollTop=bottom?e.scrollHeight:0;return nodes.map(e=>({client:e.clientHeight,height:e.scrollHeight,top:e.scrollTop}));},bottom);
try{
await page.send('Page.navigate',{url:'http://127.0.0.1:8088/inventory'});
await page.send('Page.bringToFront');
await wait(async()=>(await text()).includes('Stok Akhir'));
check('Inventory hub renders closing-stock entry',(await text()).includes('Persediaan'));
await click('Stok Akhir');await wait(async()=>(await text()).includes('Nasgor - Pedas'));
check('hub opens production stock route',await page.evaluate('location.pathname.endsWith("/inventory/closing-stock")'));
await page.evaluate('document.fonts.ready');
await wait(()=>evalFn(()=>{const images=[...document.querySelectorAll('img')].filter(e=>e.getAttribute('src')?.includes('closing-stock'));return images.length===2&&images.every(e=>e.complete&&e.naturalWidth>0);}));
check('current product and material snapshot appears',(await text()).includes('Tepung Terigu')&&(await text()).includes('18 Kg'));
check('Inventory bottom tab remains present',(await text()).includes('Katalog')&&(await text()).includes('Beranda'));
await screenshot('mobile-390');
const imageMetadata=await evalFn(()=>[...document.querySelectorAll('img')].map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));fs.writeFileSync(__dirname+'/images.json',JSON.stringify(imageMetadata,null,2)+'\n');
check('exported SVG filter assets load',imageMetadata.filter(e=>/closing-stock/.test(e.src)).length===2&&imageMetadata.filter(e=>/closing-stock/.test(e.src)).every(e=>e.loaded));
await fill(' bbk-tpg ');check('search accepts typing and filters by SKU',(await text()).includes('Tepung Terigu')&&!(await text()).includes('Nasgor - Pedas'));
await fill('no-match-sd5');check('search empty state appears',(await text()).includes('Tidak ada stok yang sesuai'));
await click('Reset Filter');check('reset restores query and results',await page.evaluate('document.querySelector("input").value===""')&&(await text()).includes('Nasgor - Pedas'));
await click('Semua Status');await click('Menipis');check('low filter uses material minimum',(await text()).includes('Tepung Terigu')&&!(await text()).includes('Teh Es'));await screenshot('low-stock');
await click('Reset Filter');
await click('Semua Toko');await wait(async()=>(await text()).includes('Toko Sushiro'));await click('Toko Sushiro');
check('store filter shows registered materials without inventing product scope',(await text()).includes('Tepung Terigu')&&!(await text()).includes('Nasgor - Pedas'));
check('unknown store quantity is explained',(await text()).includes('Jumlah stok per toko belum')&&(await text()).includes('—')&&!(await text()).includes('18 Kg'));await screenshot('store-unavailable');
await click('Semua Status');await click('Habis');check('unknown store balances are not empty stock',(await text()).includes('Tidak ada stok yang sesuai'));
await click('Reset Filter');
await evalFn(()=>{const s=globalThis.__sd5InventoryMaterials;s.setState({materials:s.getState().materials.map(m=>m.id==='tepung'?{...m,stock:0}:m)});});await wait(async()=>(await text()).includes('0 Kg'));
check('material updates appear without reloading',(await text()).includes('0 Kg'));
await click('Semua Status');await click('Habis');check('zero quantity is filterable',(await text()).includes('Tepung Terigu')&&!(await text()).includes('Nasgor - Pedas'));
const tone=await evalFn(()=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent==='0 Kg');return {className:e.className,color:getComputedStyle(e).color,error:getComputedStyle(document.documentElement).getPropertyValue('--color-error-500').trim()};});fs.writeFileSync(__dirname+'/tone.json',JSON.stringify(tone,null,2)+'\n');
check('known zero uses the destructive text color',tone.color===`rgb(${tone.error.split(/\s+/).join(', ')})`,tone);await screenshot('empty-stock');
await click('Reset Filter');
for(const [width,height,name] of [[320,640,'narrow-320'],[844,390,'landscape-844'],[768,1024,'tablet-768']]){
await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await delay(200);await scroll(false);
check(name+' has no horizontal overflow',await evalFn(w=>document.documentElement.scrollWidth<=w,width));
await screenshot(name);const info=await scroll(true);check(name+' scrolls to the final material',info.some(s=>s.top>0)&&await evalFn(h=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent==='Ayam Fillet');if(!e)return false;const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<h-64;},height));
await screenshot(name+'-bottom');}
await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await scroll(false);
await fill('Tepung');await evalFn(()=>{const s=globalThis.__sd5InventoryMaterials;s.setState({materials:s.getState().materials.filter(m=>m.id!=='tepung')});});await wait(async()=>(await text()).includes('Tidak ada stok yang sesuai'));
check('removed materials disappear live',(await text()).includes('Tidak ada stok yang sesuai'));
const created=await evalFn(()=>globalThis.__sd5InventoryMaterials.getState().saveMaterial(undefined,{stores:['Toko Degri'],name:'Bahan Uji QA',sku:'SD5-QA-ONLY',unit:'Kg',stock:2.5,minimumStock:3,averagePrice:1000,expiresAt:null,note:''}));
check('existing material creation validates successfully',!!created.id,created);
await fill('SD5-QA-ONLY');await wait(async()=>(await text()).includes('2,5 Kg'));
check('new material and decimal unit appear live',(await text()).includes('Bahan Uji QA')&&(await text()).includes('2,5 Kg'));
await click('Semua Toko');await fill('Toko Degri');check('material store is searchable in the picker',(await text()).includes('Toko Degri')&&!(await text()).includes('Toko Sushiro'));await click('Toko Degri');
check('store membership filters the new material',(await text()).includes('Bahan Uji QA')&&!(await text()).includes('2,5 Kg'));
// Header source: left16, size40, inside its64px browser header. Click the actual control,
// whose framework wrapper has no button role; duplicate stack/card titles are unreliable locators.
const back=async()=>{const r={x:36,y:32};await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...r,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button:'left',clickCount:1});await delay(800);};
await back();check('header back returns to the Inventory hub',await page.evaluate('location.pathname==="/inventory"')&&(await text()).includes('Persediaan'));
await page.send('Page.navigate',{url:'http://127.0.0.1:8088/inventory/closing-stock'});await page.send('Page.bringToFront');await wait(async()=>(await text()).includes('Nasgor - Pedas'));await back();
check('cold-link back has a working Inventory fallback',await page.evaluate('location.pathname==="/inventory"')&&(await text()).includes('Persediaan'));
check('no browser runtime exceptions',page.errors.length===0,page.errors);
check('no console errors',page.consoleErrors.length===0,page.consoleErrors);
}catch(e){checks.push({name:'Browser execution completed',pass:false,error:e.message});fs.writeFileSync(__dirname+'/browser-failure.txt',e.stack);fs.writeFileSync(__dirname+'/failure-body.txt',await text());await screenshot('failure').catch(()=>{});console.error(e.stack);process.exitCode=1;}
finally{fs.writeFileSync(__dirname+'/browser-results.json',JSON.stringify({passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,runtimeErrors:page.errors,consoleErrors:page.consoleErrors,network:page.network,scope:'Production Inventory hub, stock screen, tab/layout, shared controls and material store; test-only ExpoRoot context bypasses authentication/API, mutations live only in this browser page.'},null,2)+'\n');await page.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
