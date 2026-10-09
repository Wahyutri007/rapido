const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const transport=require('./offline-transport.cjs')(__dirname),packet=__dirname,origin='http://127.0.0.1:8088';
const checks=[],measurements=[],errors=[],consoleErrors=[],blocked=[];let browser,page,exception;
const check=(name,passed,detail)=>checks.push({name,passed:Boolean(passed),detail});
const close=(actual,expected)=>Math.abs(actual-expected)<1;
const inside=(box,safe)=>box&&box.x>=safe.left-1&&box.y>=0&&box.x+box.width<=safe.width-safe.right+1&&box.y+box.height<=safe.height-safe.bottom+1;
async function settle(){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(150);}
async function inspect(label,config,viewport){
 await page.setViewportSize(viewport);await page.evaluate(c=>window.qcSetFooter(c),config);await settle();
 const buttons=await page.getByRole('button').all();const b=[];for(const button of buttons)b.push({label:await button.innerText(),box:await button.boundingBox()});
 const footer=config.kind==='none'||config.kind==='standalone'?null:await buttons[0].evaluate(node=>{for(let p=node;p;p=p.parentElement){const css=getComputedStyle(p);if(css.position==='absolute'&&css.bottom==='0px'){const r=p.getBoundingClientRect();return {box:{x:r.x,y:r.y,width:r.width,height:r.height},padding:{top:parseFloat(css.paddingTop),bottom:parseFloat(css.paddingBottom),left:parseFloat(css.paddingLeft),right:parseFloat(css.paddingRight)}};}}return null;});
 const safe={...viewport,bottom:config.bottom,left:config.left??0,right:config.right??0};
 if(footer){
  check(label+': buttons clear simulated system bars and remain at least44px high',b.every(v=>inside(v.box,safe)&&v.box.height>=44),{buttons:b,safe});
  const bottomGap=viewport.height-config.bottom-Math.max(...b.map(v=>v.box.y+v.box.height));
  check(label+': usable gap above system area preserved',close(bottomGap,config.kind==='report'?24:16),{bottomGap});
  check(label+': left/right safe inset additive and footer remains in viewport',close(footer.padding.left,16+safe.left)&&close(footer.padding.right,16+safe.right)&&close(footer.box.x,0)&&close(footer.box.width,viewport.width)&&close(footer.box.y+footer.box.height,viewport.height),footer);
  check(label+': status-bar top inset does not increase footer top',close(footer.padding.top,config.kind==='report'?8:16),footer.padding);
 }
 const scroll=await page.getByTestId('content-scroll').evaluate(node=>{const elements=[node,...node.querySelectorAll('*')];const scroller=elements.find(n=>['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+1);if(!scroller)return null;scroller.scrollTop=scroller.scrollHeight;return {scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight,scrollTop:scroller.scrollTop};});await settle();
 const last=await page.getByTestId('last-field').boundingBox();
 if(footer)check(label+': last field fully reachable above fixed footer after scrolling',scroll&&last&&last.y>=0&&last.y+last.height<=footer.box.y+1,{last,scroll,footerTop:footer.box.y});
 else check(label+': no fixed bottom bar added without footer mode',await page.locator('[class~="bottom-0"]').count()===0);
 const before=await page.evaluate(()=>window.qcFooterCalls.length);
 if(config.kind!=='none'){
  await buttons[0].click();await settle();
  const calls=await page.evaluate(n=>window.qcFooterCalls.slice(n),before);
  if(config.kind==='report'||config.kind==='standalone'){
   check(label+': production report trigger invokes callback once and opens sheet',calls.filter(c=>c===(config.kind==='report'?'report-open':'standalone-open')).length===1&&await page.getByText('Pilih Aksi',{exact:true}).count()===1,calls);
   await page.getByText('Download',{exact:true}).click();await page.getByText('Pilih Aksi',{exact:true}).waitFor({state:'hidden'});await settle();
   check(label+': selecting fixture action closes sheet',await page.getByText('Pilih Aksi',{exact:true}).count()===0);
  }else check(label+': wrapper passes original button callback once',calls.length===1&&calls[0]===b[0].label,calls);
 }
 measurements.push({label,config,viewport,buttons:b,footer,scroll,last});
 if(['form-48','manual100-48','row-side','report-64','live-landscape','live-portrait'].includes(label))await page.screenshot({path:path.join(packet,label+'.png')});
 console.log('Checked '+label);
}
(async()=>{try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});page=await browser.newPage({viewport:{width:320,height:640},colorScheme:'light'});page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin===origin&&url.pathname==='/qc-accounting-footer')return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}'+fs.readFileSync(path.join(packet,'web.css'),'utf8')+'</style></head><body><div id="root"></div><script src="'+origin+'/.expo/qc-accounting-footer-entry.bundle"></script></body></html>'});if(await transport.serve(route,url))return;blocked.push({method:route.request().method(),path:url.pathname});return route.abort();});
 await page.goto(origin+'/qc-accounting-footer',{waitUntil:'commit'});await page.getByRole('button',{name:'Simpan',exact:true}).waitFor();
 for(const bottom of [0,16,24,34,48,64])await inspect('form-'+bottom,{kind:'form',bottom,top:32,left:0,right:0},{width:320,height:640});
 for(const kind of ['animated','manual100','manual110','row'])await inspect(kind+'-48',{kind,bottom:48,top:24,left:0,right:0},{width:390,height:844});
 await inspect('row-side',{kind:'row',bottom:16,top:0,left:48,right:24},{width:844,height:390});
 for(const bottom of [0,34,64])await inspect('report-'+bottom,{kind:'report',bottom,top:30,left:0,right:0},{width:320,height:640});
 await inspect('standalone',{kind:'standalone',bottom:48,top:24,left:0,right:0},{width:390,height:844});
 await inspect('none',{kind:'none',bottom:48,top:24,left:0,right:0},{width:320,height:640});
 await inspect('live-initial',{kind:'animated',bottom:48,top:24,left:0,right:0},{width:320,height:640});
 const instance=await page.getByTestId('instance').getAttribute('aria-label');
 await inspect('live-landscape',{kind:'animated',bottom:0,top:0,left:48,right:24},{width:640,height:360});
 await inspect('live-portrait',{kind:'animated',bottom:64,top:32,left:0,right:0},{width:320,height:640});
 check('same mounted instance survives orientation and inset updates',instance===await page.getByTestId('instance').getAttribute('aria-label'),{instance});
 check('no runtime errors',errors.length===0,errors);check('no console errors',consoleErrors.length===0,consoleErrors);check('no external HTTP/API attempts',blocked.length===0,blocked);
}catch(error){exception=error.message;console.error(error.stack);if(page)await page.screenshot({path:path.join(packet,'browser-failure.png')}).catch(()=>{});}finally{
 const result={createdAt:new Date().toISOString(),owner:'QC',ticket:'ACCOUNTING-BOTTOM-SAFE-001',passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,exception,errors,consoleErrors,blocked,checks,measurements,offlineBuild:transport.record,receipts:transport.receipts,limits:'Production shared Bar/Wrapper/AnimatedWrapper/Report/Button/Text RN-web, injected safe-inset contexts, long fixture parent content and simulated system overlays. Not the 15 financial screens, native device/system navigation, keyboard, API, persistence or full-app approval.'};
 fs.writeFileSync(path.join(packet,'browser-results.json'),JSON.stringify(result,null,2)+'\n');if(browser)await browser.close();console.log(JSON.stringify({passed:result.passed,failed:result.failed,exception,errors:errors.length,consoleErrors:consoleErrors.length}));if(result.failed||exception||errors.length||consoleErrors.length||blocked.length)process.exitCode=1;
}})().catch(e=>{console.error(e);process.exitCode=2;});
