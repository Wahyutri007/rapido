// Real screen, Keypad, Form, Rupiah utils, RHF, Zod and resolver. Native/router adapters only.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const toolRoot = path.resolve(process.env.RAPIDO_TEST_TOOLS || '.expo/senior7-test-tools/node_modules');
const React = require(path.join(toolRoot, 'react'));
require.cache[require.resolve('react')] = {id:require.resolve('react'), filename:require.resolve('react'), loaded:true, exports:React};
const {act, create} = require(path.join(toolRoot, 'react-test-renderer'));
const baseline = process.argv.includes('--baseline');
const sourceHashes = {}, checks = [], errors = [], actionRejections = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('react-test-renderer is deprecated')) return;
  errors.push(args.map(String).join(' ')); originalError(...args);
};
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function check(name, actual, expected) {
  const normalize = value => value === undefined ? null : JSON.parse(JSON.stringify(value));
  try {assert.deepEqual(normalize(actual), normalize(expected)); checks.push({name, passed:true});}
  catch {checks.push({name, passed:false, actual, expected});}
}
const hosts = (...names) => Object.fromEntries(names.map(name => [name, name]));
const defaultHost = name => ({__esModule:true, default:name});
function loader(env, legacy = baseline) {
  const loaded = new Map();
  function resolve(name, parent) {
    const base = name.startsWith('@/') ? name.slice(2) : path.relative(process.cwd(), path.resolve(path.dirname(parent), name)).replaceAll('\\', '/');
    return [base, base+'.ts', base+'.tsx', base+'/index.ts', base+'/index.tsx'].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  }
  function load(file) {
    if (loaded.has(file)) return loaded.get(file).exports;
    const before = {'app/(no-layout)/(cashier)/cart/input-money.tsx':'before/input-money.tsx', 'components/common/Keypad.tsx':'before/Keypad.tsx'};
    const tested = legacy && before[file] ? path.join(__dirname, before[file]) : file;
    const bytes = fs.readFileSync(tested);
    sourceHashes[`${legacy ? 'baseline' : 'current'}:${file}`] = sha(tested);
    const code = ts.transpileModule(bytes.toString('utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, jsx:ts.JsxEmit.ReactJSX, esModuleInterop:true}}).outputText;
    const module = {exports:{}}; loaded.set(file, module);
    function request(name) {
      if (name === 'react') return React;
      if (name === 'expo-router') return {router:env.router, useLocalSearchParams:()=>env.local, useGlobalSearchParams:()=>env.global, Link:'Link'};
      if (name === 'expo-router/react-navigation') return {useIsFocused:()=>env.focused};
      if (name === 'react-native') return {...hosts('View','Pressable','Image'), Platform:{OS:'web'}};
      if (name === '@expo/vector-icons/Entypo') return defaultHost('Entypo');
      if (name === '@react-native-community/datetimepicker' || name === 'expo-document-picker') return {};
      if (name === '@/constants/Colors') return {Colors:{zinc:{400:'#a1a1aa'}}};
      if (name === '@/constants/Fonts') return {FONT_NAMES:{regular:'fixture'}};
      if (name === '@/components/icons') return hosts('EFeather','BackspaceIcon','CheckCircleIcon','InfoIcon');
      if (name === '@/components/ui/button') return hosts('Button','ButtonText','ButtonGroup');
      if (name === '@/hooks/useSecureStore' || name === '@/components/common/AlertModal' || name === '@/components/common/Header' || name === '@/types') return {};
      if ((name === './dates' || name === './colors' || name === './styles' || name === '../haptics') && file === 'lib/utils/index.ts') return {};
      if (name.startsWith('../ui/') && file === 'components/common/Form.tsx') return new Proxy({}, {get:(_target,key)=>String(key)});
      if (name === './SingleSelect' && file === 'components/common/Form.tsx') return defaultHost('SingleSelect');
      if (name === './BouncyPressable' && file === 'components/common/Keypad.tsx') return defaultHost('Key');
      if ((name === './Text' || name === '@/components/common/Text') || name === '../icons/camera') return defaultHost('Text');
      if (name === '../icons/backspace') return defaultHost('BackspaceIcon');
      if (name.startsWith('@/') || name.startsWith('.')) {
        const target = resolve(name, file); if (!target) throw Error(`Unmapped ${name} from ${file}`);
        return load(target);
      }
      return require(name);
    }
    vm.runInNewContext(code, {module, exports:module.exports, require:request, console, setTimeout, clearTimeout}, {filename:path.resolve(file)});
    return module.exports;
  }
  return load;
}
const screenPath = 'app/(no-layout)/(cashier)/cart/input-money.tsx';
const route = (value, totalPrice) => ({pathname:'/cart/input-money-confirm', params:{value,totalPrice}});
async function fixture(params = {}, options = {}) {
  const routes = [];
  const env = {local:params, global:params, focused:true, router:{replace:entry=>{if(env.failNavigation) throw Error('Fixture route failure'); routes.push(entry);}}};
  const load = loader(env);
  const Screen = load(screenPath).default;
  let renderer;
  const update = async () => {await act(async()=>{renderer.update(React.createElement(Screen));});};
  await act(async()=>{renderer=create(React.createElement(Screen));});
  const button = () => renderer.root.findByType('Button');
  const key = label => renderer.root.findAllByType('Key').find(node => label === 'BACK' ? node.findAllByType('BackspaceIcon').length > 0 : node.findAllByType('Text').some(text => text.children.join('') === label));
  const press = async label => {await act(async()=>{key(label).props.onPress();});};
  const value = () => renderer.root.findByType(require('react-hook-form').FormProvider).props.getValues('value') ?? '';
  const message = () => renderer.root.findAllByType('Text').filter(node => node.props.id?.endsWith('-form-item-message')).map(node => node.children.join('')).join(' ');
  const enabled = () => button().props.isDisabled !== true && button().props.style?.pointerEvents !== 'none';
  return {
    routes, env, renderer, button, key, value, message, enabled,
    press, type:async text=>{for(const character of text) await press(character);},
    submit:async count=>{await act(async()=>{const fn=button().props.onPress; const results=await Promise.allSettled(Array.from({length:count || 1},()=>fn())); for(const result of results) if(result.status==='rejected')actionRejections.push(String(result.reason));});},
    local:async params=>{env.local=params; env.global=params; await update();},
    global:async params=>{env.global=params; await update();},
    focus:async focused=>{env.focused=focused; await update();},
    saved:()=>button().props.onPress,
    invoke:async fn=>{await act(async()=>{await fn();});},
    pending:async change=>{await act(async()=>{const pending=button().props.onPress(); change({renderer,key,env}); await pending;});},
    dispose:async()=>{await act(async()=>{renderer.unmount();});},
  };
}
async function keypadFixture(legacy, options = {}) {
  const env={router:{},local:{},global:{},focused:true};
  const Keypad=loader(env,legacy)('components/common/Keypad.tsx').default;
  let value, external, renderer;
  function App(){const state=React.useState(options.initial ?? null); [value,external]=state; return React.createElement(Keypad,{state,maxLength:options.maxLength,nullable:options.nullable,controlled:options.controlled});}
  await act(async()=>{renderer=create(React.createElement(App));});
  const key=label=>renderer.root.findAllByType('Key').find(node=>label==='BACK'?node.findAllByType('BackspaceIcon').length>0:node.findAllByType('Text').some(text=>text.children.join('')===label));
  return {value:()=>value, tree:()=>renderer.toJSON(), press:async label=>{await act(async()=>key(label).props.onPress());}, burst:async labels=>{await act(async()=>{for(const label of labels)key(label).props.onPress();});}, external:async text=>{await act(async()=>external(text));}, dispose:async()=>{await act(async()=>renderer.unmount());}};
}

module.exports = {fixture, keypadFixture, loader, check, checks, errors, actionRejections};

