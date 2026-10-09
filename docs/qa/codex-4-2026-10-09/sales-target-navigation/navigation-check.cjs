const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),ts=require('typescript');
const file='app/(no-layout)/manage/sales-target/_layout.tsx',headerFile='components/common/Header.tsx';
let focused=true,hasHistory=false,globalId='another-background-target';
const calls=[],checks=[];
const router={canGoBack:()=>hasHistory,back:()=>calls.push(['back']),replace:x=>calls.push(['replace',x])};
function compile(file,resolve){const m={exports:{}};const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',js)(resolve,m,m.exports);return m.exports;}
const Header=compile(headerFile,name=>{
  if(name==='expo-router')return {router};
  if(name==='react-native')return {View:'View'};
  if(name==='expo-status-bar')return {StatusBar:'StatusBar'};
  if(name==='expo-image')return {Image:'Image'};
  if(name==='@/lib/ui/figma-stock')return {figmaStockTheme:{}};
  if(name==='@expo/vector-icons/Entypo')return {__esModule:true,default:'Entypo'};
  if(name==='@/components/common/BouncyPressable')return {__esModule:true,default:'BackButton'};
  if(name==='@/components/common/Text')return {__esModule:true,default:'Text'};
  if(name==='@/constants')return {Constants:{statusBarHeight:0}};
  if(name==='@/constants/Colors')return {Colors:{zinc:{500:'#fixture'}}};
  if(name==='@/lib/utils')return {cn:(...xs)=>xs.filter(Boolean).join(' '),tw:x=>x*4};
  return require(name);
}).default;
const actual=compile(file,name=>{
  if(name==='expo-router')return {router,useGlobalSearchParams:()=>({id:globalId})};
  if(name==='expo-router/react-navigation')return {useIsFocused:()=>focused};
  if(name==='react-native')return {View:'View',StyleSheet:{create:x=>x}};
  if(name==='@/components/common/Header')return {__esModule:true,default:Header};
  if(name==='@/components/custom/JSStack')return {JSStack:Object.assign(()=>{}, {Screen:'Screen'}),ScaleBackTransition:{}};
  return require(name);
});
function materialize(node){if(!node)return node;if(Array.isArray(node))return node.map(materialize);if(typeof node.type==='function')return materialize(node.type(node.props));if(!node.props)return node;return {...node,props:{...node.props,children:materialize(node.props.children)}};}
function find(node,type){if(!node)return undefined;if(Array.isArray(node)){for(const n of node){const v=find(n,type);if(v)return v;}return undefined;}if(node.type===type)return node;return find(node.props?.children,type);}
function check(name,operation){try{operation();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:String(error)});}}
check('Cold direct child anchors the existing Target list',()=>assert.equal(actual.unstable_settings?.initialRouteName,'index'));
const screens=actual.default().props.children;
check('List, edit/add and detail remain registered',()=>assert.deepEqual(screens.map(x=>x.props.name),['index','modify','detail']));
for(const s of screens){
  const header=()=>s.props.options.header({route:{params:{id:'target-demo-1'}}});
  check(`${s.props.name}: actual Header back returns through existing history`,()=>{calls.length=0;hasHistory=true;find(materialize(header()),'BackButton').props.onPress();assert.deepEqual(calls,[['back']]);});
  check(`${s.props.name}: actual Header back replaces empty history with safe parent`,()=>{calls.length=0;hasHistory=false;find(materialize(header()),'BackButton').props.onPress();assert.deepEqual(calls,[['replace',s.props.name==='index'?'/(back-office)/manage':'/(no-layout)/manage/sales-target']]);});
  check(`${s.props.name}: active header accepts input after focus is restored`,()=>{focused=true;assert.equal(header().type(header().props).props.style?.pointerEvents,'auto');});
  check(`${s.props.name}: background header does not intercept input`,()=>{focused=false;assert.equal(header().type(header().props).props.style?.pointerEvents,'none');});
}
const edit=screens.find(x=>x.props.name==='modify');
function title(params){const node=materialize(edit.props.options.header({route:{params}}));const labels=[];function walk(x){if(!x)return;if(Array.isArray(x))return x.forEach(walk);if(x.type==='Text')labels.push(x.props.children);walk(x.props?.children);}walk(node);return labels[0];}
check('Add title uses its own empty route params despite another global ID',()=>assert.equal(title(undefined),'Tambah Target'));
check('Edit title uses its own selected ID',()=>assert.equal(title({id:'target-demo-1'}),'Edit Target'));
check('Add title stays correct with a background global ID',()=>{globalId='target-demo-2';assert.equal(title({}),'Tambah Target');});
check('Edit title stays correct while global route has no ID',()=>{globalId=undefined;assert.equal(title({id:'target-demo-2'}),'Edit Target');});
const result={status:checks.some(x=>x.status==='FAIL')?'FAIL':'PASS',passed:checks.filter(x=>x.status==='PASS').length,failed:checks.filter(x=>x.status==='FAIL').length,checks,inputs:[file,headerFile].map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')})),scope:'Actual Target layout and shared Header callbacks; router/focus/JSStack/RN presentation adapters. Not full browser/native stack certification.',checkedAt:new Date().toISOString()};
fs.writeFileSync(path.join(__dirname,process.argv.includes('--baseline')?'before/navigation-results.json':'navigation-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));process.exitCode=result.failed?1:0;
