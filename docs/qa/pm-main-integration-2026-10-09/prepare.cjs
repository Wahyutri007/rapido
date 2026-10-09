const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const source = 'C:/Users/Wahyu/Downloads/rapido-dev/rapido-dev';
const target = 'D:/Rapido-QC-temp/pm-main-2026-10-09';
const output = __dirname;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const gitFiles = cp.execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard', '-z'], {cwd:source, maxBuffer:8e6}).toString().split('\0').filter(Boolean);
const heldPrefixes = ['app/(cashier)/', 'app/(no-layout)/(cashier)/', 'components/feature/cashier/', 'lib/cashier/', 'types/ui/cashier/'];
const held = [], selected = [], suspicious = [], missing = [];
const roots = /^(?:app|components|api|hooks|context|lib|schema|store|constants|types|scripts|assets|docs)\//;
const rootFiles = new Set(['README.md','metro.config.js','tailwind.config.js','package.json','package-lock.json','babel.config.js','global.css','app.json','tsconfig.json','nativewind-env.d.ts','eslint.config.js','biome.json','AGENTS.md','AGENTS_UI.md','.env.example','.gitignore']);
for (const file of [...new Set(gitFiles)].sort()) {
  if (heldPrefixes.some(p=>file.startsWith(p))) {held.push({file,reason:'Cashier source not handed off for integration / on hold or waiting reference'});continue;}
  if (!roots.test(file) && !rootFiles.has(file)) continue;
  assert(!/(^|\/)(node_modules|\.expo|\.git|dist|web-build)\//.test(file),file);
  if (/\.env(?:\.|$)/.test(path.basename(file)) && file!=='.env.example') throw Error('Unexpected environment file: '+file);
  const src=path.join(source,file);
  if (!fs.existsSync(src)) {missing.push(file);continue;}
  const data=fs.readFileSync(src);assert(data.length<95e6,file);
  if (/\.(?:[cm]?[jt]sx?|json|md|txt|html|css|ya?ml|patch)$/.test(file) || file==='.env.example') {
    const content=data.toString('utf8');
    if (/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sk-(?:proj-)?[A-Za-z0-9_-]{35,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(content)) suspicious.push(file);
  }
  selected.push({file,bytes:data.length,sha256:hash(data)});
  const dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);
}
assert.equal(suspicious.length,0,'Credential-pattern matches: '+suspicious.join(', '));
const drift=selected.filter(i=>hash(fs.readFileSync(path.join(source,i.file)))!==i.sha256).map(i=>i.file);
assert.equal(drift.length,0,'Snapshot source drift: '+drift.join(', '));
const nodeLink=path.join(target,'node_modules');if(!fs.existsSync(nodeLink))fs.symlinkSync(path.join(source,'node_modules'),nodeLink,'junction');
for (const relative of ['expo-env.d.ts','.expo/types/router.d.ts']) {
  const src=path.join(source,relative),dest=path.join(target,relative);
  if(fs.existsSync(src)){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);}
}
for (const tool of ['senior7-test-tools','senior6-tools']) {
  const src=path.join(source,'.expo',tool),dest=path.join(target,'.expo',tool);
  if(fs.existsSync(src)&&!fs.existsSync(dest))fs.symlinkSync(src,dest,'junction');
}
const manifest={createdAt:new Date().toISOString(),source,target,sourceHead:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:source}).toString().trim(),integrationBase:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:target}).toString().trim(),selected,held,missing,sourceDrift:drift,credentialPatternMatches:suspicious,notes:['Read-only snapshot of shared workspace; no source/index/branch changes there.','Cashier remains at integration baseline.','Archived QC/developer evidence remains historical and does not certify the integrated tree.','Dependencies/tooling reused via ignored local junctions; not staged.']};
fs.writeFileSync(path.join(output,'snapshot.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:selected.length,bytes:selected.reduce((sum,i)=>sum+i.bytes,0),held:held.length,missing:missing.length,drift:drift.length,secrets:suspicious.length}));
