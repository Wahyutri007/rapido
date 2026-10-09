const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const {spawnSync}=require('node:child_process');
const sources=[
 'app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx',
 'app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx',
 'lib/accounting/journal-validation.ts',
];
const run=args=>{const r=spawnSync(process.execPath,args,{encoding:'utf8'});return {command:['node',...args],exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr.trim()};};
const lint=run(['node_modules/eslint/bin/eslint.js',...sources,'--no-cache','--max-warnings','0','--format','json']);
let lintResults;
try{lintResults=JSON.parse(lint.stdout).map(item=>({file:path.relative(process.cwd(),item.filePath).replaceAll('\\','/'),errorCount:item.errorCount,warningCount:item.warningCount,messages:item.messages.map(m=>({rule:m.ruleId,line:m.line,severity:m.severity,message:m.message}))}));}catch{lintResults=[{error:lint.stdout||lint.stderr}];}
delete lint.stdout;
const format=run(['node_modules/@biomejs/biome/bin/biome','format',...sources]);
const biome=run(['node_modules/@biomejs/biome/bin/biome','check',...sources]);
const diff=spawnSync('git',['-c','core.autocrlf=false','diff','--check','--',...sources],{encoding:'utf8'});
const renderBody=(source,name)=>{
 const parsed=ts.createSourceFile('screen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const fn=parsed.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name);
 return ts.createPrinter().printNode(ts.EmitHint.Unspecified,fn.body.statements.filter(ts.isReturnStatement).at(-1).expression,parsed).replace(/\s+/g,' ').trim();
};
const renderComparisons=sources.slice(0,2).map((file,index)=>{
 const name=(index?'AdjustingJournal':'GeneralJournal')+'Form';
 const before=path.join(__dirname,index?'adjusting-modify.before.tsx.txt':'general-modify.before.tsx.txt');
 return {file,comparison:'Editor JSX identical to SD3-003 saved baseline',passed:renderBody(fs.readFileSync(before,'utf8'),name)===renderBody(fs.readFileSync(file,'utf8'),name)};
});
const result={owner:'Codex-3',lint:{...lint,files:lintResults},format,biome,diff:{exitCode:diff.status,stdout:diff.stdout.trim(),stderr:diff.stderr.trim()},renderComparisons};
fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify(result,null,2)+'\n');
const passed=lint.exitCode===0&&format.exitCode===0&&biome.exitCode===0&&diff.status===0&&renderComparisons.every(item=>item.passed);
console.log(JSON.stringify({passed,lintExitCode:lint.exitCode,formatExitCode:format.exitCode,biomeExitCode:biome.exitCode,diffExitCode:diff.status,renderBodiesUnchanged:renderComparisons.every(item=>item.passed)}));process.exitCode=passed?0:1;
