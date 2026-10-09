const fs = require('node:fs'), path = require('node:path'), {launch,delay} = require('./browser.cjs');
const own = 'D:/Codex-5/tmp/inventory-qc-colors';
const css = fs.readFileSync(__dirname + '/generated-web-style.css','utf8');
const html = '<!doctype html><html><head><meta charset="utf-8"><style>' + css + '</style><style>html,body,#root{height:100%;margin:0}#root{display:flex}</style></head><body><div id="root"></div><script src="/browser-entry.bundle"></script></body></html>';
const assets = JSON.parse(fs.readFileSync(own + '/assets.json'));
const checks = [];
const observed = [];
let page;
const evaluate = (fn,arg) => page.evaluate('(' + fn.toString() + ')(' + JSON.stringify(arg) + ')');
const text = () => page.evaluate('document.body.innerText');
const check = (name,pass,detail) => {checks.push({name,pass,detail});if(!pass)throw Error(name + ': ' + JSON.stringify(detail));};
async function wait(fn) {for(let i=0;i<120;i++){if(await fn())return;await delay(100);}throw Error('UI wait timeout');}
async function screenshot(name) {const data=await page.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(__dirname+'/'+name+'.png',Buffer.from(data.data,'base64'));}
async function show(mode,id,variant) {await evaluate(args=>globalThis.__sd5Show(...args),[mode,id,variant]);await delay(250);}
async function click(label) {
  const point=await evaluate(label=>{const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label);if(!el)throw Error('Missing '+label);const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},label);
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await delay(150);
}
const expected = async token => evaluate(token=>{
  const variable={'warning':'--color-warning','destructive':'--color-error-500','success':'--color-success','primary':'--color-primary','muted':'--color-text-muted','foreground':'--color-text-foreground'}[token];
  const probe=document.createElement('span');probe.style.color='rgb(var('+variable+'))';document.body.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color;
},token);
async function metric(label) {
  return evaluate(label=>{
    const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label);
    const row=[...e.parentElement.children].map(e=>({text:e.textContent,color:getComputedStyle(e).color,r:e.getBoundingClientRect().toJSON()}));
    return row;
  },label);
}
async function metadata(label) {
  return evaluate(label=>{
    const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label);
    if(!e)throw Error('Metadata missing '+label);
    const icon=e.parentElement.parentElement.firstElementChild;
    const iconText=[icon,...icon.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent).at(0)??icon;
    return {color:getComputedStyle(iconText).color,value:e.parentElement.textContent,rect:icon.getBoundingClientRect().toJSON(),font:getComputedStyle(iconText).fontFamily};
  },label);
}
(async()=>{
  page=await launch(html,{bundle:fs.readFileSync(own+'/entry.bundle.js'),files:assets.flatMap(a=>a.files)});
  try {
    await page.send('Page.navigate',{url:'http://sd5-inventory-qc.test/'});
    await wait(async()=>(await text()).includes('Total Stok Awal'));
    const tokenColors=Object.fromEntries(await Promise.all(['warning','destructive','success','primary','muted','foreground'].map(async t=>[t,await expected(t)])));
    const original=await page.evaluate('JSON.stringify({stockRecords:globalThis.__sd5InventoryStore.getState().stockRecords,purchases:globalThis.__sd5InventoryStore.getState().purchases})');
    for(const [width,height] of [[390,844],[320,640]]) {
      await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await delay(150);
      for(const [label,tone] of [['Total Stok Awal','warning'],['Total Penyusutan','destructive'],['Total Stok Akhir','success']]) {
        const row=await metric(label),value=row[1];observed.push({width,label,row});
        check(width+' adjustment '+label+' value receives semantic '+tone,value.color===tokenColors[tone],{actual:value.color,expected:tokenColors[tone]});
        check(width+' adjustment '+label+' label fits',await evaluate(label=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent===label),r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().width<=e.getBoundingClientRect().width+0.5;},label));
      }
      check(width+' adjustment has no page horizontal overflow',await evaluate(w=>document.documentElement.scrollWidth<=w,width));
      check(width+' damaged quantity receives destructive color',await evaluate(color=>{
        const label=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent==='Rusak');
        return getComputedStyle(label.nextElementSibling).color===color;
      },tokenColors.destructive));
      check(width+' damaged percent receives destructive color',await evaluate(color=>{
        const label=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&/^Rusak \d/.test(e.textContent));
        return getComputedStyle(label).color===color;
      },tokenColors.destructive));
      await screenshot('adjustment-'+width);
    }
    const id=await page.evaluate('globalThis.__sd5InventoryStore.getState().stockRecords.find(r=>r.operation==="adjustment").id');
    await page.evaluate('globalThis.__sd5InventoryStore.setState({stockRecords:globalThis.__sd5InventoryStore.getState().stockRecords.map(r=>r.id==='+JSON.stringify(id)+'?{...r,lines:r.lines.map((l,i)=>({...l,item:{...l.item,unit:i===0?"Pcs":"Kg"}}))}:r)})');
    check('mixed units remain unknown rather than summed',(await metric('Total Stok Awal'))[1].text==='—'&&(await metric('Total Stok Akhir'))[2].text==='Satuan berbeda');
    await page.evaluate('globalThis.__sd5Restore()');
    await show('defaults');
    for(const variant of ['default','supplier']) {
      await show('defaults',undefined,variant);
      for(const label of ['QC warning default','QC success default','QC destructive default']) {
        const row=await metric(label);const value=row.find(e=>['123','456','789'].includes(e.text));
        check(variant+' metric values retain default foreground: '+label,value.color===tokenColors.foreground,{actual:value.color,expected:tokenColors.foreground});
      }
    }
    const defaultMetadata=await metadata('QC metadata default');
    check('unchanged metadata consumers retain primary icons',defaultMetadata.color===tokenColors.primary,defaultMetadata);
    await show('transfer');
    await wait(async()=>(await text()).includes('Dari Toko'));
    for(const label of ['Dari Toko','Ke Toko','Dibuat Oleh','Jumlah Transfer']) {
      const result=await metadata(label);observed.push({mode:'transfer',label,result});
      check('transfer metadata '+label+' is muted',result.color===tokenColors.muted,{actual:result.color,expected:tokenColors.muted});
    }
    check('transfer reference link retains primary',await evaluate(expected=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.startsWith('TF/'));return getComputedStyle(e).color===expected;},tokenColors.primary));
    await screenshot('transfer-320');
    await click('Produk ('+await page.evaluate('globalThis.__sd5InventoryStore.getState().stockRecords.filter(r=>r.operation==="transfer"&&r.kind==="product").length')+')');
    check('transfer tab still filters products',await evaluate(()=>{
      const expected=globalThis.__sd5InventoryStore.getState().stockRecords.filter(r=>r.operation==='transfer'&&r.kind==='product').length;
      return [...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent==='Dari Toko').length===expected;
    }));
    const reference=await page.evaluate('globalThis.__sd5InventoryStore.getState().stockRecords.find(r=>r.operation==="transfer"&&r.kind==="product").reference');
    await click(reference);
    check('transfer row still navigates to its actual record',await page.evaluate('globalThis.__sd5Navigation.some(v=>String(v.pathname??v).includes("stock-transfer/detail"))'));
    await show('purchase');
    await wait(async()=>(await text()).includes('Nama Supplier'));
    for(const label of ['Nama Supplier','Tanggal Transaksi','Diterima Oleh','Total Transaksi']) {
      const result=await metadata(label);observed.push({mode:'purchase',label,result});
      check('purchase metadata '+label+' is muted',result.color===tokenColors.muted,{actual:result.color,expected:tokenColors.muted});
    }
    check('purchase reference link retains primary',await evaluate(expected=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.textContent.startsWith('PO/'));return getComputedStyle(e).color===expected;},tokenColors.primary));
    await screenshot('purchase-320');
    await show('adjustment-list');
    await wait(async()=>(await text()).includes('Disesuaikan oleh:'));
    check('adjustment list metadata keeps primary',await evaluate(expected=>{const e=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&/\d{2}:\d{2}:\d{2}/.test(e.textContent));const p=e.parentElement.parentElement.firstElementChild;return getComputedStyle(p).color===expected||[...p.querySelectorAll('*')].some(e=>getComputedStyle(e).color===expected);},tokenColors.primary));
    await show('adjustment','missing-qc-id');
    check('missing stock record fallback preserved',(await text()).includes('Data stok tidak ditemukan'));
    check('no Inventory data mutation remained',original===await page.evaluate('JSON.stringify({stockRecords:globalThis.__sd5InventoryStore.getState().stockRecords,purchases:globalThis.__sd5InventoryStore.getState().purchases})'));
    check('runtime errors absent',page.errors.length===0,page.errors);
    check('console errors absent',page.consoleErrors.length===0,page.consoleErrors);
    check('no blocked/external data requests',page.network.every(r=>!r.blocked&&!r.error),page.network.filter(r=>r.blocked||r.error));
  } catch(error) {
    checks.push({name:'Browser completed',pass:false,error:error.stack});
    await screenshot('failure').catch(()=>{});fs.writeFileSync(__dirname+'/failure-body.txt',await text());console.error(error.stack);process.exitCode=1;
  } finally {
    fs.writeFileSync(__dirname+'/browser-results.json',JSON.stringify({passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,observed,runtimeErrors:page.errors,consoleErrors:page.consoleErrors,scope:'Actual production Inventory screens/store/shared components and fonts; router transport adapter. Fixture-only temporary mixed-unit update restored; no application seed/API/real device certification.'},null,2));
    console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length}));await page.close();
  }
})().catch(e=>{console.error(e.stack);process.exitCode=1});
