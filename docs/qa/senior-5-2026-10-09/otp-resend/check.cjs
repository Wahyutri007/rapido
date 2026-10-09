// Real OTP screen/store/request/factory/Common/Query/Axios; native hosts/router/clock and memory HTTP only.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const toolRoot = path.resolve(process.env.RAPIDO_TEST_TOOLS || '.expo/senior7-test-tools/node_modules');
const React = require(path.join(toolRoot,'react'));
require.cache[require.resolve('react')] = {id:require.resolve('react'),filename:require.resolve('react'),loaded:true,exports:React};
const {act,create} = require(path.join(toolRoot,'react-test-renderer'));
const query = require('@tanstack/react-query');
const axiosLibrary = require('axios');
const baseline = process.argv.includes('--baseline');
const sources={},checks=[],errors=[],unhandledRejections=[],actionRejections=[];
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const originalError=console.error;
console.error=(...args)=>{if(String(args[0]).includes('react-test-renderer is deprecated'))return;errors.push(args.map(String).join(' '));originalError(...args);};
const onUnhandled=error=>unhandledRejections.push(String(error));
process.on('unhandledRejection',onUnhandled);
function check(name,actual,expected){const copy=value=>value===undefined?null:JSON.parse(JSON.stringify(value));try{assert.deepEqual(copy(actual),copy(expected));checks.push({name,passed:true});}catch{checks.push({name,passed:false,actual:copy(actual),expected:copy(expected)});}}
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
const pause=()=>new Promise(resolve=>setTimeout(resolve,10));
const host=(...names)=>Object.fromEntries(names.map(name=>[name,name]));
const defaultHost=name=>({__esModule:true,default:name});
const payload={name:'Fixture Owner',email:'otp@example.test',phone:'081200000000',password:'FixtureOnly123!',tnc:true};
const response=(token='fixture-initial')=>({otp:{code:1234,purpose:'register',phone:payload.phone,token,expires_at:'2026-10-09T02:00:00Z',extra_data:{name:payload.name,email:payload.email,phone:payload.phone},id:token,updated_at:'2026-10-09T01:00:00Z',created_at:'2026-10-09T01:00:00Z'},registration:{current_step:1,message:'Fixture',attempts:0,max_attempts:5}});
const success=data=>({success:true,status:200,message:'Fixture response',data});
const fail=(status,errors)=>({success:false,status,message:'Fixture failure',errors});
async function fixture(options={}){
  const requests=[],routes=[],alerts=[],logs=[],verifyWrites=[],loaded=new Map(),timers=new Map();
  let renderer,visible=true,now=100000,nextTimer=0;
  const client=new query.QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,gcTime:Infinity}}});
  const router={back:()=>routes.push('back'),replace:route=>routes.push(route),push:route=>routes.push(route)};
  class FixtureDate extends Date {static now(){return now;}}
  const transport=axiosLibrary.create({adapter:async config=>{
    const wait=deferred();requests.push({url:config.url,method:config.method,data:typeof config.data==='string'?JSON.parse(config.data):config.data,wait,done:false});
    const body=await wait.promise;
    if(body.networkError)throw new axiosLibrary.AxiosError('Network Error','ERR_NETWORK',config);
    const result={data:body.data,status:body.status,statusText:body.status===200?'OK':'Error',headers:{},config};
    if(body.status>=400)throw new axiosLibrary.AxiosError('Fixture HTTP rejection','ERR_BAD_RESPONSE',config,undefined,result);
    return result;
  }});
  function resolve(name,parent){const base=name.startsWith('@/')?name.slice(2):path.relative(process.cwd(),path.resolve(path.dirname(parent),name)).replaceAll('\\','/');return[base,base+'.ts',base+'.tsx',base+'/index.ts',base+'/index.tsx'].find(file=>fs.existsSync(file));}
  function load(file){
    if(loaded.has(file))return loaded.get(file).exports;
    const tested=baseline&&file==='app/(onboarding)/otp.tsx'?path.join(__dirname,'before/otp.tsx.txt'):file;
    const bytes=fs.readFileSync(tested);sources[file]=crypto.createHash('sha256').update(bytes).digest('hex');
    const code=ts.transpileModule(bytes.toString('utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
    const module={exports:{}};loaded.set(file,module);
    const request=name=>{
      if(name==='react')return React;
      if(name==='react-native')return{...host('View','Pressable','ScrollView','KeyboardAvoidingView','RefreshControl'),Platform:{OS:'web'}};
      if(name==='react-native-otp-entry')return host('OtpInput');
      if(name==='expo-router')return{useRouter:()=>router,useLocalSearchParams:()=>({})};
      if((name==='./axios'&&file==='api/common.ts')||(name==='../axios'&&file==='api/queries/registration.ts'))return{axios:transport};
      if(name==='@/components/common/Text')return defaultHost('Text');
      if(name==='@/components/ui/button')return host('Button','ButtonText','ButtonGroup');
      if(name==='@/lib/utils')return{cn:(...items)=>items.filter(Boolean).join(' ')};
      if(name==='@/lib/haptics')return{haptic:{light:()=>{}}};
      if(/\.(ttf|otf)$/.test(name))return name;
      if(name.startsWith('@/')||name.startsWith('.')){const target=resolve(name,file);if(!target)throw Error('Unmapped '+name+' from '+file);return load(target);}
      return require(name);
    };
    vm.runInNewContext(code,{module,exports:module.exports,require:request,console:{...console,log:(...args)=>logs.push(args)},alert:message=>alerts.push(message),Date:FixtureDate,URLSearchParams,setTimeout,clearTimeout,setInterval:callback=>{const id=++nextTimer;timers.set(id,callback);return id;},clearInterval:id=>timers.delete(id)},{filename:path.resolve(file)});
    return module.exports;
  }
  const otp=load('store/otp.ts').useOtpState;
  const originalSet=otp.getState().setVerifyResponse;
  const initial=response();
  otp.setState({personalInfo:options.missingInfo?null:payload,verifyResponse:options.missingResponse?null:initial,setVerifyResponse:data=>{verifyWrites.push(data);originalSet(data);}});
  const Screen=load('app/(onboarding)/otp.tsx').default;
  function App(){return React.createElement(query.QueryClientProvider,{client},visible?React.createElement(Screen):null);}
  const element=()=>options.strict?React.createElement(React.StrictMode,null,React.createElement(App)):React.createElement(App);
  await act(async()=>{renderer=create(element());await pause();});
  const update=async()=>{await act(async()=>{renderer.update(element());await pause();});};
  const pressable=()=>renderer.root.findAllByType('Pressable')[0];
  const button=()=>renderer.root.findAllByType('Button')[0];
  const input=()=>renderer.root.findAllByType('OtpInput')[0];
  const text=()=>renderer.root.findAllByType('Text').map(node=>node.children.join('')).join(' ');
  const invoke=fn=>{try{return Promise.resolve(fn()).catch(error=>{actionRejections.push(String(error));});}catch(error){actionRejections.push(String(error));return Promise.resolve();}};
  return{
    requests,routes,alerts,logs,verifyWrites,initial,pressable,button,input,text,timers,
    state:()=>otp.getState(),render:()=>renderer.toJSON(),
    send:async(twice=false)=>{let pending;await act(async()=>{const action=pressable().props.onPress;pending=(twice?[action,action]:[action]).map(fn=>invoke(fn));await pause();});return{pending};},
    savedPress:()=>pressable()?.props.onPress,
    invokeSaved:async fn=>{let pending;await act(async()=>{pending=[invoke(fn)];await pause();});return{pending};},
    reply:async(data,status=200,index,networkError=false)=>{await act(async()=>{for(const[i,item]of requests.entries())if(!item.done&&(index===undefined||i===index)){item.done=true;item.wait.resolve({data,status,networkError});}await pause();});},
    inputCode:async text=>{await act(async()=>{input().props.onTextChange(text);await pause();});},
    login:async()=>{await act(async()=>{button().props.onPress();await pause();});},
    advance:async seconds=>{await act(async()=>{now+=seconds*1000;for(const fn of [...timers.values()])fn();await pause();});},
    setSession:async(info,verified)=>{await act(async()=>{otp.setState({personalInfo:info,verifyResponse:verified});await pause();});},
    update,hide:async()=>{visible=false;await update();},show:async()=>{visible=true;await update();},
    dispose:async()=>{await act(async()=>{renderer.unmount();client.clear();await pause();});},
  };
}
const complete=async attempt=>{await act(async()=>{await Promise.all(attempt.pending);});};
async function scenarios(){
  let f=await fixture();check('valid session has no initial alert or redirect',[f.alerts,f.routes],[[],[]]);check('no OTP response is logged',f.logs.length,0);
  check('shared scroll/keyboard Wrapper used',[Boolean(f.render()&&JSON.stringify(f.render()).includes('KeyboardAvoidingView')),Boolean(f.render()&&JSON.stringify(f.render()).includes('ScrollView'))],[true,true]);
  const first=await f.send(true);check('double press sends one POST',f.requests.length,1);check('pending resend disabled',f.pressable().props.disabled,true);
  check('existing endpoint/method/payload',[f.requests[0].url.replace(/^\//,''),f.requests[0].method,f.requests[0].data],['register/start','post',payload]);
  const sent=response('fixture-sent');await f.reply(success(sent));await complete(first);
  check('success feedback once',f.alerts,['Kode verifikasi telah dikirim ulang ke email-mu.']);check('success writes OTP once',f.verifyWrites,[sent]);check('success leaves personal info intact',f.state().personalInfo,payload);check('resend never logs in or navigates',f.routes,[]);check('success unlocks resend',Boolean(f.pressable().props.disabled),false);await f.dispose();

  for(const[label,status,body,expected]of[
    ['500',500,fail(500,'offline'),'Gagal mengirim ulang kode. Silakan coba lagi.'],
    ['422',422,fail(422,{email:['Fixture invalid']}),'Gagal mengirim ulang kode. Silakan coba lagi.'],
    ['429 missing',429,fail(429,{}),'Terlalu banyak percobaan mengirim ulang kode. Silakan coba lagi nanti.'],
    ['429 string',429,fail(429,{seconds:'30'}),'Terlalu banyak percobaan mengirim ulang kode. Silakan coba lagi nanti.'],
    ['429 negative',429,fail(429,{seconds:-2}),'Terlalu banyak percobaan mengirim ulang kode. Silakan coba lagi nanti.'],
    ['429 zero',429,fail(429,{seconds:0}),'Terlalu banyak percobaan mengirim ulang kode. Silakan coba lagi nanti.'],
    ['429 infinite',429,fail(429,{seconds:Infinity}),'Terlalu banyak percobaan mengirim ulang kode. Silakan coba lagi nanti.'],
    ['429 overflowing',429,fail(429,{seconds:Number.MAX_VALUE}),'Terlalu banyak percobaan mengirim ulang kode. Silakan coba lagi nanti.'],
  ]){
    f=await fixture();const pending=await f.send();await f.reply(body,status);await complete(pending);
    check(`${label}: one meaningful feedback`,f.alerts,[expected]);check(`${label}: keeps OTP/no redirect`,[f.state().verifyResponse,f.verifyWrites,f.routes],[f.initial,[],[]]);
    check(`${label}: no invented cooldown`,f.timers.size,0);const retry=await f.send();check(`${label}: retry reaches transport`,f.requests.length,2);await f.reply(success(response('fixture-retry')));await complete(retry);check(`${label}: retry feedback once`,f.alerts.length,2);await f.dispose();
  }
  f=await fixture();const offline=await f.send();await f.reply(null,500,undefined,true);await complete(offline);check('network error feedback once',f.alerts,['Gagal mengirim ulang kode. Silakan coba lagi.']);check('network failure preserves OTP',f.state().verifyResponse,f.initial);await f.dispose();
  f=await fixture();const empty=await f.send();await f.reply(success(null));await complete(empty);check('empty success response shows one failure',f.alerts,['Gagal mengirim ulang kode. Silakan coba lagi.']);check('empty success keeps previous session',f.state().verifyResponse,f.initial);await f.dispose();

  for(const seconds of [3,1.2]){
    f=await fixture();const limited=await f.send();await f.reply(fail(429,{seconds}),429);await complete(limited);
    const rounded=Math.ceil(seconds);
    check(`429 ${seconds}: feedback once`,f.alerts,[`Terlalu banyak percobaan mengirim ulang kode. Coba lagi dalam ${rounded} detik.`]);
    check(`429 ${seconds}: button shows countdown and disabled`,[f.text().includes(`Kirim ulang (${rounded} dtk)`),Boolean(f.pressable().props.disabled)],[true,true]);
    const blocked=await f.send(true);check(`429 ${seconds}: direct callbacks cannot bypass cooldown`,f.requests.length,1);await f.reply(fail(429,{seconds}),429);await complete(blocked);
    await f.advance(seconds/2);check(`429 ${seconds}: countdown remains disabled`,Boolean(f.pressable().props.disabled),true);
    await f.advance(seconds/2);check(`429 ${seconds}: deadline unlocks`,[Boolean(f.pressable().props.disabled),f.timers.size],[false,0]);
    const retry=await f.send();check(`429 ${seconds}: retry sends new POST`,f.requests.length,2);await f.reply(success(response('fixture-after-cooldown')));await complete(retry);await f.dispose();
  }
  f=await fixture();const cooldown=await f.send();await f.reply(fail(429,{seconds:3}),429);await complete(cooldown);await f.hide();check('cooldown timer canceled on unmount',f.timers.size,0);await f.advance(4);check('no extra cooldown alert after unmount',f.alerts.length,1);await f.dispose();

  for(const status of [200,429,500]){
    f=await fixture();const old=await f.send();const oldAction=f.savedPress();await f.hide();await f.reply(status===200?success(response('fixture-late')):fail(status,{seconds:30}),status);await complete(old);
    check(`unmount ${status}: no late feedback/store write/routes`,[f.alerts,f.verifyWrites,f.routes],[[],[],[]]);const blocked=await f.invokeSaved(oldAction);check(`unmount ${status}: old callback does not post`,f.requests.length,1);await f.reply(fail(500,'fixture cleanup'),500);await complete(blocked);await f.dispose();
  }
  for(const status of [200,429]){
    f=await fixture();await f.inputCode('1234');const old=await f.send();const oldAction=f.savedPress();const nextPayload={...payload,email:'next-otp@example.test'},nextResponse=response('fixture-next-session');
    await f.setSession(nextPayload,nextResponse);check(`session swap ${status}: clears entered code`,Boolean(f.button().props.isDisabled),true);check(`session swap ${status}: new resend available`,Boolean(f.pressable().props.disabled),false);
    const next=await f.send();check(`session swap ${status}: new payload`,f.requests[1]?.data,nextPayload);
    await f.reply(status===200?success(response('fixture-old-result')):fail(status,{seconds:10}),status,0);await complete(old);
    check(`session swap ${status}: ignores old result`,[f.state().verifyResponse,f.alerts,f.verifyWrites],[nextResponse,[],[]]);
    check(`session swap ${status}: old response cannot unlock new request`,Boolean(f.pressable().props.disabled),true);
    const blocked=await f.invokeSaved(oldAction);check(`session swap ${status}: saved old callback ignored`,f.requests.length,2);for(let i=2;i<f.requests.length;i++)await f.reply(fail(500,'fixture cleanup'),500,i);await complete(blocked);
    const newResult=response('fixture-new-result');await f.reply(success(newResult),200,1);await complete(next);check(`session swap ${status}: current response alone commits`,[f.state().verifyResponse,f.alerts.length,f.verifyWrites.length],[newResult,1,1]);await f.dispose();
  }
  f=await fixture();await f.inputCode('1234');await f.update();check('same session rerender keeps entered code',Boolean(f.button().props.isDisabled),false);await f.login();check('complete OTP has explicit unavailable feedback',f.alerts,['Verifikasi kode belum tersedia. Silakan coba lagi nanti.']);check('complete OTP does not fake login/navigation',f.routes,[]);check('entered code/response never logged',f.logs.length,0);await f.dispose();
  f=await fixture();check('incomplete OTP disables Masuk',Boolean(f.button().props.isDisabled),true);await f.login();check('direct incomplete callback asks for code',f.alerts,['Masukkan kode verifikasi']);await f.dispose();

  for(const missing of ['missingResponse','missingInfo']){
    f=await fixture({[missing]:true,strict:true});check(`${missing}: invalid session returns once`,[f.alerts,f.routes],[['Terjadi kesalahan. Silakan coba lagi.'],['back']]);check(`${missing}: no actionable resend`,Boolean(f.pressable()),false);await f.update();check(`${missing}: rerender does not repeat redirect`,f.routes.length,1);await f.dispose();
  }
  f=await fixture({strict:true});const strict=await f.send(true);await f.reply(success(response('fixture-strict')));await complete(strict);check('StrictMode one POST/feedback/write',[f.requests.length,f.alerts.length,f.verifyWrites.length],[1,1,1]);await f.dispose();
}
(async()=>{
  await scenarios();check('no runtime/React/act errors',errors,[]);check('no unhandled rejections',unhandledRejections,[]);check('no rejected UI action promises',actionRejections,[]);
  const result={developer:'Software Developer Senior 5 / Codex-5',ticket:'SD5-007',baseline,sources,checks,errors,unhandledRejections,actionRejections,passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length};
  fs.writeFileSync(path.join(__dirname,baseline?'baseline-results.json':'final-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,unhandledRejections,actionRejections,failures:checks.filter(item=>!item.passed)}));process.exitCode=result.failed||errors.length||unhandledRejections.length||actionRejections.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;process.removeListener('unhandledRejection',onUnhandled);});
