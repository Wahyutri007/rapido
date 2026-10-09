const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync('docs/qa/pm-cashier-scanner-publication-2026-10-10/browser.cjs','utf8');
let prefix=source.slice(0,source.indexOf('(async()=>{')).replaceAll('__pmFixture','__pmPrinter').replace('http://pm-scanner.test','http://pm-printer.test').replace("['/scanner','/scanner-detail','/header-lab','/wrapper-lab']","['/list','/modify']").replace('history:false,...extra',"history:true,appMode:'cashier',...extra");
fs.writeFileSync(path.join(__dirname,'browser.cjs'),prefix+fs.readFileSync(path.join(__dirname,'browser-body.txt'),'utf8'));
