const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{launch,delay}=require('./replay/browser.cjs');
const own='D:/Rapido-QC-temp/closing-stock-figma-2026-10-09',css=fs.readFileSync(path.join(__dirname,'replay/generated-web-style.css'),'utf8');
const html='<!doctype html><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><style>html,body,#root{width:100%;height:100%;margin:0;overflow:hidden}#root{display:flex}</style><div id="root"></div><script src="/browser-entry.bundle"></script>';
const xml=fs.readFileSync(path.join(__dirname,'replay/figma-metadata.xml'),'utf8'),nodes=new Map(),stack=[];
for(const line of xml.split(/\r?\n/)){
 const m=line.match(/^(\s*)<(frame|instance|text|line)\b(.*)>\s*$/);if(!m)continue;
 const indent=m[1].length;while(stack.length&&stack.at(-1).indent>=indent)stack.pop();
 const attrs=Object.fromEntries([...m[3].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]));if(!attrs.id)continue;
 const node={...attrs,indent,absoluteX:stack.length?stack.at(-1).absoluteX+Number(attrs.x):0,absoluteY:stack.length?stack.at(-1).absoluteY+Number(attrs.y):0};nodes.set(attrs.id,node);if(!/\/\s*$/.test(m[3]))stack.push(node);
}
const expected=Object.fromEntries(Object.entries({search:'1:12485',store:'1:12403',status:'1:12412',card:'1:12422',tier:'1:12423',food:'1:12427',drink:'1:12463',bar:'1:12486',header:'1:12421'}).map(([key,id])=>{const n=nodes.get(id);assert(n,id);return [key,{nodeId:id,rect:[n.absoluteX,n.absoluteY,Number(n.width),Number(n.height)]}];}));
(async()=>{
 const page=await launch(html,{bundle:fs.readFileSync(own+'/entry.bundle.js'),files:JSON.parse(fs.readFileSync(own+'/assets.json')).flatMap(a=>a.files)}),checks=[],matrix=[];
 const evaluate=(fn,arg)=>page.evaluate('('+fn.toString()+')('+JSON.stringify(arg)+')');
 const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});if(!pass)throw Error(name);};
 const wait=async fn=>{for(let i=0;i<160;i++){if(page.errors.length||page.consoleErrors.length)throw Error([...page.errors,...page.consoleErrors].join('\n'));if(await fn())return;await delay(250);}throw Error('UI timeout');};
 const screenshot=async name=>{const r=await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(r.data,'base64'));};
 const click=async label=>{const point=await evaluate(label=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label&&e.getBoundingClientRect().width>0);if(!e)throw Error('Missing '+label);e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},label);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await delay(500);};
 try{
  await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:1347,deviceScaleFactor:1,mobile:false});await page.send('Page.navigate',{url:'http://127.0.0.1:8088/qc-fixture-intercepted'});
  await wait(()=>evaluate(()=>document.body.innerText.includes('Pizza politan')));await page.evaluate('document.fonts.ready');await wait(()=>evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));await delay(250);
  const actual=await evaluate(()=>{
   const leaf=label=>[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label),parent=(e,token)=>{while(e&&!String(e.className).split(' ').includes(token))e=e.parentElement;return e;};
   const rect=e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
   return {search:rect(parent(document.querySelector('input'),'h-12')),store:rect(parent(leaf('Semua Toko'),'h-12')),status:rect(parent(leaf('Status Stok'),'h-12')),card:rect(parent(leaf('Produk'),'p-0')),tier:rect(parent(leaf('Produk'),'bg-primary/10')),food:rect(parent(leaf('Makanan'),'p-3')),drink:rect(parent(leaf('Minuman'),'p-3')),bar:rect(parent(leaf('Inventory'),'rounded-t-[20px]')),header:rect(parent(leaf('Stok Akhir'),'bg-white'))};
  });
  for(const [key,target]of Object.entries(expected))check('geometry derived from Figma XML '+target.nodeId,target.rect.every((v,i)=>Math.abs(actual[key][i]-v)<0.1),{key,expected:target.rect,actual:actual[key],difference:actual[key].map((v,i)=>v-target.rect[i])});
  await page.evaluate('globalThis.__sd5UseActual()');await wait(()=>evaluate(()=>document.body.innerText.includes('Gula Pasir')));
  for(const [width,height]of [[320,480],[359,640],[360,640],[390,844],[414,736],[844,390],[768,1024]]){
   await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await delay(150);
   const detail=await evaluate(()=>{
    const labels=['Beranda','Laporan','Katalog','Inventory','Kelola'];
    const measured=labels.map(label=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label);if(!e)throw Error('Missing nav label '+label);const r=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const text=range.getBoundingClientRect();const button=e.closest('.flex-1'),b=button.getBoundingClientRect(),center=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return {label,width:r.width,naturalWidth:text.width,targetWidth:b.width,targetHeight:b.height,centerReachable:button.contains(center)};});
    const bar=[...document.querySelectorAll('*')].find(e=>String(e.className).split(' ').includes('rounded-t-[20px]'));return {labels:measured,columnGap:getComputedStyle(bar).columnGap,overflow:document.documentElement.scrollWidth>innerWidth};
   });matrix.push({width,height,...detail});
   check(width+' all five nav labels fit',detail.labels.every(l=>l.naturalWidth<=l.width+0.1),detail.labels);
   check(width+' gap boundary is correct',detail.columnGap===(width<360?'8px':'14px'),detail.columnGap);
   check(width+' five nav targets are at least44px and reachable',detail.labels.every(l=>l.targetWidth>=44&&l.targetHeight>=44&&l.centerReachable),detail.labels);
   check(width+' no horizontal overflow',!detail.overflow);
   const clearance=await evaluate(()=>{for(const e of document.querySelectorAll('div'))if(e.scrollHeight>e.clientHeight&&/auto|scroll/.test(getComputedStyle(e).overflowY))e.scrollTop=e.scrollHeight;const leaf=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent==='Gula Pasir'),bar=[...document.querySelectorAll('*')].find(e=>String(e.className).split(' ').includes('rounded-t-[20px]'));const r=leaf.getBoundingClientRect(),b=bar.getBoundingClientRect();return {lastTop:r.top,lastBottom:r.bottom,barTop:b.top,inside:r.top>=0&&r.bottom<=b.top};});
   check(width+' last row clears actual bar bounds',clearance.inside,clearance);if(width===320||width===360)await screenshot('qc-'+width+'-bottom');
  }
  await page.send('Emulation.setDeviceMetricsOverride',{width:320,height:640,deviceScaleFactor:1,mobile:false});
  await page.evaluate('globalThis.__sd5InventoryMaterials.setState({materials:globalThis.__sd5InventoryMaterials.getState().materials.map(m=>m.id==="tepung"?{...m,stock:0}:m)})');await click('Status Stok');await click('Habis');
  check('zero stock follows Habis picker',await evaluate(()=>document.body.innerText.includes('Tepung Terigu')&&document.body.innerText.includes('0 Kg')));await click('Reset Filter');
  await click('Semua Toko');await click('Toko Sushiro');await click('Status Stok');await click('Belum Tersedia');
  check('store unknown status is distinct from zero',await evaluate(()=>document.body.innerText.includes('Tepung Terigu')&&document.body.innerText.includes('Jumlah stok per toko belum')&&document.body.innerText.includes('—')&&!document.body.innerText.includes('0 Kg')));await click('Reset Filter');
  await page.evaluate('globalThis.__sd5InventoryMaterials.setState({materials:globalThis.__sd5InventoryMaterials.getState().materials.map(m=>m.id==="tepung"?{...m,name:"Bahan baku untuk pemeriksaan nama panjang di layar telepon agar jumlah stok tetap terbaca",sku:"QC-LONG-SKU-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789"}:m)})');await delay(200);
  const long=await evaluate(()=>{const row=[...document.querySelectorAll('[aria-label]')].find(e=>e.getAttribute('aria-label').startsWith('Bahan baku untuk pemeriksaan'));if(!row)throw Error('Missing long fixture row');row.scrollIntoView({block:'center'});const r=row.getBoundingClientRect();const qty=[...row.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent==='0 Kg').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,rowWidth:r.width,quantityWidth:qty.width,quantityInRow:qty.x>=r.x&&qty.right<=r.right};});
  check('long name/SKU retains readable quantity without horizontal overflow',!long.overflow&&long.quantityWidth>0&&long.quantityInRow,long);await screenshot('qc-320-long-item');
  check('runtime exceptions absent',page.errors.length===0,page.errors);check('console errors absent',page.consoleErrors.length===0,page.consoleErrors);
  check('unknown external requests absent',!page.network.some(r=>r.blocked),page.network.filter(r=>r.blocked));
 }catch(e){checks.push({name:'QC extra browser completed',pass:false,error:e.stack});await screenshot('extra-failure').catch(()=>{});console.error(e.stack);process.exitCode=1;}
 finally{const result={scope:'Independent XML-derived geometry, 359/360 boundary, five44px nav targets, long text and zero/unknown status on production RNWeb. Fixture/router transport adapters; not native or full router.',passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,matrix,runtimeErrors:page.errors,consoleErrors:page.consoleErrors};fs.writeFileSync(path.join(__dirname,'extra-browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,failed:result.failed,runtimeErrors:page.errors.length,consoleErrors:page.consoleErrors.length}));await page.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
