const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'source-before.json'),'utf8'));
const success='components/common/SuccessModal.tsx',current=hash(success),proposed='docs/qa/qc-success-modal-2026-10-09/proposal/SuccessModal.tsx';
assert.equal(current,'7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8');
fs.writeFileSync(path.join(__dirname,'dependency-update.json'),JSON.stringify({file:success,initial:old.hashes[success],current,source:'Codex-3 SD3-012 applied previous QC copy; external recheck still required',previousQcCopy:fs.existsSync(proposed)?hash(proposed):null,approval:'Dependency execution only; no SuccessModal delta approved by this packet'},null,2)+'\n');
fs.mkdirSync(path.join(__dirname,'interim'),{recursive:true});
for(const file of ['browser-results.json','failure.png'])if(fs.existsSync(path.join(__dirname,'final',file)))fs.copyFileSync(path.join(__dirname,'final',file),path.join(__dirname,'interim','metro-timeout-'+file));
fs.writeFileSync(path.join(__dirname,'interim','lifecycle-adapter-failure.json'),JSON.stringify({executedScenarios:0,reason:'Current SuccessModal now renders ScrollView; historical presentation adapter only exposed View, Image, Pressable. Updated own adapter, no production defect or failed business assertion counted.'},null,2)+'\n');
const lifecycle=path.join(__dirname,'delete-lifecycle/check.cjs');let code=fs.readFileSync(lifecycle,'utf8');
assert.ok(code.includes('presentation(["View", "Image", "Pressable"])'));
code=code.replace('presentation(["View", "Image", "Pressable"])','presentation(["View", "Image", "Pressable", "ScrollView"])').replace('owner: "Codex-3", ticket: "SD3-006"','owner: "QC", ticket: "SD3-008"');fs.writeFileSync(lifecycle,code);
for(const file of ['browser.cjs','orientation.cjs']){
  const target=path.join(__dirname,file);let code=fs.readFileSync(target,'utf8');
  if(file==='browser.cjs'){
    code=code.replace('let browser, page, exception;','const transport = require("./offline-transport.cjs")(__dirname);\nlet browser, page, exception;');
    code=code.replace('if (url.origin === origin && (url.pathname.includes(".bundle") || url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css"))) return route.continue();','if (await transport.serve(route, url)) return;');
    code=code.replace('Loading owned delete-modal fixture using existing Metro8088','Loading owned delete-modal offline fixture; no HTTP server').replace('sourceHash: hash(', 'offlineBuild: transport.record, offlineReceipts: transport.receipts, sourceHash: hash(');
  }else{
    code=code.replace('let browser, page, exception;', 'const transport=require("./offline-transport.cjs")(__dirname,proposal);\nlet browser, page, exception;');
    // Some runners use compact declarations.
    if(!code.includes('const transport='))code=code.replace('let browser,page,exception;', 'const transport=require("./offline-transport.cjs")(__dirname,proposal);\nlet browser,page,exception;');
    code=code.replace("if(url.origin===origin&&(url.pathname.includes('.bundle')||url.pathname.startsWith('/assets/')||url.pathname.endsWith('.css')))return route.continue();","if(await transport.serve(route,url))return;");
    code=code.replace('Loading owned delete orientation fixture on existing Metro8088','Loading owned delete orientation offline fixture; no HTTP server').replace('measurements,bundleReceipts,receiptErrors','measurements,bundleReceipts,receiptErrors,offlineBuild:transport.record,offlineReceipts:transport.receipts');
  }
  assert.ok(code.includes('transport.serve'));assert.ok(!code.includes('route.continue()'));fs.writeFileSync(target,code);
}
console.log(JSON.stringify({updatedOwnLifecycleAdapter:true,successDependency:current,offlineFixtureTransport:true,applicationEdited:false}));
