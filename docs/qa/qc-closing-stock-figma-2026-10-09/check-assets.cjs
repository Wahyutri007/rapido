const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),context=fs.readFileSync(path.join(__dirname,'replay/figma-context.txt'),'utf8');
const receipts=[...JSON.parse(fs.readFileSync(path.join(__dirname,'replay/assets.json'),'utf8')),...JSON.parse(fs.readFileSync(path.join(__dirname,'replay/filter-asset-confirmation.json'),'utf8'))];
const checks=receipts.map(a=>{const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,a.file))).digest('hex');return {file:a.file,sha256:actual,expected:a.sha256,contextUrlPresent:context.includes(a.url),pass:actual===a.sha256&&context.includes(a.url)};});
const result={scope:'Local SVG integrity against saved Figma export receipts and their URLs in full frame context. No live API download or cross-renderer pixel identity claim.',passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks};
fs.writeFileSync(path.join(__dirname,'asset-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,failed:result.failed}));process.exitCode=result.failed?1:0;
