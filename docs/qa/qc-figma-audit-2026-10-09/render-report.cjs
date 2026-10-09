const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL,fileURLToPath}=require('node:url');
const root=path.resolve(__dirname,'../../..'),{chromium}=require(path.join(root,'.expo/senior6-tools/node_modules/playwright'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
(async()=>{
 const errors=[],checks=[];
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(String(e)));
  await page.route(/^https?:\/\//,r=>r.abort());
  const report=path.join(__dirname,'Laporan-Audit-Figma-QC-2026-10-09.html');await page.goto(pathToFileURL(report).href);
  assert.equal(await page.locator('#inventory tbody tr').count(),239);checks.push('239 source rows present');
  await page.locator('#area').selectOption('Inventory');assert.equal(await page.locator('#inventory tbody tr:visible').count(),26);checks.push('Area filter Inventory = 26');
  await page.locator('#area').selectOption('');await page.locator('#search').fill('1:19624');assert.equal(await page.locator('#inventory tbody tr:visible').count(),1);checks.push('Frame search FAQ = 1');
  await page.locator('#search').fill('');assert.equal(await page.locator('#inventory tbody tr:visible').count(),239);checks.push('Reset = 239');
  const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href));for(const href of links){assert(href.startsWith('file:'),href);const f=fileURLToPath(href);if(!f.endsWith('.pdf'))assert(fs.existsSync(f),f);}checks.push('Report local links exist');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(__dirname,'report-preview.png')});
  const pdf=path.join(__dirname,'Laporan-Audit-Figma-QC-2026-10-09.pdf');await page.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});assert(fs.statSync(pdf).size>10000);assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');checks.push('PDF generated with signature');
  await page.goto(pathToFileURL(path.join(__dirname,'perbandingan-visual.html')).href);
  await page.locator('img').evaluateAll(nodes=>nodes.forEach(n=>n.loading='eager'));
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.locator('.plate').count(),17);assert.equal(await page.locator('img').count(),32);checks.push('17 visual plates / 32 images load');
  for(const href of await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href)))assert(fs.existsSync(fileURLToPath(href)),href);checks.push('Visual image links exist');
  assert.equal(errors.length,0);checks.push('Document page errors = 0');
  const proof={createdAt:new Date().toISOString(),scope:'Audit HTML/PDF document only; not application behavior or visual certification.',checks,errors,pdf:{bytes:fs.statSync(pdf).size,sha256:hash(pdf)}};
  fs.writeFileSync(path.join(__dirname,'report-proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
