// Real registration hook/store/schema/parameter parser/Form/RHF/Zod; only router/native/presentation adapters.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const ts=require('typescript');
const toolRoot=path.resolve(process.env.RAPIDO_TEST_TOOLS||'.expo/senior7-test-tools/node_modules');
const React=require(path.join(toolRoot,'react'));
require.cache[require.resolve('react')]={id:require.resolve('react'),filename:require.resolve('react'),loaded:true,exports:React};
const {act,create}=require(path.join(toolRoot,'react-test-renderer'));
const baseline=process.argv.includes('--baseline');
const sources={},checks=[],errors=[],unhandledRejections=[];
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const originalError=console.error;
console.error=(...args)=>{if(String(args[0]).includes('react-test-renderer is deprecated'))return;errors.push(args.map(String).join(' '));originalError(...args);};
const onUnhandled=error=>unhandledRejections.push(String(error));process.on('unhandledRejection',onUnhandled);
function check(name,actual,expected){const copy=value=>value===undefined?null:JSON.parse(JSON.stringify(value));try{assert.deepEqual(copy(actual),copy(expected));checks.push({name,passed:true});}catch{checks.push({name,passed:false,actual:copy(actual),expected:copy(expected)});}}
const pause=()=>new Promise(resolve=>setTimeout(resolve,10));
const host=(...names)=>Object.fromEntries(names.map(name=>[name,name]));
const defaultHost=name=>({__esModule:true,default:name});
const personal={name:'Fixture Owner',email:'resume@example.test',phone:'081200000000',password:'FixtureOnly123!',tnc:true};
const bank={bankName:'Fixture bank',accountName:'Fixture Owner',accountNumber:'000000001'};
const password={password:'FixtureOnly123!',confirmPassword:'FixtureOnly123!'};
const emptyPersonal=accepted=>({name:'',email:'',phone:'',password:'',tnc:accepted});
const emptyBank={bankName:'',accountName:'',accountNumber:''};
const emptyPassword={password:'',confirmPassword:''};
async function fixture(options={}){
  const loaded=new Map(),routes=[],apis=[],consentWrites=[];
  let params=options.params||{},renderer,visible=true;
  function resolve(name,parent){const base=name.startsWith('@/')?name.slice(2):path.relative(process.cwd(),path.resolve(path.dirname(parent),name)).replaceAll('\\','/');return[base,base+'.ts',base+'.tsx',base+'/index.ts',base+'/index.tsx'].find(file=>fs.existsSync(file));}
  function load(file){
    if(loaded.has(file))return loaded.get(file).exports;
    const tested=baseline&&file==='hooks/useRegistrationForm.ts'?path.join(__dirname,'before/useRegistrationForm.ts.txt'):file;
    const bytes=fs.readFileSync(tested);sources[file]=crypto.createHash('sha256').update(bytes).digest('hex');
    const code=ts.transpileModule(bytes.toString('utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
    const module={exports:{}};loaded.set(file,module);
    const request=name=>{
      if(name==='react')return React;
      if(name==='react-native')return{...host('View','Pressable','Image'),Platform:{OS:'web'}};
      if(name==='expo-router')return{useLocalSearchParams:()=>params,Link:'Link',router:{push:route=>routes.push(route)}};
      const uiName=name.match(/(?:^|\/)ui\/([^/]+)$/)?.[1];
      const ui={input:host('Input','InputField','InputIcon'),checkbox:host('Checkbox','CheckboxGroup','CheckboxIcon','CheckboxIndicator','CheckboxLabel'),radio:host('Radio','RadioGroup','RadioCircleIndicator','RadioLabel')};
      if(uiName&&ui[uiName])return ui[uiName];
      if(name==='@/components/common/Text'||name==='./Text')return defaultHost('Text');
      if(name==='@/components/icons')return host('EFeather');
      if(name==='@expo/vector-icons/Entypo')return defaultHost('Entypo');
      if(name==='@react-native-community/datetimepicker'||name==='expo-document-picker')return{};
      if(name==='@/lib/utils')return{cn:(...items)=>items.filter(Boolean).join(' '),tw:value=>value*4};
      if(name.includes('SingleSelect'))return defaultHost('SingleSelect');
      if(name.includes('icons/camera'))return defaultHost('CameraIcon');
      if(/\.(ttf|otf)$/.test(name))return name;
      if(name.startsWith('@/')||name.startsWith('.')){const target=resolve(name,file);if(!target)throw Error('Unmapped '+name+' from '+file);return load(target);}
      return require(name);
    };
    vm.runInNewContext(code,{module,exports:module.exports,require:request,console,Date,setTimeout,clearTimeout},{filename:path.resolve(file)});
    return module.exports;
  }
  const store=load('store/registration.ts').useRegistrationStore;
  const setAccepted=store.getState().setTncAccepted;
  store.setState({...options.store,setTncAccepted:accepted=>{consentWrites.push(accepted);setAccepted(accepted);}});
  const useForm=load('hooks/useRegistrationForm.ts').useRegistrationForm;
  const Form=load('components/common/Form.tsx');
  function Content({instance}){
    const api=useForm();apis[instance]=api;
    return React.createElement(Form.Form,api.personalInfoForm,
      ['name','email','phone','password'].map(name=>React.createElement(Form.FormField,{key:name,name,control:api.personalInfoForm.control,render:()=>React.createElement(Form.FormItem,null,React.createElement(Form.FormControl,null,React.createElement(Form.FormInput,{placeholder:name})),React.createElement(Form.FormMessage))})),
      React.createElement(Form.FormField,{name:'tnc',control:api.personalInfoForm.control,render:()=>React.createElement(Form.FormItem,null,React.createElement(Form.FormControl,null,React.createElement(Form.FormCheckbox,{data:{label:'Syarat & Ketentuan',value:'tnc'},href:'/terms-and-condition'})),React.createElement(Form.FormMessage))}));
  }
  function App(){return visible?React.createElement(React.Fragment,null,Array.from({length:options.instances||1},(_,instance)=>React.createElement(Content,{key:instance,instance}))):null;}
  const element=()=>options.strict?React.createElement(React.StrictMode,null,React.createElement(App)):React.createElement(App);
  await act(async()=>{renderer=create(element());await pause();});
  const update=async()=>{await act(async()=>{renderer.update(element());await pause();});};
  const checkbox=(instance=0)=>renderer.root.findAllByType('Checkbox')[instance];
  return{
    apis,store:()=>store.getState(),routes,consentWrites,checkbox,
    values:()=>({personal:apis[0].personalInfoForm.getValues(),bank:apis[0].bankInfoForm.getValues(),password:apis[0].passwordInfoForm.getValues(),index:apis[0].indexState[0]}),
    set:async(part)=>{await act(async()=>{store.setState(part);await pause();});},
    accept:async value=>{await act(async()=>{store.getState().setTncAccepted(value);await pause();});},
    edit:async(name,value)=>{await act(async()=>{renderer.root.findAllByType('InputField').find(node=>node.props.placeholder===name).props.onChangeText(value);await pause();});},
    check:async(value,instance=0)=>{await act(async()=>{checkbox(instance).props.onChange(value);await pause();});},
    formConsent:async(value,instance=0)=>{await act(async()=>{apis[instance].personalInfoForm.setValue('tnc',value,{shouldValidate:true,shouldDirty:true,shouldTouch:true});await pause();});},
    resetForm:async(value)=>{await act(async()=>{apis[0].personalInfoForm.reset(value);await pause();});},
    resetStore:async()=>{await act(async()=>{store.getState().resetRegistration();await pause();});},
    index:async index=>{await act(async()=>{apis[0].indexState[1](index);await pause();});},
    params:async next=>{params=next;await update();},update,
    hide:async()=>{visible=false;await update();},show:async()=>{visible=true;await update();},
    trigger:async kind=>{let valid;await act(async()=>{valid=await apis[0][kind+'InfoForm'].trigger();await pause();});return valid;},
    dispose:async()=>{await act(async()=>{renderer.unmount();await pause();});},
  };
}
async function scenarios(){
  let f=await fixture();check('empty session complete controlled defaults',f.values(),{personal:emptyPersonal(false),bank:emptyBank,password:emptyPassword,index:0});check('empty consent remains false',[f.store().tncAccepted,f.checkbox().props.isChecked],[false,false]);
  check('unchecked consent opens terms without granting',[await f.check(true),f.routes,f.store().tncAccepted,f.checkbox().props.isChecked],[null,['/terms-and-condition'],false,false]);
  await f.edit('name',personal.name);await f.edit('email',personal.email);await f.edit('phone',personal.phone);await f.edit('password',personal.password);
  check('actual form/schema rejects missing consent',await f.trigger('personal'),false);check('consent validation message',f.apis[0].personalInfoForm.getFieldState('tnc').error?.message,'Syarat & ketentuan harus disetujui');
  await f.accept(true);check('terms acceptance updates checkbox/form/store',[f.checkbox().props.isChecked,f.apis[0].personalInfoForm.getValues('tnc'),f.store().tncAccepted],[true,true,true]);check('acceptance preserves typed credentials',f.values().personal,personal);check('accepted form validates',await f.trigger('personal'),true);
  await f.accept(false);check('external revocation propagates to form',[f.checkbox().props.isChecked,f.apis[0].personalInfoForm.getValues('tnc'),f.store().tncAccepted],[false,false,false]);check('revocation invalidates schema',await f.trigger('personal'),false);
  await f.formConsent(true);check('programmatic true synchronizes store',f.store().tncAccepted,true);await f.check(false);check('checkbox false synchronizes store',[f.store().tncAccepted,f.values().personal.tnc],[false,false]);await f.dispose();

  for(const strict of [false,true]){
    f=await fixture({strict,store:{tncAccepted:true}});check(`mount consent true strict=${strict}: no stale false write`,[f.store().tncAccepted,f.values().personal.tnc,f.checkbox().props.isChecked,f.consentWrites],[true,true,true,[]]);await f.update();check(`mount consent true strict=${strict}: rerender stable`,[f.store().tncAccepted,f.values().personal.tnc],[true,true]);await f.dispose();
  }
  f=await fixture({store:{tncAccepted:true,personalInfo:personal,bankInfo:bank,passwordInfo:password}});check('full store restores all three forms and password stage',f.values(),{personal,bank,password,index:2});check('restored values have clean field state',f.apis[0].personalInfoForm.getFieldState('name').isDirty,false);check('restored consent validates',await f.trigger('personal'),true);check('restored bank validates',await f.trigger('bank'),true);check('restored password validates',await f.trigger('password'),true);await f.dispose();

  const url={personalInfo:JSON.stringify(personal),bankInfo:JSON.stringify(bank),passwordInfo:JSON.stringify(password)};
  f=await fixture({store:{tncAccepted:true},params:url});check('URL seed restores valid forms with existing accepted consent',f.values(),{personal,bank,password,index:2});await f.dispose();
  f=await fixture({params:url});check('URL cannot grant consent or skip personal stage',f.values(),{personal:{...personal,tnc:false},bank,password,index:0});check('URL does not grant store consent',f.store().tncAccepted,false);check('URL with no accepted consent fails validation',await f.trigger('personal'),false);await f.dispose();
  f=await fixture({store:{tncAccepted:true,personalInfo:{...personal,name:'Store Owner'},bankInfo:{...bank,accountNumber:'store-number'},passwordInfo:{password:'StoreFixture123!',confirmPassword:'StoreFixture123!'}},params:url});check('store seeds retain priority over URL',f.values(),{personal:{...personal,name:'Store Owner'},bank:{...bank,accountNumber:'store-number'},password:{password:'StoreFixture123!',confirmPassword:'StoreFixture123!'},index:2});await f.dispose();
  f=await fixture({store:{tncAccepted:true,personalInfo:{...personal,email:'invalid'}},params:url});check('invalid store personal does not fall through to URL',[f.values().personal,f.values().index],[emptyPersonal(true),0]);await f.dispose();

  for(const[label,seed,index,expectedBank,expectedPassword]of[
    ['personal only',{tncAccepted:true,personalInfo:personal},1,emptyBank,emptyPassword],
    ['personal plus bank',{tncAccepted:true,personalInfo:personal,bankInfo:bank},2,bank,emptyPassword],
    ['invalid bank',{tncAccepted:true,personalInfo:personal,bankInfo:{...bank,accountName:''},passwordInfo:password},1,emptyBank,password],
    ['invalid password',{tncAccepted:true,personalInfo:personal,bankInfo:bank,passwordInfo:{password:'short',confirmPassword:'different'}},2,bank,emptyPassword],
    ['missing personal invalid bank',{bankInfo:{...bank,accountName:''},passwordInfo:password},0,emptyBank,password],
    ['missing personal bank only',{bankInfo:bank},0,bank,emptyPassword],
    ['missing bank invalid password',{tncAccepted:true,personalInfo:personal,passwordInfo:{password:'short',confirmPassword:'different'}},1,emptyBank,emptyPassword],
  ]){
    f=await fixture({store:seed});check(`${label}: earliest incomplete stage`,f.values().index,index);check(`${label}: safe future defaults`,[f.values().bank,f.values().password],[expectedBank,expectedPassword]);await f.dispose();
  }
  for(const[label,params]of[
    ['malformed JSON',{personalInfo:'{invalid',bankInfo:'bad',passwordInfo:'bad'}],
    ['wrong types',{personalInfo:JSON.stringify({name:32}),bankInfo:JSON.stringify({bankName:42}),passwordInfo:'null'}],
  ]){f=await fixture({params});check(`${label}: safe blank defaults`,f.values(),{personal:emptyPersonal(false),bank:emptyBank,password:emptyPassword,index:0});await f.dispose();}
  f=await fixture({store:{tncAccepted:true,personalInfo:{...personal,tnc:false}}});check('accepted store restores otherwise valid personal even if old draft tnc false',f.values().personal,personal);check('canonical accepted consent determines resume stage',f.values().index,1);await f.dispose();

  f=await fixture({store:{tncAccepted:true,personalInfo:personal,bankInfo:bank,passwordInfo:password}});await f.edit('email','typed@example.test');await f.index(0);const draft=f.values();
  await f.params({...url,personalInfo:JSON.stringify({...personal,email:'late-url@example.test'})});await f.set({personalInfo:{...personal,email:'late-store@example.test'},bankInfo:{...bank,accountName:'Late owner'},passwordInfo:{password:'LateFixture123!',confirmPassword:'LateFixture123!'}});
  check('URL/store seed changes do not overwrite mounted draft/index',f.values(),draft);await f.accept(false);check('live consent false alone updates personal draft',f.values().personal,{...draft.personal,tnc:false});check('live consent does not overwrite bank/password/index',[f.values().bank,f.values().password,f.values().index],[draft.bank,draft.password,draft.index]);await f.hide();await f.show();check('new mount restores latest valid seed while preserving revoked consent',[f.values().personal.email,f.values().personal.tnc,f.values().bank.accountName,f.values().password.password,f.values().index],['late-store@example.test',false,'Late owner','LateFixture123!',0]);await f.dispose();

  f=await fixture({store:{tncAccepted:true}});await f.edit('name','Typed owner');await f.resetStore();check('registration store reset revokes form consent',[f.store().tncAccepted,f.values().personal.tnc],[false,false]);check('store reset does not silently wipe mounted input',f.values().personal.name,'Typed owner');await f.resetForm({...personal,tnc:true});check('explicit form reset updates shared consent',f.store().tncAccepted,true);await f.dispose();
  f=await fixture({instances:2,strict:true,store:{tncAccepted:true}});check('two forms initial consent does not fight',f.apis.map(api=>api.personalInfoForm.getValues('tnc')),[true,true]);check('two forms keep shared accepted true',f.store().tncAccepted,true);await f.check(false,0);check('one form revocation propagates to second',[f.store().tncAccepted,...f.apis.map(api=>api.personalInfoForm.getValues('tnc'))],[false,false,false]);await f.formConsent(true,1);check('one form acceptance propagates without feedback loop',[f.store().tncAccepted,...f.apis.map(api=>api.personalInfoForm.getValues('tnc'))],[true,true,true]);check('consent writes bounded without repeated echoes',f.consentWrites,[false,true]);await f.dispose();
  f=await fixture({store:{tncAccepted:true}});const old=f.apis[0].personalInfoForm;await f.hide();const writes=f.consentWrites.length;await act(async()=>{old.setValue('tnc',false);await pause();});check('unmounted form cannot change shared consent',[f.store().tncAccepted,f.consentWrites.length],[true,writes]);await f.dispose();
}
(async()=>{
  await scenarios();check('no runtime/React/act errors',errors,[]);check('no unhandled rejections',unhandledRejections,[]);
  const result={developer:'Software Developer Senior 5 / Codex-5',ticket:'SD5-008',baseline,sources,checks,errors,unhandledRejections,passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length};
  fs.writeFileSync(path.join(__dirname,baseline?'baseline-results.json':'final-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors,unhandledRejections,failures:checks.filter(item=>!item.passed)}));process.exitCode=result.failed||errors.length||unhandledRejections.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{console.error=originalError;process.removeListener('unhandledRejection',onUnhandled);});
