// Checks the running application's real web routes; no API fixtures or login.
// Run from app root: node docs/qa/qc-startup-2026-10-09/web-check.cjs
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(path.resolve('.expo/qc-startup-tools/node_modules/playwright-core'));
const origin='http://127.0.0.1:8088', out=__dirname;
const checks=[], errors=[], consoleErrors=[], failedRequests=[];
const browserResponses=[];
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args:['--disable-features=LocalNetworkAccessChecks']});
  const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark'});
  const page=await context.newPage(); page.setDefaultTimeout(45000);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  page.on('requestfailed',request=>failedRequests.push({path:new URL(request.url()).pathname,error:request.failure()?.errorText}));
  page.on('response',response=>{if(response.status()>=400)browserResponses.push({path:new URL(response.url()).pathname,status:response.status()});});
  const record=(name,passed)=>{checks.push({name,passed});if(!passed)throw Error(name);};
  let failure;
  try {
    const response=await page.goto(origin+'/login',{waitUntil:'domcontentloaded',timeout:180000});
    record('real login route HTTP 200',response.status()===200);
    await page.getByRole('button',{name:'Masuk',exact:true}).first().waitFor({timeout:180000});
    record('login renders without red error overlay',!(/Unable to manually set color scheme|Uncaught Error|Render Error|Internal Server Error/.test(await page.locator('body').innerText())));
    record('application stays light with dark OS preference',await page.evaluate(()=>document.documentElement.classList.contains('light')));
    await page.locator('input').first().fill('qc-startup@example.test');
    record('login input accepts typing',await page.locator('input').first().inputValue()==='qc-startup@example.test');
    await page.screenshot({path:path.join(out,'web-login-390.png')});
    await page.setViewportSize({width:1280,height:900});
    record('login visible on desktop web',await page.getByRole('button',{name:'Masuk',exact:true}).first().isVisible());
    await page.screenshot({path:path.join(out,'web-login-1280.png')});
    await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:120000});
    await page.getByRole('button',{name:'Gabung Sekarang',exact:true}).first().waitFor({timeout:90000});
    record('cold unauthenticated boot reaches onboarding',new URL(page.url()).pathname==='/onboarding');
    await page.waitForFunction(()=>Array.from(document.querySelectorAll('[role="button"],button')).some(button=>button.textContent.trim()==='Gabung Sekarang'&&button.getAttribute('aria-disabled')!=='true'&&!button.disabled),{},{timeout:45000});
    record('onboarding action enabled',await page.getByRole('button',{name:'Gabung Sekarang',exact:true}).first().isEnabled());
    await page.screenshot({path:path.join(out,'web-onboarding.png')});
    record('no runtime exceptions',errors.length===0);
  } catch(error) {
    failure=String(error);
    await page.screenshot({path:path.join(out,'web-failure.png')}).catch(()=>{});
  } finally {
    const report={date:'2026-10-09',timezone:'Asia/Jakarta',origin,kind:'Real application/SSR/Expo Router/production providers; real backend read requests, no API fixtures, no submitted credentials.',checks,errors,consoleErrors,failedRequests,browserResponses,failure,url:page.url(),body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,3500)};
    fs.writeFileSync(path.join(out,'web-results.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report));
    await browser.close();
    process.exitCode=failure||errors.length?1:0;
  }
})().catch(error=>{console.error(error);process.exitCode=2;});
