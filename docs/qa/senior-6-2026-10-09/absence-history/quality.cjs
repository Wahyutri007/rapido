const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {owned,shared}=require('./sources.cjs');
const all=[...owned,...shared];
const hashes=()=>Object.fromEntries(all.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=hashes();
const commands=[
 ['ESLint all nine touched sources',process.execPath,['node_modules/eslint/bin/eslint.js',...all,'--no-cache','--max-warnings','0','--format','json','--output-file',path.join(__dirname,'eslint.json')]],
 ['Biome seven new sources',process.execPath,['node_modules/@biomejs/biome/bin/biome','check',...owned]],
 ['TypeScript five route/home/layout roots and dependency closure',process.execPath,[path.join(__dirname,'typecheck.cjs')]],
 ['Scoped whitespace','git.exe',['diff','--check','--',...all]]
];
const checks=commands.map(([name,exe,args])=>{const result=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,timeout:180000});console.log(`${name}: exit ${result.status}`);if(result.status!==0)console.log(result.stdout+result.stderr);return {name,args,exitCode:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?.message};});
const after=hashes();
fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify({before,after,checks,limitations:'Strict formatting of seven new files; shared home/parent preserved outside route import/handler/registration deltas after EOL normalization, proved in model checks. Lint covers all nine and TypeScript both shared roots.'},null,2)+'\n');
assert.deepEqual(after,before);assert.ok(checks.every(c=>c.exitCode===0&&!c.error));
