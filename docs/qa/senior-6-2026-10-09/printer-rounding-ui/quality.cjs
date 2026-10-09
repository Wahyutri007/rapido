const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const sources=['app/(no-layout)/manage/printer/modify.tsx','app/(no-layout)/manage/pos-settings/rounding.tsx'];
const fingerprints=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=fingerprints();
const commands=[
 ['ESLint',process.execPath,['node_modules/eslint/bin/eslint.js',...sources,'--no-cache','--max-warnings','0','--format','json','--output-file',path.join(__dirname,'eslint.json')]],
 ['Biome',process.execPath,['node_modules/@biomejs/biome/bin/biome','check',...sources]],
 ['TypeScript two roots',process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--project','.expo/senior6-printer-pos-tsconfig.json']],
 ['Scoped whitespace','git.exe',['diff','--check','--',...sources]]
];
const checks=commands.map(([name,executable,args])=>{const result=spawnSync(executable,args,{encoding:'utf8',windowsHide:true,timeout:120000});console.log(`${name}: exit ${result.status}`);return {name,args,exitCode:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?.message};});
const after=fingerprints();fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify({before,after,checks,limitations:'Two production roots plus TypeScript dependency closure; not global project quality or native test.'},null,2)+'\n');
assert.deepEqual(before,after);assert.ok(checks.every(check=>check.exitCode===0&&!check.error));
