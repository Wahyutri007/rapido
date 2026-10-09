// Run from the app root. Uses the existing isolated React 19 test tools.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const ts = require("typescript");
const toolRoot = process.env.RAPIDO_TEST_TOOLS || ".expo/senior7-test-tools/node_modules";
const React = require(path.resolve(toolRoot, "react"));
const { act, create } = require(path.resolve(toolRoot, "react-test-renderer"));
const { createStore } = require("zustand/vanilla");
const baseline = process.argv.includes("--baseline");
const baselineRef = "acba0d92460c1af3149abc3775f09888a2943cab";
const outputDir = "docs/qa/senior-5-2026-10-09";
const checks = [], errors = [], sources = {};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes("react-test-renderer is deprecated")) return;
  errors.push(args.map(String).join(" "));
  originalError(...args);
};
function check(name, actual, expected) {
  try {
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)));
    checks.push({ name, passed: true });
  } catch {
    checks.push({ name, passed: false, actual, expected });
  }
}
function load(file, imports, timers = {}) {
  const source = baseline
    ? execFileSync("git", ["show", `${baselineRef}:${file}`], { encoding: "utf8" })
    : fs.readFileSync(file, "utf8");
  sources[file] = crypto.createHash("sha256").update(source).digest("hex");
  const output = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, ...timers, require(name) {
    if (name === "react") return React;
    if (Object.hasOwn(imports, name)) return imports[name];
    throw new Error(`Unmapped dependency ${name} in ${file}`);
  } }, { filename: file });
  return exports;
}
async function onboarding() {
  let query = { isLoading: true, data: undefined }, allocations = 0;
  const routes = [], writes = [], scrolls = [];
  class AnimatedValue { constructor(value) { this.value = value; allocations += 1; } }
  function List({ ref, ...props }) {
    React.useImperativeHandle(ref, () => ({ scrollToIndex: args => scrolls.push(args) }), []);
    return React.createElement("FlatList", props);
  }
  const Keys = load("constants/Keys.ts", {}).default;
  const Screen = load("app/(onboarding)/onboarding.tsx", {
    "expo-router": { useRouter: () => ({ replace: route => routes.push(route) }) },
    "react-native": {
      View: "View", FlatList: List, useWindowDimensions: () => ({ width: 390 }),
      Animated: { Value: AnimatedValue, event: (mapping, config) => event => {
        mapping[0].nativeEvent.contentOffset.x.value = event.nativeEvent.contentOffset.x;
        config.listener(event);
      } },
    },
    "@/api/hooks/onboarding-data": () => query,
    "@/api/transformers/onboarding-data": item => item,
    "@/components/feature/onboarding/OnboardingItem": { __esModule: true, default: "OnboardingItem", OnboardingItemSkeleton: "Skeleton" },
    "@/components/feature/onboarding/Paginator": "Paginator",
    "@/components/ui/button": { Button: "Button", ButtonGroup: "ButtonGroup", ButtonText: "ButtonText" },
    "@/constants/Keys": Keys,
    "@/lib/storage": { setItemAsync: async (...args) => writes.push(args) },
  }).default;
  let renderer;
  const mount = async () => { await act(async () => { renderer = create(React.createElement(Screen)); }); };
  const update = async () => { await act(async () => renderer.update(React.createElement(Screen))); };
  const buttons = () => renderer.root.findAllByType("Button");
  const press = async index => { await act(async () => buttons()[index].props.onPress()); };
  const list = () => renderer.root.findByType("FlatList");
  const paginator = () => renderer.root.findByType("Paginator");
  const layout = async width => { await act(async () => renderer.root.findAllByType("View")[0].props.onLayout({ nativeEvent: { layout: { width } } })); };
  const scroll = async x => { await act(async () => list().props.onScroll({ nativeEvent: { contentOffset: { x } } })); };
  await mount();
  const initialValue = paginator().props.scrollX;
  check("loading disables both CTAs", buttons().map(b => b.props.isDisabled), [true, true]);
  await press(0); await press(1);
  check("loading handlers neither navigate nor persist completion", [routes, writes], [[], []]);
  check("loading skeleton follows viewport width", renderer.root.findByType("Skeleton").props.width, 390);
  query = { isLoading: false, data: [{ id: "a" }, { id: "b" }, { id: "c" }] };
  await update();
  check("loaded query exposes three pages", list().props.data.length, 3);
  check("query resolution preserves the animation object", paginator().props.scrollX === initialValue, true);
  await layout(736); await layout(0);
  check("positive container width updates layout and zero is ignored", [list().props.extraData, list().props.getItemLayout(null, 2)], [736, { length: 736, offset: 1472, index: 2 }]);
  await press(0);
  check("Lanjutkan scrolls one page", scrolls.at(-1), { index: 1, animated: true });
  check("intermediate continue does not navigate", routes, []);
  await press(0);
  check("last page presents Mulai", buttons()[0].findByType("ButtonText").props.children, "Mulai");
  await press(0);
  check("Mulai records onboarding and opens login", [writes.at(-1), routes.at(-1)], [[Keys.ONBOARDING_COMPLETED, "true"], "/(onboarding)/login"]);
  await scroll(-900);
  check("negative overscroll clamps to first page", buttons()[0].findByType("ButtonText").props.children, "Lanjutkan");
  const routeCount = routes.length;
  await press(1);
  check("Gabung on an earlier page jumps to last without navigation", [scrolls.at(-1).index, routes.length], [2, routeCount]);
  await press(1);
  check("Gabung on last page records completion and opens register", [writes.at(-1), routes.at(-1)], [[Keys.ONBOARDING_COMPLETED, "true"], "/(onboarding)/register"]);
  await scroll(9999);
  check("positive overscroll clamps to final page", buttons()[0].findByType("ButtonText").props.children, "Mulai");
  await layout(320); await scroll(320);
  check("scroll uses the latest container width", [paginator().props.pageWidth, buttons()[0].findByType("ButtonText").props.children], [320, "Lanjutkan"]);
  check("rerenders allocate no discarded Animated values", allocations, 1);
  check("paginator retains the same scroll animation across all actions", paginator().props.scrollX === initialValue, true);
  await act(async () => renderer.unmount());
  query = { isLoading: false, data: [{ id: "only" }] };
  await mount();
  check("remount receives a fresh animation value", paginator().props.scrollX !== initialValue, true);
  await press(0);
  check("single-page onboarding can finish immediately", routes.at(-1), "/(onboarding)/login");
  await act(async () => renderer.unmount());
  query = { isLoading: false, data: [] };
  await mount(); await press(0);
  check("empty non-loading data preserves existing login fallback", routes.at(-1), "/(onboarding)/login");
  await act(async () => renderer.unmount());
}
async function transitions() {
  let now = 0, jobId = 0, splashId = 0;
  const jobs = new Map(), routes = [];
  const timers = { setTimeout(fn, delay) { const id = ++jobId; jobs.set(id, { fn, at: now + delay }); return id; } };
  async function advance(amount) {
    const end = now + amount;
    for (;;) {
      const next = [...jobs].filter(([, job]) => job.at <= end).sort((a,b) => a[1].at-b[1].at)[0];
      if (!next) break;
      now = next[1].at; jobs.delete(next[0]);
      await act(async () => next[1].fn());
    }
    now = end;
  }
  const storeModule = load("store/appModeStore.ts", {
    "expo-router": { router: { replace: route => routes.push(route) } },
    "@/lib/storage": {},
    zustand: { create: () => initializer => {
      const store = createStore(initializer);
      const useStore = selector => React.useSyncExternalStore(store.subscribe, () => selector(store.getState()), () => selector(store.getState()));
      return Object.assign(useStore, store);
    } },
    "zustand/middleware": { persist: initializer => initializer, createJSONStorage: () => ({}) },
  }, timers);
  function Splash(props) {
    const [instance] = React.useState(() => ++splashId);
    return React.createElement("Splash", { ...props, instance });
  }
  const Screen = load("components/custom/LayoutTransitionSplash.tsx", {
    "@/store/appModeStore": storeModule,
    "@/components/custom/SplashScreenView": { SplashScreenView: Splash },
  }).LayoutTransitionSplash;
  const store = storeModule.useAppModeStore;
  let renderer;
  await act(async () => { renderer = create(React.createElement(Screen)); });
  const splash = () => renderer.root.findAllByType("Splash")[0];
  const switchMode = async mode => { await act(async () => store.getState().switchModeWithTransition(mode)); };
  check("idle layout has no transition overlay", !!splash(), false);
  await switchMode("back-office");
  check("same-mode guard creates neither overlay nor timer", [!!splash(), jobs.size], [false, 0]);
  for (const mode of ["cashier", "operator", "absence", "back-office"]) {
    const count = routes.length;
    await switchMode(mode);
    check(`${mode}: opening transition shows an unready overlay`, splash()?.props.isReady, false);
    await switchMode(mode === "cashier" ? "operator" : "cashier");
    check(`${mode}: in-progress guard retains one navigation timer`, jobs.size, 1);
    await advance(299);
    check(`${mode}: destination waits for the 300ms entrance`, routes.length, count);
    await advance(1);
    check(`${mode}: store selects correct destination and label`, [routes.at(-1), splash()?.props.targetModeLabel], [`/(${mode})/home`, storeModule.APP_MODE_LABELS[mode]]);
    await advance(799);
    check(`${mode}: overlay remains unready during hold`, splash()?.props.isReady, false);
    await advance(1);
    check(`${mode}: completed store transition starts outro`, splash()?.props.isReady, true);
    const complete = splash()?.props.onAnimationComplete;
    await act(async () => renderer.update(React.createElement(Screen)));
    check(`${mode}: unrelated rerender keeps outro callback stable`, splash()?.props.onAnimationComplete === complete, true);
    await act(async () => complete?.());
    check(`${mode}: current outro completion removes overlay`, !!splash(), false);
  }
  await switchMode("cashier"); await advance(1100);
  const oldComplete = splash()?.props.onAnimationComplete;
  const oldInstance = splash()?.props.instance;
  await switchMode("operator");
  check("restarting during outro mounts a fresh animation instance", splash()?.props.instance !== oldInstance, true);
  const newComplete = splash()?.props.onAnimationComplete;
  await act(async () => oldComplete?.());
  check("late prior outro cannot hide an active transition", !!splash(), true);
  await act(async () => newComplete?.());
  check("premature current callback cannot hide an active transition", !!splash(), true);
  await advance(1100);
  await act(async () => oldComplete?.());
  check("late prior outro cannot hide the next completed transition", !!splash(), true);
  await act(async () => newComplete?.());
  check("only current completed transition may close overlay", !!splash(), false);
  check("all mode transition timers are drained", jobs.size, 0);
  await act(async () => renderer.unmount());
}
(async () => {
  await onboarding();
  await transitions();
  check("no runtime errors or act warnings", errors, []);
  const result = { baseline, baselineRef: baseline ? baselineRef : null, sources, checks, errors,
    passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length };
  fs.writeFileSync(`${outputDir}/${baseline ? "baseline" : "lifecycle"}-results.json`, JSON.stringify(result, null, 2)+"\n");
  console.log(JSON.stringify({ passed: result.passed, failed: result.failed, errors, failures: checks.filter(c => !c.passed) }));
  if (result.failed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { console.error = originalError; });
