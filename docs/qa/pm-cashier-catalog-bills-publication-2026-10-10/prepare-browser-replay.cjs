const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const packet=__dirname,file=path.join(packet,'browser-replay.cjs');assert.ok(!fs.existsSync(file),'Preserve replay');
let source=fs.readFileSync(path.join(packet,'browser.cjs'),'utf8');
const before="async function selectTrigger(){await page.getByText('Alpha',{exact:true}).click();";
assert.equal(source.split(before).length,2);
source=source.replace(before,"async function selectTrigger(){await page.getByText('Pilihan privat',{exact:true}).waitFor({state:'hidden'});await page.getByText('Alpha',{exact:true}).click();").replaceAll('D:/Rapido-QC-temp/pm-catalog-bills-final-browser-2026-10-10','D:/Rapido-QC-temp/pm-catalog-bills-final-browser-replay-2026-10-10');
fs.writeFileSync(file,source);console.log('Fresh replay waits for actual popup exit before physical reopen; source/bundle/thresholds unchanged. First selector failure preserved.');
