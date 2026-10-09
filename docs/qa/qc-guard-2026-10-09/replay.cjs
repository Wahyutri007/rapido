// Production route guard, plus production AuthProvider in integration cases.
// Frame queue, router, route/auth bindings and storage/query transport are adapters.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const ts = require('typescript');
const {createStore} = require('zustand/vanilla');
const toolRoot = process.env.RAPIDO_TEST_TOOLS || '.expo/senior7-test-tools/node_modules';
const React = require(path.resolve(toolRoot,'react'));
const {act,create} = require(path.resolve(toolRoot,'react-test-renderer'));
const baseline = process.argv.includes('--baseline');
const baselineRef = 'acba0d92460c1af3149abc3775f09888a2943cab';
const folder = 'docs/qa/qc-guard-2026-10-09';
const sources = {}, checks = [], errors = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => {
  if(String(args[0]).includes('react-test-renderer is deprecated'))return;
  errors.push(args.map(String).join(' '));originalError(...args);
};
function check(name,actual,expected) {
  const snapshot=JSON.parse(JSON.stringify(actual));
  try{assert.deepEqual(snapshot,expected);checks.push({name,passed:true});}
  catch{checks.push({name,passed:false,actual:snapshot,expected});}
}
function deferred(){let resolve;const promise=new Promise(yes=>{resolve=yes;});return{promise,resolve};}
function load(file,imports,globals={}) {
  const source=baseline&&file==='hooks/useProtectedRoute.ts'?execFileSync('git',['show',`${baselineRef}:${file}`],{encoding:'utf8'}):fs.readFileSync(file==='context/AuthContext.tsx'?'docs/qa/qc-guard-2026-10-09/fixtures/AuthContext.tsx.txt':file,'utf8');
  sources[file]=crypto.createHash('sha256').update(source).digest('hex');
  const output=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports={};vm.runInNewContext(output,{exports,...globals,require(name){if(name==='react')return React;if(Object.hasOwn(imports,name))return imports[name];throw Error(`Unmapped dependency ${name} in ${file}`);}}, {filename:file});return exports;
}
async function fixture(options={}) {
  let segments=options.segments||['(back-office)','home'];
  let auth=options.auth||{authenticated:false,isLoading:false};
  let nextId=0,authApi;
  const jobs=new Map(),history=new Map(),routes=[],cancelled=[],storageReads=[],userReads=[];
  const router={replace:target=>routes.push(target)};
  const frames={requestAnimationFrame(fn){const id=++nextId;jobs.set(id,fn);history.set(id,fn);return id;},cancelAnimationFrame(id){cancelled.push(id);jobs.delete(id);}};
  let providerModule;
  if(options.provider){
    const Keys=load('constants/Keys.ts',{}).default;
    const query=createStore(()=>({data:undefined}));
    const storage={
      getItemAsync(){const request=deferred();storageReads.push(request);return request.promise;},
      setItemAsync:async()=>{},deleteItemAsync:async()=>{},
    };
    const useQuery=()=>({data:React.useSyncExternalStore(query.subscribe,()=>query.getState().data,()=>undefined),refetch:()=>{const request=deferred();userReads.push(request);return request.promise.then(data=>{query.setState({data});return{data};});}});
    providerModule=load('context/AuthContext.tsx',{
      '@/constants/Keys':Keys,'@/lib/storage':storage,'@/api/factory':{createGetHook:()=>useQuery},
      '@tanstack/react-query':{useQueryClient:()=>({setQueryData:(_key,data)=>query.setState({data}),removeQueries(){},clear(){}})},
    });
  }
  const module=load('hooks/useProtectedRoute.ts',{
    '@/context/AuthContext':providerModule||{useAuth:()=>auth},
    'expo-router':{router,useSegments:()=>segments},
  },frames);
  function Guard(){if(providerModule)authApi=providerModule.useAuth();module.useProtectedRoute();return React.createElement('Guard');}
  const element=()=>{
    const child=options.strict?React.createElement(React.StrictMode,null,React.createElement(Guard)):React.createElement(Guard);
    return options.provider?React.createElement(providerModule.default,null,child):child;
  };
  let renderer;await act(async()=>{renderer=create(element());});
  return {
    jobs,routes,cancelled,history,storageReads,userReads,
    update:async(next={})=>{if(next.auth)auth=next.auth;if(next.segments)segments=next.segments;await act(async()=>renderer.update(element()));},
    deliver:async id=>{jobs.delete(id);await act(async()=>history.get(id)());},
    flush:async()=>{const queued=[...jobs];for(const [id,fn]of queued){jobs.delete(id);await act(async()=>fn());}},
    unmount:async()=>{await act(async()=>renderer.unmount());},
    storage:async(index,token)=>{await act(async()=>storageReads[index].resolve(token));},
    user:async(index,data)=>{await act(async()=>userReads[index].resolve(data));},
    signOut:async()=>{await act(async()=>authApi.signOut());},
    reload:async()=>{let promise;await act(async()=>{promise=authApi.reloadAuth();});return{promise};},
    token:async()=>{let promise;await act(async()=>{promise=authApi.updateToken('fixture-new-token');});return{promise};},
  };
}
const owner={roles:['owner'],permissions:[],user:{id:'fixture-user',team_id:null}};
const routeCases=[
  {name:'root empty',segments:[],anon:null,authed:null},
  {name:'root index',segments:['index'],anon:null,authed:null},
  {name:'grouped login',segments:['(onboarding)','login'],anon:null,authed:'/(back-office)/home'},
  {name:'legacy login',segments:['login'],anon:null,authed:'/(back-office)/home'},
  {name:'onboarding slides',segments:['onboarding'],anon:null,authed:'/(back-office)/home'},
  {name:'registration wizard',segments:['register','wizard'],anon:null,authed:'/(back-office)/home'},
  {name:'OTP',segments:['otp'],anon:null,authed:'/(back-office)/home'},
  {name:'forgot password',segments:['forgot-password'],anon:null,authed:'/(back-office)/home'},
  {name:'reset password',segments:['reset-password'],anon:null,authed:'/(back-office)/home'},
  {name:'choose store',segments:['choose-store','pin'],anon:null,authed:'/(back-office)/home'},
  {name:'maintenance',segments:['maintenance'],anon:null,authed:null},
  {name:'terms',segments:['terms-and-condition'],anon:null,authed:null},
  {name:'back office',segments:['(back-office)','home'],anon:'/(onboarding)/login',authed:null},
  {name:'cashier',segments:['(cashier)','home'],anon:'/(onboarding)/login',authed:null},
  {name:'operator',segments:['(operator)','home'],anon:'/(onboarding)/login',authed:null},
  {name:'absence',segments:['(absence)','home'],anon:'/(onboarding)/login',authed:null},
  {name:'private catalog',segments:['(no-layout)','catalog','menu','detail'],anon:'/(onboarding)/login',authed:null},
  {name:'private workers',segments:['(no-layout)','manage','workers','modify'],anon:'/(onboarding)/login',authed:null},
];
async function scenarios(){
  for(const entry of routeCases){
    for(const authenticated of [false,true])for(const isLoading of [false,true]){
      const f=await fixture({segments:entry.segments,auth:{authenticated,isLoading}});
      const queued=f.jobs.size;await f.flush();
      const target=isLoading?null:authenticated?entry.authed:entry.anon;
      check(`policy ${entry.name} auth=${authenticated} loading=${isLoading}`,{queued,routes:f.routes},{queued:target?1:0,routes:target?[target]:[]});
      await f.unmount();
    }
  }
  let f=await fixture();
  check('guard never redirects synchronously before next frame',f.routes,[]);
  let frame=[...f.jobs.keys()][0];await f.update();
  check('stable route/auth rerender preserves pending frame',[...f.jobs.keys()],[frame]);
  await f.update({auth:{authenticated:true,isLoading:false}});
  check('completed login cancels pending anonymous redirect',f.jobs.size,0);
  await f.deliver(frame);check('already dequeued login callback is ignored after authentication',f.routes,[]);await f.unmount();

  f=await fixture();frame=[...f.jobs.keys()][0];await f.update({segments:['(onboarding)','register','wizard']});
  check('entering public registration cancels old login frame',f.jobs.size,0);
  await f.deliver(frame);check('stale private callback cannot replace chosen public page',f.routes,[]);await f.unmount();

  f=await fixture();frame=[...f.jobs.keys()][0];await f.update({auth:{authenticated:false,isLoading:true}});
  check('loading revalidation cancels queued redirect',f.jobs.size,0);
  await f.deliver(frame);check('stale redirect cannot run while auth is loading',f.routes,[]);
  await f.update({auth:{authenticated:false,isLoading:false}});await f.flush();
  check('resolved anonymous revalidation schedules fresh login',f.routes,['/(onboarding)/login']);await f.unmount();

  f=await fixture({segments:['(onboarding)','login'],auth:{authenticated:true,isLoading:false}});frame=[...f.jobs.keys()][0];
  await f.update({auth:{authenticated:false,isLoading:false}});await f.deliver(frame);
  check('sign-out on login cancels old back-office callback',f.routes,[]);await f.unmount();

  f=await fixture({segments:['(onboarding)','login'],auth:{authenticated:true,isLoading:false}});frame=[...f.jobs.keys()][0];
  await f.update({segments:['(cashier)','home']});await f.deliver(frame);
  check('choosing authenticated cashier route cannot be overwritten by old public redirect',f.routes,[]);await f.unmount();

  f=await fixture({segments:['(onboarding)','login'],auth:{authenticated:true,isLoading:false}});frame=[...f.jobs.keys()][0];
  await f.update({segments:['(absence)','home'],auth:{authenticated:false,isLoading:false}});await f.deliver(frame);
  check('obsolete authenticated redirect cannot run before new anonymous decision',f.routes,[]);await f.flush();
  check('latest private anonymous decision navigates only to login',f.routes,['/(onboarding)/login']);await f.unmount();

  f=await fixture();frame=[...f.jobs.keys()][0];await f.update({segments:['(no-layout)','manage','roles']});
  check('private route change retains exactly one active frame',f.jobs.size,1);
  await f.deliver(frame);check('previous private route callback is invalidated',f.routes,[]);await f.flush();
  check('replacement private route callback navigates once',f.routes,['/(onboarding)/login']);await f.unmount();

  for(const authenticated of [false,true]){
    f=await fixture({segments:authenticated?['(onboarding)','login']:['(operator)','home'],auth:{authenticated,isLoading:false}});frame=[...f.jobs.keys()][0];await f.unmount();
    check(`unmount drains pending frame auth=${authenticated}`,f.jobs.size,0);await f.deliver(frame);
    check(`queued callback after unmount cannot navigate auth=${authenticated}`,f.routes,[]);
  }
  f=await fixture({strict:true});
  check('StrictMode effect replay leaves one active frame',f.jobs.size,1);
  const first=[...f.history.keys()][0];await f.deliver(first);
  check('StrictMode discarded effect callback cannot navigate',f.routes,[]);await f.flush();
  check('StrictMode current effect redirects once',f.routes,['/(onboarding)/login']);await f.unmount();

  f=await fixture({provider:true});
  check('actual AuthProvider bootstrap pauses guard',f.jobs.size,0);await f.storage(0,'fixture-stored-token');
  check('actual AuthProvider user validation still pauses guard',f.jobs.size,0);await f.user(0,owner);await f.flush();
  check('validated provider user remains on private route',f.routes,[]);await f.unmount();

  f=await fixture({provider:true});await f.storage(0,null);frame=[...f.jobs.keys()][0];const update=await f.token();await f.user(0,owner);await act(async()=>update.promise);
  check('actual completed updateToken cancels anonymous frame',f.jobs.size,0);await f.deliver(frame);
  check('actual provider login prevents obsolete login redirect',f.routes,[]);await f.unmount();

  f=await fixture({provider:true,segments:['(onboarding)','login']});await f.storage(0,'fixture-stored-token');await f.user(0,owner);frame=[...f.jobs.keys()][0];
  await f.signOut();await f.deliver(frame);
  check('actual provider signOut invalidates authenticated public redirect',f.routes,[]);await f.unmount();

  f=await fixture({provider:true,segments:['(onboarding)','login']});await f.storage(0,'fixture-stored-token');await f.user(0,owner);frame=[...f.jobs.keys()][0];const reload=await f.reload();
  check('actual reloadAuth loading cancels old frame',f.jobs.size,0);await f.deliver(frame);
  check('actual reloadAuth loading ignores dequeued old frame',f.routes,[]);await f.storage(1,'fixture-stored-token');await f.user(1,owner);await act(async()=>reload.promise);await f.flush();
  check('actual reloadAuth completion schedules current public redirect',f.routes,['/(back-office)/home']);await f.unmount();

  check('no runtime errors or act warnings',errors,[]);
}
(async()=>{
  await scenarios();
  const result={ticket:'SD5-004',baseline,baselineRef:baseline?baselineRef:null,sources,checks,errors,passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length};
  fs.writeFileSync(`${folder}/${baseline?'baseline':'final'}-results.json`,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,failures:checks.filter(item=>!item.passed)}));if(result.failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;});
