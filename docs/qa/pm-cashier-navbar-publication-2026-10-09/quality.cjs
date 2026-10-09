const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const ts=require('typescript');
const files=['components/custom/BottomTab.tsx','app/(cashier)/_layout.tsx','app/(no-layout)/(cashier)/catalog/index.tsx','app/_layout.tsx'];
const hash=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const before=hash(),checks=[];
for(const [name,exe,args] of [
 ['biome',path.resolve('node_modules/@biomejs/cli-win32-x64/biome.exe'),['check',...files]],
 ['eslint',process.execPath,['node_modules/eslint/bin/eslint.js',...files]],
 ['diff','git',['diff','--check','--',...files]],
]){
 const r=spawnSync(exe,args,{encoding:'utf8',timeout:120000,windowsHide:true});
 fs.writeFileSync(path.join(__dirname,name+'.txt'),[r.stdout,r.stderr,r.error?.message].filter(Boolean).join('\n'));
 checks.push({name,exitCode:r.status});
}
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const ambient=parsed.fileNames.filter(f=>f.endsWith('.d.ts'));
const program=ts.createProgram([...files,...ambient],{...parsed.options,noEmit:true});
const diags=ts.getPreEmitDiagnostics(program);
fs.writeFileSync(path.join(__dirname,'typescript.txt'),ts.formatDiagnosticsWithColorAndContext(diags,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>process.cwd(),getNewLine:()=> '\n'}));
checks.push({name:'scoped-typescript',rootFiles:files.length,ambientFiles:ambient.length,sourceClosure:program.getSourceFiles().length,diagnostics:diags.length,diagnosticFiles:[...new Set(diags.map(d=>d.file?path.relative(process.cwd(),d.file.fileName):null))]});
const after=hash();
const result={files,checks,before,after,sourceStable:JSON.stringify(before)===JSON.stringify(after),pass:checks.every(x=>x.exitCode===undefined?x.diagnostics===0:x.exitCode===0)&&JSON.stringify(before)===JSON.stringify(after)};
fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));process.exitCode=result.pass?0:1;
