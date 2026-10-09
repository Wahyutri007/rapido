// Run from the app root. Actual Boot/AuthProvider/navigation/guard, isolated query/storage/router adapters.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const {execFileSync} = require("node:child_process");
const ts = require("typescript");
const toolRoot = process.env.RAPIDO_TEST_TOOLS || ".expo/senior7-test-tools/node_modules";
const React = require(path.resolve(toolRoot,"react"));
const {act,create} = require(path.resolve(toolRoot,"react-test-renderer"));
const {createStore} = require("zustand/vanilla");
const baseline = process.argv.includes("--baseline");
const baselineRef = "acba0d92460c1af3149abc3775f09888a2943cab";
const folder = "docs/qa/qc-boot-2026-10-09";
const checks=[],errors=[],sources={};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError=console.error;
console.error=(...args)=>{
  if(String(args[0]).includes("react-test-renderer is deprecated"))return;
  errors.push(args.map(String).join(" "));originalError(...args);
};
function check(name,actual,expected){
  const actualSnapshot=JSON.parse(JSON.stringify(actual)),expectedSnapshot=JSON.parse(JSON.stringify(expected));
  try{assert.deepEqual(actualSnapshot,expectedSnapshot);checks.push({name,passed:true});}
  catch{checks.push({name,passed:false,actual:actualSnapshot,expected:expectedSnapshot});}
}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
function load(file,imports,timers={}){
  const source=baseline&&file==="app/index.tsx"?execFileSync("git",["show",`${baselineRef}:${file}`],{encoding:"utf8"}):fs.readFileSync(file,"utf8");
  sources[file]=crypto.createHash("sha256").update(source).digest("hex");
  const output=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports={};vm.runInNewContext(output,{exports,...timers,require(name){if(name==="react")return React;if(Object.hasOwn(imports,name))return imports[name];throw Error(`Unmapped dependency ${name} in ${file}`);}}, {filename:file});return exports;
}
async function fixture(options={}){
  let now=0,nextId=0,health={status:"success",data:{status:"online"}},mode=options.mode||"back-office",activeStoreId=options.activeStore||null;
  let storedToken=options.token||null,onboardingFinished=!!options.completed,authApi,refetchCalls=0,storageReads=0,splashInstance=0;
  const routes=[],modeChanges=[],storeChanges=[],jobs=new Map();
  const tokenRequest=deferred(),userRequest=deferred();
  const queryStore=createStore(()=>({data:undefined}));
  const timers={setTimeout(fn,delay){const id=++nextId;jobs.set(id,{fn,at:now+delay});return id;},clearTimeout(id){jobs.delete(id);},requestAnimationFrame(fn){return timers.setTimeout(fn,0);}};
  const Keys=load("constants/Keys.ts",{}).default;
  const storage={getItem:key=>key===Keys.AUTH_TOKEN?storedToken:onboardingFinished?"true":null,getItemAsync:()=>{storageReads++;return tokenRequest.promise;},deleteItemAsync:async()=>{storedToken=null;}};
  const refetch=()=>{
    refetchCalls++;
    // A second unexpected refetch is held so the baseline cannot loop indefinitely.
    if(refetchCalls>1)return new Promise(()=>{});
    return userRequest.promise.then(data=>{queryStore.setState({data});return{data};});
  };
  const useUserQuery=()=>({data:React.useSyncExternalStore(queryStore.subscribe,()=>queryStore.getState().data,()=>undefined),refetch});
  const queryClient={setQueryData:(_key,data)=>queryStore.setState({data}),removeQueries:()=>{},clear:()=>{}};
  const authModule=load("context/AuthContext.tsx",{
    "@tanstack/react-query":{useQueryClient:()=>queryClient},
    "@/api/factory":{createGetHook:()=>useUserQuery},"@/constants/Keys":Keys,"@/lib/storage":storage,
  });
  const router={replace:route=>routes.push(route)};
  const modeHook=selector=>selector({mode});modeHook.getState=()=>({setMode:value=>{mode=value;modeChanges.push(value);}});
  const activeHook=()=>({activeStoreId,setActiveStoreId:value=>{activeStoreId=value;storeChanges.push(value);}});
  const navigateModule=load("hooks/useNavigateAuthenticated.ts",{
    "expo-router":{useRouter:()=>router},"@/context/AuthContext":authModule,"@/store/appModeStore":{useAppModeStore:modeHook},"@/store/useActiveStore":{useActiveStore:activeHook},
  });
  const guardModule=load("hooks/useProtectedRoute.ts",{
    "expo-router":{router,useSegments:()=>["index"]},"@/context/AuthContext":authModule,
  },timers);
  function Splash(props){const [instance]=React.useState(()=>++splashInstance);return React.createElement("Splash",{...props,instance});}
  const Boot=load("app/index.tsx",{
    "expo-router":{useRouter:()=>router},"@/lib/storage":storage,"@/api/hooks/misc":{useApiHealthData:()=>health},
    "@/components/custom/SplashScreenView":{SplashScreenView:Splash},"@/constants/Keys":Keys,"@/context/AuthContext":authModule,"@/hooks/useNavigateAuthenticated":navigateModule,
  },timers).default;
  function Capture(){authApi=authModule.useAuth();guardModule.useProtectedRoute();return React.createElement(Boot);}
  function App(){return React.createElement(authModule.default,null,React.createElement(Capture));}
  let renderer;await act(async()=>{renderer=create(React.createElement(App));});
  const update=async()=>{await act(async()=>renderer.update(React.createElement(App)));};
  const advance=async amount=>{
    const end=now+amount;
    for(;;){const next=[...jobs].filter(([,job])=>job.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);await act(async()=>next[1].fn());}
    now=end;
  };
  return{
    routes,modeChanges,storeChanges,jobs,advance,
    splash:()=>renderer.root.findByType("Splash"),
    calls:()=>refetchCalls,reads:()=>storageReads,
    resolveStorage:async()=>{await act(async()=>tokenRequest.resolve(storedToken));},
    rejectStorage:async()=>{await act(async()=>tokenRequest.reject(Error("storage unavailable")));},
    resolveUser:async user=>{await act(async()=>userRequest.resolve(user));},
    rejectUser:async()=>{await act(async()=>userRequest.reject(Error("user request unavailable")));},
    health:async value=>{health=value;await update();},
    completed:value=>{onboardingFinished=value;},
    signOut:async()=>{await act(async()=>authApi.signOut());},
    update,
    unmount:async()=>{await act(async()=>renderer.unmount());},
  };
}
const user=(roles=["owner"],team=null)=>({roles,permissions:[],user:{id:"fixture-user",team_id:team}});
async function scenarios(){
  let f=await fixture();
  check("boot initially waits for AuthProvider storage validation",f.splash().props.isReady,false);
  await f.resolveStorage();await f.advance(849);
  check("public destination still respects minimum 850ms",f.splash().props.isReady,false);
  await f.advance(1);
  check("new user reaches ready onboarding splash",f.splash().props.isReady,true);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("new user navigates to onboarding after outro",f.routes,["/(onboarding)/onboarding"]);
  check("missing token makes no user refetch",f.calls(),0);
  await f.unmount();check("unmount drains boot minimum timer",f.jobs.size,0);

  f=await fixture({completed:true});await f.resolveStorage();await f.advance(850);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("completed onboarding routes to start",f.routes,["/(onboarding)/start"]);await f.unmount();

  f=await fixture();await f.resolveStorage();f.completed(true);await f.advance(850);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("completion saved during bootstrap is read before routing",f.routes,["/(onboarding)/start"]);await f.unmount();

  f=await fixture({token:"expired-fixture",completed:true});await f.resolveStorage();await f.resolveUser(undefined);await f.advance(850);
  check("expired token is validated once by AuthProvider",f.calls(),1);
  check("expired token can finish public splash instead of revalidation loop",f.splash().props.isReady,true);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("expired token routes to completed onboarding start",f.routes,["/(onboarding)/start"]);await f.unmount();

  f=await fixture({token:"network-failure-fixture"});await f.resolveStorage();await f.rejectUser();await f.advance(850);
  check("user request failure does not retry from Boot",f.calls(),1);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("failed validation follows provider anonymous state",f.routes,["/(onboarding)/onboarding"]);await f.unmount();

  f=await fixture();await f.rejectStorage();await f.advance(850);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("storage read failure can finish anonymous boot",f.routes,["/(onboarding)/onboarding"]);await f.unmount();

  f=await fixture({token:"valid-fixture"});await f.resolveStorage();await f.advance(900);
  check("valid token waits for user query even after minimum time",f.splash().props.isReady,false);
  await f.resolveUser(user());
  check("user validation finishes authenticated splash",f.splash().props.isReady,true);
  const complete=f.splash().props.onAnimationComplete;await f.update();
  check("unrelated auth/provider rerender preserves outro callback",f.splash().props.onAnimationComplete===complete,true);
  await act(async()=>{complete();complete();});await f.update();
  await act(async()=>f.splash().props.onAnimationComplete());
  check("outro completion navigates once including late rerenders",f.routes,["/(back-office)/home"]);await f.unmount();

  f=await fixture({token:"valid-fixture"});await f.resolveStorage();await f.resolveUser(user());
  await act(async()=>f.splash().props.onAnimationComplete());
  check("premature animation callback cannot bypass splash minimum",f.routes,[]);await f.unmount();

  for(const state of [{status:"error"},{status:"success",data:{status:"maintenance"}}]){
    f=await fixture();await f.health(state);await f.advance(850);
    check(`${state.status}: unhealthy API outranks unresolved auth`,f.splash().props.isReady,true);
    await act(async()=>f.splash().props.onAnimationComplete());
    check(`${state.status}: unhealthy API navigates to maintenance`,f.routes,["/maintenance"]);await f.unmount();
  }
  f=await fixture({completed:true});await f.resolveStorage();await f.advance(850);
  const prior=f.splash().props.onAnimationComplete;
  const priorInstance=f.splash().props.instance;
  await f.health({status:"pending"});
  check("health revalidation suspends readiness",f.splash().props.isReady,false);
  check("revoking readiness remounts the splash so faded animation state is reset",f.splash().props.instance!==priorInstance,true);
  await act(async()=>prior());
  check("late callback cannot use stale destination during health pending",f.routes,[]);
  await f.health({status:"success",data:{status:"online"}});
  await act(async()=>prior());
  check("callback from revoked splash session cannot finish the recovered session",f.routes,[]);
  await act(async()=>f.splash().props.onAnimationComplete());
  check("health recovery resolves public destination again",f.routes,["/(onboarding)/start"]);await f.unmount();

  f=await fixture({token:"valid-fixture"});await f.resolveStorage();await f.resolveUser(user());await f.advance(850);
  const authComplete=f.splash().props.onAnimationComplete;
  await f.health({status:"error"});await act(async()=>authComplete());
  check("late authenticated outro uses latest maintenance decision",f.routes,["/maintenance"]);await f.unmount();

  f=await fixture({token:"valid-fixture",completed:true});await f.resolveStorage();await f.advance(850);
  await f.signOut();await f.resolveUser(user());await act(async()=>f.splash().props.onAnimationComplete());
  check("sign-out during validation follows provider token state",f.routes,["/(onboarding)/start"]);await f.unmount();

  f=await fixture({token:"valid-fixture",completed:true});await f.resolveStorage();await f.resolveUser(user());await f.advance(850);
  const beforeSignOut=f.splash().props.onAnimationComplete;
  await f.signOut();await act(async()=>beforeSignOut());
  check("sign-out during authenticated outro uses current anonymous destination",f.routes,["/(onboarding)/start"]);await f.unmount();

  f=await fixture({token:"valid-fixture"});await f.resolveStorage();await f.resolveUser(user());await f.advance(850);
  const beforeUnmount=f.splash().props.onAnimationComplete;await f.unmount();await act(async()=>beforeUnmount());
  check("late callback after ready Boot unmount cannot navigate",f.routes,[]);

  const modeCases=[
    {mode:"back-office",roles:["cashier"],target:"back-office"},
    {mode:"absence",roles:["owner"],target:"absence"},
    {mode:"cashier",roles:["owner"],activeStore:"owner-store",target:"cashier"},
    {mode:"operator",roles:["owner"],activeStore:"owner-store",target:"operator"},
    {mode:"cashier",roles:["owner"],target:"back-office",fallback:true},
    {mode:"operator",roles:["owner"],target:"back-office",fallback:true},
    {mode:"cashier",roles:["cashier"],team:"worker-store",activeStore:"old-store",target:"cashier"},
    {mode:"operator",roles:["operator"],team:"worker-store",target:"operator"},
    {mode:"cashier",roles:["cashier"],target:"back-office",fallback:true},
    {mode:"unknown",roles:["owner"],target:"back-office"},
  ];
  for(const [index,entry]of modeCases.entries()){
    f=await fixture({...entry,token:"mode-fixture"});await f.resolveStorage();await f.resolveUser(user(entry.roles,entry.team||null));await f.advance(850);
    await act(async()=>f.splash().props.onAnimationComplete());
    check(`mode case ${index}: authenticated role destination`,f.routes,[`/(${entry.target})/home`]);
    check(`mode case ${index}: owner/worker fallback updates mode`,f.modeChanges,entry.fallback?["back-office"]:[]);
    check(`mode case ${index}: assigned worker store synchronizes`,f.storeChanges,entry.team?[entry.team]:[]);
    await f.unmount();
  }
  f=await fixture();await f.unmount();await f.resolveStorage();await f.advance(900);
  check("unmounted boot never navigates on later async completion",f.routes,[]);
}
(async()=>{
  await scenarios();check("no runtime errors or act warnings",errors,[]);
  const result={ticket:"SD5-002",baseline,baselineRef:baseline?baselineRef:null,sources,checks,errors,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length};
  fs.writeFileSync(`${folder}/${baseline?"baseline":"final"}-results.json`,JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,failures:checks.filter(c=>!c.passed)}));
  if(result.failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;});
