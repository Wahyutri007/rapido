const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript'),{spawnSync}=require('node:child_process');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function shape(node){const children=[];ts.forEachChild(node,child=>{children.push(shape(child));});return [node.kind,ts.isIdentifier(node)||ts.isLiteralExpression(node)?node.text:null,...children];}
function calls(text,file){
  const parsed=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),found=[];
  const visit=node=>{if((ts.isJsxSelfClosingElement(node)&&node.tagName.getText(parsed)==='DeleteConfirmModal')||(ts.isJsxElement(node)&&node.openingElement.tagName.getText(parsed)==='DeleteConfirmModal')){const attrs=ts.isJsxElement(node)?node.openingElement.attributes:node.attributes;found.push({line:parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line+1,props:attrs.properties.map(x=>ts.isJsxAttribute(x)?x.name.getText(parsed):'spread'),ast:shape(node)});}ts.forEachChild(node,visit);};visit(parsed);return found;
}
const inventory=JSON.parse(fs.readFileSync('docs/qa/codex-3/delete-modal-size/callers.json','utf8'));
const search=spawnSync('rg',['-l','DeleteConfirmModal','app','components'],{encoding:'utf8'});if(search.status!==0)throw Error('Caller search failed: '+search.stderr);
const current=search.stdout.trim().split(/\r?\n/).filter(Boolean).map(file=>{const uses=calls(fs.readFileSync(file,'utf8'),file);return {file:file.replaceAll('\\','/'),sha256:hash(file),uses};}).filter(x=>x.uses.length);
const historical=inventory.entries.map(entry=>{
  const now=current.find(x=>x.file===entry.file);const expected=entry.uses.flatMap(use=>calls(use.jsx,'historic.tsx')).map(x=>x.ast);
  return {file:entry.file,historicalHash:entry.sha256,currentHash:now?.sha256,sourceUnchanged:now?.sha256===entry.sha256,callSiteAstUnchanged:Boolean(now)&&JSON.stringify(now.uses.map(x=>x.ast))===JSON.stringify(expected),currentProps:now?.uses.map(x=>x.props)};
});
const newCallers=current.filter(x=>!inventory.entries.some(old=>old.file===x.file)).map(x=>({file:x.file,sha256:x.sha256,uses:x.uses.length,props:x.uses.map(use=>use.props)}));
const result={owner:'QC',capturedAt:new Date().toISOString(),scope:'Static current DeleteConfirmModal JSX prop audit, not execution or approval of all caller screens',historicalFiles:inventory.files,historicalUsages:inventory.usages,currentFiles:current.length,currentUsages:current.reduce((sum,x)=>sum+x.uses.length,0),historical,sourceChanges:historical.filter(x=>!x.sourceUnchanged),changedCallSites:historical.filter(x=>!x.callSiteAstUnchanged),newCallers,currentInventory:current.map(x=>({file:x.file,sha256:x.sha256,uses:x.uses.map(use=>({line:use.line,props:use.props}))})),allHistoricalCallSitesAstUnchanged:historical.every(x=>x.callSiteAstUnchanged),allCallersExecuted:false};
fs.writeFileSync(path.join(__dirname,'caller-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({currentFiles:result.currentFiles,currentUsages:result.currentUsages,sourceChanges:result.sourceChanges.map(x=>x.file),changedCallSites:result.changedCallSites.map(x=>x.file),newCallers:result.newCallers,allHistoricalCallSitesAstUnchanged:result.allHistoricalCallSitesAstUnchanged}));
