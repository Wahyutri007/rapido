const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const ts = require('typescript');
const roots = ['app/(no-layout)/(cashier)/cart/input-money.tsx','components/common/Keypad.tsx','app/(no-layout)/(cashier)/cart/_layout.tsx','lib/cashier/cash-input.ts','lib/cashier/cash-input-theme.ts','schema/cashier/cash-input.ts'];
const lint = cp.spawnSync(process.execPath,['node_modules/eslint/bin/eslint.js',...roots,'--format','json'],{encoding:'utf8'});
const biome = cp.spawnSync(process.execPath,['node_modules/@biomejs/biome/bin/biome','check',...roots],{encoding:'utf8'});
const diff = cp.spawnSync('git',['diff','--check','--',...roots],{encoding:'utf8'});
const configFile=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const config=ts.parseJsonConfigFileContent(configFile.config,ts.sys,process.cwd());
const program=ts.createProgram([...roots,...config.fileNames.filter(file=>file.endsWith('.d.ts'))],{...config.options,noEmit:true,incremental:false});
const diagnostics=[...config.errors,...ts.getPreEmitDiagnostics(program)];
const sourceHashes={};
for(const source of program.getSourceFiles()){
  if(source.isDeclarationFile || /[\\/]node_modules[\\/]/.test(source.fileName))continue;
  const bytes=fs.readFileSync(source.fileName); if(source.text!==bytes.toString('utf8').replace(/^\uFEFF/,''))throw Error('Source drift during type check');
  sourceHashes[path.relative(process.cwd(),source.fileName).replaceAll('\\','/')]=crypto.createHash('sha256').update(bytes).digest('hex');
}
const rows=JSON.parse(lint.stdout || '[]');
const result={ticket:'SD5-015',scope:'Six production roots including the schema prerequisite, actual tsconfig/declarations and imported source closure, not global app TS.',roots,filesInClosure:program.getSourceFiles().length,sourceHashes,eslint:{exit:lint.status,errors:rows.reduce((n,r)=>n+r.errorCount,0),warnings:rows.reduce((n,r)=>n+r.warningCount,0),messages:rows.flatMap(r=>r.messages),stderr:lint.stderr},biome:{exit:biome.status,stdout:biome.stdout,stderr:biome.stderr},diff:{exit:diff.status,stdout:diff.stdout,stderr:diff.stderr},diagnosticCount:diagnostics.length,diagnostics:diagnostics.map(d=>({file:d.file?.fileName,code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}))};
const index=process.argv.indexOf('--output');
if(index!==-1){const destination=path.resolve(process.argv[index+1]);const frozen=path.resolve('docs/qa/senior-5-2026-10-09/cashier-cash-input-figma');const relative=path.relative(frozen,destination);if(!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('Write reviewer output outside frozen developer packet.');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({...result,sourceHashes:undefined}));process.exitCode=lint.status || biome.status || diff.status || diagnostics.length ? 1 : 0;
