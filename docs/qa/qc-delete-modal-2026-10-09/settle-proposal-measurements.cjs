const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const target=path.join(__dirname,'proposal/browser.cjs'),interim=path.join(__dirname,'interim');
for(const [file,name] of [[target,'proposal-animation-runner.cjs'],[path.join(__dirname,'proposal/final/browser-results.json'),'proposal-animation-results.json'],[path.join(__dirname,'proposal/final/node-320.png'),'proposal-animation-node-320.png'],[path.join(__dirname,'quality-results.json'),'proposal-animation-quality.json']]){assert.ok(!fs.existsSync(path.join(interim,name)));fs.copyFileSync(file,path.join(interim,name));}
const previous=JSON.parse(fs.readFileSync(path.join(interim,'proposal-animation-results.json'),'utf8'));
assert.equal(previous.failed,2);assert.ok(previous.checks.filter(x=>!x.passed).every(x=>x.name.startsWith('node-320:')));
let code=fs.readFileSync(target,'utf8');
assert.equal(code.split('let browser, page, exception;').length,2);
code=code.replace('let browser, page, exception;','const measurementWaits = [];\nlet browser, page, exception;');
const anchor='await page.waitForTimeout(700);\n\t\t\tconst dialog =';assert.equal(code.split(anchor).length,2);
code=code.replace(anchor,`await page.waitForTimeout(700);
            // Moti spring can still scale the card on a busy machine. Await its
            // rendered size matching the computed CSS box, independent of the
            // expected viewport width or any geometry assertion below.
            const motionBefore = await page.getByRole("dialog").evaluate(node => { const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return {width:rect.width,height:rect.height,cssWidth:parseFloat(style.width),cssHeight:parseFloat(style.height),transform:style.transform}; });
            await page.waitForFunction(() => { const node=document.querySelector('[role="dialog"]');if(!node)return false;const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return Math.abs(rect.width-parseFloat(style.width))<0.1 && Math.abs(rect.height-parseFloat(style.height))<0.1; }, {timeout:12000});
            measurementWaits.push({label,motionBefore,settled:true});
\t\t\tconst dialog =`);
code=code.replace('offlineBuild: transport.record,','measurementWaits, offlineBuild: transport.record,');fs.writeFileSync(target,code);
console.log('Saved initial 113/2 run; only proposal measurement wait changed, candidate source unchanged.');
