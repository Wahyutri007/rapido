const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript'),assert=require('node:assert/strict');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const before=JSON.parse(fs.readFileSync(__dirname+'/before.json'));
const checks=[];
const check=(name,actual,expected)=>{const pass=actual===expected;checks.push({name,pass});assert.equal(actual,expected,name);};
const print=source=>ts.createPrinter({removeComments:false}).printFile(ts.createSourceFile('source.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX));
for(const file of ['StockOperationDetail.tsx','StockOperationList.tsx','PurchaseListScreen.tsx']) {
  const source='components/feature/inventory/'+file;
  let current=fs.readFileSync(source,'utf8').replace(/\s+valueTone="item"/g,'').replace(/\s+tone="muted"/g,'');
  if(file==='StockOperationDetail.tsx') current=current.replaceAll('"!text-destructive"','"text-destructive"');
  check(file+' only approved opt-in props changed',print(current),print(fs.readFileSync(__dirname+'/before/'+file+'.txt','utf8')));
}
const parse=file=>ts.createSourceFile('source.tsx',fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const beforeUi=parse(__dirname+'/before/InventoryUi.tsx.txt'),currentUi=parse('components/feature/inventory/InventoryUi.tsx');
const printer=ts.createPrinter();
for(const name of ['InventorySectionHeading','InventorySearch','InventoryTabs','StockKindBadge']) {
  const get=source=>printer.printNode(ts.EmitHint.Unspecified,source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name),source);
  check(name+' source behavior unchanged',get(currentUi),get(beforeUi));
}
fs.writeFileSync(__dirname+'/scope-results.json',JSON.stringify({passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,sourceHashes:Object.fromEntries(Object.keys(before.files).map(f=>[f,hash(f)])),scope:'Three caller inverse-delta AST equality and four unchanged shared exports. Not whole default caller/native approval.'},null,2));
console.log(JSON.stringify({passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length}));
