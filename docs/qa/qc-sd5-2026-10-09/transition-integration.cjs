// Run from application root. Production LayoutTransitionSplash, SplashScreenView,
// appModeStore and Zustand React/persist; native worklets/bridge/storage/router are adapters.
const fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto'),assert=require('node:assert/strict'),ts=require('typescript');
const React=require(path.resolve('.expo/senior7-test-tools/node_modules/react'));
const {act,create}=require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer'));
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const sources=['components/custom/LayoutTransitionSplash.tsx','components/custom/SplashScreenView.tsx',
  'store/appModeStore.ts','node_modules/zustand/react.js','node_modules/zustand/middleware.js'];
const fingerprint=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=fingerprint(),checks=[],errors=[],routes=[],writes=[],bridge=[],outros=[];
const originalError=console.error;
console.error=(...args)=>{if(String(args[0]).includes('react-test-renderer is deprecated'))return;
  errors.push(args.map(String).join(' '));originalError(...args);};
let now=0,nextId=0,haptics=0;
const jobs=new Map();
const setTimer=(fn,delay)=>{const id=++nextId;jobs.set(id,{fn,at:now+delay});return id;};
const clearTimer=id=>jobs.delete(id);
async function advance(amount){const until=now+amount;
  for(;;){const next=[...jobs].filter(([,job])=>job.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];
    if(!next)break;now=next[1].at;jobs.delete(next[0]);await act(async()=>next[1].fn());}
  now=until;
}
async function flushBridge(count=bridge.length){for(let index=0;index<count;index++){
  const task=bridge.shift();if(task)await act(async()=>task.fn(...task.args));}}
function load(file,imports){const exports={};
  const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{
    jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,
  }}).outputText;
  // Keep async storage promises in the middleware's realm (it checks instanceof Promise).
  new Function('exports','require','setTimeout','clearTimeout',output)(exports,name=>{
    if(name==='react')return React;if(name in imports)return imports[name];throw Error('Unmapped '+name+' in '+file);
  },setTimer,clearTimer);return exports;
}
const zustandReact={exports:{}};
new Function('module','exports','require',fs.readFileSync('node_modules/zustand/react.js','utf8'))(
  zustandReact,zustandReact.exports,name=>name==='react'?React:require(name));
