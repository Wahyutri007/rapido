const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const packet=__dirname,root=path.resolve(packet,'../../..'),digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const manifestFile=path.join(packet,'manifest.json');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
if(process.argv.includes('--seal')){
 assert.ok(!fs.existsSync(manifestFile),'Packet already sealed');
 const quality=JSON.parse(fs.readFileSync(path.join(packet,'quality-results.json'))),candidate=JSON.parse(fs.readFileSync(path.join(packet,'candidate.json'))),browser=JSON.parse(fs.readFileSync(path.join(packet,'browser-font-final/results.json'))),build=JSON.parse(fs.readFileSync("D:/Rapido-QC-temp/pm-bills-publication-fixed-2026-10-10/build.json"));
 assert.equal(quality.diagnosticCount,0);assert.equal(quality.eslint.exit,0);assert.equal(quality.biome.exit,0);assert.equal(quality.diff.exit,0);assert.equal(browser.fail,0);assert.equal(browser.errors.length,0);assert.equal(browser.consoleErrors.length,0);assert.equal(browser.blocked.length,0);
 const source={...quality.closureSourceHashes,...candidate.owned,...candidate.preserved,...build.sources,...build.transformedSources};
 const artifacts=Object.fromEntries(walk(packet).map(f=>[path.relative(packet,f).replaceAll('\\','/'),digest(f)]));
 const output='D:/Rapido-QC-temp/pm-bills-publication-fixed-2026-10-10';
 const external=Object.fromEntries(['bundle.js','style.css','assets.json','build.json'].map(f=>[path.join(output,f),digest(path.join(output,f))]));
 for(const [file,hash]of Object.entries(browser.assetBindings)){if(path.isAbsolute(file))external[file]=hash;else source[file]=hash;}
 const regression=JSON.parse(fs.readFileSync(path.join(packet,'cash-regression-candidate/results.json')));assert.equal(regression.fail,0);assert.equal(regression.errors.length,0);assert.equal(regression.consoleErrors.length,0);assert.equal(regression.blockedRequests.length,0);Object.assign(source,regression.build.sources,regression.build.transformedSources);
 for(const f of ['bundle.js','style.css','assets.json','build.json']){const file=path.join('D:/Rapido-QC-temp/pm-bills-cash-regression-2026-10-10',f);external[file]=digest(file);}
 const manifest={createdAtUtc:new Date().toISOString(),base:candidate.base,scope:candidate.scope,source,artifacts,external};
 fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
}
const manifest=JSON.parse(fs.readFileSync(manifestFile));let checked=0;
for(const [group,base]of [['source',root],['artifacts',packet],['external',null]])for(const [f,hash]of Object.entries(manifest[group])){assert.equal(digest(base?path.join(base,f):f),hash,f);checked++;}
console.log(JSON.stringify({status:'PASS',checked,manifestSHA256:digest(manifestFile)}));
