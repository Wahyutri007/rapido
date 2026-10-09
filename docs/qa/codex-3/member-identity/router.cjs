// Developer regression: actual Expo Router parameter updates + production Member route/form.
// Isolated layout, browser API fixtures, no full auth/root/SSR/native verification.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../../..');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(root,'.expo/payroll-qa-tools/node_modules/playwright'));
const checks=[], errors=[], requests=[], expectedNetworkErrors=[];
let browser, page, held=null, hold=false, expected422Responses=0;
const headers={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS','access-control-allow-headers':'*'};
const member = (id,name) => ({id,name,phone:'08123456789',email:null,id_number:null,address:null,date_of_birth:null,gender:null,notes:null,user_id:'qa-owner',created_at:'2026-10-08T10:00:00Z',updated_at:'2026-10-08T10:00:00Z'});
const data={a:member('a','Member A'),b:member('b','Member B')};
const check=(name,passed)=>{checks.push({name,passed:Boolean(passed)});if(!passed)throw Error(name);};
async function change(id) {
  await page.evaluate(id=>window.memberChangeId(id),id);
  await page.waitForTimeout(200);
  await page.waitForFunction(id=>new URL(location.href).searchParams.get('id')===(id===undefined?null:id),id);
}
async function waitHeld() {for(let n=0;n<100&&!held;n++)await page.waitForTimeout(50);if(!held)throw Error('Pending fixture request did not start');}
(async()=>{
 try{
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--disable-features=LocalNetworkAccessChecks']});
  page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(30000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{
    if(m.type()!=='error')return;
    if(expected422Responses>expectedNetworkErrors.length&&/^Failed to load resource: the server responded with a status of 422 /.test(m.text()))expectedNetworkErrors.push(m.text());
    else errors.push(m.text());
  });
  await page.route(/\/customers\/data(?:\/|\?|$)/,async route=>{
   const r=route.request(),method=r.method(),id=decodeURIComponent(new URL(r.url()).pathname.split('/').at(-1));
   if(method==='OPTIONS')return route.fulfill({status:204,headers});
   requests.push({method,id,body:method==='PUT'||method==='POST'?r.postDataJSON():undefined});
   if(method==='PUT'&&hold){held=route;return;}
   if(method==='GET')return route.fulfill({status:data[id]?200:404,headers,contentType:'application/json',body:JSON.stringify(data[id]?{success:true,data:data[id]}:{success:false,message:'Not found'})});
   return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({success:true,data:data[id]})});
  });
  await page.route('http://127.0.0.1:8097/forms-preview',async route=>{
   const css=fs.readFileSync(path.join(root,'node_modules/react-native-css-interop/.cache/web.css'),'utf8');
   await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}'+css+'</style></head><body><div id="root"></div><script src="http://127.0.0.1:8097/.expo/codex-3-manage-forms-entry.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>'});
  });
  await page.goto('http://127.0.0.1:8097/forms-preview',{waitUntil:'commit',timeout:600000});await page.getByText('Pilih form',{exact:true}).waitFor({timeout:600000});
  await page.evaluate(()=>window.manageNavigate('member','a'));const name=page.locator('input').first();
  await page.waitForFunction(()=>document.querySelector('input')?.value==='Member A');
  check('actual route hydrates A',await name.inputValue()==='Member A');
  await name.fill('Draft A');data.a.name='Server A refreshed';await page.evaluate(()=>window.memberRefetch());await page.waitForTimeout(250);
  check('same-ID query refetch preserves draft',await name.inputValue()==='Draft A');
  await change('b');await page.waitForFunction(()=>document.querySelector('input')?.value==='Member B');
  check('router setParams A to B replaces identity',await name.inputValue()==='Member B');
  await change(undefined);check('router setParams edit to create clears identity',await name.inputValue()==='');
  await page.getByRole('button',{name:'Simpan',exact:true}).click();await page.waitForTimeout(100);
  check('empty create does not clone previous member',requests.every(r=>r.method!=='POST'));
  await name.fill('New draft');await change('b');await page.waitForFunction(()=>document.querySelector('input')?.value==='Member B');
  check('return to B after create restores B',await name.inputValue()==='Member B');
  await page.getByRole('button',{name:'Simpan',exact:true}).click();await page.getByText('Member berhasil diubah',{exact:true}).waitFor();
  await change('a');await page.waitForFunction(()=>document.querySelector('input')?.value==='Server A refreshed');
  check('changing identity clears old success modal',await page.getByText('Member berhasil diubah',{exact:true}).count()===0);
  check('changing identity clears saved lock',await page.getByRole('button',{name:'Simpan',exact:true}).isEnabled());
  for(const kind of ['success','error']){
   console.log('Member pending '+kind);held=null;hold=true;
   await page.getByRole('button',{name:'Simpan',exact:true}).click();await waitHeld();await change('b');
   await page.waitForFunction(()=>document.querySelector('input')?.value==='Member B');await name.fill('Draft B '+kind);
   const oldRoute=held;hold=false;held=null;
   if(kind==='error')expected422Responses++;
   await oldRoute.fulfill({status:kind==='success'?200:422,headers,contentType:'application/json',body:JSON.stringify(kind==='success'?{success:true,data:data.a}:{success:false,message:'Validation error',errors:{phone:['Old request error']}})});
   await page.waitForTimeout(350);
   check('late '+kind+' cannot replace new draft',await name.inputValue()==='Draft B '+kind);
   check('late '+kind+' leaves new save enabled',await page.getByRole('button',{name:'Simpan',exact:true}).isEnabled());
   check('late '+kind+' cannot open new modal or field error',await page.getByText('Member berhasil diubah',{exact:true}).count()===0&&await page.getByText('Member belum disimpan',{exact:true}).count()===0&&await page.getByText('Old request error',{exact:true}).count()===0);
   await change('a');await page.waitForFunction(()=>document.querySelector('input')?.value==='Server A refreshed');
  }
  check('all update requests retain old identity',requests.filter(r=>r.method==='PUT').slice(-2).every(r=>r.id==='a'));
  check('no unexpected runtime or console errors',errors.length===0);
  await page.screenshot({path:path.join(__dirname,'member-after-identity-change.png')});
 }catch(e){errors.push(e.message);process.exitCode=1;if(page)await page.screenshot({path:path.join(__dirname,'failure.png')}).catch(()=>{});}
 finally{
  const files=['components/feature/manage/member/MemberModifyScreen.tsx','app/(no-layout)/manage/member/modify.tsx','api/hooks/customers.ts','api/factory.ts','api/common.ts','schema/add/customer.ts','lib/manage/members.ts'];
  fs.writeFileSync(path.join(__dirname,'router-results.json'),JSON.stringify({owner:'Codex-3',date:'2026-10-09',passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,expectedNetworkErrors,requests,sourceHashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')])),scope:'Production modify route/form and Expo Router setParams; API browser fixtures and isolated layout. Full auth/root, SSR, backend mutations, native and Figma parity untested.'},null,2)+'\n');
  console.log(JSON.stringify({passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,errors}));if(browser)await browser.close();
 }
})();
