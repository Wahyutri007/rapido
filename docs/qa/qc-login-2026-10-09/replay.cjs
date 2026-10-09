// Run from the app root. Actual LoginScreen/RHF/Zod/login hook/factory/usePostRequest;
// presentation, HTTP and AuthProvider commit use isolated adapters.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const ts = require('typescript');
const toolRoot = process.env.RAPIDO_TEST_TOOLS || '.expo/senior7-test-tools/node_modules';
const React = require(path.resolve(toolRoot, 'react'));
const {act, create} = require(path.resolve(toolRoot, 'react-test-renderer'));
const baseline = process.argv.includes('--baseline');
const baselineRef = 'acba0d92460c1af3149abc3775f09888a2943cab';
const folder = 'docs/qa/qc-login-2026-10-09';
const checks = [], runtimeErrors = [], unhandledRejections = [], sources = {};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('react-test-renderer is deprecated')) return;
  runtimeErrors.push(args.map(String).join(' ')); originalError(...args);
};
const onUnhandled = error => unhandledRejections.push(String(error));
process.on('unhandledRejection', onUnhandled);
function check(name, actual, expected) {
  const snapshot = actual === undefined ? undefined : JSON.parse(JSON.stringify(actual));
  try {assert.deepEqual(snapshot, expected); checks.push({name, passed:true});}
  catch {checks.push({name, passed:false, actual:snapshot, expected});}
}
function deferred() {
  let resolve, reject; const promise = new Promise((yes,no) => {resolve=yes;reject=no;});
  return {promise,resolve,reject};
}
function load(file, imports, raw=false) {
  const source = baseline && file === 'api/hooks/auth.ts'
    ? execFileSync('git', ['show', `${baselineRef}:${file}`], {encoding:'utf8'})
    : fs.readFileSync(file, 'utf8');
  sources[file] = crypto.createHash('sha256').update(source).digest('hex');
  const output = raw ? source : ts.transpileModule(source, {compilerOptions:{jsx:ts.JsxEmit.React, module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, esModuleInterop:true}}).outputText;
  const module = {exports:{}};
  vm.runInNewContext(output, {module, exports:module.exports, console, process, setTimeout, clearTimeout,
    require(name) {if(name==='react')return React;if(Object.hasOwn(imports,name))return imports[name];throw Error(`Unmapped dependency ${name} in ${file}`);}}, {filename:file});
  return module.exports;
}
const rhf = load('node_modules/react-hook-form/dist/index.cjs.js', {}, true);
const zod = require('zod');
const resolver = require('@hookform/resolvers/zod');
const schema = load('schema/onboarding/login.ts', {zod});
const tick = () => new Promise(resolve => setImmediate(resolve));
const payload = {email:'fixture@example.test', password:'fixture-password'};
const fail = (status=401, errors={}) => ({status, message:'fixture error', success:false, errors});
const success = {status:200, message:'fixture success', success:true, data:{token:'fixture-session-token'}};
async function fixture(options={}) {
  const requests = [], tokenCommits = [], errorWrites = [], routes = [];
  const authCommit = deferred();
  let api, form;
  const auth = {updateToken:async token => {tokenCommits.push(token);await authCommit.promise;}};
  const post = async (url, data, name, config) => {
    const response = deferred();requests.push({url,data,name,config,response});return response.promise;
  };
  const postHook = load('hooks/usePostRequest.ts', {});
  const factory = load('api/factory.ts', {
    '@tanstack/react-query':{useQueryClient:()=>({invalidateQueries(){}}),useQuery:()=>({})},
    './common':{post,put:()=>{throw Error('Unexpected PUT');},del:()=>{throw Error('Unexpected DELETE');}},
    '@/hooks/usePostRequest':postHook,
  });
  const authHooks = load('api/hooks/auth.ts', {'../factory':factory,zod,'@/context/AuthContext':{useAuth:()=>auth}});
  const Field = React.createContext(null);
  function Form(props) {return React.createElement(rhf.FormProvider, props, props.children);}
  function FormField(props) {return React.createElement(rhf.Controller,{...props,render:result=>React.createElement(Field.Provider,{value:result.field},props.render(result))});}
  function FormInput(props) {const field=React.useContext(Field);return React.createElement('Input',{...props,name:field.name,value:field.value??'',onChangeText:field.onChange,onBlur:field.onBlur});}
  function FormMessage() {const field=React.useContext(Field), methods=rhf.useFormContext(),state=rhf.useFormState();return React.createElement('Error',{name:field.name},methods.getFieldState(field.name,state).error?.message);}
  const wrap = type => props => React.createElement(type,props,props.children);
  const router = {push:route=>routes.push(route),replace:route=>routes.push(route)};
  const screen = load('app/(onboarding)/login.tsx', {
    '@hookform/resolvers/zod':resolver,'expo-router':{useRouter:()=>router},'react-hook-form':rhf,
    'react-native':{Image:wrap('Image'),Pressable:wrap('Pressable'),View:wrap('View')},
    '@/api/hooks/auth':{default:methods=>{form=methods;api=authHooks.default(methods);return api;},__esModule:true},
    '@/assets/images':{IMAGES:{step_1:'step-1',step_2:'step-2',step_3:'step-3'}},
    '@/components/common/Form':{Form,FormField,FormInput,FormMessage,FormControl:wrap('Control'),FormItem:wrap('Item'),FormLabel:wrap('Label')},
    '@/components/common/Text':{default:wrap('Text'),__esModule:true},
    '@/components/common/Wrapper':{default:wrap('Wrapper'),__esModule:true},
    '@/components/feature/auth/shared':{AuthBackgroundImage:wrap('Background'),AuthContainer:wrap('AuthContainer'),KasikooLogo:wrap('Logo')},
    '@/components/icons':{EFeather:wrap('Icon')},
    '@/components/ui/actionsheet':{Actionsheet:props=>React.createElement('Actionsheet',props,props.isOpen?props.children:null),ActionsheetBackdrop:wrap('Backdrop'),ActionsheetContent:wrap('SheetContent')},
    '@/components/ui/button':{Button:wrap('Button'),ButtonGroup:wrap('ButtonGroup'),ButtonText:wrap('Text')},
    '@/components/ui/modal':{ModalBody:wrap('ModalBody'),ModalFooter:wrap('ModalFooter'),ModalHeader:wrap('ModalHeader')},
    '@/schema/onboarding/login':schema,
  }).default;
  const element=()=>options.strict?React.createElement(React.StrictMode,null,React.createElement(screen)):React.createElement(screen);
  let renderer;await act(async()=>{renderer=create(element());});
  const methods = form;
  const originalSetError=methods.setError;
  methods.setError=(...args)=>{errorWrites.push(args);return originalSetError(...args);};
  return {
    requests, tokenCommits, errorWrites, routes, api:()=>api, form:()=>methods,
    button:()=>renderer.root.findAllByType('Button').find(button=>button.findAllByType('Text').some(text=>text.children.includes('Masuk'))),
    forgot:()=>renderer.root.findAllByType('Pressable').find(button=>button.findAllByType('Text').some(text=>text.children.includes('Lupa password?'))),
    type:async(name,value)=>{await act(async()=>renderer.root.findAllByType('Input').find(input=>input.props.name===name).props.onChangeText(value));},
    reply:async(index,body)=>{await act(async()=>{requests[index].response.resolve(body);await tick();});},
    rejectRequest:async(index)=>{await act(async()=>{requests[index].response.reject(Error('fixture transport failure'));await tick();});},
    commit:async()=>{await act(async()=>{authCommit.resolve();await tick();});},
    rejectCommit:async()=>{await act(async()=>{authCommit.reject(Error('fixture storage/query failure'));await tick();});},
    update:async()=>{await act(async()=>renderer.update(element()));},
    unmount:async()=>{await act(async()=>renderer.unmount());},
  };
}
async function call(f, data=payload) {let promise;await act(async()=>{promise=f.api().call(data);});return {promise};}
async function scenarios() {
  let f=await fixture();
  check('login starts idle',f.api().isLoading,false);
  await act(async()=>f.button().props.onPress());
  check('empty RHF form does not submit HTTP',f.requests.length,0);
  check('empty email has schema error',f.form().getFieldState('email').error?.message,'Email tidak boleh kosong');
  await f.type('email','invalid');await f.type('password','short');
  await act(async()=>f.button().props.onPress());
  check('invalid values do not submit HTTP',f.requests.length,0);
  check('invalid email retains schema validation',f.form().getFieldState('email').error?.message,'Email tidak valid');
  check('short password retains schema validation',f.form().getFieldState('password').error?.message,'Password minimal 8 karakter');
  await f.type('email',payload.email);await f.type('password',payload.password);
  let clicks;
  await act(async()=>{const press=f.button().props.onPress;clicks=[press(),press()];await tick();});
  check('two rapid valid button presses create one login request',f.requests.length,1);
  check('transport uses existing login endpoint',f.requests[0].url,'/login');
  check('transport preserves submitted payload',f.requests[0].data,payload);
  check('pending request disables Masuk',f.button().props.isDisabled,true);
  for(let i=0;i<f.requests.length;i++)await f.reply(i,fail());
  await act(async()=>Promise.all(clicks));
  check('failed attempt restores button',f.button().props.isDisabled,false);
  check('failed attempt preserves email',f.form().getValues('email'),payload.email);
  check('failed attempt preserves password',f.form().getValues('password'),payload.password);
  await f.unmount();

  f=await fixture();const early=f.api().call;
  let promises;await act(async()=>{promises=[early(payload),early(payload)];});
  check('retained callback also prevents concurrent POSTs',f.requests.length,1);
  await f.update();let duplicate;await act(async()=>{duplicate=f.api().call(payload);});
  check('rerender cannot bypass pending login lock',f.requests.length,1);
  // Baseline is allowed to finish every dispatched request; no request is held.
  for(let i=0;i<f.requests.length;i++)await f.reply(i,fail());
  await act(async()=>Promise.all([...promises,duplicate]));await f.unmount();

  f=await fixture();let attempt=await call(f), settled=false;
  attempt.promise.then(()=>{settled=true;});
  await f.reply(0,success);
  check('successful transport updates auth once',f.tokenCommits.length,1);
  check('loading remains active while auth commit is pending',f.api().isLoading,true);
  check('call remains pending until auth commit finishes',settled,false);
  check('button remains disabled while auth commit is pending',f.button().props.isDisabled,true);
  let duringCommit;await act(async()=>{duringCommit=f.api().call(payload);});
  check('pending auth commit prevents a second login request',f.requests.length,1);
  if(f.requests.length>1)await f.reply(1,fail());
  await f.commit();let result;await act(async()=>{result=await attempt.promise;await duringCommit;});
  check('success preserves response tuple',result,[success.data,null]);
  check('loading ends after auth commit',f.api().isLoading,false);
  await f.unmount();

  const errorCases=[
    [fail(), 'Email atau password salah'],
    [fail(401,{attempts:1,max_attempts:5}), 'Email atau password salah'],
    [fail(401,{attempts:3,max_attempts:5}), 'Email atau password salah (2 percobaan lagi)'],
    [fail(401,{attempts:5,max_attempts:5}), 'Terlalu banyak percobaan masuk. Coba lagi nanti.'],
    [fail(401,{attempts:'invalid',max_attempts:5}), 'Email atau password salah'],
    [fail(429,{seconds:42}), 'Terlalu banyak percobaan masuk. Coba lagi dalam 42 detik.'],
    [fail(429,{}), 'Terlalu banyak percobaan masuk. Coba lagi nanti.'],
    [fail(500), 'Terdapat kesalahan. Silakan coba lagi.'],
  ];
  for(const [index,[response,message]]of errorCases.entries()){
    f=await fixture();attempt=await call(f);await f.reply(0,response);
    await act(async()=>{result=await attempt.promise;});
    check(`error ${index}: backend message retained`,f.form().getFieldState('email').error?.message,message);
    check(`error ${index}: response tuple retained`,result,[null,response]);
    check(`error ${index}: loading released for retry`,f.api().isLoading,false);
    const retry=await call(f);check(`error ${index}: retry dispatches once`,f.requests.length,2);
    await f.reply(1,fail());await act(async()=>retry.promise);await f.unmount();
  }

  f=await fixture();attempt=await call(f);await f.unmount();await f.reply(0,success);
  check('successful response after unmount does not begin auth commit',f.tokenCommits.length,0);
  await f.commit();await act(async()=>attempt.promise);

  f=await fixture();const retained=f.api().call;await f.unmount();
  let afterUnmount;await act(async()=>{afterUnmount=retained(payload);});
  check('retained submit after unmount does not dispatch HTTP',f.requests.length,0);
  if(f.requests.length)await f.reply(0,fail());await act(async()=>afterUnmount);
  check('retained submit after unmount does not write errors',f.errorWrites.length,0);

  f=await fixture();attempt=await call(f);await f.unmount();await f.reply(0,fail(429,{seconds:42}));await act(async()=>attempt.promise);
  check('failed response after unmount does not mutate old form',f.errorWrites.length,0);

  const old=await fixture();const oldAttempt=await call(old);await old.unmount();
  const current=await fixture();const newAttempt=await call(current);
  await old.reply(0,success);
  check('old screen response cannot commit alongside new login',old.tokenCommits.length,0);
  check('new screen keeps independent request pending',current.api().isLoading,true);
  await old.commit();await act(async()=>oldAttempt.promise);
  await current.reply(0,success);await current.commit();await act(async()=>newAttempt.promise);
  check('current screen commits its own token once',current.tokenCommits.length,1);await current.unmount();

  f=await fixture();attempt=await call(f);await f.reply(0,success);await f.rejectCommit();await tick();
  await act(async()=>attempt.promise);
  check('auth commit failure is shown on form',f.form().getFieldState('email').error?.message,'Terdapat kesalahan. Silakan coba lagi.');
  check('auth commit failure releases loading',f.api().isLoading,false);
  check('auth commit failure has no unhandled rejection',unhandledRejections,[]);
  const retry=await call(f);check('auth commit failure allows retry',f.requests.length,2);
  await f.reply(1,fail());await act(async()=>retry.promise);await f.unmount();

  f=await fixture();attempt=await call(f);await f.rejectRequest(0);await act(async()=>{result=await attempt.promise;});
  check('unexpected transport exception has generic form error',f.form().getFieldState('email').error?.message,'Terdapat kesalahan. Silakan coba lagi.');
  check('unexpected transport exception releases loading',f.api().isLoading,false);await f.unmount();

  f=await fixture();attempt=await call(f);await f.reply(0,success);await f.unmount();await f.rejectCommit();await act(async()=>attempt.promise);
  check('auth commit begun before unmount may finish without writing old form',f.errorWrites.length,0);
  check('auth commit rejection after unmount is still handled',unhandledRejections,[]);

  f=await fixture({strict:true});let strictCalls;
  await act(async()=>{const submit=f.api().call;strictCalls=[submit(payload),submit(payload)];});
  check('StrictMode effect replay keeps login active and locked',f.requests.length,1);
  for(let i=0;i<f.requests.length;i++)await f.reply(i,success);
  check('StrictMode keeps loading until auth commit',f.api().isLoading,true);
  await f.commit();await act(async()=>Promise.all(strictCalls));
  check('StrictMode produces one token commit',f.tokenCommits.length,1);await f.unmount();

  f=await fixture();await act(async()=>f.forgot().props.onPress());
  check('production screen retains forgot-password route',f.routes,['/(onboarding)/forgot-password']);await f.unmount();
  check('no runtime errors or act warnings',runtimeErrors,[]);
}
(async()=>{
  await scenarios();
  const result={ticket:'SD5-003',baseline,baselineRef:baseline?baselineRef:null,sources,checks,runtimeErrors,unhandledRejections,passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length};
  fs.writeFileSync(`${folder}/${baseline?'baseline':'final'}-results.json`,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,runtimeErrors,unhandledRejections,failures:checks.filter(item=>!item.passed)}));
  if(result.failed)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{
  console.error=originalError;process.removeListener('unhandledRejection',onUnhandled);
});
