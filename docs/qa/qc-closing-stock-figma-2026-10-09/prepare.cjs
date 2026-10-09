const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),parent=path.join(root,'docs/qa/senior-5-2026-10-09/closing-stock-figma-narrow'),replay=path.join(__dirname,'replay'),own='D:/Rapido-QC-temp/closing-stock-figma-2026-10-09';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
assert(!fs.existsSync(replay),'Existing reviewer copy must not be overwritten');assert(replay.startsWith(root+path.sep));
const packetNames=['docs/qa/senior-5-2026-10-09/closing-stock-figma-narrow','docs/qa/senior-5-2026-10-09/closing-stock-figma','docs/qa/senior-5-2026-10-09/closing-stock','docs/qa/qc-figma-audit-2026-10-09'];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(i=>i.isDirectory()?walk(path.join(dir,i.name)):[path.join(dir,i.name)]);
const guards=packetNames.flatMap(p=>walk(path.join(root,p)).map(f=>({file:path.relative(root,f).replace(/\\/g,'/'),sha256:hash(f)})));
const verification=JSON.parse(fs.readFileSync(path.join(parent,'verification.json'),'utf8'));
for(const [f,expected]of Object.entries(verification.sourceHashes))assert.equal(hash(path.join(root,f)),expected,f);
fs.writeFileSync(path.join(__dirname,'parent-guards.json'),JSON.stringify(guards,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'source-inputs.json'),JSON.stringify(verification.sourceHashes,null,2)+'\n');
fs.cpSync(parent,replay,{recursive:true,errorOnExist:true});fs.mkdirSync(own,{recursive:true});
for(const file of ['build-browser.cjs','check-browser.cjs','browser.cjs']){
 let text=fs.readFileSync(path.join(replay,file),'utf8');
 text=text.replaceAll('D:/Codex-5/tmp/closing-stock-figma-narrow',own).replaceAll('D:/Codex-5/tmp/closing-stock-figma/transform-cache',own+'/transform-cache').replaceAll("'sd5-figma-visual'","'qc-closing-stock-figma-v1'").replaceAll("path.join('D:/Codex-5/tmp','rapido-sd5-closing-')","path.join('"+own+"','qc-browser-')");
 fs.writeFileSync(path.join(replay,file),text);
}
const runtimeGuards=['metro.config.js','babel.config.js','tailwind.config.js','global.css','node_modules/react-native-css-interop/.cache/android.js','node_modules/react-native-css-interop/.cache/web.css'];
fs.writeFileSync(path.join(__dirname,'runtime-guards.json'),JSON.stringify(runtimeGuards.map(file=>({file,sha256:hash(path.join(root,file))})),null,2)+'\n');
console.log(JSON.stringify({parentSourceMatches:Object.keys(verification.sourceHashes).length,frozenArtifactGuards:guards.length,reviewer:replay,ownCache:own}));
