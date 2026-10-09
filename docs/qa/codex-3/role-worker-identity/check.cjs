// Actual routes/editors, RHF/Zod and worker multipart helper; API/query/UI/fetch adapters.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const React=require(path.resolve('.expo/senior7-test-tools/node_modules/react'));
require('react');require.cache[require.resolve('react')].exports=React;
const {act,create}=require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer'));
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const checks=[],errors=[],loaded=new Map();
const originalError=console.error;
console.error=(...args)=>{if(String(args[0]).includes('react-test-renderer is deprecated'))return;errors.push(args.map(String).join(' '));originalError(...args);};
const check=(name,actual,expected)=>checks.push({name,passed:JSON.stringify(actual)===JSON.stringify(expected),actual,expected});
const queries={role:{},worker:{},permissions:{},roles:{},stores:{}};
let currentId,requests=[],problem=null,pendingResponse=null,pendingImage=null,imageError=false,fetchCalls=[],backs=0,strict=false;
const payloadObject=payload=>payload instanceof FormData?Object.fromEntries([...payload.entries()].map(([key,value])=>[key,typeof value==='string'?value:{name:value.name,size:value.size,type:value.type}])):payload;
const mutation=(entity,editing,id)=>({isLoading:false,call:async payload=>{requests.push({entity,editing,id,method:editing&&entity==='role'?'PUT':'POST',payload:payloadObject(payload)});return pendingResponse?await pendingResponse:[{id:id||'new'},problem];}});
const load=file=>{
 const absolute=path.resolve(file);if(loaded.has(absolute))return loaded.get(absolute);
 const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{}};loaded.set(absolute,module.exports);
 const customRequire=name=>{
  if(name==='react')return React;
  if(name==='react/jsx-runtime')return require(path.resolve('.expo/senior7-test-tools/node_modules/react/jsx-runtime'));
  if(name==='react-native')return {View:'View',Platform:{OS:'web'}};
  if(name==='expo-router')return {useLocalSearchParams:()=>({id:currentId}),router:{push() {}}};
  if(name==='@/api/hooks/roles')return {useRoleQuery:()=>queries.role,useRolePermissionsQuery:()=>queries.permissions,useRolesQuery:()=>queries.roles,useRoleRequest:()=>mutation('role',false),useRoleUpdateRequest:(_,id)=>mutation('role',true,id)};
  if(name==='@/api/hooks/workers')return {useWorkerQuery:()=>queries.worker,useWorkerRequest:()=>mutation('worker',false),useWorkerUpdateRequest:(_,id)=>mutation('worker',true,id)};
  if(name==='@/api/hooks/stores')return {useStoresQuery:()=>queries.stores};
  if(name==='@/api/common')return {handleFormError:(error,form)=>{if(error?.status===422)for(const [field,messages]of Object.entries(error.errors||{}))form.setError(field,{message:messages[0],type:'server'});}};
  if(name==='@/components/common/AlertModal')return {__esModule:true,default:'AlertModal',useAlertModal:()=>{const state=React.useState(false);return {openState:state,open:()=>state[1](true),close:()=>state[1](false)};}};
  if(name==='@/components/common/Form')return Object.fromEntries(['Form','FormControl','FormField','FormInput','FormItem','FormLabel','FormMessage','FormSelect'].map(n=>[n,n]));
  if(name==='@/components/common/DataPlaceholder')return {LoadingPlaceholder:'LoadingPlaceholder'};
  if(name==='@/components/custom/JSStack')return {delayedBack:()=>backs++};
  if(name==='@/components/ui/button')return {Button:'Button',ButtonText:'ButtonText'};
  if(name==='@/lib/utils')return {route:value=>value};
  if(name==='@/components/feature/manage/roles/RoleModifyScreen')return load('components/feature/manage/roles/RoleModifyScreen.tsx');
  if(name==='@/components/feature/manage/workers/WorkerModifyScreen')return load('components/feature/manage/workers/WorkerModifyScreen.tsx');
  if(name.startsWith('@/components/')||name.startsWith('./Role')||name.startsWith('./Worker'))return {__esModule:true,default:name.split('/').at(-1)};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
  return require(name);
 };
 const fetchFixture=async uri=>{fetchCalls.push(uri);if(pendingImage)return await pendingImage;if(imageError)throw new Error('Fixture image failure');return {ok:true,blob:async()=>new Blob(['photo'],{type:'image/png'})};};
 vm.runInNewContext(code,{module,exports:module.exports,require:customRequire,console,Date,FormData,Blob,fetch:fetchFixture,setTimeout,clearTimeout},{filename:absolute});
 loaded.set(absolute,module.exports);return module.exports;
};
const role=(id,name)=>({id,name:'internal-'+id,display_name:name,permissions:['cashier'],workers_count:0});
const worker=(id,name)=>({id,name,email:id+'@example.com',phone:'081234567890',team_id:'store-a',role_id:'role-a',roles:[{id:'role-a',name:'cashier',display_name:'Kasir'}],assigned_store:{id:'store-a',name:'Toko A',address:''},worker_profile:{id:'profile-'+id,address:'Address '+id,date_of_birth:'1998-06-01',face_scan:null,id_scan:null},created_at:'2026-10-08T10:00:00Z',updated_at:'2026-10-08T10:00:00Z'});
const workerDefaults=load('lib/manage/workers.ts').WORKER_DEFAULTS;
let renderer,Route,kind;
const form=()=>renderer.root.findByType('Form').props;
const save=()=>renderer.root.findByType('BottomActionButton').props;
const success=()=>renderer.root.findByType('SuccessModal').props;
const alert=()=>renderer.root.findByType('AlertModal').props;
const element=()=>strict?React.createElement(React.StrictMode,null,React.createElement(Route)):React.createElement(Route);
const render=async(id,data,extra={})=>{currentId=id;Object.assign(queries[kind.name],{data,isLoading:false,isError:false},extra);await act(async()=>{if(renderer)renderer.update(element());else renderer=create(element());});};
const unmount=async()=>{if(renderer)await act(async()=>renderer.unmount());renderer=null;};
const reset=async()=>{await unmount();requests=[];problem=null;pendingResponse=null;pendingImage=null;imageError=false;fetchCalls=[];strict=false;backs=0;for(const [name,data]of [['permissions',{}],['roles',[role('role-a','Kasir')]],['stores',[{id:'store-a',name:'Toko A'}]]])Object.assign(queries[name],{data,isLoading:false,isError:false,refetch:()=>{}});};
const field=async(name,value)=>{await act(async()=>form().setValue(name,value));};
const fill=async()=>{await act(async()=>{if(kind.name==='role'){form().setValue('name','New role');form().setValue('permissions',['cashier']);}else for(const [name,value]of Object.entries({...workerDefaults,name:'New worker',email:'new@example.com',phone:'08123',role_id:'role-a',store_id:'store-a',password:'password123',password_confirmation:'password123'}))form().setValue(name,value);});};
const startPending=async()=>{let finish,submission;pendingResponse=new Promise(resolve=>{finish=resolve;});await act(async()=>{submission=save().onPress();await new Promise(resolve=>setImmediate(resolve));});return {finish,submission};};
(async()=>{
 for(kind of [{name:'role',route:'app/(no-layout)/(back-office)/manage/roles/modify.tsx',fixture:role,defaults:{name:'',permissions:[]}},
              {name:'worker',route:'app/(no-layout)/manage/workers/modify.tsx',fixture:worker,defaults:workerDefaults}]){
  console.log('Identity '+kind.name);Route=load(kind.route).default;
  await reset();await render('a',kind.fixture('a','Entity A'));
  check(kind.name+': edit prefilled',form().getValues('name'),'Entity A');
  await field('name','Draft A');await render('a',kind.fixture('a','Refetched A'));
  check(kind.name+': same-ID refetch keeps draft',form().getValues('name'),'Draft A');
  await render('b',kind.fixture('b','Entity B'));check(kind.name+': different ID hydrates B',form().getValues('name'),'Entity B');
  await render(undefined,undefined);check(kind.name+': edit to create resets all defaults',form().getValues(),kind.defaults);
  if(kind.name==='worker'){await field('password','password123');await field('password_confirmation','password123');}
  await act(async()=>save().onPress());check(kind.name+': create cannot clone old entity',requests.length,0);
  await render('b',kind.fixture('b','Entity B'));check(kind.name+': return to B after create hydrates B',form().getValues('name'),'Entity B');
  await reset();await render('a',kind.fixture('a','Entity A'));await act(async()=>save().onPress());
  check(kind.name+': successful edit targets A',requests.map(r=>r.id),['a']);
  check(kind.name+': success locks save',save().isDisabled,true);
  await render('b',kind.fixture('b','Entity B'));
  check(kind.name+': identity change clears success modal',success().openState[0],false);
  check(kind.name+': identity change clears saved lock',save().isDisabled,false);
  await reset();await render(undefined,undefined);await fill();
  const handler=save().onPress;await act(async()=>Promise.all([handler(),handler()]));
  check(kind.name+': same-event double save creates once',requests.length,1);
  await act(async()=>success().onClose());check(kind.name+': closing success navigates back',backs,1);
  check(kind.name+': closing modal keeps saved editor locked',save().isDisabled,true);
  await act(async()=>save().onPress());check(kind.name+': saved callback cannot send second mutation',requests.length,1);
  for(const [status,error]of [['success',null],['422',{status:422,errors:{name:['Old response error']}}],['500',{status:500}]]){
   await reset();await render('a',kind.fixture('a','Entity A'));const pending=await startPending();
   check(kind.name+': pending '+status+' starts on A',requests.map(r=>r.id),['a']);
   await render('b',kind.fixture('b','Entity B'));await field('name','Draft B');
   await render('a',kind.fixture('a','Entity A new'));await field('name','New A draft');
   await act(async()=>{pending.finish([null,error]);await pending.submission;});
   check(kind.name+': late '+status+' preserves new A draft',form().getValues('name'),'New A draft');
   check(kind.name+': late '+status+' leaves new A unlocked',save().isDisabled,false);
   check(kind.name+': late '+status+' cannot open success',success().openState[0],false);
   check(kind.name+': late '+status+' cannot open alert',alert().openState[0],false);
   check(kind.name+': late '+status+' cannot attach field error',Boolean(form().getFieldState('name').error),false);
  }
  await reset();await render('a',kind.fixture('a','Entity A'));await field('name','Current draft');
  problem={status:422,errors:kind.name==='role'?{'permissions.0':['Permission rejected'],name:['Name rejected']}:{name:['Name rejected']}};
  await act(async()=>save().onPress());check(kind.name+': current 422 preserves draft',form().getValues('name'),'Current draft');
  check(kind.name+': current 422 maps field errors',form().getFieldState('name').error?.message,'Name rejected');
  if(kind.name==='role')check('role: indexed permission error maps to permission field',form().getFieldState('permissions').error?.message,'Permission rejected');
  check(kind.name+': current 422 unlocks retry',save().isDisabled,false);
  problem=null;await act(async()=>save().onPress());check(kind.name+': retry after 422 succeeds',success().openState[0],true);
  await reset();await render('missing',undefined,{isError:true});check(kind.name+': missing ID hides form',renderer.root.findAllByType('Form').length,0);check(kind.name+': missing ID blocks save',save().isDisabled,true);
  await render('missing',kind.fixture('missing','Recovered'));check(kind.name+': query retry hydrates record',form().getValues('name'),'Recovered');
  await reset();await render('',undefined);check(kind.name+': supplied empty ID cannot create',renderer.root.findAllByType('Form').length,0);
  await reset();await render(['b','a'],kind.fixture('b','Entity B'));check(kind.name+': array ID uses first record',form().getValues('name'),'Entity B');
  await reset();await render('a',kind.fixture('a','Entity A'));const oldHandler=save().onPress;
  await render('b',kind.fixture('b','Entity B'));await act(async()=>oldHandler());check(kind.name+': queued old submit after unmount starts no mutation',requests.length,0);
  await reset();strict=true;await render('a',kind.fixture('a','Strict A'));await act(async()=>save().onPress());
  check(kind.name+': StrictMode replay still permits current save',requests.map(r=>r.id),['a']);check(kind.name+': StrictMode save locks current editor',save().isDisabled,true);
  if(kind.name==='worker'){
   for(const outcome of ['success','failure']){
    await reset();await render('a',worker('a','Worker A'));
    await field('face_scan',{uri:'fixture://photo-a',name:'a.png',mimeType:'image/png',size:5});
    let resolveImage,rejectImage,submission;pendingImage=new Promise((resolve,reject)=>{resolveImage=resolve;rejectImage=reject;});
    await act(async()=>{submission=save().onPress();await new Promise(resolve=>setImmediate(resolve));});
    check('worker: '+outcome+' preparation awaits production image fetch',fetchCalls,['fixture://photo-a']);
    await render('b',worker('b','Worker B'));await field('name','New B draft');
    await act(async()=>{if(outcome==='success')resolveImage({ok:true,blob:async()=>new Blob(['photo'],{type:'image/png'})});else rejectImage(new Error('Old photo failed'));await submission;});
    check('worker: late photo '+outcome+' starts no API request',requests.length,0);
    check('worker: late photo '+outcome+' keeps B draft',form().getValues('name'),'New B draft');
    check('worker: late photo '+outcome+' cannot open B alert',alert().openState[0],false);
    check('worker: late photo '+outcome+' leaves B save unlocked',save().isDisabled,false);
   }
   await reset();await render('a',worker('a','Worker A'));await field('face_scan',{uri:'fixture://photo-current',name:'current.png',mimeType:'image/png',size:5});
   imageError=true;await act(async()=>save().onPress());check('worker: current image failure is reported',alert().openState[0],true);check('worker: current image failure allows retry',save().isDisabled,false);
   imageError=false;await act(async()=>save().onPress());check('worker: image retry sends multipart method override',requests[0]?.payload._method,'PUT');check('worker: image retry sends prepared file',requests[0]?.payload.face_scan,{name:'current.png',size:5,type:'image/png'});
   await reset();await render(undefined,undefined);await fill();await act(async()=>save().onPress());
   check('worker: create multipart preserves password',requests[0]?.payload.password,'password123');check('worker: create multipart has no method override',Boolean(requests[0]?.payload._method),false);
  }
  await unmount();
 }
 check('No unexpected React runtime errors',errors,[]);
 const sources=['components/feature/manage/roles/RoleModifyScreen.tsx','components/feature/manage/workers/WorkerModifyScreen.tsx','app/(no-layout)/(back-office)/manage/roles/modify.tsx','app/(no-layout)/manage/workers/modify.tsx','lib/manage/roles.ts','lib/manage/workers.ts','schema/add/role.ts','schema/add/worker.ts','api/hooks/roles.ts','api/hooks/workers.ts'];
 const result={owner:'Codex-3',ticket:'SD3-004',scope:'Actual route/editor/RHF/Zod/worker multipart helper with API/query/native/UI/fetch adapters; no API writes, browser, full router or native',passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,sourceHashes:Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))};
 fs.writeFileSync(path.join(__dirname,process.argv.includes('--baseline')?'baseline.json':'results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({passed:result.passed,failed:result.failed,failures:checks.filter(c=>!c.passed).map(c=>c.name)}));process.exitCode=result.failed?1:0;
})().catch(error=>{console.error(error);process.exitCode=2;});
