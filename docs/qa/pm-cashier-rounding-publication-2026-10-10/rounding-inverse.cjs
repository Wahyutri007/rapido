const fs=require('node:fs'),crypto=require('node:crypto'),ts=require('C:/Users/Wahyu/Downloads/rapido-pm-cashier-publish-2026-10-10/node_modules/typescript');
const currentPath='C:/Users/Wahyu/Downloads/rapido-pm-cashier-publish-2026-10-10/app/(no-layout)/manage/pos-settings/rounding.tsx';
const beforePath='D:/Rapido-QC-temp/pm-rounding-candidate-2026-10-10/before/RoundingSettingScreen.tsx';
const releasedPath='C:/Users/Wahyu/Downloads/rapido-dev/rapido-dev/app/(no-layout)/manage/pos-settings/rounding.tsx';
const expectedCurrent='30927ee3620dfa2c9cf20b7998adda5db3febebc9127ab6060f91f39c5cfab10';
const expectedBefore='79893f4bd22b9d85cd42287d12dfadc9f9dac7df3c978312b69071dd8e191ba8';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const cb=fs.readFileSync(currentPath),bb=fs.readFileSync(beforePath),rb=fs.readFileSync(releasedPath),ch=hash(cb),bh=hash(bb),rh=hash(rb);
if(ch!==expectedCurrent||bh!==expectedBefore||rh!==expectedCurrent)throw Error(`input hashes mismatch ${JSON.stringify({ch,bh,rh})}`);
const a=ts.createSourceFile('before.tsx',bb.toString('utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),b=ts.createSourceFile('current.tsx',cb.toString('utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
if(a.parseDiagnostics.length||b.parseDiagnostics.length)throw Error('TSX parse diagnostics');
let removed={imports:0,helpers:0,viewportVars:0,saveButtonVar:0,selectOptin:0,wrapperCompact:0,compactPlacement:0,savePlacement:0,errorWrapper:0};
let saveInitializer;
function findSave(n){if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.name.text==='saveButton')saveInitializer=n.initializer;ts.forEachChild(n,findSave);}findSave(b);
if(!saveInitializer)throw Error('saveButton initializer not found');
const id=n=>ts.isIdentifier(n)?n.text:'';
function shape(n,sf){
 if(ts.isImportDeclaration(n)){
  const mod=n.moduleSpecifier.text;
  if(['react-native-safe-area-context','@/components/ui/actionsheet','@/components/ui/button'].includes(mod)){removed.imports++;return null;}
  if(mod==='react-native'&&n.importClause?.namedBindings&&ts.isNamedImports(n.importClause.namedBindings)){
   const names=n.importClause.namedBindings.elements.map(x=>x.name.text).filter(x=>x!=='useWindowDimensions');
   if(names.length!==n.importClause.namedBindings.elements.length)removed.imports++;
   return ['IMPORT',mod,names];
  }
  return ['IMPORT',mod,n.importClause?shape(n.importClause,sf):null];
 }
 if(ts.isFunctionDeclaration(n)&&n.name?.text==='RoundingError'){removed.helpers++;return null;}
 if(ts.isVariableStatement(n)){
  const decls=n.declarationList.declarations;
  if(decls.length===1){
   const name=decls[0].name;
   const simple=ts.isIdentifier(name)&&['height','insets','compact','saveButton'].includes(name.text)?name.text:null;
   const binding=ts.isObjectBindingPattern(name)&&name.elements.length===1?name.elements[0].name.getText(sf):null;
   const variable=simple??(binding&&['height','insets'].includes(binding)?binding:null);
   if(variable){if(variable==='saveButton')removed.saveButtonVar++;else removed.viewportVars++;return null;}
  }
 }
 if(ts.isJsxAttribute(n)&&n.name.getText(sf)==='viewportSafe'){removed.selectOptin++;return null;}
 if(ts.isJsxAttribute(n)&&n.name.getText(sf)==='hasActionButton'&&n.initializer&&ts.isJsxExpression(n.initializer)&&n.initializer.expression?.getText(sf)==='!compact'){
  removed.wrapperCompact++;return ['ATTRIBUTE','hasActionButton',true];
 }
 if(ts.isJsxElement(n)&&n.openingElement.tagName.getText(sf)==='RoundingError'){
  removed.errorWrapper++;return ['__FLAT__',...n.children.map(c=>shape(c,sf)).filter(x=>x!==null).flatMap(x=>Array.isArray(x)&&x[0]==='__FLAT__'?x.slice(1):[x])];
 }
 if(ts.isJsxExpression(n)&&n.expression&&ts.isBinaryExpression(n.expression)&&n.expression.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken){
  const e=n.expression;
  if(id(e.left)==='compact'&&ts.isCallExpression(e.right)&&e.right.expression.getText(sf)==='React.cloneElement'&&id(e.right.arguments[0])==='saveButton'){
   removed.compactPlacement++;return null;
  }
  if(ts.isPrefixUnaryExpression(e.left)&&e.left.operator===ts.SyntaxKind.ExclamationToken&&id(e.left.operand)==='compact'&&id(e.right)==='saveButton'){
   removed.savePlacement++;return shape(ts.isParenthesizedExpression(saveInitializer)?saveInitializer.expression:saveInitializer,sf);
  }
 }
 if(ts.isJsxText(n)){const t=n.text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).join(' ');return t?['JSXTEXT',t]:null;}
 if(ts.isJsxElement(n)){const o=n.openingElement;return ['JSX',o.tagName.getText(sf),o.attributes.properties.map(p=>shape(p,sf)).filter(x=>x!==null),n.children.map(c=>shape(c,sf)).filter(x=>x!==null).flatMap(x=>Array.isArray(x)&&x[0]==='__FLAT__'?x.slice(1):[x])];}
 if(ts.isJsxSelfClosingElement(n))return ['SELF',n.tagName.getText(sf),n.attributes.properties.map(p=>shape(p,sf)).filter(x=>x!==null)];
 if(ts.isJsxAttribute(n)){const name=n.name.getText(sf),i=n.initializer;if(!i)return ['ATTRIBUTE',name,true];if(ts.isStringLiteral(i))return ['ATTRIBUTE',name,['string',i.text]];if(ts.isJsxExpression(i))return ['ATTRIBUTE',name,['expr',i.expression?shape(i.expression,sf):null]];return ['ATTRIBUTE',name,shape(i,sf)];}
 if(ts.isJsxSpreadAttribute(n))return ['SPREAD',shape(n.expression,sf)];
 if(ts.isJsxExpression(n))return n.expression?['EXPR',shape(n.expression,sf)]:null;
 if(ts.isJsxFragment(n))return ['FRAGMENT',n.children.map(c=>shape(c,sf)).filter(x=>x!==null).flatMap(x=>Array.isArray(x)&&x[0]==='__FLAT__'?x.slice(1):[x])];
 const children=[];ts.forEachChild(n,c=>{const v=shape(c,sf);if(v===null)return;if(Array.isArray(v)&&v[0]==='__FLAT__')children.push(...v.slice(1));else if(Array.isArray(v)&&v.length&&Array.isArray(v[0]))children.push(...v);else children.push(v);});
 return children.length?['NODE',n.kind,children]:['LEAF',n.kind,n.getText(sf)];
}
const old=JSON.stringify(shape(a,a));removed={imports:0,helpers:0,viewportVars:0,saveButtonVar:0,selectOptin:0,wrapperCompact:0,compactPlacement:0,savePlacement:0,errorWrapper:0};const now=JSON.stringify(shape(b,b));
const expected={helpers:1,viewportVars:3,saveButtonVar:1,selectOptin:1,wrapperCompact:1,compactPlacement:1,savePlacement:1,errorWrapper:1};
for(const [k,v] of Object.entries(expected))if(removed[k]!==v)throw Error(`normalization count ${k}: ${removed[k]} expected ${v}`);
if(old!==now){const A=JSON.parse(old),B=JSON.parse(now);function first(x,y,path='$'){if(JSON.stringify(x)===JSON.stringify(y))return null;if(Array.isArray(x)&&Array.isArray(y)){for(let i=0;i<Math.max(x.length,y.length);i++){const q=first(x[i],y[i],path+'.'+i);if(q)return q;}return{path,oldLen:x.length,newLen:y.length};}return{path,old:JSON.stringify(x)?.slice(0,300),current:JSON.stringify(y)?.slice(0,300)};}throw Error(`inverse AST mismatch ${JSON.stringify({old:old.length,current:now.length,first:first(A,B),removed})}`);}
console.log(JSON.stringify({status:'PASS',currentPath,beforePath,currentSha256:ch,beforeSha256:bh,sharedReleasedSha256:rh,fullInverseAst:true,parseDiagnostics:0,normalized:removed}));