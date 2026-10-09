// Production hooks/factory/query/common/usePostRequest/error mapper and editors.
// Axios custom adapter intercepts all calls; no HTTP or user data is accessed.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync('docs/qa/codex-3/role-worker-identity/check.cjs', 'utf8');
const boundary = source.indexOf('\n(async()=>{');
if (boundary < 0) throw new Error('Audited loader seam missing');
let bootstrap = source.slice(0, boundary);
const replaceLine = (needle, replacement) => {
  const line = bootstrap.split('\n').find((item) => item.includes(needle));
  if (!line) throw new Error(`Loader seam missing: ${needle}`);
  bootstrap = bootstrap.replace(line, replacement);
};
replaceLine("if(name==='@/api/hooks/roles')", "  if(name==='@/api/hooks/roles')return load('api/hooks/roles.ts');");
replaceLine("if(name==='@/api/hooks/workers')", "  if(name==='@/api/hooks/workers')return load('api/hooks/workers.ts');");
replaceLine("if(name==='@/api/hooks/stores')", "  if(name==='@/api/hooks/stores')return load('api/hooks/stores.ts');");
replaceLine("if(name==='@/api/common')", "  if(name==='@/api/common')return load('api/common.ts');");
replaceLine("if(name.startsWith('@/'))", "  if(name==='@/api/axios'||(name.startsWith('.')&&path.resolve(path.dirname(absolute),name)===path.resolve('api/axios')))return {axios:transport};\n  if(name==='@/context/AuthContext')return {useAuth:()=>({user:{roles:['owner']}})};\n  if(name==='@/store/useActiveStore')return {useActiveStore:()=>({activeStoreId:'store-a'})};\n  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');");
replaceLine('return require(name);', "  if(name.startsWith('.')){const target=path.resolve(path.dirname(absolute),name);return load(fs.existsSync(target+'.ts')?target+'.ts':fs.existsSync(target+'.tsx')?target+'.tsx':path.join(target,'index.ts'));}\n  return require(name);");
replaceLine('const element=()=>', 'const element=()=>React.createElement(QueryClientProvider,{client},React.createElement(React.StrictMode,null,React.createElement(Route)));');
const readSeam = "const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),";
if (!bootstrap.includes(readSeam)) throw new Error('Source fingerprint seam missing');
bootstrap = 'const sourceFingerprints={};\n' + bootstrap.replace(readSeam, "const sourceBytes=fs.readFileSync(absolute);sourceFingerprints[path.relative(process.cwd(),absolute).replaceAll('\\\\','/')]=crypto.createHash('sha256').update(sourceBytes).digest('hex');const code=ts.transpileModule(sourceBytes.toString('utf8'),");
const tests = `
const {QueryClient,QueryClientProvider}=require('@tanstack/react-query');
const axiosLibrary=require('axios');
const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,gcTime:Infinity}}});
const invalidations=[],getCalls=[],mutationCalls=[];
const originalInvalidate=client.invalidateQueries.bind(client);
client.invalidateQueries=(options)=>{invalidations.push(options.queryKey);return originalInvalidate(options);};
let transportWait,transportError;
const resultFor=(url)=>{
 if(url==='/reference-data/permissions')return {Kasir:[{value:'cashier',name:'Kasir'}]};
 if(url==='/stores')return [{id:'store-a',name:'Toko A'}];
 if(url==='/contents/roles')return [role('role-a','Kasir')];
 if(url==='/contents/workers')return [worker('a','Worker A')];
 if(url.startsWith('/contents/roles/')){const id=decodeURIComponent(url.split('/').at(-1));return role(id,'Role '+id.toUpperCase());}
 if(url.startsWith('/contents/workers/')){const id=decodeURIComponent(url.split('/').at(-1));return worker(id,'Worker '+id.toUpperCase());}
 throw new Error('Unexpected fixture endpoint '+url);
};
const transport=axiosLibrary.create({adapter:async(config)=>{
 if(config.method==='get'){getCalls.push(config.url);return {data:{success:true,data:resultFor(config.url)},status:200,statusText:'OK',headers:{},config};}
 const payload=typeof config.data==='string'?JSON.parse(config.data):payloadObject(config.data);
 mutationCalls.push({method:config.method,url:config.url,payload,contentType:config.headers.get('Content-Type')});
 const error=transportError;
 if(transportWait)await transportWait;
 const data=error?{success:false,message:'Fixture validation',errors:error.errors}:{success:true,data:{id:config.url.split('/').at(-1)}};
 const response={data,status:error?.status||200,statusText:error?'Error':'OK',headers:{},config};
 if(error)throw new axiosLibrary.AxiosError('Fixture request rejected','ERR_BAD_REQUEST',config,undefined,response);
 return response;
}});
const pause=()=>new Promise(resolve=>setTimeout(resolve,20));
const flush=async()=>act(async()=>{await pause();});
const mount=async(id)=>{await render(id);await flush();if(renderer.root.findAllByType('Form').length!==1)throw new Error('Production queries did not expose the editor');};
const submit=async()=>act(async()=>{await save().onPress();await pause();});
const deferredSubmit=async()=>{
 let finish,submission;transportWait=new Promise(resolve=>{finish=resolve;});
 await act(async()=>{submission=save().onPress();await pause();});
 return {finish,submission};
};
(async()=>{
 try{
  kind={name:'role',route:'app/(no-layout)/(back-office)/manage/roles/modify.tsx'};
  Route=load(kind.route).default;
  await reset();await mount('a');
  check('role: production query hydrates A',form().getValues('name'),'Role A');
  check('role: production detail and permission paths requested',getCalls.includes('/contents/roles/a')&&getCalls.includes('/reference-data/permissions'),true);
  await field('name','  Role A draft  ');await field('permissions',['cashier','cashier']);
  const rolePending=await deferredSubmit();
  check('role: production mutation uses PUT and captured A path',[mutationCalls[0].method,mutationCalls[0].url],['put','/contents/roles/a']);
  check('role: production RHF/Zod trims and deduplicates payload',mutationCalls[0].payload,{name:'Role A draft',permissions:['cashier']});
  check('role: production request marks current save loading',save().isLoading,true);
  await mount('b');await field('name','B draft retained');
  await act(async()=>{rolePending.finish();await rolePending.submission;await pause();});transportWait=undefined;
  check('role: late real factory success cannot open B modal',success().openState[0],false);
  check('role: invalidation/refetch cannot replace B draft',form().getValues('name'),'B draft retained');
  check('role: B editor remains unlocked after old request',save().isDisabled,false);
  check('role: real factory invalidates original detail and worker caches',invalidations.slice(0,3),[['roles'],['roles','a'],['workers']]);
  transportError={status:422,errors:{name:['Fixture name error'],'permissions.0':['Fixture permission error']}};
  await submit();
  check('role: B request uses new entity path',mutationCalls.at(-1).url,'/contents/roles/b');
  check('role: real Axios error mapper attaches name error',form().getFieldState('name').error?.message,'Fixture name error');
  check('role: indexed permission error aggregates through real mapper',form().getFieldState('permissions').error?.message,'Fixture permission error');
  check('role: rejected real request unlocks retry',[save().isDisabled,alert().openState[0]],[false,true]);
  const beforeRetry=mutationCalls.length;transportError=undefined;
  await act(async()=>{const handler=save().onPress;await Promise.all([handler(),handler()]);await pause();});
  check('role: same-event retry produces one transport mutation',mutationCalls.length-beforeRetry,1);
  check('role: successful current request opens modal and locks',[success().openState[0],save().isDisabled],[true,true]);
  await unmount();client.clear();transportWait=undefined;transportError=undefined;

  kind={name:'worker',route:'app/(no-layout)/manage/workers/modify.tsx'};
  Route=load(kind.route).default;
  await reset();await mount('a');
  check('worker: production detail query hydrates A',form().getValues('name'),'Worker A');
  check('worker: role/store prerequisites use production queries',getCalls.includes('/contents/roles')&&getCalls.includes('/stores'),true);
  await field('face_scan',{uri:'fixture://face-a',name:'face.png',mimeType:'image/png',size:5});
  let imageFinish,imageSubmission;
  pendingImage=new Promise(resolve=>{imageFinish=resolve;});
  const beforeImage=mutationCalls.length;
  await act(async()=>{const handler=save().onPress;imageSubmission=Promise.all([handler(),handler()]);await pause();});
  check('worker: same-event photo preparation fetches only once',fetchCalls,['fixture://face-a']);
  check('worker: preparation has not reached transport',mutationCalls.length-beforeImage,0);
  await mount('b');await field('name','Worker B draft');
  await act(async()=>{imageFinish({ok:true,blob:async()=>new Blob(['photo'],{type:'image/png'})});await imageSubmission;await pause();});pendingImage=undefined;
  check('worker: late preparation starts no production mutation',mutationCalls.length-beforeImage,0);
  check('worker: late preparation leaves B draft/modal',[form().getValues('name'),success().openState[0]],['Worker B draft',false]);
  await field('face_scan',{uri:'fixture://face-b',name:'face-b.png',mimeType:'image/png',size:5});
  await field('id_scan',{uri:'fixture://id-b',name:'id-b.png',mimeType:'image/png',size:5});
  const workerPending=await deferredSubmit();
  const workerRequest=mutationCalls.at(-1);
  check('worker: real update uses POST entity path',[workerRequest.method,workerRequest.url],['post','/contents/workers/b']);
  check('worker: real update retains multipart PUT override',workerRequest.payload._method,'PUT');
  check('worker: real update contains both prepared files',[workerRequest.payload.face_scan,workerRequest.payload.id_scan],[{name:'face-b.png',size:5,type:'image/png'},{name:'id-b.png',size:5,type:'image/png'}]);
  check('worker: real update carries assigned role/store',[workerRequest.payload.role_id,workerRequest.payload.store_id],['role-a','store-a']);
  check('worker: real update excludes account passwords','password' in workerRequest.payload,false);
  check('worker: request configured as multipart',workerRequest.contentType.startsWith('multipart/form-data'),true);
  await mount(undefined);await field('name','New create draft');
  await act(async()=>{workerPending.finish();await workerPending.submission;await pause();});transportWait=undefined;
  check('worker: late update cannot change new create draft',form().getValues('name'),'New create draft');
  check('worker: late update leaves new create lock/modal',[save().isDisabled,success().openState[0]],[false,false]);
  check('worker: production update invalidates original worker cache',invalidations.some(key=>JSON.stringify(key)===JSON.stringify(['workers','b'])),true);
  await fill();const beforeCreate=mutationCalls.length;await submit();
  const createRequest=mutationCalls.at(-1);
  check('worker: production create sends one POST',[mutationCalls.length-beforeCreate,createRequest.method,createRequest.url],[1,'post','/contents/workers']);
  check('worker: create multipart sends confirmation and excludes override',[createRequest.payload.password,createRequest.payload.password_confirmation,'_method' in createRequest.payload],['password123','password123',false]);
  check('worker: current create success locks editor',[success().openState[0],save().isDisabled],[true,true]);
  await unmount();client.clear();await flush();
  check('no unexpected React/runtime errors',errors,[]);
  const result={owner:'QC',createdAt:new Date().toISOString(),passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length,checks,errors,sourceFingerprints,getCalls,mutationCalls,invalidations,realHTTPRequests:0,scope:'Production routes/editors/RHF/Zod/QueryClient/hooks/factory/common/error mapping/usePostRequest/workerFormData; Axios adapter and native/UI/auth/fetch/navigation fixture. No real backend/browser/device.'};
  fs.writeFileSync(path.join(__dirname,'production-hooks-results.json'),JSON.stringify(result,null,2)+'\\n');
  console.log(JSON.stringify({passed:result.passed,failed:result.failed,errors:errors.length,loadedFiles:Object.keys(sourceFingerprints).length,realHTTPRequests:0,failures:checks.filter(item=>!item.passed).map(item=>item.name)}));
  process.exitCode=result.failed||errors.length?1:0;
 }finally{await unmount();client.clear();}
})().catch(error=>{console.error(error);process.exitCode=2;});
`;
new Function('require', '__dirname', bootstrap + tests)(require, __dirname);
