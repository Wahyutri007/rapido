const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source='app/(back-office)/inventory/_layout.tsx',bytes=fs.readFileSync(source),routerCalls=[];
const Header=Symbol('Header'),Screen=Symbol('Screen');
const router={canGoBack(){throw Error('Parent/global history must not decide local Inventory back');},back(){throw Error('Parent/global back must not be invoked');},replace(route){routerCalls.push(route);}};
const modules={
  'expo-router':{router},
  '@/components/common/Header':{__esModule:true,default:Header},
  '@/components/custom/JSStack':{JSStack:{Screen},ScaleBackTransition:{}},
  '@/lib/utils':{route:value=>value},
  'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
};
const output=ts.transpileModule(bytes.toString('utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
const loaded={};
vm.runInNewContext(output,{exports:loaded,require:name=>{assert.ok(modules[name],'Unexpected import '+name);return modules[name];}},{filename:source});
const tree=loaded.default(),screens=tree.props.children,closing=screens.find(s=>s.props.name==='closing-stock'),results=[];
function check(name,run){try{run();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}}
check('cold Inventory stack falls back despite parent-tab history',()=>{routerCalls.length=0;const header=closing.props.options.header({navigation:{getState:()=>({index:0}),goBack:()=>{throw Error('No local history');}}});assert.equal(header.type,Header);assert.equal(header.props.title,'Stok Akhir');header.props.back();assert.deepEqual(routerCalls,['/inventory']);});
check('local Inventory history goes back without replacing route',()=>{routerCalls.length=0;let calls=0;const header=closing.props.options.header({navigation:{getState:()=>({index:1}),goBack:()=>calls++}});header.props.back();assert.equal(calls,1);assert.deepEqual(routerCalls,[]);});
check('back evaluates live local state after header render',()=>{routerCalls.length=0;let index=1;const header=closing.props.options.header({navigation:{getState:()=>({index}),goBack:()=>{throw Error('Local entry already removed');}}});index=0;header.props.back();assert.deepEqual(routerCalls,['/inventory']);});
check('Inventory hub remains a root header without back action',()=>{const hub=screens.find(s=>s.props.name==='index').props.options.header();assert.equal(hub.props.title,'Persediaan');assert.equal(hub.props.back,undefined);});
const result={source,sourceHash:crypto.createHash('sha256').update(bytes).digest('hex'),passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results,scope:'Actual Inventory layout and Header callbacks with JSX/router/navigation adapters; not browser/native execution.'};
fs.writeFileSync(path.join(__dirname,'header-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));process.exitCode=result.failed?1:0;
