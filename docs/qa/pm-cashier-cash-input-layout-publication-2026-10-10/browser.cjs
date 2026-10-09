const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {launch,delay}=require('./offline-browser.cjs');
const option=name=>process.argv[process.argv.indexOf(name)+1];
if(!process.argv.includes('--preview')||!process.argv.includes('--output'))throw Error('Provide --preview and --output');
const preview=path.resolve(option('--preview')),output=path.resolve(option('--output'));
if(fs.existsSync(path.join(output,'results.json')))throw Error('Preserve existing results; use a new output.');
fs.mkdirSync(output,{recursive:true});
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const build=JSON.parse(fs.readFileSync(path.join(preview,'build.json')));
const bindings={...build.sources,...build.transformedSources};
const historical=process.argv.includes('--historical');
const cohort=process.argv.includes('--cohort')?option('--cohort'):'after';
const resolvedFile=file=>historical&&file==='app/(no-layout)/(cashier)/cart/input-money.tsx'?path.join(__dirname,'before/input-money.tsx'):file;
for(const [file,hash]of Object.entries(bindings))if(sha(resolvedFile(file))!==hash)throw Error('Bound source drift: '+file);
if(sha(path.join(preview,'bundle.js'))!==build.bundleHash||sha(path.join(preview,'style.css'))!==build.styleHash)throw Error('Build drift.');
const files=JSON.parse(fs.readFileSync(path.join(preview,'assets.json'))).flatMap(a=>a.files||[]);
files.push(...['Inter_24pt-Regular.ttf','Inter_24pt-Medium.ttf','Inter_24pt-SemiBold.ttf'].map(f=>path.resolve('assets/fonts',f)),path.resolve('assets/images/figma/back-office/back.svg'),path.resolve('assets/images/figma/cashier/cash-input/backspace.svg'));
const css=fs.readFileSync(path.join(preview,'style.css'),'utf8');
const html=`<!doctype html><html><head><meta charset="utf-8"><style>html,body,#root{width:100%;height:100%;margin:0}#root{display:flex}*{box-sizing:border-box}${css}</style></head><body><div id="root"></div><script>globalThis.__cashFixture={cohort:${JSON.stringify(cohort)},params:{totalPrice:'186000',value:'186000'},focused:true,routes:[],insets:{top:0,bottom:0,left:0,right:0}};</script><script src="/browser-entry.bundle"></script></body></html>`;
const checks=[],measurements=[],screenshots=[];
const leaf=text=>`Array.from(document.querySelectorAll('*')).find(el=>el.children.length===0&&el.textContent===${JSON.stringify(text)})`;
const rect=`el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,fontSize:s.fontSize,lineHeight:s.lineHeight,color:s.color,background:s.backgroundColor,scroll:el.scrollWidth,client:el.clientWidth}}`;
const check=(name,pass,details)=>checks.push({name,pass:!!pass,...(details?{details}:{})});
const scenarios=[
 {name:'reference390',width:390,height:844,insets:{top:0,bottom:0,left:0,right:0},total:'186000',value:'186000'},
 {name:'small320',width:320,height:568,insets:{top:0,bottom:24,left:0,right:0},total:'186000',value:'186000'},
 {name:'landscape844',width:844,height:390,insets:{top:0,bottom:24,left:34,right:24},total:'186000',value:'186000'},
 {name:'narrow280',width:280,height:568,insets:{top:0,bottom:48,left:8,right:8},total:'186000',value:'186000'},
 {name:'long-total320',width:320,height:568,insets:{top:0,bottom:24,left:0,right:0},total:'9007199254740991',value:'9007199254740991'},
];
(async()=>{
 let browser;
 try{
  browser=await launch(html,{bundle:fs.readFileSync(path.join(preview,'bundle.js')),files});
  await browser.send('Page.navigate',{url:'http://qc-cash-layout.test/'});
  for(let i=0;i<120;i++){if(await browser.evaluate(`Boolean(${leaf('186.000')})`))break;if(i===119)throw Error('Render timeout');await delay(250);}
  await browser.evaluate('document.fonts.ready');
  for(const scenario of scenarios){
   await browser.send('Emulation.setDeviceMetricsOverride',{width:scenario.width,height:scenario.height,deviceScaleFactor:1,mobile:false});
   await browser.evaluate(`globalThis.__cashFixture.insets=${JSON.stringify(scenario.insets)};globalThis.__cashFixture.params={totalPrice:${JSON.stringify(scenario.total)},value:${JSON.stringify(scenario.value)}};globalThis.__cashUpdate()`);
   await delay(250);
   const value=String(scenario.value).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
   const geometry=await browser.evaluate(`(()=>{const box=${rect};return{amount:box(${leaf(value)}),quick:[...document.querySelectorAll('[aria-label^="Isi uang"]')].map(box),keys:[...document.querySelectorAll('[role="button"][aria-label]')].filter(e=>/^\\d$|Hapus semua|Hapus satu digit/.test(e.getAttribute('aria-label'))).map(box),key1:box(document.querySelector('[aria-label="1"]')),backspace:box(document.querySelector('[aria-label="Hapus satu digit"] img')),pay:box((${leaf('Bayar')}).closest('[role="button"]')),overflow:document.documentElement.scrollWidth>innerWidth}})()`);
   measurements.push({scenario,geometry});
   check(`${scenario.name}: no horizontal document overflow`,!geometry.overflow);
   check(`${scenario.name}: amount inside safe width`,geometry.amount.x>=scenario.insets.left-0.6&&geometry.amount.right<=scenario.width-scenario.insets.right+0.6,geometry.amount);
   check(`${scenario.name}: all keypad buttons inside safe width`,geometry.keys.length===12&&geometry.keys.every(key=>key.x>=scenario.insets.left-0.6&&key.right<=scenario.width-scenario.insets.right+0.6),{keys:geometry.keys.map(({x,right})=>({x,right})),insets:scenario.insets});
   check(`${scenario.name}: quick amounts inside safe width`,geometry.quick.every(key=>key.x>=scenario.insets.left-0.6&&key.right<=scenario.width-scenario.insets.right+0.6));
   check(`${scenario.name}: Bayar above system bottom inset`,geometry.pay.bottom<=scenario.height-scenario.insets.bottom&&geometry.pay.y>=0);
   check(`${scenario.name}: original backspace renders32x32`,geometry.backspace.width===32&&geometry.backspace.height===32);
   if(scenario.name==='reference390'){
    for(const [name,actual,expected]of [['amount y',geometry.amount.y,177],['quick y',geometry.quick[0].y,420],['quick height',geometry.quick[0].height,39],['key1 y',geometry.key1.y,475.5],['key1 width',geometry.key1.width,130],['key1 height',geometry.key1.height,59],['pay y',geometry.pay.y,766],['pay width',geometry.pay.width,350],['pay height',geometry.pay.height,48]])check(`Figma29:25047 ${name}`,Math.abs(actual-expected)<=0.6,{actual,expected});
    check('Figma29:25047 amount typography/color',geometry.amount.fontSize==='32px'&&geometry.amount.lineHeight==='48px'&&geometry.amount.color==='rgb(57, 57, 57)');
    check('Figma29:25047 pay color',geometry.pay.background==='rgb(46, 120, 249)');
   }
   await browser.evaluate(`document.querySelector('[aria-label="Hapus satu digit"]').scrollIntoView({block:'center'})`);await delay(100);
   const last=await browser.evaluate(`(${rect})(document.querySelector('[aria-label="Hapus satu digit"]'))`);
   check(`${scenario.name}: last keypad row reachable above Bayar`,last.y>=0&&last.bottom<=geometry.pay.y+0.6);
   const shot=await browser.send('Page.captureScreenshot',{format:'png'}),name=scenario.name+'.png';
   fs.writeFileSync(path.join(output,name),Buffer.from(shot.data,'base64'));screenshots.push(name);
  }
 }catch(error){check('Execution completes',false,{error:error.stack});}
 finally{
  const drift=Object.entries(bindings).filter(([file,hash])=>sha(resolvedFile(file))!==hash).map(([file])=>file);
  const currentDrift=Object.entries(bindings).filter(([file,hash])=>sha(file)!==hash).map(([file])=>file);
  check('Bound source stable during browser',drift.length===0,{drift});
  const result={historical:historical||cohort==='before',cohort,currentDrift,scope:'Actual production RNWeb components, fonts and CSS; offline asset/network, router/focus/stack and explicit SafeAreaInsetsContext seed adapters. Before cohort renders the unchanged intake snapshot and does not approve later owner source. No native/device/full-router/payment certification.',referenceNode:'29:25047',checks,pass:checks.filter(c=>c.pass).length,fail:checks.filter(c=>!c.pass).length,measurements,screenshots,build,errors:browser?.errors||[],consoleErrors:browser?.consoleErrors||[],blockedRequests:browser?.network.filter(row=>row.blocked||row.error)||[]};
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({pass:result.pass,fail:result.fail,failures:checks.filter(c=>!c.pass),errors:result.errors,consoleErrors:result.consoleErrors,blockedRequests:result.blockedRequests}));
  if(browser)await browser.close();process.exitCode=result.fail||result.errors.length||result.consoleErrors.length||result.blockedRequests.length?1:0;
 }
})();
