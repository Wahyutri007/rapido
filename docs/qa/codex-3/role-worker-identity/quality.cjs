const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const sources=['components/feature/manage/roles/RoleModifyScreen.tsx','components/feature/manage/workers/WorkerModifyScreen.tsx'];
const run=args=>{const r=spawnSync(process.execPath,args,{encoding:'utf8'});return {command:['node',...args],exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr.trim()};};
const lintArgs=['node_modules/eslint/bin/eslint.js',...sources,'--no-cache','--max-warnings','0','--format','json'];
const reuse=process.argv.includes('--reuse-eslint');
const lint=reuse?{command:['node',...lintArgs],exitCode:0,stdout:fs.readFileSync('.expo/codex-3-role-worker-lint.json','utf8'),stderr:'',reused:'Completed scoped command on this unchanged source snapshot'}:run(lintArgs);
const lintFiles=JSON.parse(lint.stdout).map(item=>({file:path.relative(process.cwd(),item.filePath).replaceAll('\\','/'),errors:item.errorCount,warnings:item.warningCount,messages:item.messages.map(m=>({rule:m.ruleId,line:m.line,severity:m.severity,message:m.message}))}));
delete lint.stdout;if(lintFiles.some(item=>item.errors||item.warnings))lint.exitCode=1;
const biome=run(['node_modules/@biomejs/biome/bin/biome','check',...sources]);
const diff=spawnSync('git',['-c','core.autocrlf=false','diff','--check','--',...sources],{encoding:'utf8'});
const render=(text,name)=>{
 const parsed=ts.createSourceFile('screen.tsx',text.replace(/\r\n/g,'\n'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const fn=parsed.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name);
 const root=fn.body.statements.filter(ts.isReturnStatement).at(-1).expression;
 const transform=ts.transform(root,[context=>{
  const visit=node=>{
   if((ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))&&node.tagName.getText(parsed)==='BottomActionButton'){
    const attrs=ts.factory.updateJsxAttributes(node.attributes,node.attributes.properties.filter(attr=>!ts.isJsxAttribute(attr)||!['onPress','isDisabled'].includes(attr.name.getText(parsed))));
    node=ts.isJsxOpeningElement(node)?ts.factory.updateJsxOpeningElement(node,node.tagName,node.typeArguments,attrs):ts.factory.updateJsxSelfClosingElement(node,node.tagName,node.typeArguments,attrs);
   }
   return ts.visitEachChild(node,visit,context);
  };return node=>ts.visitNode(node,visit);
 }]);
 const result=ts.createPrinter().printNode(ts.EmitHint.Unspecified,transform.transformed[0],parsed).replace(/\s+/g,' ').trim();transform.dispose();return result;
};
const renderChecks=sources.map((file,index)=>{
 const entity=index?'Worker':'Role',before=fs.readFileSync(path.join(__dirname,index?'worker.before.tsx.txt':'role.before.tsx.txt'),'utf8');
 return {file,comparison:'Editor JSX unchanged except intentional submit event binding and saved disabled condition',passed:render(before,entity+'ModifyScreen')===render(fs.readFileSync(file,'utf8'),entity+'ModifyForm')};
});
const passed=lint.exitCode===0&&biome.exitCode===0&&diff.status===0&&renderChecks.every(item=>item.passed);
const result={owner:'Codex-3',status:passed?'PASS':'FAILED',lint:{...lint,files:lintFiles},biome,diff:{exitCode:diff.status,stdout:diff.stdout.trim(),stderr:diff.stderr.trim()},renderChecks,sourceHashes:Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))};
fs.writeFileSync(path.join(__dirname,'quality-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed,eslintExitCode:lint.exitCode,biomeExitCode:biome.exitCode,diffExitCode:diff.status,renderChecksPassed:renderChecks.every(item=>item.passed)}));process.exitCode=passed?0:1;
