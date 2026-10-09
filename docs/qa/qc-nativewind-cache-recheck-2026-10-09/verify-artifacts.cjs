const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'artifact-manifest.json'),'utf8'));
const results=manifest.artifacts.map(item=>({file:item.file,passed:fs.existsSync(path.join(__dirname,item.file))&&hash(path.join(__dirname,item.file))===item.sha256}));
const failed=results.filter(item=>!item.passed);
console.log(JSON.stringify({owner:'QC',readOnly:true,total:results.length,matched:results.length-failed.length,failed}));
process.exitCode=failed.length?1:0;
