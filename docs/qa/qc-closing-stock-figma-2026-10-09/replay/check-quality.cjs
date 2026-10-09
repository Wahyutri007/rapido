const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),cp=require('node:child_process'),crypto=require('node:crypto');
const dir=__dirname;
const roots=["components/feature/inventory/closing-stock/ClosingStockScreen.tsx","app/(back-office)/inventory/_layout.tsx","app/(back-office)/_layout.tsx","components/common/Header.tsx","components/common/SearchBar.tsx","components/common/SingleSelect.tsx","components/common/Card.tsx","components/custom/BottomTab.tsx","lib/ui/figma-stock.ts"];
const lint=cp.spawnSync(process.execPath,['node_modules/eslint/bin/eslint.js',...roots,'--format','json','--output-file',dir+'/eslint-final.json'],{encoding:'utf8'});
const biome=cp.spawnSync(process.execPath,['node_modules/@biomejs/biome/bin/biome','check',...roots],{encoding:'utf8'});
const diff=cp.spawnSync('git',['diff','--check','--',...roots],{encoding:'utf8'});
const file=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const config=ts.parseJsonConfigFileContent(file.config,ts.sys,process.cwd());
const program=ts.createProgram([...roots,...config.fileNames.filter(name=>name.endsWith('.d.ts'))],{...config.options,noEmit:true,incremental:false});
const diagnostics=[...config.errors,...ts.getPreEmitDiagnostics(program)];
const sourceHashes={};
for(const source of program.getSourceFiles()){
if(source.isDeclarationFile||/[\\/]node_modules[\\/]/.test(source.fileName))continue;
const bytes=fs.readFileSync(source.fileName);if(source.text!==bytes.toString('utf8').replace(/^\uFEFF/,''))throw Error('Source drift during type check');
sourceHashes[path.relative(process.cwd(),source.fileName).replaceAll('\\','/')]=crypto.createHash('sha256').update(bytes).digest('hex');}
const result={scope:'Nine visual roots and their imported source/declaration closure, not global TypeScript',roots,sourceHashes,eslint:{exit:lint.status,errors:JSON.parse(fs.readFileSync(dir+'/eslint-final.json','utf8')).reduce((n,r)=>n+r.errorCount,0),warnings:JSON.parse(fs.readFileSync(dir+'/eslint-final.json','utf8')).reduce((n,r)=>n+r.warningCount,0),stderr:lint.stderr},biome:{exit:biome.status,stdout:biome.stdout,stderr:biome.stderr},diff:{exit:diff.status,stdout:diff.stdout,stderr:diff.stderr},diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(d=>({file:d.file?.fileName,code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}))};
fs.writeFileSync(dir+'/quality-results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,sourceHashes:undefined}));process.exitCode=lint.status||biome.status||diff.status||diagnostics.length?1:0;
