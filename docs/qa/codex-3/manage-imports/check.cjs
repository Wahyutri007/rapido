const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const qc=JSON.parse(fs.readFileSync('docs/qa/qc-manage-forms-2026-10-09/style-findings.json','utf8'));
const sources=[...['extra','order-type','payment-method','tax'].map(name=>'app/(no-layout)/manage/'+name+'/modify.tsx'),...['ExtraModifyScreen','OrderTypeModifyScreen','PaymentMethodModifyScreen','TaxModifyScreen','ManageFormNotFound','ManagePreviewForm'].map(name=>'components/feature/manage/settings/'+name+'.tsx')];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const structure=text=>{
 const parsed=ts.createSourceFile('source.tsx',text.replace(/\r\n/g,'\n'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const printer=ts.createPrinter();
 const body=parsed.statements.filter(node=>!ts.isImportDeclaration(node)).map(node=>printer.printNode(ts.EmitHint.Unspecified,node,parsed)).join('\n');
 const imports=parsed.statements.filter(ts.isImportDeclaration).map(node=>({
  from:node.moduleSpecifier.text,typeOnly:node.importClause?.isTypeOnly||false,default:node.importClause?.name?.text,
  namespace:node.importClause?.namedBindings&&ts.isNamespaceImport(node.importClause.namedBindings)?node.importClause.namedBindings.name.text:undefined,
  names:node.importClause?.namedBindings&&ts.isNamedImports(node.importClause.namedBindings)?node.importClause.namedBindings.elements.map(item=>({imported:item.propertyName?.text||item.name.text,local:item.name.text,typeOnly:item.isTypeOnly})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))):[],
 })).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return {body,imports};
};
const comparisons=qc.proposalVerification.map(item=>{
 const original=fs.readFileSync(path.join(__dirname,'baseline',item.file+'.txt'),'utf8');
 const current=fs.readFileSync(item.file,'utf8');
 const before=structure(original),after=structure(current);
 return {file:item.file,originalSha256:hash(original),sourceSha256:hash(current),qcProposalSha256:item.proposalSha256,normalizedLFMatchesQCProposal:hash(current.replace(/\r\n/g,'\n'))===item.proposalSha256,bodyUnchanged:before.body===after.body,importBindingsUnchanged:JSON.stringify(before.imports)===JSON.stringify(after.imports)};
});
const run=args=>{const r=spawnSync(process.execPath,args,{encoding:'utf8'});return {command:['node',...args],exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr.trim()};};
const lint=run(['node_modules/eslint/bin/eslint.js',...sources,'--no-cache','--max-warnings','0','--format','json']);
let lintResults;try{lintResults=JSON.parse(lint.stdout).map(item=>({file:path.relative(process.cwd(),item.filePath).replaceAll('\\','/'),errors:item.errorCount,warnings:item.warningCount,messages:item.messages.map(m=>({rule:m.ruleId,line:m.line,message:m.message}))}));}catch{lintResults=[{error:lint.stdout||lint.stderr}];}delete lint.stdout;
const biome=run(['node_modules/@biomejs/biome/bin/biome','check',...sources]);
const diff=spawnSync('git',['-c','core.autocrlf=false','diff','--check','--',...sources],{encoding:'utf8'});
const passed=comparisons.every(item=>item.bodyUnchanged&&item.importBindingsUnchanged&&item.normalizedLFMatchesQCProposal)&&lint.exitCode===0&&biome.exitCode===0&&diff.status===0;
const result={owner:'Codex-3',finding:'QC-MANAGE-FORMS-001',status:passed?'READY_FOR_QC_RECHECK':'CHECK_FAILED',comparisons,lint:{...lint,files:lintResults},biome,diff:{exitCode:diff.status,stdout:diff.stdout.trim(),stderr:diff.stderr.trim()},sourceHashes:Object.fromEntries(sources.map(file=>[file,hash(fs.readFileSync(file))]))};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,filesChecked:sources.length,bodiesAndBindingsUnchanged:comparisons.every(item=>item.bodyUnchanged&&item.importBindingsUnchanged),matchesQCProposalAfterLFNormalization:comparisons.every(item=>item.normalizedLFMatchesQCProposal),eslintExitCode:lint.exitCode,biomeExitCode:biome.exitCode,diffExitCode:diff.status}));process.exitCode=passed?0:1;
