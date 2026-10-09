// Scoped reproducible lint/format/diff checks. No full-project gate or source writes.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const {spawnSync,execFileSync} = require('node:child_process');
const sources = [
 'app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx',
 'app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx',
 'components/feature/accounting/general-journal/JournalFormNotFound.tsx',
 'lib/accounting/journal-date.ts',
];
const run = args => {
 const result=spawnSync(process.execPath,args,{encoding:'utf8'});
 return {command:['node',...args],exitCode:result.status,stdout:result.stdout.trim(),stderr:result.stderr.trim()};
};
const lint=run(['node_modules/eslint/bin/eslint.js',...sources,'--no-cache','--max-warnings','0','--format','json']);
let lintResults;
try {lintResults=JSON.parse(lint.stdout).map(item=>({file:path.relative(process.cwd(),item.filePath).replaceAll('\\','/'),errorCount:item.errorCount,warningCount:item.warningCount,messages:item.messages.map(m=>({rule:m.ruleId,line:m.line,severity:m.severity,message:m.message}))}));}
catch {lintResults=[{error:lint.stdout||lint.stderr}];}
delete lint.stdout;
const format=run(['node_modules/@biomejs/biome/bin/biome','format',...sources]);
const diff=spawnSync('git',['-c','core.autocrlf=false','diff','--check','--',...sources],{encoding:'utf8'});
const renderBody=(source,name)=>{
 const parsed=ts.createSourceFile('screen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const fn=parsed.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name);
 const statement=fn.body.statements.filter(ts.isReturnStatement).at(-1);
 return ts.createPrinter().printNode(ts.EmitHint.Unspecified,statement.expression,parsed).replace(/\s+isDisabled=\{isSaved\}/g,'').replace(/\s+/g,' ').trim();
};
const renderComparisons=sources.slice(0,2).map((file,index)=>{
 const entity=index?'AdjustingJournal':'GeneralJournal';
 const baseline=execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'});
 return {file,comparison:'Existing editor JSX against HEAD, ignoring the added save isDisabled prop; new missing-ID fallback excluded',passed:renderBody(baseline,entity+'ModifyScreen')===renderBody(fs.readFileSync(file,'utf8'),entity+'Form')};
});
const result={owner:'Codex-3',lint:{...lint,files:lintResults},format,diff:{exitCode:diff.status,stdout:diff.stdout.trim(),stderr:diff.stderr.trim()},renderComparisons};
fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify(result,null,2)+'\n');
const passed=lint.exitCode===0&&format.exitCode===0&&diff.status===0&&renderComparisons.every(item=>item.passed);
console.log(JSON.stringify({passed,lintExitCode:lint.exitCode,formatExitCode:format.exitCode,diffExitCode:diff.status,renderBodiesUnchanged:renderComparisons.every(item=>item.passed)}));
process.exitCode=passed?0:1;
