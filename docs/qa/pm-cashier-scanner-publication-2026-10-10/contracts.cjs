const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),ts=require('typescript');
const root=process.cwd(),packet=__dirname,intake=JSON.parse(fs.readFileSync(path.join(packet,'intake.json'))),checks=[];
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const parse=file=>ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=(source,name)=>source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);
function shape(node,mode){
 if(ts.isJsxText(node)){const value=node.text.trim();return value?{kind:node.kind,text:value}:null;}
 if(mode==='wrapper'&&ts.isJsxAttribute(node)&&node.name.text==='style'&&node.parent.parent.tagName?.getText()==='KeyboardAvoidingView')return null;
 if(mode==='wrapper'&&ts.isJsxExpression(node)&&['hasBottomBar','hasActionButton','bottomClearance'].some(name=>node.expression?.getText().startsWith(name)))return null;
 if(mode==='wrapper'&&ts.isVariableStatement(node)&&node.declarationList.declarations.some(d=>['insets','{ fontScale }','bottomClearance'].includes(d.name.getText())))return null;
 if(mode==='header'&&ts.isIfStatement(node)&&node.expression.getText()==='appearance === "cashier"')return null;
 if(mode==='parent'&&ts.isJsxSelfClosingElement(node)&&node.attributes.properties.some(a=>ts.isJsxAttribute(a)&&a.name.text==='name'&&a.initializer?.text==='scanner'))return null;
 const children=[];ts.forEachChild(node,n=>{const value=shape(n,mode);if(value)children.push(value);});
 return {kind:node.kind,...(ts.isIdentifier(node)||ts.isStringLiteral(node)||ts.isNumericLiteral(node)?{text:node.text}:{}),children};
}
function check(name,action){try{const details=action();checks.push({name,status:'PASS',details});}catch(e){checks.push({name,status:'FAIL',error:e.message});}}
for(const file of Object.keys(intake.inputs))check('Accepted intake source hash '+file,()=>assert.equal(sha(path.join(root,file)),intake.inputs[file]));
for(const [file,name,mode]of [['components/common/Header.tsx','Header','header'],['components/common/Wrapper.tsx','Wrapper','wrapper'],['app/(no-layout)/(cashier)/_layout.tsx','CashierNoLayout','parent']])check('Inverse AST preserves published '+name+' behavior outside reviewed delta',()=>{assert.deepEqual(shape(fn(parse(path.join(root,file)),name),mode),shape(fn(parse(path.join(packet,'before',file)),name),mode));});
check('Wrapper clearance is a single maximum and Header opt-in is isolated',()=>{const wrapper=fs.readFileSync('components/common/Wrapper.tsx','utf8'),header=fs.readFileSync('components/common/Header.tsx','utf8');assert.ok(wrapper.includes('const bottomClearance = Math.max('));assert.equal((wrapper.match(/height: bottomClearance/g)||[]).length,1);assert.ok(wrapper.includes('128 + insets.bottom'));assert.ok(wrapper.includes('bottomTabClearance(insets.bottom, fontScale)'));assert.equal((header.match(/if \(appearance === "cashier"\)/g)||[]).length,1);});
check('Only the Scanner child registration changes parent callbacks',()=>{const source=parse('app/(no-layout)/(cashier)/_layout.tsx');let count=0;function walk(n){if(ts.isJsxSelfClosingElement(n)&&n.attributes.properties.some(a=>ts.isJsxAttribute(a)&&a.name.text==='name'&&a.initializer?.text==='scanner')){count++;assert.ok(n.getText().includes('headerShown: false'));}ts.forEachChild(n,walk);}walk(source);assert.equal(count,1);});
check('All new file route destinations exist in candidate',()=>{for(const file of intake.scanner)assert.ok(fs.existsSync(file),file);assert.ok(fs.existsSync('app/(cashier)/home/index.tsx'));});
check('No scanner hardware, install, save or success operation introduced',()=>{for(const file of intake.scanner.filter(f=>f.endsWith('.tsx'))){const source=fs.readFileSync(file,'utf8');assert.ok(!/SuccessModal|useMutation|createMutationHook|Bluetooth|requestPermissions/.test(source),file);}});
const result={status:checks.some(c=>c.status==='FAIL')?'FAIL':'PASS',passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length,checks};fs.writeFileSync(path.join(packet,'contract-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=result.failed?1:0;
