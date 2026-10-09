// Production registration sheet/hook/Form/factory/Common/Query/Axios/OTP store; memory IO and native host adapters.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const toolRoot = path.resolve(process.env.RAPIDO_TEST_TOOLS || '.expo/senior7-test-tools/node_modules');
const React = require(path.join(toolRoot, 'react'));
require.cache[require.resolve('react')] = { id: require.resolve('react'), filename: require.resolve('react'), loaded: true, exports: React };
const {act,create} = require(path.join(toolRoot, 'react-test-renderer'));
const RHF = require('react-hook-form');
const {zodResolver} = require('@hookform/resolvers/zod');
const query = require('@tanstack/react-query');
const axiosLibrary = require('axios');
const baseline = process.argv.includes('--baseline');
const sources = {}, checks = [], errors = [], unhandledRejections = [], actionRejections = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalError = console.error;
console.error = (...args) => { if(String(args[0]).includes('react-test-renderer is deprecated')) return; errors.push(args.map(String).join(' ')); originalError(...args); };
const onUnhandled = error => unhandledRejections.push(String(error));
process.on('unhandledRejection', onUnhandled);
function check(name, actual, expected) { const copy = value => value === undefined ? null : JSON.parse(JSON.stringify(value)); try {assert.deepEqual(copy(actual), copy(expected)); checks.push({name,passed:true});} catch { checks.push({name,passed:false,actual:copy(actual),expected:copy(expected)}); } }
const deferred = () => {let resolve,reject; const promise = new Promise((yes,no)=>{resolve=yes;reject=no;}); return {promise,resolve,reject};};
const pause = () => new Promise(resolve => setTimeout(resolve, 15));
const host = (...names) => Object.fromEntries(names.map(name=>[name,name]));
const defaultHost = name => ({__esModule:true,default:name});
const payload = {name:'Fixture Owner',email:'registration@example.test',phone:'081200000000',password:'FixtureOnly123!',tnc:true};
const verified = {otp:{code:1234,purpose:'register',phone:payload.phone,token:'fixture-otp-token',expires_at:'2026-10-09T02:00:00Z',extra_data:{name:payload.name,email:payload.email,phone:payload.phone},id:'fixture-otp',updated_at:'2026-10-09T01:00:00Z',created_at:'2026-10-09T01:00:00Z'},registration:{current_step:1,message:'Fixture',attempts:0,max_attempts:5}};
const success = data => ({success:true,status:200,message:'Fixture response',data});
async function fixture(options={}) {
  const requests=[],routes=[],closeWrites=[],errorWrites=[],loaded=new Map();
  let renderer,form,requestApi,visible=true,open=options.open ?? true;
  const client = new query.QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,gcTime:Infinity}}});
  const transport = axiosLibrary.create({adapter:async config=>{
    const wait=deferred(); const data=typeof config.data==='string'?JSON.parse(config.data):config.data;
    requests.push({url:config.url,method:config.method,data,wait,done:false});
    const body=await wait.promise;
    const result={data:body.data,status:body.status,statusText:body.status===200?'OK':'Error',headers:{},config};
    if(body.status>=400) throw new axiosLibrary.AxiosError('Fixture HTTP rejection','ERR_BAD_RESPONSE',config,undefined,result);
    return result;
  }});
  function resolve(name,parent){const base=name.startsWith('@/')?name.slice(2):path.relative(process.cwd(),path.resolve(path.dirname(parent),name)).replaceAll('\\','/');return [base,base+'.ts',base+'.tsx',base+'/index.ts'].find(file=>fs.existsSync(file));}
  function load(file){
    if(loaded.has(file))return loaded.get(file).exports;
    const scoped=['api/hooks/registration.ts','components/feature/register/wizard/PersonalInfoAction.tsx'];
    const tested=baseline&&scoped.includes(file)?path.join(__dirname,'before',file.split('/').at(-1)+'.txt'):file;
    const bytes=fs.readFileSync(tested); sources[file]=crypto.createHash('sha256').update(bytes).digest('hex');
    const code=ts.transpileModule(bytes.toString('utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
    const module={exports:{}};loaded.set(file,module);
    const request=name=>{
      if(name==='react')return React;
      if(name==='react-native')return {...host('View','Image','Pressable'),Platform:{OS:'web'}};
      if(name==='expo-router')return {useRouter:()=>({push:route=>routes.push(route)}),Link:'Link',router:{push:route=>routes.push(route)}};
      if(name==='./axios'&&file==='api/common.ts')return {axios:transport};
      if(name==='@/api/hooks/registration'&&file.startsWith('components/feature/')){const actual=load('api/hooks/registration.ts');return {...actual,useRegistrationStartRequest:methods=>{requestApi=actual.useRegistrationStartRequest(methods);return requestApi;}};}
      const uiName=name.match(/(?:^|\/)ui\/([^/]+)$/)?.[1];
      const ui={input:host('Input','InputField','InputIcon'),button:host('Button','ButtonText','ButtonGroup'),checkbox:host('Checkbox','CheckboxGroup','CheckboxIcon','CheckboxIndicator','CheckboxLabel'),radio:host('Radio','RadioGroup','RadioCircleIndicator','RadioLabel'),actionsheet:{...host('ActionsheetBackdrop','ActionsheetContent'),Actionsheet:props=>React.createElement('Actionsheet',props,props.isOpen?props.children:null)}};
      if(uiName&&ui[uiName])return ui[uiName];
      if(name==='@/components/common/Text'||name==='./Text')return defaultHost('Text');
      if(name==='@/components/icons')return host('EFeather');
      if(name==='@expo/vector-icons/Entypo')return defaultHost('Entypo');
      if(name==='@react-native-community/datetimepicker'||name==='expo-document-picker')return {};
      if(name==='@/lib/utils')return {cn:(...items)=>items.filter(Boolean).join(' '),tw:value=>value*4};
      if(name.includes('SingleSelect'))return defaultHost('SingleSelect');
      if(name.includes('icons/camera'))return defaultHost('CameraIcon');
      if(name.startsWith('@/')||name.startsWith('.')){const target=resolve(name,file);if(!target)throw Error('Unmapped '+name+' from '+file);return load(target);}
      return require(name);
    };
    vm.runInNewContext(code,{module,exports:module.exports,require:request,console,Date,setTimeout,clearTimeout},{filename:path.resolve(file)});
    return module.exports;
  }
  const Sheet=load('components/feature/register/wizard/PersonalInfoAction.tsx').default;
  const Form=load('components/common/Form.tsx');
  const schema=load('schema/registration.ts');
  const otp=load('store/otp.ts').useOtpState;
  function Content(){
    form=RHF.useForm({resolver:zodResolver(schema.personalInfoSchema),defaultValues:{name:'',email:'',phone:'',password:'',tnc:false},mode:'onChange'});
    const wrapped=React.useRef(false);
    React.useEffect(()=>{if(!wrapped.current){const original=form.setError;form.setError=(...args)=>{errorWrites.push(args);return original(...args);};wrapped.current=true;}},[form]);
    return React.createElement(React.Fragment,null,
      React.createElement(Form.Form,form,['name','email','phone','password'].map(name=>React.createElement(Form.FormField,{key:name,name,control:form.control,render:()=>React.createElement(Form.FormItem,null,React.createElement(Form.FormControl,null,React.createElement(Form.FormInput,{placeholder:name})),React.createElement(Form.FormMessage))}))),
      React.createElement(Sheet,{state:[open,next=>{open=next;closeWrites.push(next);setOpenVersion(v=>v+1);}],form}));
  }
  let setOpenVersion;
  function App(){const [,setVersion]=React.useState(0);setOpenVersion=setVersion;return React.createElement(query.QueryClientProvider,{client},visible?React.createElement(Content):null);}
  const element=()=>options.strict?React.createElement(React.StrictMode,null,React.createElement(App)):React.createElement(App);
  await act(async()=>{renderer=create(element());await pause();});
  const update=async()=>{await act(async()=>{renderer.update(element());await pause();});};
  const button=text=>renderer.root.findAllByType('Button').find(node=>node.findAllByType('ButtonText').some(label=>label.children.includes(text)));
  return {
    requests,routes,closeWrites,errorWrites,form:()=>form,api:()=>requestApi,otp:()=>JSON.parse(JSON.stringify(otp.getState())),open:()=>open,button,
    messages:()=>renderer.root.findAllByType('Text').filter(node=>node.props.id?.endsWith('-form-item-message')).map(node=>node.children.join('')),
    fill:async()=>{await act(async()=>{for(const [name,value]of Object.entries(payload))form.setValue(name,value);await pause();});},
    input:async(name,value)=>{await act(async()=>{renderer.root.findAllByType('InputField').find(node=>node.props.placeholder===name).props.onChangeText(value);await pause();});},
    send:async(twice=false)=>{let pending;await act(async()=>{const press=button('Kirim').props.onPress;pending=(twice?[press(),press()]:[press()]).map(promise=>Promise.resolve(promise).catch(error=>{actionRejections.push(String(error));}));await pause();});return {pending};},
    reply:async(data,status=200,index)=>{await act(async()=>{for(const [i,item]of requests.entries())if(!item.done&&(index===undefined||i===index)){item.done=true;item.wait.resolve({data,status});}await pause();});},
    dismiss:async()=>{await act(async()=>{button('Perbaiki').props.onPress();await pause();});},
    backdrop:async()=>{await act(async()=>{renderer.root.findByType('Actionsheet').props.onClose();await pause();});},
    reopen:async()=>{open=true;await update();}, closeExternal:async()=>{open=false;await update();}, hide:async()=>{visible=false;await update();},
    flush:async()=>{await act(async()=>{await pause();});},
    dispose:async()=>{await act(async()=>{renderer.unmount();client.clear();await pause();});},
  };
}
async function complete(attempt){await act(async()=>{await Promise.all(attempt.pending);});}
async function scenarios(){
  let f=await fixture();await f.fill();const first=await f.send(true);
  check('two send callbacks: one registration POST',f.requests.length,1);
  check('registration transport endpoint/payload',f.requests[0]&&[f.requests[0].method,f.requests[0].url,f.requests[0].data],['post','/register/start',payload]);
  check('pending submission disables send',f.button('Kirim').props.isDisabled,true);
  check('blocked second submission does not dismiss pending sheet',f.open(),true);
  await f.reply(success(verified));await complete(first);
  check('success navigates to OTP once',f.routes,['/(onboarding)/otp']);
  check('success closes sheet once',f.closeWrites,[false]);
  check('success stores submitted personal info',f.otp().personalInfo,payload);
  check('success stores OTP response',f.otp().verifyResponse,verified);
  check('success stores registration type',f.otp().type,'register');
  await f.dispose();

  for(const [label,status,body,expected]of [
    ['429 cooldown',429,{errors:{seconds:30}},'Terlalu banyak percobaan pendaftaran. Coba lagi dalam 30 detik.'],
    ['429 missing seconds',429,{errors:{}},'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.'],
    ['429 invalid seconds',429,{errors:{seconds:'unexpected'}},'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.'],
    ['429 negative seconds',429,{errors:{seconds:-2}},'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.'],
    ['500 generic',500,{errors:'offline'},'Terjadi kesalahan. Silakan coba lagi.'],
    ['422 malformed errors',422,{errors:null},'Terjadi kesalahan. Silakan coba lagi.'],
    ['422 malformed entry',422,{errors:{email:'invalid-shape'}},'Terjadi kesalahan. Silakan coba lagi.'],
    ['422 empty errors',422,{errors:{}},'Terjadi kesalahan. Silakan coba lagi.'],
  ]){
    f=await fixture();await f.fill();const failed=await f.send();await f.reply({success:false,message:'Fixture failure',...body},status);await complete(failed);await f.flush();
    check(`${label}: expected message`,f.form().getFieldState('email').error?.message,expected);
    check(`${label}: FormMessage renders error`,f.messages().includes(expected),true);
    check(`${label}: no navigation or OTP mutation`,[f.routes,f.otp().personalInfo,f.otp().verifyResponse],[[],null,null]);
    check(`${label}: credentials retained`,f.form().getValues(),payload);
    await f.reopen();check(`${label}: retry button available`,Boolean(f.button('Kirim').props.isDisabled),false);
    const retry=await f.send();check(`${label}: retry sends one new POST`,f.requests.length,2);
    await f.reply(success(verified));await complete(retry);check(`${label}: retry navigates once`,f.routes,['/(onboarding)/otp']);await f.dispose();
  }

  f=await fixture();await f.fill();const validation=await f.send();
  await f.reply({success:false,message:'Fixture validation',errors:{email:['Email sudah dipakai','Coba email lain'],phone:['Nomor tidak valid']}},422);await complete(validation);await f.flush();
  check('422: email array combined',f.form().getFieldState('email').error?.message,'Email sudah dipakai Coba email lain');
  check('422: phone field preserved',f.form().getFieldState('phone').error?.message,'Nomor tidak valid');
  check('422: actual FormMessages display both',f.messages().sort(),['Email sudah dipakai Coba email lain','Nomor tidak valid'].sort());
  check('422: no OTP navigation',f.routes,[]);await f.dispose();

  for(const close of ['dismiss','backdrop','closeExternal','hide']){
    f=await fixture();await f.fill();const pending=await f.send();const previous=JSON.stringify(f.otp());const beforeCloses=f.closeWrites.length;
    await f[close]();const closeCount=f.closeWrites.length;
    await f.reply(success(verified));await complete(pending);
    check(`${close}: late success causes no navigation`,f.routes,[]);
    check(`${close}: late success causes no OTP mutation`,JSON.stringify(f.otp()),previous);
    check(`${close}: late success causes no extra close`,f.closeWrites.length,closeCount);
    if(close==='dismiss'||close==='backdrop')check(`${close}: close works while request pending`,closeCount,beforeCloses+1);
    await f.dispose();
  }

  f=await fixture();await f.fill();const old=await f.send();await f.dismiss();await f.reopen();
  await f.input('email','new-registration@example.test');const current=await f.send();const newPayload={...payload,email:'new-registration@example.test'};
  check('reopen creates new submission for current draft',f.requests[1]?.data,newPayload);
  await f.reply({success:false,message:'old error',errors:{seconds:40}},429,0);await complete(old);
  check('reopen: stale failure writes no error',f.errorWrites.length,0);
  check('reopen: old result leaves new sheet open/busy',[f.open(),f.button('Kirim')?.props.isDisabled],[true,true]);
  await f.reply(success(verified),200,1);await complete(current);
  check('reopen: current result alone navigates',f.routes,['/(onboarding)/otp']);
  check('reopen: OTP state uses new submitted draft',f.otp().personalInfo,newPayload);await f.dispose();

  f=await fixture();await f.fill();const snapshot=await f.send();await f.input('email','changed-during-request@example.test');await f.reply(success(verified));await complete(snapshot);
  check('success uses sent payload even if form changed meanwhile',f.otp().personalInfo,payload);
  check('form changes remain intact after response',f.form().getValues().email,'changed-during-request@example.test');await f.dispose();

  f=await fixture({strict:true});await f.fill();const strict=await f.send(true);await f.reply(success(verified));await complete(strict);
  check('StrictMode: one POST and OTP navigation',[f.requests.length,f.routes],[1,['/(onboarding)/otp']]);await f.dispose();

  f=await fixture({open:false});await f.fill();check('closed sheet has no visible send button',Boolean(f.button('Kirim')),false);await f.reopen();check('closed -> open presents current email',f.form().getValues().email,payload.email);await f.dispose();
}
(async()=>{
  await scenarios();check('no runtime/React/act errors',errors,[]);check('no unhandled rejections',unhandledRejections,[]);check('no rejected UI action promises',actionRejections,[]);
  const result={developer:'Senior5 / Codex-5',ticket:'SD5-006',baseline,sources,checks,errors,unhandledRejections,actionRejections,passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length};
  fs.writeFileSync(path.join(__dirname,baseline?'baseline-results.json':'final-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,unhandledRejections,actionRejections,failures:checks.filter(item=>!item.passed)}));process.exitCode=result.failed||errors.length||unhandledRejections.length||actionRejections.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;process.removeListener('unhandledRejection',onUnhandled);});
