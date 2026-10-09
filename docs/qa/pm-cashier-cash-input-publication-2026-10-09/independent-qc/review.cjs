const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const dir=path.dirname(__dirname),setup=JSON.parse(fs.readFileSync(path.join(dir,'CANDIDATE_SETUP.json'),'utf8')),files=Object.keys(setup.productionHashes),base=setup.baseCommit;
const read=f=>fs.readFileSync(f,'utf8'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),git=(...a)=>cp.execFileSync('git',a,{encoding:'utf8',windowsHide:true}).trim();
const source=Object.fromEntries(files.filter(f=>f.endsWith('.tsx')||f.endsWith('.ts')).map(f=>[f,read(f)])),screen=source[files[0]],keypad=source[files[1]],layout=source[files[2]];
const parse=s=>ts.createSourceFile('check.tsx',s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function nodes(n,p,out=[]){if(p(n))out.push(n);ts.forEachChild(n,c=>{nodes(c,p,out);});return out;}
const variable=(s,name)=>nodes(parse(s),n=>ts.isVariableDeclaration(n)&&n.name.getText()===name)[0].initializer;
const fn=(s,name)=>nodes(parse(s),n=>ts.isFunctionDeclaration(n)&&n.name?.text===name)[0];
const js=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const expression=(n,env)=>vm.runInNewContext(js('('+n.getText()+')'),env);
function tree(n){if(ts.isParenthesizedExpression(n))return tree(n.expression);const cs=[];ts.forEachChild(n,c=>{cs.push(tree(c));});return [n.kind,ts.isIdentifier(n)||ts.isStringLiteral(n)||ts.isNumericLiteral(n)?n.text:ts.isJsxText(n)?n.text.trim():undefined,...cs];}
const load=(f,imports)=>{const exports={};vm.runInNewContext(js(read(f)),{exports,require:n=>imports[n]??require(n)});return exports;};
const schema=load(files[6],{'@/lib/utils':{formatRp:n=>String(n)}}),helpers=load(files[3],{}),results=[];
const check=(name,f)=>{try{f();results.push({name,result:'PASS'});}catch(e){results.push({name,result:'FAIL',message:e.message});}};
check('seven production paths, exact base and sealed hashes, published dependencies untouched',()=>{
 const paths=[...new Set([...git('diff','--name-only',base).split(/\r?\n/),...git('ls-files','--others','--exclude-standard').split(/\r?\n/)].filter(f=>f&&!f.startsWith('docs/')))];assert.deepEqual(paths.sort(),files.slice().sort());assert.equal(git('rev-parse','HEAD'),base);
 for(const f of files)assert.equal(hash(f),setup.productionHashes[f]);for(const dep of setup.candidateDependencies){assert.equal(hash(dep.file),dep.candidateHash);assert.equal(git('diff',base,'--',dep.file),'');}
});
check('official context and reference exact; backspace SVG original and passive 32px asset',()=>{
 assert.equal(hash(path.join(dir,'reference/context.txt')),setup.referenceHashes['docs/figma/cashier/sd5-20261009/cash-input/context.txt']);assert.equal(hash(path.join(dir,'reference/reference.png')),setup.referenceHashes['docs/figma/cashier/sd5-20261009/cash-input/reference.png']);
 assert.equal(hash(files[5]),hash(path.join(dir,'reference/assets/backspace.svg')));const svg=read(files[5]);assert.match(svg,/viewBox="0 0 32 32"/);assert.doesNotMatch(svg,/<script|href=|url\(/i);
});
check('five existing route registrations: four other header options unchanged; input header-only delta',()=>{
 const before=git('show',`${base}:${files[2]}`),get=s=>nodes(parse(s),n=>ts.isJsxSelfClosingElement(n)&&n.tagName.getText()==='JSStack.Screen');const old=get(before),next=get(layout);assert.equal(old.length,5);assert.equal(next.length,5);
 for(const i of [0,1,2,4])assert.deepEqual(tree(next[i]),tree(old[i]));assert.match(layout,/Header back title="Uang Diterima" appearance="figma"/);assert.doesNotMatch(layout,/useGlobalSearchParams/);
});
check('actual parser/schema reject unsafe/missing/ambiguous/nondecimal/insufficient amounts',()=>{
 for(const value of ['',undefined,null,[],['1','2'],'-1','1.2','1e3',' 1','9007199254740992'])assert.equal(schema.parseCashRouteAmount(value),null);
 assert.equal(schema.parseCashRouteAmount(['186000']),186000);assert.equal(schema.parseCashAmount('9007199254740991'),Number.MAX_SAFE_INTEGER);
 for(const total of [null,-1,NaN,Number.MAX_SAFE_INTEGER+1])assert.equal(schema.createCashInputSchema(total).safeParse({value:'200000'}).success,false);
 for(const value of ['','0','185999','1e6'])assert.equal(schema.createCashInputSchema(186000).safeParse({value}).success,false);assert.equal(schema.createCashInputSchema(186000).safeParse({value:'186000'}).success,true);
});
check('actual quick amounts are explicit route total and 200k key; never fake quote or rounded value',()=>{
 for(const [total,expected] of [[null,[]],[0,[200000]],[186000,[186000,200000]],[200000,[200000]],[200001,[200001]],[-1,[]]])assert.deepEqual(Array.from(helpers.getCashQuickAmounts(total)),expected);
 assert.equal(helpers.formatCashDigits('9007199254740991'),'9.007.199.254.740.991');assert.equal(helpers.formatCashDigits('000186000'),'186.000');assert.doesNotMatch(screen,/186_?000/);assert.equal(variable(screen,'totalPrice').getText(),'parseCashRouteAmount(params.totalPrice)');
});
function keypadHarness(s,controlled=false,nullable=true,maxLength=3){let value=controlled?'12':'',internal='',queue=[];const env={controlled,nullable,maxLength,keypadValue:value,setKeypadValue:next=>{internal=typeof next==='function'?next(internal):next;},setValue:next=>{queue.push(next);}};env.updateKeypad=expression(variable(keypad,'updateKeypad'),env);const press=expression(variable(s,'setNumber'),env);return {press,flush:()=>{for(const next of queue)value=typeof next==='function'?next(value):next;queue=[];return value;},get internal(){return internal;},env};}
check('Keypad actual default callbacks preserve legacy transitions; controlled rapid input capped atomically',()=>{
 const old=git('show',`${base}:${files[1]}`);for(const nullable of [false,true]){const next=keypadHarness(keypad,false,nullable),prior=keypadHarness(old,false,nullable);for(const key of ['1','2','BACK','C','0','BACK']){next.env.keypadValue=next.internal;prior.env.keypadValue=prior.internal;next.press(key);prior.press(key);assert.equal(next.internal,prior.internal);}}
 const current=keypadHarness(keypad,true,true,3);current.press('3');current.press('4');assert.equal(current.flush(),'123');current.press('BACK');assert.equal(current.flush(),'12');current.press('C');assert.equal(current.flush(),null);
 assert.match(keypad,/controlled = false/);assert.match(keypad,/appearance = "default"/);assert.match(keypad,/if \(controlled\) return;/);assert.match(keypad,/: "h-\[62px\] flex-1 items-center justify-center overflow-hidden rounded-2xl"/);assert.match(keypad,/<BackspaceGlyph size=\{24\}/);
});
check('actual submit callback blocks inactive/stale/duplicate/short/missing input; navigation exception retries',()=>{
 const callback=js(fn(screen,'handleContinue').getText()+'\nhandleContinue;');
 const make=({active=true,submitting=false,current='200000',total=186000,throws=false}={})=>{const calls=[],errors=[],env={active:{current:active},submitting:{current:submitting},form:{getValues:()=>current,setError:(...x)=>errors.push(x)},totalPrice:total,parseCashAmount:schema.parseCashAmount,router:{replace:x=>{calls.push(x);if(throws)throw Error('fixture');}}};return {env,calls,errors,run:vm.runInNewContext(callback,env)};};
 for(const opts of [{active:false},{submitting:true},{current:'199999',data:'200000'},{total:null},{current:'100',total:186000}]){const fixture=make(opts);fixture.run({value:opts.data??opts.current??'200000'});assert.equal(fixture.calls.length,0);}
 const ok=make();ok.run({value:'200000'});ok.run({value:'200000'});assert.equal(ok.calls.length,1);assert.equal(ok.calls[0].pathname,'/cart/input-money-confirm');assert.equal(ok.calls[0].params.value,200000);assert.equal(ok.calls[0].params.totalPrice,186000);
 const failure=make({throws:true});failure.run({value:'200000'});assert.equal(failure.env.submitting.current,false);assert.equal(failure.errors.length,1);
});
check('actual focused validity gate, immutable route remount key, lifecycle and focus edit guards',()=>{
 const valid=variable(screen,'isValid');for(const [focused,totalPrice,amount,want] of [[false,1,2,false],[true,null,2,false],[true,1,null,false],[true,0,0,false],[true,186000,185999,false],[true,186000,186000,true]])assert.equal(expression(valid,{focused,totalPrice,amount}),want);
 const setter=variable(screen,'setValue').arguments[0];let calls=0;const env={active:{current:false},form:{getValues:()=>'',setValue:()=>calls++,clearErrors:()=>{}},totalPrice:186000};expression(setter,env)('1');assert.equal(calls,0);assert.match(screen,/active.current = false/);assert.match(screen,/key=\{JSON.stringify\(\[params.totalPrice \?\? null, params.value \?\? null\]\)\}/);
});
check('actual footer safe insets and long-value responsive font expressions remain finite',()=>{
 const sf=parse(screen),props=nodes(sf,n=>ts.isPropertyAssignment(n));for(const [name,base,axis] of [['paddingBottom',30,'bottom'],['paddingLeft',20,'left'],['paddingRight',20,'right']]){const n=props.find(n=>n.name.getText()===name&&n.initializer.getText().includes('insets.'));for(const inset of [0,24,48])assert.equal(expression(n.initializer,{insets:{[axis]:inset}}),base+inset);}
 const n=variable(screen,'amountFontSize');for(const width of [288,358,812])for(const value of ['0','186.000','9.007.199.254.740.991']){const size=expression(n,{amountWidth:width,displayValue:value});assert.ok(Number.isFinite(size)&&size>0&&size<=32);}
});
check('Figma scoped semantic colors and original slot wiring; no protected source mutation',()=>{
 const theme=source[files[4]],reference=read(path.join(dir,'reference/context.txt'));for(const token of ['h-[39px]','h-[59px]','h-[68px]','h-[69px]','pb-[30px]','px-[20px]'])assert.ok(reference.includes(token));
 assert.match(theme,/"--color-background": "247 248 250"/);assert.match(theme,/"--color-primary": "46 120 249"/);assert.match(keypad,/appearance === "cashier"/);assert.match(screen,/appearance="cashier"/);assert.match(keypad,/width: 32, height: 32/);for(const f of files)assert.equal(hash(f),setup.productionHashes[f]);
});
const report={decision:results.every(r=>r.result==='PASS')?'PASS_SOURCE_SCOPED_QA_PENDING':'CHANGES_REQUESTED',base,candidate:process.cwd(),checks:results,sourceHashes:Object.fromEntries(files.map(f=>[f,hash(f)])),limits:['QA receipt acceptance pending; source/expression checks only','Root quality separate; no repeat of developer169/browser28/fullquality/build/native/router/payment','Literal non-four-unit Figma geometry and Header21 versus20.8 line height documented, not pixel certification']};fs.writeFileSync(path.join(__dirname,'source-verification-v2.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));process.exitCode=results.every(r=>r.result==='PASS')?0:1;
