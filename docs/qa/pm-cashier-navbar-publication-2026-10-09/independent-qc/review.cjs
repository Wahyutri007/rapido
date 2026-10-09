const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = process.cwd();
const shared = 'C:/Users/Wahyu/Downloads/rapido-dev/rapido-dev';
const base = '42fb6217ad53047a444f698b25d0f01ce845807f';
const sources = ['components/custom/BottomTab.tsx','app/(cashier)/_layout.tsx','app/(no-layout)/(cashier)/catalog/index.tsx','app/_layout.tsx'];
const names = ['home','report','catalog','location','bills'];
const assets = names.map(n => `assets/images/cashier/navigation/${n}.svg`);
const files = [...sources,...assets];
const read = (f, dir=root) => fs.readFileSync(path.join(dir,f),'utf8');
const hash = (f, dir=root) => crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,f))).digest('hex');
const git = (...args) => cp.execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();
const baseline = f => git('show',`${base}:${f}`);
const parse = s => ts.createSourceFile('review.tsx',s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const all = (node,predicate,out=[]) => {if(predicate(node))out.push(node);ts.forEachChild(node,n=>{all(n,predicate,out);});return out;};
const fn = (s,name) => all(parse(s),n=>ts.isFunctionDeclaration(n)&&n.name?.text===name)[0];
function tree(n) { if(ts.isParenthesizedExpression(n))return tree(n.expression); const children=[]; ts.forEachChild(n,c=>{children.push(tree(c));}); const value=ts.isIdentifier(n)||ts.isStringLiteral(n)||ts.isNumericLiteral(n)?n.text:ts.isJsxText(n)?n.text.trim():undefined; return [n.kind,value,...children]; }
const same = (a,b) => assert.deepEqual(tree(a),tree(b));
const variable = (s,name) => all(parse(s),n=>ts.isVariableDeclaration(n)&&n.name.getText()===name)[0].initializer;
const evalExpr = (n,env) => vm.runInNewContext(ts.transpileModule(`(${n.getText()})`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,env);
const results=[];
function check(name,f) {try {f();results.push({name,result:'PASS'});} catch(e){results.push({name,result:'FAIL',message:e.message});}}
const tab=read(sources[0]),layout=read(sources[1]),catalog=read(sources[2]),app=read(sources[3]);
const before=Object.fromEntries(files.map(f=>[f,hash(f)]));
check('exact nine production paths against main base; no backend/auth/invoice delta',()=>{
 const changed=git('diff','--name-only',base).split(/\r?\n/).filter(f=>f&&!f.startsWith('docs/'));
 const untracked=git('ls-files','--others','--exclude-standard').split(/\r?\n/).filter(f=>f&&!f.startsWith('docs/'));
 assert.deepEqual([...new Set([...changed,...untracked])].sort(),files.slice().sort());
 assert.equal(git('rev-parse','HEAD'),base);
});
check('eight unchanged frozen inputs and QA compatibility fingerprint for four source files',()=>{
 const frozen=JSON.parse(read('docs/qa/qc-cashier-visual-fix-2026-10-09/verification.json',shared));
 for(const f of files.filter(f=>f!==sources[1]))assert.equal(hash(f),frozen.inputs.find(i=>i.file===f).sha256);
 const qa=JSON.parse(read('docs/qa/pm-cashier-navbar-qa-2026-10-09/candidate-compatibility.json',shared));
 assert.equal(qa.result,'PASS_SCOPED');assert.deepEqual(qa.independentReplay.checks,{total:17,passed:17,failed:0});
 for(const f of sources)assert.equal(hash(f),qa.sourceHashes[f]);
});
check('five original Figma SVGs byte-exact, 24px geometry, no external script or asset reference',()=>{
 const originals=['imgIconamoonHome','imgChart1','imgCarbonCatalog','imgMaterialSymbolsTableBarOutlineRounded','imgReceiptBill'];
 names.forEach((n,i)=>{const f=assets[i],text=read(f);assert.equal(hash(f),hash(`docs/figma/cashier/qc-20261009/tagihan/assets/list/${originals[i]}.svg`,shared));assert.match(text,/viewBox="0 0 24 24"/);assert.doesNotMatch(text,/<script|href=|url\(/i);});
});
check('cashier layout only opts into appearance; all route/options/header callbacks preserved',()=>{
 same(fn(layout.replace(' appearance="cashier"',''),'CashierLayout'),fn(baseline(sources[1]),'CashierLayout'));
 assert.match(layout,/name="location\/index"[\s\S]*?headerShown: false/);
});
check('BottomTabPadding, hidden-route logic, label precedence and press callbacks AST unchanged',()=>{
 const old=baseline(sources[0]);same(fn(tab,'BottomTabPadding'),fn(old,'BottomTabPadding'));same(fn(tab,'handlePress'),fn(old,'handlePress'));
 for(const name of ['isHidden','label','isFocused'])same(variable(tab,name),variable(old,name));
});
check('actual bar expressions preserve default/BO and cover cashier bottom inset 0/24/48',()=>{
 for(const appearance of ['default','figma','cashier'])for(const bottom of [0,24,48]){
  const env={insets:{bottom},isFigma:appearance!=='default',isCashier:appearance==='cashier'};
  const padding=evalExpr(variable(tab,'bottomPadding'),env); // first occurrence belongs to BottomTabPadding
  assert.equal(padding,Math.max(bottom,10));
  const vars=all(parse(tab),n=>ts.isVariableDeclaration(n)&&n.name.getText()==='bottomPadding');
  env.bottomPadding=evalExpr(vars[1].initializer,env);
  assert.equal(env.bottomPadding,Math.max(bottom,appearance==='default'?10:32));
  assert.equal(evalExpr(variable(tab,'barHeight'),env),(appearance==='cashier'?64:appearance==='figma'?61:58)+env.bottomPadding);
 }
});
check('actual active/inactive tint expression and cashier-only accessibility/tint wiring',()=>{
 for(const isCashier of [false,true])for(const isFocused of [false,true])assert.equal(evalExpr(variable(tab,'itemColor'),{isCashier,isFocused,Colors:{primary:'#2e78f9',neutral:'neutral'}}),isFocused?'#2e78f9':isCashier?'#2c2c2c':'neutral');
 assert.match(tab,/tintColor=\{isCashier \? itemColor : undefined\}/);
 assert.match(tab,/accessibilityRole=\{isCashier \? "tab" : undefined\}/);
 assert.match(tab,/accessibilityState=\{isCashier \? \{ selected: isFocused \} : undefined\}/);
 assert.match(tab,/appearance === "figma" && figmaStockShadows.tab/);
});
check('catalog AST unchanged after removing explicit inset/effect/unused-handler edits; checkout preserved',()=>{
 const old=baseline(sources[2]).replace(/\s*function handleAddToCart\(\) \{\s*router.push\("\/cart"\);\s*\}/,'');
 const next=catalog.replace(/\s*const insets = useSafeAreaInsets\(\);/,'').replace('}, [fetchData]);','}, []);').replace(/\s*style=\{\{ paddingBottom: 24 \+ insets.bottom \}\}/,'');
 // JSX class whitespace normalization is formatting-only.
 const clean=s=>s.replace(/bg-white  justify/g,'bg-white justify');
 same(fn(clean(old),'MenuScreen'),fn(clean(next),'MenuScreen'));
 const style=all(parse(catalog),n=>ts.isPropertyAssignment(n)&&n.name.getText()==='paddingBottom')[0].initializer;
 for(const bottom of [0,24,48])assert.equal(evalExpr(style,{insets:{bottom}}),24+bottom);
 assert.match(catalog,/router.push\("\/\(no-layout\)\/\(cashier\)\/cart"\)/);
});
check('DevFab guard exact truth table; root auth/providers/routes/callbacks AST unchanged',()=>{
 const old=baseline(sources[3]);
 const normalized=app.replace('__DEV__ && process.env.EXPO_PUBLIC_SHOW_DEV_TOOLS === "1" && (','__DEV__ && (');
 for(const name of ['DevFab','AppContent','RootLayout'])same(fn(normalized,name),fn(old,name));
 const guard=all(parse(app),n=>ts.isBinaryExpression(n)&&n.getText()==='__DEV__ && process.env.EXPO_PUBLIC_SHOW_DEV_TOOLS === "1"')[0];assert.ok(guard);
 for(const dev of [false,true])for(const opt of [undefined,'','0','1','true'])assert.equal(evalExpr(guard,{__DEV__:dev,process:{env:{EXPO_PUBLIC_SHOW_DEV_TOOLS:opt}}}),dev&&opt==='1');
});
check('cashier spacing corresponds to supplied Figma context; immutable source after QC',()=>{
 const figma=read('docs/figma/cashier/qc-20261009/tagihan/list-context.txt',shared);
 for(const token of ['w-[48px]','size-[24px]','gap-[8px]','pb-[32px]','pt-[16px]','rounded-tl-[20px]'])assert.ok(figma.includes(token));
 assert.match(tab,/width: 48, flexShrink: 1/);assert.match(tab,/width: 24, height: 24/);assert.match(tab,/isFigma \? "mt-2"/);assert.match(tab,/isFigma \? "small"/);
 assert.deepEqual(Object.fromEntries(files.map(f=>[f,hash(f)])),before);
});
const result={decision:results.every(r=>r.result==='PASS')?'PASS_SCOPED':'CHANGES_REQUESTED',base,candidate:root,checks:results,sourceHashes:before,qaCompatibilityReceiptHash:hash('docs/qa/pm-cashier-navbar-qa-2026-10-09/candidate-compatibility.json',shared),limits:['Source/AST and actual-expression VM checks; no native pixel or device-inset certification','QA adapter compatibility reviewed independently; no repeat of developer 27 or QA 17 replay','Quality gate belongs to root; no full TypeScript/lint/build/backend/router/payment/Figma-full approval']};
fs.writeFileSync(path.join(__dirname,'verification-final.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));process.exitCode=result.decision==='PASS_SCOPED'?0:1;
