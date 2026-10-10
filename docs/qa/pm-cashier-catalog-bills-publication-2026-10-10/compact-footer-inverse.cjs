const fs=require('node:fs'),crypto=require('node:crypto'),ts=require('C:/Users/Wahyu/Downloads/rapido-pm-cashier-publish-2026-10-10/node_modules/typescript');
const source='C:/Users/Wahyu/Downloads/rapido-pm-cashier-publish-2026-10-10/components/feature/cashier/bills/CatalogBillsScreen.tsx';
const before='D:/Rapido-QC-temp/pm-catalog-bills-preparation-2026-10-10/before/compact-footer/CatalogBillsScreen.tsx';
const expectedCurrent='90b10b1989ba8f4e1f20f22fe7962e0a2d1a79c1a4069ee64380abba3981c63a';
const expectedBefore='738c6a1a84a9fab0c36f805bff9d69b134daa1c7e5a1c6359f453276b9492665';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const cb=fs.readFileSync(source),bb=fs.readFileSync(before),ch=hash(cb),bh=hash(bb);
if(ch!==expectedCurrent||bh!==expectedBefore)throw Error(`input hash mismatch ${JSON.stringify({ch,bh})}`);
const a=ts.createSourceFile('before.tsx',bb.toString('utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),b=ts.createSourceFile('current.tsx',cb.toString('utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
if(a.parseDiagnostics.length||b.parseDiagnostics.length)throw Error('TSX parse diagnostics');
let decl=0,props=0,expr=0;
function shape(n,sf){
 if(ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>ts.isIdentifier(d.name)&&d.name.text==='footerPadding')){decl++;return null;}
 if(ts.isJsxAttribute(n)&&(n.name.getText(sf)==='topPadding'||n.name.getText(sf)==='bottomPadding')&&ts.isJsxOpeningElement(n.parent.parent)&&n.parent.parent.tagName.getText(sf)==='BottomActionBar'){props++;return null;}
 if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.AsteriskToken&&n.left.getText(sf)==='footerPadding'&&n.right.getText(sf)==='2'){expr++;return ['leaf',ts.SyntaxKind.NumericLiteral,'32'];}
 if(ts.isJsxText(n)){const t=n.text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).join(' ');return t?['jsxtext',t]:null;}
 const children=[];ts.forEachChild(n,c=>{const v=shape(c,sf);if(v!==null)children.push(v);});
 return children.length?['node',n.kind,children]:['leaf',n.kind,n.getText(sf)];
}
const old=JSON.stringify(shape(a,a));decl=props=expr=0;const now=JSON.stringify(shape(b,b));
if(old!==now||decl!==1||props!==2||expr!==1){const A=JSON.parse(old),B=JSON.parse(now);function first(x,y,path='$'){if(JSON.stringify(x)===JSON.stringify(y))return null;if(Array.isArray(x)&&Array.isArray(y)){for(let i=0;i<Math.max(x.length,y.length);i++){const q=first(x[i],y[i],path+'.'+i);if(q)return q;}return {path,oldLen:x.length,newLen:y.length};}return {path,old:JSON.stringify(x)?.slice(0,300),current:JSON.stringify(y)?.slice(0,300)};}throw Error(`AST inverse mismatch ${JSON.stringify({decl,props,expr,old:old.length,current:now.length,diff:first(A,B)})}`);}
console.log(JSON.stringify({status:'PASS',source,before,currentSha256:ch,beforeSha256:bh,astInverse:true,normalized:{footerPaddingDeclaration:decl,BottomActionBarPaddingProps:props,footerHeightExpression:expr},parseDiagnostics:0}));