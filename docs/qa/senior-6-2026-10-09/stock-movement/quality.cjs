const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const sources=['lib/inventory-stock-movement.ts',...fs.readdirSync('components/feature/inventory/stock-movement').map(f=>'components/feature/inventory/stock-movement/'+f),...fs.readdirSync('app/(no-layout)/inventory/stock-movement').map(f=>'app/(no-layout)/inventory/stock-movement/'+f),'app/(no-layout)/inventory/_layout.tsx','app/(back-office)/inventory/index.tsx'];
const fingerprints=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=fingerprints();
const commands=[
 ['ESLint',process.execPath,['node_modules/eslint/bin/eslint.js',...sources,'--no-cache','--max-warnings','0','--format','json','--output-file',path.join(__dirname,'eslint.json')]],
 ['Biome',process.execPath,['node_modules/@biomejs/biome/bin/biome','check',...sources]],
 ['TypeScript new flow and two shared roots',process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--project','.expo/senior6-stock-movement-tsconfig.json']],
 ['Scoped whitespace','git.exe',['diff','--check','--',...sources]]
];
const checks=commands.map(([name,executable,args])=>{const result=spawnSync(executable,args,{encoding:'utf8',windowsHide:true,timeout:120000});console.log(`${name}: exit ${result.status}`);return {name,args,exitCode:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?.message};});
const after=fingerprints();fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify({before,after,checks,limitations:'Nine production source files and TypeScript dependency closure, not global app/native/backend verification.'},null,2)+'\n');
assert.deepEqual(before,after);assert.ok(checks.every(check=>check.exitCode===0&&!check.error));
