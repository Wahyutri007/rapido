const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const packet=__dirname,sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),manifest=JSON.parse(fs.readFileSync(path.join(packet,'manifest.json'))),drift=[];
for(const group of [manifest.sourceBindings,manifest.privateOutputs])for(const[f,h]of Object.entries(group))if(!fs.existsSync(f)||sha(f)!==h)drift.push(f);
for(const[f,h]of Object.entries(manifest.artifacts))if(!fs.existsSync(path.join(packet,f))||sha(path.join(packet,f))!==h)drift.push(f);
console.log(JSON.stringify({status:drift.length?'FAIL':'PASS',bindings:Object.keys(manifest.sourceBindings).length,artifacts:Object.keys(manifest.artifacts).length,manifestSHA256:sha(path.join(packet,'manifest.json')),drift}));process.exitCode=drift.length?1:0;
