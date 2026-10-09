const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require(path.resolve('.expo/senior6-tools/node_modules/playwright'));
const proposal=process.argv.includes('--proposal'),origin='http://127.0.0.1:8088';
const entry=proposal?'qc-delete-proposal-entry':'qc-delete-modal-entry';
const source=proposal?'.expo/qc-delete-modal-candidate.tsx':'components/common/DeleteConfirmModal.tsx';
const output=path.join(__dirname,proposal?'orientation-proposal':'orientation-current');
fs.mkdirSync(output,{recursive:true});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const checks=[],errors=[],consoleErrors=[],blocked=[],measurements=[],bundleReceipts=[],receiptPromises=[];
const check=(name,passed,detail)=>checks.push({name,passed:Boolean(passed),detail});
const inside=(box,view)=>box&&box.x>=0&&box.y>=0&&box.x+box.width<=view.width+1&&box.y+box.height<=view.height+1;
const title='Hapus seluruh data contoh pada pengaturan yang dipilih?';
const descriptionText='Data yang dipilih akan dihapus dari daftar. Periksa kembali pilihan dan akses yang masih diperlukan sebelum melanjutkan. Anda dapat membatalkan tindakan ini untuk meninjau data pada halaman sebelumnya.';
const transport=require("./offline-transport.cjs")(__dirname,proposal);
let browser,page,exception;
async function buttonDetails(name){
  const control=page.getByRole('button',{name,exact:true});
  const box=await control.boundingBox();
  const clipping=await control.evaluate(element=>{
    const box=element.getBoundingClientRect();let top=Math.max(0,box.top),bottom=Math.min(innerHeight,box.bottom);const ancestors=[];
    for(let node=element.parentElement;node;node=node.parentElement){const rect=node.getBoundingClientRect(),style=getComputedStyle(node);ancestors.push({tag:node.tagName,overflowY:style.overflowY,top:rect.top,bottom:rect.bottom,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight});if(['hidden','auto','scroll','clip'].includes(style.overflowY)){top=Math.max(top,rect.top);bottom=Math.min(bottom,rect.bottom);}}
    return {visibleHeight:Math.max(0,bottom-top),ancestors};
  });
  return {box,...clipping};
}
async function measure(label,viewport){
  await page.waitForTimeout(700);
  const modal=await page.getByRole('dialog').boundingBox(),cancel=await buttonDetails('Batal'),confirm=await buttonDetails('Hapus');
  check(label+': entire modal fits viewport',inside(modal,viewport),modal);
  check(label+': width follows current window',Math.abs(modal.width-Math.min(viewport.width-32,380))<=1,modal);
  for(const [name,detail] of [['Batal',cancel],['Hapus',confirm]]){
    check(label+': '+name+' fully inside viewport',inside(detail.box,viewport),detail.box);
    check(label+': '+name+' visible target at least44px',detail.visibleHeight>=44,detail);
  }
  check(label+': buttons remain side by side',Math.abs(cancel.box.y-confirm.box.y)<=1&&cancel.box.x+cancel.box.width<=confirm.box.x+1,{cancel:cancel.box,confirm:confirm.box});
  measurements.push({label,viewport,modal,cancel,confirm,screen:await page.evaluate(()=>({width:screen.width,height:screen.height}))});
  await page.screenshot({path:path.join(output,label+'.png')});
}
async function restoreAndCancel(){await page.setViewportSize({width:320,height:640});await page.waitForTimeout(450);await page.getByRole('button',{name:'Batal',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});}
(async()=>{
  try{
    browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
    page=await browser.newPage({viewport:{width:320,height:640},screen:{width:844,height:390},colorScheme:'dark'});
    page.setDefaultTimeout(12000);
    page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
    page.on('response',response=>{if(response.url().includes(entry+'.bundle'))receiptPromises.push(response.body().then(bytes=>bundleReceipts.push({path:new URL(response.url()).pathname,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')})));});
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin===origin&&url.pathname==='/qc-delete-orientation')return route.fulfill({status:200,contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>html,body,#root{margin:0;width:100%;height:100%;overflow:hidden}#root{display:flex}${fs.readFileSync(path.join(__dirname,'web.css'),'utf8')}</style></head><body><div id="root"></div><script src="${origin}/.expo/${entry}.bundle?platform=web&dev=false&hot=false&transform.engine=hermes&transform.bytecode=0&unstable_transformProfile=hermes-stable"></script></body></html>`});
      if(await transport.serve(route,url))return;
      blocked.push({path:url.pathname,method:route.request().method()});return route.abort();
    });
    console.log('Loading owned delete orientation offline fixture; no HTTP server');
    await page.goto(origin+'/qc-delete-orientation',{waitUntil:'commit',timeout:180000});
    await page.getByTestId('preview-ready').waitFor({timeout:180000});
    check('initial closed modal remains hidden',await page.getByRole('dialog').count()===0);
    for(const kind of ['direct','long'])for(const viewport of [{width:640,height:360},{width:844,height:390}]){
      await page.setViewportSize(viewport);await page.evaluate(kind=>window.codexShowDelete(kind),kind);
      await page.getByRole('button',{name:'Hapus',exact:true}).waitFor();
      await measure(kind+'-'+viewport.width+'x'+viewport.height,viewport);
      if(proposal&&kind==='long'){
        const description=page.getByText(descriptionText,{exact:true}),beforeCancel=await page.getByRole('button',{name:'Batal',exact:true}).boundingBox(),beforeConfirm=await page.getByRole('button',{name:'Hapus',exact:true}).boundingBox();
        const region=await description.evaluate(node=>{for(let parent=node.parentElement;parent;parent=parent.parentElement){if(['auto','scroll'].includes(getComputedStyle(parent).overflowY)&&parent.scrollHeight>parent.clientHeight+2){parent.scrollTop=parent.scrollHeight;window.qcDeleteScrollRegion=parent;return {found:true,clientHeight:parent.clientHeight,scrollHeight:parent.scrollHeight};}}return {found:false};});
        await page.waitForTimeout(100);
        const reachable=await description.evaluate(node=>{const region=window.qcDeleteScrollRegion;if(!region||!region.contains(node))return false;const box=node.getBoundingClientRect(),area=region.getBoundingClientRect();return region.scrollTop>0&&box.bottom<=area.bottom+1&&box.bottom>=area.top;});
        const cancel=await page.getByRole('button',{name:'Batal',exact:true}).boundingBox(),confirm=await page.getByRole('button',{name:'Hapus',exact:true}).boundingBox();
        check(kind+'-'+viewport.width+': overflowing content has scroll region',region.found,region);
        check(kind+'-'+viewport.width+': final description line reachable',reachable);
        check(kind+'-'+viewport.width+': both footer buttons remain visible and stationary while scrolling',inside(cancel,viewport)&&inside(confirm,viewport)&&Math.abs(cancel.y-beforeCancel.y)<=1&&Math.abs(confirm.y-beforeConfirm.y)<=1,{beforeCancel,beforeConfirm,cancel,confirm});
      }
      await restoreAndCancel();
    }
    await page.evaluate(()=>window.codexShowDelete('long'));await page.getByText(title,{exact:true}).waitFor();
    await page.getByText(title,{exact:true}).evaluate(node=>{window.qcDeleteTitleNode=node;});
    const callbacksBefore=await page.evaluate(()=>window.codexDeleteCallbacks.length);
    await page.setViewportSize({width:640,height:360});await measure('long-live-rotate-640x360',{width:640,height:360});
    check('rotation keeps same title/modal instance',await page.getByText(title,{exact:true}).evaluate(node=>node===window.qcDeleteTitleNode));
    check('rotation causes neither close nor delete callback',await page.evaluate(()=>window.codexDeleteCallbacks.length)===callbacksBefore);
    await restoreAndCancel();
    check('restore portrait then cancel notifies exactly once',await page.evaluate(()=>window.codexDeleteCallbacks.length)===callbacksBefore+1);
    await page.evaluate(()=>{window.codexShowDelete('long');window.codexDeleteLoading(true);});
    await page.getByText(title,{exact:true}).waitFor();await page.setViewportSize({width:640,height:360});await page.waitForTimeout(450);
    const beforeDisabled=await page.evaluate(()=>window.codexDeleteCallbacks.length);
    const cancel=page.getByRole('button',{name:'Batal',exact:true}),confirm=page.getByRole('button',{name:'Hapus',exact:true});
    check('landscape loading disables both buttons',await cancel.isDisabled()&&await confirm.isDisabled());
    await cancel.evaluate(node=>node.click());await confirm.evaluate(node=>node.click());
    check('disabled landscape controls invoke no callbacks',await page.evaluate(()=>window.codexDeleteCallbacks.length)===beforeDisabled);
    await page.evaluate(()=>window.codexDeleteLoading(false));await page.setViewportSize({width:320,height:640});await page.waitForTimeout(450);await cancel.click();
    check('after loading ends and portrait restored cancel invokes once',await page.evaluate(()=>window.codexDeleteCallbacks.length)===beforeDisabled+1);
    check('final no runtime errors',errors.length===0,errors);check('final no console errors',consoleErrors.length===0,consoleErrors);check('final no external/business HTTP',blocked.length===0,blocked);
  }catch(error){exception=error.message;console.error(exception);if(page)await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});}
  finally{
    const settled=await Promise.allSettled(receiptPromises),receiptErrors=settled.filter(x=>x.status==='rejected').map(x=>String(x.reason));
    const result={owner:'QC',scope:'DeleteConfirmModal horizontal orientation, live rotation and two-button/loading contract',tested:proposal?'PROPOSAL_ONLY_NOT_APPLIED':'CURRENT_PRODUCTION_SOURCE',sourceHash:hash(source),fixtureHash:hash('.expo/'+entry+'.jsx'),checks,passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,errors,consoleErrors,blocked,exception:exception??null,measurements,bundleReceipts,receiptErrors,offlineBuild:transport.record,offlineReceipts:transport.receipts};
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify({tested:result.tested,passed:result.passed,failed:result.failed,errors:errors.length,consoleErrors:consoleErrors.length,blocked:blocked.length,exception,failedChecks:checks.filter(x=>!x.passed).map(x=>x.name)}));
    if(browser)await browser.close();process.exitCode=result.failed||errors.length||consoleErrors.length||blocked.length||exception||receiptErrors.length?1:0;
  }
})().catch(error=>{console.error(error);process.exitCode=2;});
