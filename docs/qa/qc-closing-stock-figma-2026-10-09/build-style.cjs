const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const guards=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime-guards.json'),'utf8'));
for(const g of guards)assert.equal(hash(path.join(root,g.file)),g.sha256,g.file);
const output=path.join(__dirname,'replay/generated-web-style.css');
const result=cp.spawnSync(process.execPath,[path.join(root,'node_modules/tailwindcss/lib/cli.js'),'-i',path.join(root,'global.css'),'-c',path.join(root,'tailwind.config.js'),'-o',output],{cwd:root,encoding:'utf8',windowsHide:true});
for(const g of guards)assert.equal(hash(path.join(root,g.file)),g.sha256,g.file);
const proof={scope:'Fresh reviewer Tailwind output from current production config/content; no shared CSS cache changed.',exit:result.status,stdout:result.stdout,stderr:result.stderr,sha256:hash(output)};
fs.writeFileSync(path.join(__dirname,'style-build.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));process.exitCode=result.status||0;
