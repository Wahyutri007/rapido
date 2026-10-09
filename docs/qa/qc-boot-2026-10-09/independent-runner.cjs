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
  let storedToken=options.token||null,onboardingFinished=!!options.completed,authApi,refetchCalls=0,storageReads=0,splashInstance=0,bootVisible=true;
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
  
  const outros = [], haptics = [];
  const FONT_NAMES = load("constants/Fonts.ts", {}).FONT_NAMES;
  const nativeHaptic = { impactAsync: value => { haptics.push(value); return Promise.resolve(); }, ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" }, selectionAsync: () => Promise.resolve(), notificationAsync: () => Promise.resolve(), NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" } };
  const actualHaptic = load("lib/haptics.ts", { "expo-haptics": nativeHaptic });
  const easing = value => value;
  const reanimated = {
    __esModule: true,
    default: { View: "AnimatedView", Text: "AnimatedText" },
    useSharedValue: initial => { const [value] = React.useState(() => ({ value: initial, get() { return this.value; }, set(next) { this.value = next; } })); return value; },
    useAnimatedStyle: fn => fn(),
    Easing: { out: easing, in: easing, inOut: easing, ease: easing, cubic: easing },
    withTiming: (value, config, callback) => { if (callback) outros.push({ value, config, callback }); return value; },
    withSpring: value => value, withDelay: (_delay, value) => value, withRepeat: value => value,
    runOnJS: fn => fn,
  };
  const ActualSplash = load("components/custom/SplashScreenView.tsx", {
    "react-native": { Dimensions: { get: () => ({ width: 390, height: 844 }) }, Pressable: "Pressable", View: "View", StyleSheet: { create: value => value, absoluteFill: { position: "absolute" } } },
    "expo-linear-gradient": { LinearGradient: "LinearGradient" }, "react-native-reanimated": reanimated,
    "@/constants/Fonts": { FONT_NAMES }, "@/lib/haptics": actualHaptic,
  }).SplashScreenView;
  function Splash(props){const [instance]=React.useState(()=>++splashInstance);return React.createElement("Splash",{...props,instance},React.createElement(ActualSplash,props));}

  const Boot=load("app/index.tsx",{
    "expo-router":{useRouter:()=>router},"@/lib/storage":storage,"@/api/hooks/misc":{useApiHealthData:()=>health},
    "@/components/custom/SplashScreenView":{SplashScreenView:Splash},"@/constants/Keys":Keys,"@/context/AuthContext":authModule,"@/hooks/useNavigateAuthenticated":navigateModule,
  },timers).default;
  function Capture(){authApi=authModule.useAuth();guardModule.useProtectedRoute();return bootVisible ? React.createElement(React.StrictMode,null,React.createElement(Boot)) : null;}
  function App(){return React.createElement(authModule.default,null,React.createElement(Capture));}
  let renderer;await act(async()=>{renderer=create(React.createElement(App));});
  const update=async()=>{await act(async()=>renderer.update(React.createElement(App)));};
  const advance=async amount=>{
    const end=now+amount;
    for(;;){const next=[...jobs].filter(([,job])=>job.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;jobs.delete(next[0]);await act(async()=>next[1].fn());}
    now=end;
  };
  return{
    routes,modeChanges,storeChanges,jobs,advance,outros,haptics,
    finish: async (index, finished=true) => { await act(async () => outros[index].callback(finished)); },
    opacity: () => renderer.root.findAllByType("AnimatedView")[0].props.style.at(-1).opacity,
    hideBoot: async () => { bootVisible=false; await update(); },
    showBoot: async () => { bootVisible=true; await update(); },
    mode: async value => { mode=value; await update(); },
    store: async value => { activeStoreId=value; await update(); },
    user: async value => { await act(async () => queryStore.setState({ data: value })); },
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
  let f=await fixture({completed:true});
  check("production splash: minimum prevents outro before auth",f.outros.length,0);
  await f.resolveStorage(); await f.advance(849);
  check("production splash: minimum prevents outro at 849ms",f.outros.length,0);
  await f.advance(1);
  check("production splash: one outro starts at readiness",f.outros.length,1);
  check("production splash: production outro timing",f.outros[0].config.duration,320);
  check("production splash: production haptic invoked",f.haptics,["light"]);
  const stable=f.splash().props.onAnimationComplete;
  await f.update(); await f.update();
  check("strict boot rerenders: callback stays stable",f.splash().props.onAnimationComplete===stable,true);
  check("strict boot rerenders: outro is not restarted",f.outros.length,1);
  await f.finish(0,false);
  check("cancelled worklet: finished=false does not navigate",f.routes,[]);
  await f.finish(0); await f.finish(0);
  check("real outro callback: exactly one local navigation",f.routes,["/(onboarding)/start"]);
  await f.update(); await f.finish(0);
  check("after navigation: rerender and repeated worklet remain inert",f.routes,["/(onboarding)/start"]);
  await f.unmount(); await f.finish(0);
  check("disposed boot: real worklet completion cannot navigate again",f.routes,["/(onboarding)/start"]);
  check("strict boot: minimum timer is cleaned",f.jobs.size,0);

  f=await fixture({completed:true}); await f.resolveStorage(); await f.advance(850);
  const oldInstance=f.splash().props.instance;
  await f.health({status:"pending"});
  check("pending health: readiness withdrawn",f.splash().props.isReady,false);
  check("pending health: production splash instance replaced",f.splash().props.instance!==oldInstance,true);
  check("pending health: replacement starts with opacity 1 in adapter",f.opacity(),1);
  check("pending health: no extra outro starts",f.outros.length,1);
  await f.finish(0);
  check("pending health: old production callback cannot navigate",f.routes,[]);
  await f.health({status:"success",data:{status:"online"}});
  check("recovered health: new production outro starts",f.outros.length,2);
  await f.finish(0);
  check("recovered health: old session cannot finish new session",f.routes,[]);
  await f.finish(1);
  check("recovered health: current session navigates",f.routes,["/(onboarding)/start"]);
  await f.unmount();

  f=await fixture({token:"valid-qc"}); await f.resolveStorage(); await f.resolveUser(user()); await f.advance(850);
  await f.health({status:"error"});
  check("ready target changes to maintenance: outro is not restarted",f.outros.length,1);
  await f.finish(0);
  check("ready target changes: production callback uses latest maintenance",f.routes,["/maintenance"]);
  await f.unmount();

  f=await fixture(); await f.resolveStorage(); await f.advance(850);
  await f.health({status:"pending"}); await f.health({status:"success",data:{status:"online"}});
  await f.health({status:"pending"}); await f.health({status:"success",data:{status:"online"}});
  check("two recovery cycles: three production outros",f.outros.length,3);
  await f.finish(1); await f.finish(0);
  check("two recovery cycles: both retired worklets are inert",f.routes,[]);
  await f.finish(2); await f.finish(2);
  check("two recovery cycles: newest worklet navigates once",f.routes,["/(onboarding)/onboarding"]);
  await f.unmount();

  f=await fixture({token:"valid-qc",completed:true}); await f.resolveStorage(); await f.resolveUser(user()); await f.advance(850);
  await f.signOut();
  check("sign-out during outro: existing animation remains single",f.outros.length,1);
  await f.finish(0);
  check("sign-out during outro: production callback uses public target",f.routes,["/(onboarding)/start"]);
  await f.unmount();

  f=await fixture(); await f.resolveStorage(); await f.advance(850);
  await f.hideBoot(); await f.showBoot();
  await f.finish(0);
  check("boot remount: prior worklet cannot navigate",f.routes,[]);
  check("boot remount: fresh minimum timer applies",f.outros.length,1);
  await f.advance(850);
  check("boot remount: fresh production outro starts",f.outros.length,2);
  await f.finish(0);
  check("boot remount: old callback stays inert after new readiness",f.routes,[]);
  await f.finish(1);
  check("boot remount: new callback navigates",f.routes,["/(onboarding)/onboarding"]);
  await f.unmount();

  f=await fixture({token:"valid-qc"}); await f.resolveStorage(); await f.resolveUser(user()); await f.advance(850);
  await f.mode("operator"); await f.store("owner-late-store");
  check("mode/store change during outro: one production animation",f.outros.length,1);
  await f.finish(0);
  check("mode/store change during outro: latest navigator selects operator",f.routes,["/(operator)/home"]);
  check("owner late store: no fallback mode change",f.modeChanges,[]);
  await f.unmount();

  f=await fixture({token:"valid-qc",mode:"cashier",activeStore:"old-store"}); await f.resolveStorage(); await f.resolveUser(user()); await f.advance(850);
  await f.user(user(["cashier"],"new-team"));
  await f.finish(0);
  check("role change during outro: newest worker role used",f.routes,["/(cashier)/home"]);
  check("role change during outro: newest team synchronizes",f.storeChanges,["new-team"]);
  await f.unmount();

  f=await fixture(); await f.advance(400); await f.unmount(); await f.resolveStorage(); await f.advance(1000);
  check("unmount before readiness: no production outro",f.outros.length,0);
  check("unmount before readiness: no navigation",f.routes,[]);
  check("unmount before readiness: no leaked minimum timer",f.jobs.size,0);
}
(async()=>{
  await scenarios(); check("no runtime/React/act errors",errors,[]);
  const result={owner:"QC",ticket:"SD5-002",scope:"Actual boot/AuthProvider/navigation/index guard/SplashScreenView/haptic code with React StrictMode on Boot; Reanimated, host/query/storage/router/timer adapters",sources,checks,errors,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length};
  fs.writeFileSync(folder+"/independent-results.json",JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,failures:checks.filter(c=>!c.passed)}));
  process.exitCode=result.failed||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;});
