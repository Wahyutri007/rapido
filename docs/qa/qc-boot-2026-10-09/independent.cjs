// Reuse the audited developer setup; new scenarios connect the actual SplashScreenView.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const original = fs.readFileSync('docs/qa/senior-5-2026-10-09/boot/check.cjs', 'utf8');
const boundary = 'async function scenarios(){';
if (original.split(boundary).length !== 2) throw new Error('Unexpected fixture boundary');
let setup = original.split(boundary)[0];
function replace(from, to) {
  if (setup.split(from).length !== 2) throw new Error(`Fixture anchor changed: ${from.slice(0, 80)}`);
  setup = setup.replace(from, to);
}
replace('const folder = "docs/qa/senior-5-2026-10-09/boot";', 'const folder = "docs/qa/qc-boot-2026-10-09";');
replace('let storedToken=options.token||null,onboardingFinished=!!options.completed,authApi,refetchCalls=0,storageReads=0,splashInstance=0;', 'let storedToken=options.token||null,onboardingFinished=!!options.completed,authApi,refetchCalls=0,storageReads=0,splashInstance=0,bootVisible=true;');
replace('function Splash(props){const [instance]=React.useState(()=>++splashInstance);return React.createElement("Splash",{...props,instance});}', `
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
`);
replace('return React.createElement(Boot);', 'return bootVisible ? React.createElement(React.StrictMode,null,React.createElement(Boot)) : null;');
replace('routes,modeChanges,storeChanges,jobs,advance,', `routes,modeChanges,storeChanges,jobs,advance,outros,haptics,
    finish: async (index, finished=true) => { await act(async () => outros[index].callback(finished)); },
    opacity: () => renderer.root.findAllByType("AnimatedView")[0].props.style.at(-1).opacity,
    hideBoot: async () => { bootVisible=false; await update(); },
    showBoot: async () => { bootVisible=true; await update(); },
    mode: async value => { mode=value; await update(); },
    store: async value => { activeStoreId=value; await update(); },
    user: async value => { await act(async () => queryStore.setState({ data: value })); },`);
const scenarios = `
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
  fs.writeFileSync(folder+"/independent-results.json",JSON.stringify(result,null,2)+"\\n");
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,failures:checks.filter(c=>!c.passed)}));
  process.exitCode=result.failed||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;});
`;
const runner = path.join(__dirname, 'independent-runner.cjs');
fs.writeFileSync(runner, setup + scenarios);
const result = spawnSync(process.execPath, [runner], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
fs.writeFileSync(path.join(__dirname, 'independent.out.txt'), result.stdout || '');
fs.writeFileSync(path.join(__dirname, 'independent.err.txt'), result.stderr || '');
process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
process.exitCode = result.status ?? 1;
