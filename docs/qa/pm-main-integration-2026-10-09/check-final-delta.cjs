const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root='D:/Rapido-QC-temp/pm-main-2026-10-09';process.chdir(root);
const ts=require(path.join(root,'node_modules/typescript')),{ESLint}=require(path.join(root,'node_modules/eslint'));
const file='components/common/DeleteConfirmModal.tsx';
(async()=>{
 const raw=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile).config;
 const config=ts.parseJsonConfigFileContent({...raw,include:[file,'nativewind-env.d.ts','expo-env.d.ts','.expo/types/**/*.ts'],exclude:['node_modules','docs']},ts.sys,root);
 const program=ts.createProgram(config.fileNames,{...config.options,noEmit:true,incremental:false});
 const diagnostics=ts.getPreEmitDiagnostics(program).map(d=>({file:d.file?.fileName,line:d.file&&d.start!==undefined?d.file.getLineAndCharacterOfPosition(d.start).line+1:null,code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')}));
 const lint=await new ESLint({cwd:root}).lintFiles([file,'scripts/start-hp.cjs','scripts/preserve-nativewind-cache.cjs','scripts/verify-metro-cache.cjs','scripts/verify-nativewind-cache.cjs','metro.config.js','tailwind.config.js']);
 const results={scope:'Final applied DeleteConfirmModal delta TypeScript import closure, and modal/runtime CJS configuration lint. Earlier whole production TypeScript remains recorded before this single component delta.',sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),typeDiagnostics:diagnostics,lintErrors:lint.reduce((n,r)=>n+r.errorCount,0),lintWarnings:lint.reduce((n,r)=>n+r.warningCount,0),lintResults:lint.filter(r=>r.messages.length).map(r=>({file:r.filePath,messages:r.messages}))};
 fs.writeFileSync(path.join(__dirname,'final-delta-quality.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({typeDiagnostics:diagnostics.length,lintErrors:results.lintErrors,lintWarnings:results.lintWarnings}));
 assert.equal(diagnostics.length,0);assert.equal(results.lintErrors,0);
})().catch(e=>{console.error(e);process.exitCode=1;});
