const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),ts=require('node:module').createRequire("C:/Users/Wahyu/Downloads/rapido-pm-cashier-publish-2026-10-10/package.json")('typescript');
const packet=__dirname,roots=["app/(no-layout)/manage/pos-settings/rounding.tsx","components/common/SingleSelect.tsx","app/(no-layout)/manage/pos-settings/_layout.tsx"];
const output=path.join(packet,'quality.json');if(fs.existsSync(output))throw Error('Preserve quality output');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),before=Object.fromEntries(roots.map(f=>[f,hash(f)]));
const lint=cp.spawnSync(process.execPath,['node_modules/eslint/bin/eslint.js',...roots,'--format','json'],{encoding:'utf8'});
const biome=cp.spawnSync(process.execPath,['node_modules/@biomejs/biome/bin/biome','check',...roots],{encoding:'utf8'});
const diff=cp.spawnSync('git',['diff','--check','--',...roots],{encoding:'utf8'});
const configFile=ts.readConfigFile('tsconfig.json',ts.sys.readFile),config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,process.cwd());
const ambient=config.fileNames.filter(f=>f.endsWith('.d.ts'));
const program=ts.createProgram([...roots,...ambient],{...config.options,noEmit:true,incremental:false});
const diagnostics=[...config.errors,...ts.getPreEmitDiagnostics(program)],sourceHashes={};
for(const source of program.getSourceFiles()){
 if(source.isDeclarationFile||/[\\/]node_modules[\\/]/.test(source.fileName))continue;
 const bytes=fs.readFileSync(source.fileName);if(source.text!==bytes.toString('utf8').replace(/^\uFEFF/,''))throw Error('Source changed during TS: '+source.fileName);
 sourceHashes[path.relative(process.cwd(),source.fileName).replaceAll('\\','/')]=hash(source.fileName);
}
const rows=JSON.parse(lint.stdout||'[]'),after=Object.fromEntries(roots.map(f=>[f,hash(f)]));
const drift=roots.filter(f=>before[f]!==after[f]);
const result={status:lint.status||biome.status||diff.status||diagnostics.length||drift.length?'FAIL':'PASS',roots,ambient,filesInClosure:program.getSourceFiles().length,diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(d=>({file:d.file?.fileName,code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')})),before,after,sourceHashes,drift,eslint:{exit:lint.status,errors:rows.reduce((n,r)=>n+r.errorCount,0),warnings:rows.reduce((n,r)=>n+r.warningCount,0),messages:rows.flatMap(r=>r.messages),stderr:lint.stderr},biome:{exit:biome.status,stdout:biome.stdout,stderr:biome.stderr},diff:{exit:diff.status,stdout:diff.stdout,stderr:diff.stderr},scope:'Three main-based review roots plus actual imported/ambient TypeScript closure; not whole project.'};
fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(JSON.stringify({...result,sourceHashes:undefined,before:undefined,after:undefined}));process.exitCode=result.status==='PASS'?0:1;
