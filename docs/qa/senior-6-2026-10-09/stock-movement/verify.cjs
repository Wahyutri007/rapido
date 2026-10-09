// Read-only by default. --seal is permitted only for the initial final snapshot.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=process.cwd(),folder=__dirname,manifest=path.join(folder,'verification.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function artifacts(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{const file=path.join(directory,entry.name);return entry.isDirectory()?artifacts(file):file===manifest?[]:[path.relative(folder,file).replaceAll('\\','/')];});}
if(process.argv.includes('--seal')){
 assert.equal(fs.existsSync(manifest),false,'Frozen evidence must not be resealed');
 const helper=JSON.parse(fs.readFileSync(path.join(folder,'helper-results.json'))),audit=JSON.parse(fs.readFileSync(path.join(folder,'audit-results.json'))),browser=JSON.parse(fs.readFileSync(path.join(folder,'browser-results.json'))),quality=JSON.parse(fs.readFileSync(path.join(folder,'quality-results.json')));
 assert.equal(browser.error,undefined);assert.ok(helper.checks.every(c=>c.passed)&&audit.checks.every(c=>c.passed)&&browser.checks.every(c=>c.passed));assert.ok(quality.checks.every(c=>c.exitCode===0&&!c.error));
 assert.deepEqual(browser.before,browser.after);assert.deepEqual(quality.before,quality.after);
 const owned=Object.fromEntries(Object.entries(browser.after).filter(([file])=>file==='lib/inventory-stock-movement.ts'||file.startsWith('components/feature/inventory/stock-movement/')||file.startsWith('app/(no-layout)/inventory/stock-movement/')));
 assert.equal(Object.keys(owned).length,7);
 for(const [file,expected]of Object.entries(owned))assert.equal(hash(path.resolve(root,file)),expected,file);
 const result={status:'READY_FOR_QA',signal:'SD6-004-STOCK-MOVEMENT-READY-FOR-QA',workflow:'Developer -> QA -> QC -> PM',ownedSource:owned,readOnlyContext:browser.after,counts:{helper:helper.checks.length,audit:audit.checks.length,browser:browser.checks.length,quality:quality.checks.length},artifacts:Object.fromEntries(artifacts(folder).map(file=>[file,hash(path.join(folder,file))])),limitations:'Read-only UI based on existing session records; historical closing stock/API/persistence/full router/native/Figma parity not certified. Shared integration files may advance under their owners; own route contracts must remain.'};
 fs.writeFileSync(manifest,JSON.stringify(result,null,2)+'\n');
}
const result=JSON.parse(fs.readFileSync(manifest));let count=0;
for(const [file,expected]of Object.entries(result.artifacts)){assert.equal(hash(path.join(folder,file)),expected,'Frozen artifact: '+file);count++;}
for(const [file,expected]of Object.entries(result.ownedSource))assert.equal(hash(path.resolve(root,file)),expected,'Owned source: '+file);
const hub=fs.readFileSync('app/(back-office)/inventory/index.tsx','utf8'),parent=fs.readFileSync('app/(no-layout)/inventory/_layout.tsx','utf8');
assert.ok(hub.includes('href: route("/inventory/stock-movement")'));assert.ok(parent.includes('name="stock-movement" options={{ headerShown: false }}'));
const contextDrift=Object.entries(result.readOnlyContext).filter(([file,expected])=>!result.ownedSource[file]&&(!fs.existsSync(path.resolve(root,file))||hash(path.resolve(root,file))!==expected)).map(([file])=>file);
console.log(JSON.stringify({status:result.status,artifactsVerified:count,ownedSourceVerified:Object.keys(result.ownedSource).length,integrationContracts:'PASS',contextDrift,counts:result.counts}));
