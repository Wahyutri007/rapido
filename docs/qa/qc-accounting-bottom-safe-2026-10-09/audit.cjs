const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const packet=__dirname,dev='docs/qa/senior-8-2026-10-09/accounting-bottom-safe',receipt=JSON.parse(fs.readFileSync(path.join(packet,'source-before.json'),'utf8')),migration=JSON.parse(fs.readFileSync(dev+'/migration.json','utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),parse=(file,text)=>ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),checks=[],details=[];
const check=(name,passed,detail)=>checks.push({name,passed:Boolean(passed),detail});
const walk=(n,fn)=>{fn(n);ts.forEachChild(n,c=>walk(c,fn));};
const attrs=n=>Object.fromEntries(n.attributes.properties.map(p=>[p.name?.getText()??'spread',p.initializer?.getText()??true]));
function canonical(node,context){
 if(node.kind===ts.SyntaxKind.EndOfFileToken)return null;
 if(ts.isParenthesizedExpression(node))return canonical(node.expression,context);
 if(ts.isImportDeclaration(node)&&context?.bodyOnly)return null;
 if(ts.isJsxText(node)){const text=node.text.replace(/\s+/g,' ').trim();return text?{kind:node.kind,text}:null;}
 if(context?.invert&&ts.isJsxSelfClosingElement(node)&&node.tagName.getText()==='BottomActionInset')return null;
 if(context?.invert&&ts.isJsxElement(node)&&node.openingElement.tagName.getText()==='BottomActionBar')return {kind:node.kind,children:[canonical(context.footer.openingElement),...node.children.map(n=>canonical(n,context)).filter(Boolean),canonical(context.footer.closingElement)]};
 if(context?.invert&&ts.isJsxFragment(node)){const children=node.children.map(n=>canonical(n,context)).filter(Boolean);if(children.length===1&&node.children.some(n=>ts.isJsxSelfClosingElement(n)&&n.tagName.getText()==='BottomActionInset'))return children[0];}
 const children=[];ts.forEachChild(node,c=>{const value=canonical(c,context);if(value)children.push(value);});
 return {kind:node.kind,...(typeof node.text==='string'&&!ts.isSourceFile(node)?{text:node.text}:{}),children};
}
for(const entry of migration.changes){
 const before=parse(entry.file,fs.readFileSync(entry.snapshot,'utf8')),after=parse(entry.file,fs.readFileSync(entry.file,'utf8'));
 const oldFooters=[],newFooters=[],insets=[],newImports=[];
 walk(before,n=>{if(ts.isJsxElement(n)&&n.openingElement.tagName.getText()==='View'&&n.openingElement.getText().includes('absolute bottom-0'))oldFooters.push(n);});
 walk(after,n=>{if(ts.isJsxElement(n)&&n.openingElement.tagName.getText()==='BottomActionBar')newFooters.push(n);if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText()==='BottomActionInset')insets.push(n);if(ts.isImportDeclaration(n)&&n.moduleSpecifier.text==='@/components/common/BottomActionBar')newImports.push(n);});
 const report=entry.file.endsWith('ReportActionButton.tsx'),wrapper=/\/(Animated)?Wrapper\.tsx$/.test(entry.file);
 const expectedAlias=wrapper?{default:null,named:['BottomActionInset']}:{default:'BottomActionBar',named:insets.length?['BottomActionInset']:[]};
 const alias=newImports.length===1?{default:newImports[0].importClause?.name?.text??null,named:newImports[0].importClause?.namedBindings?.elements?.map(e=>e.name.text)??[]}:null;
 const footerOptions=newFooters.map(f=>attrs(f.openingElement));
 const optionsValid=footerOptions.every(p=>report?JSON.stringify(p)===JSON.stringify({bottomPadding:'{24}',topPadding:'{8}',className:'{containerClassName}'}):Object.keys(p).length===0||JSON.stringify(p)===JSON.stringify({className:'"flex-row items-center gap-3"'}));
 const insetParents=insets.map(n=>{const p=n.parent;return ts.isJsxFragment(p)?'wrapper-spacer':ts.isJsxElement(p)?p.openingElement.tagName.getText():'unexpected';});
 const fragmentValid=insets.filter(n=>ts.isJsxFragment(n.parent)).every(n=>{const siblings=n.parent.children.filter(c=>!ts.isJsxText(c)||c.text.trim());return siblings.length===2&&ts.isJsxSelfClosingElement(siblings[0])&&siblings[0].tagName.getText()==='View'&&['"h-20"','"h-32"'].includes(attrs(siblings[0]).className)&&n.attributes.properties.length===0;});
 const topologyValid=wrapper?insets.length===2&&fragmentValid:insets.every(n=>n.attributes.properties.length===0&&ts.isJsxElement(n.parent)&&n.parent.openingElement.tagName.getText()==='ScrollView'&&n.parent.children.filter(c=>!ts.isJsxText(c)||c.text.trim()).at(-1)===n);
 const importList=ast=>ast.statements.filter(ts.isImportDeclaration).filter(n=>n.moduleSpecifier.text!=='@/components/common/BottomActionBar').map(n=>JSON.stringify(canonical(n))).sort();
 const importsPreserved=JSON.stringify(importList(before))===JSON.stringify(importList(after));
 const inverse=JSON.stringify(canonical(after,{invert:true,bodyOnly:true,footer:oldFooters[0]}))===JSON.stringify(canonical(before,{bodyOnly:true}));
 const passed=hash(entry.file)===receipt.hashes[entry.file]&&hash(entry.snapshot)===entry.before&&oldFooters.length===(wrapper?0:1)&&newFooters.length===(wrapper?0:1)&&JSON.stringify(alias)===JSON.stringify(expectedAlias)&&optionsValid&&topologyValid&&importsPreserved&&inverse;
 const detail={file:entry.file,sourceHash:hash(entry.file),beforeHash:hash(entry.snapshot),inverseAST:inverse,importsPreservedExceptExplicitAddition:importsPreserved&&JSON.stringify(alias)===JSON.stringify(expectedAlias),formatterImportReorderAllowed:true,footerOptions,insetParents,topologyValid};details.push(detail);check('whole-file imports/handlers/props preserved except declared footer/clearance: '+entry.file,passed,detail);
}
const picker=details.find(d=>d.file.endsWith('general-journal/modify.tsx'));
assert.equal(picker.insetParents.length,1);
const candidates=cp.execFileSync('rg',['--files','app','components'],{encoding:'utf8',windowsHide:true}).trim().split(/\r?\n/).filter(f=>/\.[jt]sx$/.test(f)).map(f=>f.replaceAll('\\','/'));
const reportCallers=[],unsafeAccounting=[];
for(const file of candidates){const text=fs.readFileSync(file,'utf8');if(file.includes('/report/accounting/')&&/absolute bottom-0/.test(text))unsafeAccounting.push(file);if(!text.includes('ReportActionButton')||file.endsWith('/ReportActionButton.tsx'))continue;const ast=parse(file,text);const uses=[];walk(ast,n=>{const open=ts.isJsxElement(n)?n.openingElement:ts.isJsxSelfClosingElement(n)?n:null;if(open?.tagName.getText()==='ReportActionButton')uses.push({line:ast.getLineAndCharacterOfPosition(open.getStart()).line+1,props:attrs(open)});});if(uses.length)reportCallers.push({file,sha256:hash(file),uses,hasBottomBar:/\bhasBottomBar\b/.test(text),hasActionButton:/\bhasActionButton\b/.test(text),limits:'Static inventory; this screen was not executed.'});}
check('no raw fixed footer remains in Accounting audit',unsafeAccounting.length===0,unsafeAccounting);
const result={createdAt:new Date().toISOString(),passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,details,reportCallers,reportUsageCount:reportCallers.reduce((n,c)=>n+c.uses.length,0),notes:['Developer migrator also inserted BottomActionInset inside the General Journal account-picker ScrollView; five main manual ScrollViews plus one picker, not six main forms. It adds an empty inset without changing handlers; native picker spacing remains a QA check.','Report consumers and other Wrapper consumers have dependency deltas. This review does not approve their entire screens or revalidate legacy financial lifecycle defects.'],limits:'Independent AST keeps every existing import and all source structure, inverses only approved footer tags/import and empty-inset/fragment delta. New BottomActionBar is measured in browser. Static caller inventory is not runtime coverage.'};
fs.writeFileSync(path.join(packet,'audit-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,failed:result.failed,reportCallerFiles:reportCallers.length,reportUses:result.reportUsageCount,failures:checks.filter(c=>!c.passed).map(c=>c.name)}));process.exitCode=result.failed?1:0;
