const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),packet=__dirname,manifest=JSON.parse(fs.readFileSync(path.join(packet,'manifest.json'))),drift=[];
for(const [file,hash]of Object.entries(manifest.sourceBindings))if(!fs.existsSync(file)||sha(file)!==hash)drift.push(file);
for(const [file,hash]of Object.entries(manifest.privateOutputs))if(!fs.existsSync(file)||sha(file)!==hash)drift.push(file);
for(const [file,hash]of Object.entries(manifest.artifacts))if(sha(path.join(packet,file))!==hash)drift.push(file);
console.log(JSON.stringify({status:drift.length?'FAIL':'PASS',bindings:Object.keys(manifest.sourceBindings).length,artifacts:Object.keys(manifest.artifacts).length,manifestSHA256:sha(path.join(packet,'manifest.json')),drift}));process.exitCode=drift.length?1:0;