const storage={getItemAsync:async()=>null,setItemAsync:async(name,value)=>writes.push({name,value}),deleteItemAsync:async()=>{}};
const storeModule=load('store/appModeStore.ts',{
  'expo-router':{router:{replace:route=>routes.push(route)}},'@/lib/storage':storage,
  zustand:zustandReact.exports,'zustand/middleware':require('zustand/middleware'),
});
const store=storeModule.useAppModeStore;
function useSharedValue(initial){
  const [shared]=React.useState(()=>{
    const holder={value:initial,pending:null,get(){return this.value;},set(next){
      if(this.pending!==null){clearTimer(this.pending);this.pending=null;}
      this.value=next&&typeof next==='object'&&'target'in next?next.target:next;
      if(next&&typeof next.callback==='function'){
        const ticket={started:now,duration:next.duration,callback:next.callback};outros.push(ticket);
        this.pending=setTimer(()=>{this.pending=null;next.callback(true);},next.duration);
      }
    }};return holder;
  });
  React.useEffect(()=>()=>{if(shared.pending!==null){clearTimer(shared.pending);shared.pending=null;}},[shared]);
  return shared;
}
const easing={ease:'ease',cubic:'cubic',out:value=>value,in:value=>value,inOut:value=>value};
const reanimated={__esModule:true,default:{View:'AnimatedView',Text:'AnimatedText'},
  Easing:easing,useSharedValue,useAnimatedStyle:fn=>fn(),
  withTiming:(target,config={},callback)=>({target,duration:config.duration??0,callback}),
  withSpring:target=>({target}),withDelay:(_delay,value)=>value,withRepeat:value=>value,
  runOnJS:fn=>(...args)=>bridge.push({fn,args}),
};
const splashModule=load('components/custom/SplashScreenView.tsx',{
  'react-native':{Dimensions:{get:()=>({width:390})},Pressable:'Pressable',View:'View',
    StyleSheet:{create:styles=>styles,absoluteFill:{position:'absolute'}}},
  'expo-linear-gradient':{LinearGradient:'LinearGradient'},'react-native-reanimated':reanimated,
  '@/constants/Fonts':{FONT_NAMES:{logo:'logo',medium:'medium',regular:'regular'}},
  '@/lib/haptics':{haptic:{light:()=>haptics++}},
});
const Screen=load('components/custom/LayoutTransitionSplash.tsx',{
  '@/components/custom/SplashScreenView':splashModule,'@/store/appModeStore':storeModule,
}).LayoutTransitionSplash;
function check(name,actual,expected){
  // Store serializable evidence and avoid implementation-specific prototypes in assertions.
  assert.deepEqual(JSON.parse(JSON.stringify(actual)),JSON.parse(JSON.stringify(expected)),name);
  checks.push({name,passed:true});
}
async function main(){
  let renderer;
  await act(async()=>{renderer=create(React.createElement(React.StrictMode,null,React.createElement(Screen)));});
  const splash=()=>renderer.root.findAllByType(splashModule.SplashScreenView)[0];
  const switchMode=mode=>act(async()=>store.getState().switchModeWithTransition(mode));
  const redraw=()=>act(async()=>renderer.update(React.createElement(React.StrictMode,null,React.createElement(Screen))));
  check('actual persisted store hydrates without an idle overlay',Boolean(splash()),false);
  check('actual middleware hydration completes',store.persist.hasHydrated(),true);
  await switchMode('cashier');
  check('actual splash enters transition mode unready',[splash().props.mode,splash().props.isReady],['transition',false]);
  await advance(300);
  check('store navigation and actual splash badge agree',[routes.at(-1),splash().props.targetModeLabel],['/(cashier)/home','Kasir']);
  await advance(800);
  check('actual splash starts one outro after hold',[splash().props.isReady,outros.length,haptics],[true,1,1]);
  await advance(100);await redraw();
  check('rerender does not restart native outro effect',[outros.length,outros[0].duration],[1,320]);
  await advance(220);
  check('finished worklet queues JS completion without synchronous removal',[bridge.length,Boolean(splash())],[1,true]);
  const oldCallback=splash().props.onAnimationComplete;
  await switchMode('operator');
  const newCallback=splash().props.onAnimationComplete;
  check('restart mounts fresh splash callback identity',oldCallback===newCallback,false);
  check('restart clears readiness before next mode navigation',splash().props.isReady,false);
  await advance(1100);
  check('next mode has its own outro and correct badge',[outros.length,splash().props.targetModeLabel],[2,'Operator']);
  await advance(320);
  check('old and new completed worklets can coexist in JS queue',bridge.length,2);
  await flushBridge(1);
  check('late actual prior worklet cannot remove next completed splash',Boolean(splash()),true);
  await flushBridge(1);
  check('current actual worklet removes overlay once',Boolean(splash()),false);
  check('two transitions navigate exactly once each',routes,['/(cashier)/home','/(operator)/home']);
  check('persist middleware saves only mode snapshots',writes.every(write=>{
    const state=JSON.parse(write.value).state;return Object.keys(state).length===1&&typeof state.mode==='string';
  }),true);
  check('latest persistence matches final selected mode',JSON.parse(writes.at(-1).value).state,{mode:'operator'});
  const settledRoutes=routes.length;
  await switchMode('operator');
  check('same-mode production guard creates no overlay or new route',[Boolean(splash()),routes.length],[false,settledRoutes]);
  await switchMode('absence');
  await advance(1100);
  const pendingOutroCount=outros.length;
  await act(async()=>renderer.unmount());
  await advance(320);await flushBridge();
  check('native cleanup adapter cancels unfinished unmounted outro',[jobs.size,bridge.length,outros.length],[0,0,pendingOutroCount]);
  check('strict lifecycle and bridge handlers have no runtime or act errors',errors,[]);
  const after=fingerprint();check('integration sources stable before and after test',after,before);
  fs.writeFileSync(path.join(__dirname,'transition-results.json'),JSON.stringify({status:'PASS',passed:checks.length,failed:0,
    checks,errors,before,after,routes,persistedSnapshots:writes.map(write=>JSON.parse(write.value)),
    outroTimings:outros.map(ticket=>({started:ticket.started,duration:ticket.duration})),
    scope:'Actual LayoutTransitionSplash + SplashScreenView + appModeStore + Zustand React/persist. React StrictMode; timer/worklet/bridge/native/storage/router adapters, no animation frames/device/persistent storage.',
  },null,2)+'\n');
  console.log(JSON.stringify({suite:'transition-integration',passed:checks.length,failed:0,errors}));
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;});
