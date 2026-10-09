const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),ts=require('typescript');
const React=require(path.resolve('.expo/senior7-test-tools/node_modules/react'));
require.cache[require.resolve('react')]={exports:React};
const {create,act}=require(path.resolve('.expo/senior7-test-tools/node_modules/react-test-renderer'));
global.IS_REACT_ACT_ENVIRONMENT=true;
const {owned,shared,read}=require('./sources.cjs');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before=Object.fromEntries([...owned,...shared,...read].map(f=>[f,hash(f)]));
const cache={},loaded={},checks=[],errors=[],navigations=[];
const originalError=console.error;
console.error=(...args)=>{if(String(args[0]).includes('react-test-renderer is deprecated'))return;errors.push(args.map(String).join(' '));originalError(...args);};
const check=(name,run)=>{run();checks.push(name);};
let params={},focused=true,renderer,screen;
const aliases={'@/components/common/Card':'Card','@/components/common/Text':'Text','@/components/common/Wrapper':'Wrapper','@/components/common/SearchBar':'SearchBar','@/components/common/BottomActionButton':'BottomActionButton','@/components/common/BouncyPressable':'BouncyPressable','@/components/common/SingleSelect':'SingleSelect','./SingleSelect':'SingleSelect','./Text':'Text','../icons/camera':'CameraIcon','@/components/custom/DetailRow':'DetailRow','@/components/custom/DetailBottomActions':'DetailBottomActions','@/components/custom/ItemActionSheet':'ItemActionSheet','@/components/common/Header':'Header'};
const def=defaultValue=>({__esModule:true,default:defaultValue});
const names=values=>Object.fromEntries(values.map(n=>[n,n]));
const url=(target,values)=>target+(values?'?'+new URLSearchParams(values).toString():'');
const router={push:target=>navigations.push(['push',target]),replace:target=>navigations.push(['replace',target]),dismissTo:target=>navigations.push(['dismissTo',target]),back:()=>navigations.push(['back']),canGoBack:()=>false};
function load(file){
 if(cache[file])return cache[file];loaded[file]=hash(file);
 const mod={exports:{}};
 function req(id){
  if(id==='react')return React;
  if(id==='react/jsx-runtime')return require(path.resolve('.expo/senior7-test-tools/node_modules/react/jsx-runtime'));
  if(id==='react-native')return {View:'View',Image:'Image',Pressable:'Pressable',Platform:{OS:'web'},StyleSheet:{create:v=>v},FlatList:({data,renderItem,ListHeaderComponent,ListEmptyComponent,...props})=>React.createElement('FlatList',{data,...props},ListHeaderComponent,data.map((item,index)=>React.createElement(React.Fragment,{key:item.id},renderItem({item,index}))),!data.length&&ListEmptyComponent)};
  if(id==='expo-router')return {router,Link:'Link',useLocalSearchParams:()=>params};
  if(id==='expo-router/react-navigation')return {useIsFocused:()=>focused};
  if(id==='@/components/custom/JSStack'){const stack='JSStack';const component=({children})=>React.createElement(stack,null,children);component.Screen='StackScreen';return {JSStack:component,ScaleBackTransition:{}};}
  if(id==='@/lib/utils')return {route:url,cn:(...v)=>v.filter(Boolean).join(' '),tw:v=>v*4};
  if(id in aliases)return def(aliases[id]);
  if(id==='@/components/common/AlertModal')return {...def('AlertModal'),useAlertModal:()=>{const openState=React.useState(false);return {openState,open:()=>openState[1](true),close:()=>openState[1](false)};}};
  if(id==='@/components/common/SuccessModal')return def('SuccessModal');
  if(id==='@/components/common/DeleteConfirmModal')return def('DeleteConfirmModal');
  if(id==='@/components/custom/CatalogItemCard')return def(({title,subtitle,badge,description,right,children,...props})=>React.createElement('CatalogItemCard',props,title,subtitle,badge,description,children,right));
  if(id==='@/components/common/DataPlaceholder')return {SearchNotFound:'SearchNotFound'};
  if(id==='@/components/icons')return {EFeather:'EFeather'};
  if(id==='@/components/ui/button'||id==='../ui/button')return names(['Button','ButtonText']);
  if(id==='../ui/input')return names(['Input','InputField','InputIcon']);
  if(id==='../ui/checkbox')return names(['Checkbox','CheckboxGroup','CheckboxIcon','CheckboxIndicator','CheckboxLabel']);
  if(id==='../ui/radio')return names(['Radio','RadioCircleIndicator','RadioGroup','RadioLabel']);
  if(id.startsWith('@expo/vector-icons'))return def('Icon');
  if(id==='expo-document-picker'||id==='@react-native-community/datetimepicker')return {};
  if(id.startsWith('@/')||id.startsWith('.')){const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const resolved=[base+'.ts',base+'.tsx',path.join(base,'index.ts'),path.join(base,'index.tsx')].find(fs.existsSync);if(!resolved)throw Error('Unresolved '+id+' from '+file);return load(resolved);}
  return require(id);
 }
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('module','exports','require',code)(mod,mod.exports,req);cache[file]=mod.exports;return mod.exports;
}
const store=load('store/digitalOrderChannelStore.ts').useDigitalOrderChannelStore;
const schema=load('schema/manage/digital-order-channel.ts').digitalOrderChannelSchema;
const base='app/(no-layout)/manage/pos-settings/digital-orders/';
const Modify=load(base+'modify.tsx').default,Detail=load(base+'detail.tsx').default,List=load(base+'index.tsx').default;
const Form=load('components/common/Form.tsx').Form;
const value=(name='Kanal Satu')=>({name,kind:'link',url:'https://contoh.com/pesan#menu',notes:'Catatan'});
const state=()=>store.getState();
const props=type=>renderer.root.findAllByType(type)[0]?.props;
const form=()=>props(Form),submit=()=>props('BottomActionButton').onPress;
const open=type=>!!props(type)?.openState[0];
async function mount(component,next={}){if(renderer)await act(async()=>renderer.unmount());renderer=undefined;screen=component;params=next;await act(async()=>{renderer=create(React.createElement(React.StrictMode,null,React.createElement(component)));});}
async function change(next){params=next;await act(async()=>renderer.update(React.createElement(React.StrictMode,null,React.createElement(screen))));}
async function fill(values){await act(async()=>Object.entries(values).forEach(([key,v])=>form().setValue(key,v)));}
async function reset(){if(renderer)await act(async()=>renderer.unmount());renderer=undefined;store.setState({items:[],nextId:1});navigations.length=0;}
(async()=>{
 try{
  check('Initial collection is empty and user-entered only',()=>assert.deepEqual(state().items,[]));
  for(const [input,valid] of [['https://example.com/pesan',true],[' HTTPS://EXAMPLE.COM/menu#section ',true],['https://contoh.com/pesan?a=1',true],['https://例え.テスト/menu',true],['http://example.com',false],['javascript:alert(1)',false],['ftp://example.com',false],['//example.com',false],['https://u:p@example.com',false],['https://@example.com',false],['https://example.com/a b',false],['https://example.com\\a',false],['',false]])check('URL validation '+JSON.stringify(input),()=>assert.equal(schema.safeParse({...value(),url:input}).success,valid));
  check('Schema trims all text without dropping valid fragment or query',()=>assert.deepEqual(schema.parse({...value(' A '),notes:' B ',url:' https://example.com/pesan?a=1#menu '}),{name:'A',kind:'link',url:'https://example.com/pesan?a=1#menu',notes:'B'}));
  check('Empty/oversize name and unsupported kind are invalid',()=>{for(const v of [{name:' '},{name:'a'.repeat(81)},{kind:'unsupported'},{notes:'x'.repeat(1001)},{url:'https://example.com/'+ 'x'.repeat(2048)}])assert.equal(schema.safeParse({...value(),...v}).success,false);});
  check('Add validates at store boundary',()=>{assert.deepEqual(state().add({...value(),url:'invalid'}),{ok:false,reason:'invalid'});assert.equal(state().items.length,0);});
  const first=state().add(value(' Kanal A '));const second=state().add({...value('Kanal B'),kind:'marketplace'});
  check('Store assigns monotonic ID, draft status and first revision',()=>{assert.equal(first.id,'digital-channel-1');assert.equal(second.id,'digital-channel-2');assert.equal(state().items[0].name,'Kanal A');assert.equal(state().items[0].status,'draft');assert.equal(state().items[0].revision,1);});
  check('Name uniqueness is case-insensitive and whitespace normalized',()=>{assert.deepEqual(state().add(value('  kAnAl a ')),{ok:false,reason:'duplicate'});assert.equal(state().items.length,2);});
  check('Update rejects missing ID without inserting',()=>assert.deepEqual(state().update('missing',1,value()),{ok:false,reason:'missing'}));
  check('Duplicate edit preserves both existing records',()=>{const before=JSON.stringify(state().items);assert.equal(state().update(second.id,1,value('KANAL A')).reason,'duplicate');assert.equal(JSON.stringify(state().items),before);});
  check('Valid edit preserves ID and increments only target revision',()=>{assert.equal(state().update(first.id,1,value('Kanal Baru')).ok,true);assert.equal(state().items[0].revision,2);assert.equal(state().items[1].revision,1);});
  check('Old revision cannot overwrite current draft',()=>{assert.equal(state().update(first.id,1,value('Old')).reason,'stale');assert.equal(state().items[0].name,'Kanal Baru');});
  check('Old deletion revision cannot remove edited draft',()=>{assert.equal(state().remove(first.id,1).reason,'stale');assert.equal(state().items.length,2);});
  check('Actual deletion and missing repeat produce truthful results',()=>{assert.equal(state().remove(first.id,2).ok,true);assert.equal(state().remove(first.id,2).reason,'missing');});
  check('Deleted IDs are never reused in this session',()=>assert.equal(state().add(value('Kanal C')).id,'digital-channel-3'));
  await reset();await mount(Modify);
  check('Create form defaults are empty with Link Pemesanan kind',()=>{assert.equal(form().getValues('name'),'');assert.equal(form().getValues('url'),'');assert.equal(form().getValues('kind'),'link');});
  await act(async()=>submit()());
  check('Empty submission shows required errors and never adds a draft',()=>{assert.equal(state().items.length,0);assert.ok(form().formState.errors.name);assert.ok(form().formState.errors.url);});
  await fill(value('Create UI'));const saveCreate=submit();await act(async()=>{await Promise.all([saveCreate(),saveCreate()]);});
  check('Double submit adds exactly one validated record and opens success',()=>{assert.equal(state().items.length,1);assert.equal(state().items[0].name,'Create UI');assert.equal(open('SuccessModal'),true);});
  const ack=props('SuccessModal').onClose;await act(async()=>{ack();ack();});
  check('Success acknowledgement navigates to list once',()=>assert.deepEqual(navigations,[['dismissTo','/manage/pos-settings/digital-orders']]));
  const a=state().items[0],b=state().add(value('Record B'));await mount(Modify,{id:a.id});
  check('Edit prefill reads exactly selected ID',()=>assert.equal(form().getValues('name'),'Create UI'));
  await fill({name:'Draft A'});const staleSave=submit();await change({id:b.id});
  check('ID switch resets editor to B',()=>assert.equal(form().getValues('name'),'Record B'));
  const revisionA=state().items[0].revision;await act(async()=>staleSave());
  check('Submit retained from prior ID cannot mutate A or B',()=>{assert.equal(state().items[0].revision,revisionA);assert.equal(state().items[0].name,'Create UI');assert.equal(state().items[1].name,'Record B');});
  await fill({name:'User draft B'});await act(async()=>{state().update(b.id,1,value('External B'));});
  check('Same-ID source update preserves unsaved user input',()=>assert.equal(form().getValues('name'),'User draft B'));
  await act(async()=>submit()());
  check('Saving stale prefill shows conflict and never overwrites latest B',()=>{assert.equal(state().items[1].name,'External B');assert.equal(open('AlertModal'),true);assert.equal(form().getValues('name'),'User draft B');});
  await change({id:a.id});await fill({name:'External B'});await act(async()=>submit()());
  check('Duplicate name error attaches to form and keeps input',()=>{assert.equal(form().formState.errors.name.message,'Nama kanal sudah digunakan');assert.equal(state().items[0].name,'Create UI');});
  await fill({name:'Edited A'});await act(async()=>submit()());
  check('Duplicate name can be corrected and retried successfully',()=>{assert.equal(state().items[0].name,'Edited A');assert.equal(open('SuccessModal'),true);});
  const oldAck=props('SuccessModal').onClose;await change({});const countNav=navigations.length;await act(async()=>oldAck());
  check('Retired success callback cannot navigate after route changes',()=>assert.equal(navigations.length,countNav));
  await fill(value('Never committed'));const afterUnmount=submit();await act(async()=>renderer.unmount());renderer=undefined;await act(async()=>afterUnmount());
  check('Retired create submit cannot add record after unmount',()=>assert.equal(state().items.length,2));
  for(const id of ['', 'missing', ['x','y']]){await mount(Modify,{id});check('Invalid editor ID '+JSON.stringify(id)+' stays missing',()=>assert.equal(form(),undefined));}
  await mount(Detail,{id:a.id});const detailActions=props('DetailBottomActions');await act(async()=>detailActions.onDelete());
  const cancelled=props('DeleteConfirmModal').onConfirm;await act(async()=>props('DeleteConfirmModal').openState[1](false));await act(async()=>cancelled());
  check('Cancelled confirmation cannot delete from retained callback',()=>assert.equal(state().items.length,2));
  await act(async()=>props('DetailBottomActions').onDelete());const oldConfirm=props('DeleteConfirmModal').onConfirm;await act(async()=>state().update(a.id,2,value('External A')));await act(async()=>oldConfirm());
  check('Record changed after prompt is not deleted; conflict is shown',()=>{assert.equal(state().items.length,2);assert.equal(state().items[0].name,'External A');assert.equal(open('AlertModal'),true);});
  await mount(Detail,{id:a.id});await act(async()=>props('DetailBottomActions').onDelete());const confirm=props('DeleteConfirmModal').onConfirm;await act(async()=>{confirm();confirm();});
  check('Confirm deletes target once and keeps success feedback after row removal',()=>{assert.equal(state().items.length,1);assert.equal(state().items[0].id,b.id);assert.equal(open('SuccessModal'),true);});
  const deleteAck=props('SuccessModal').onClose;const navBefore=navigations.length;await act(async()=>{deleteAck();deleteAck();});
  check('Delete success acknowledgement returns to list once',()=>assert.equal(navigations.length,navBefore+1));
  await mount(Detail,{id:b.id});await act(async()=>props('DetailBottomActions').onDelete());const switchedConfirm=props('DeleteConfirmModal').onConfirm;await change({id:'missing'});await act(async()=>switchedConfirm());
  check('ID switch retires deletion callback rather than deleting previous record',()=>assert.equal(state().items.length,1));
  await mount(Detail,{id:b.id});const oldEdit=props('DetailBottomActions').onEdit;await act(async()=>renderer.unmount());renderer=undefined;const navCount=navigations.length;await act(async()=>oldEdit());
  check('Unmounted detail edit callback cannot navigate',()=>assert.equal(navigations.length,navCount));
  await mount(List);const listProps=()=>props('FlatList');check('List reads current real session collection',()=>assert.equal(listProps().data.length,1));
  await act(async()=>props('SearchBar').setSearch(' missing '));check('List search trims and gives no fabricated result',()=>assert.equal(listProps().data.length,0));
  await act(async()=>props('SearchBar').setSearch('external b'));check('List search matches source name case-insensitively',()=>assert.equal(listProps().data[0].id,b.id));
  await act(async()=>props('SingleSelect').onValueChange('marketplace'));check('Kind and search filters combine',()=>assert.equal(listProps().data.length,0));
  await act(async()=>renderer.root.findAllByType('Button')[0].props.onPress());check('Reset restores search/filter and real rows',()=>{assert.equal(props('SearchBar').search,'');assert.equal(props('SingleSelect').value,'all');assert.equal(listProps().data.length,1);});
  const oldRow=props('CatalogItemCard').onPress,oldAdd=submit();await act(async()=>renderer.unmount());renderer=undefined;const navEnd=navigations.length;await act(async()=>{oldRow();oldAdd();});
  check('Unmounted list row/add callbacks cannot navigate',()=>assert.equal(navigations.length,navEnd));
  const layout=load(base+'_layout.tsx');const screens=React.Children.toArray(layout.default().props.children);
  check('Layout anchors index and registers all three screen headers',()=>{assert.equal(layout.unstable_settings.initialRouteName,'index');assert.deepEqual(screens.map(s=>s.props.name),['index','modify','detail']);});
  check('Modify header reads its own route params',()=>{assert.equal(screens[1].props.options({route:{params:{id:'x'}}}).header().props.title,'Edit Kanal Pemesanan');assert.equal(screens[1].props.options({route:{params:{}}}).header().props.title,'Tambah Kanal Pemesanan');});
  check('No-stack list header falls back to POS',()=>{screens[0].props.options.header().props.back();assert.deepEqual(navigations.at(-1),['replace','/manage/pos-settings']);});
  check('No-stack detail header falls back to digital list',()=>{screens[2].props.options.header().props.back();assert.deepEqual(navigations.at(-1),['replace','/manage/pos-settings/digital-orders']);});
  check('Inactive header blocks pointers and refocus restores them',()=>{const header=screens[0].props.options.header();focused=false;assert.equal(header.type(header.props).props.style.pointerEvents,'none');focused=true;assert.equal(header.type(header.props).props.style.pointerEvents,'auto');});
  const baseline=require('./baseline.json');for(const file of read)check('Read-only reused contract unchanged '+file,()=>assert.equal(hash(file),baseline[file]));
  const parent=fs.readFileSync(shared[1],'utf8').replace(/\r\n/g,'\n').replace('\t\t\t<JSStack.Screen name="digital-orders" options={{ headerShown: false }} />\n','');
  check('Parent layout delta is only headerfalse registration',()=>assert.equal(parent,fs.readFileSync(path.join(__dirname,'before/1-_layout.tsx.txt'),'utf8').replace(/\r\n/g,'\n')));
  check('POS source preserves all content outside replaced Digital slot and route import',()=>{
   const original=fs.readFileSync(path.join(__dirname,'before/0-index.tsx.txt'),'utf8').replace(/\r\n/g,'\n'),current=fs.readFileSync(shared[0],'utf8').replace(/\r\n/g,'\n');
   const parse=(text)=>ts.createSourceFile('pos.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
   const beforeAST=parse(original),afterAST=parse(current);let oldSlot,newSlot;
   const visit=(n,ast,old)=>{if(old&&ts.isJsxElement(n)&&n.openingElement.attributes.properties.some(p=>p.name?.text==='className'&&p.initializer?.text?.includes('border-dashed')))oldSlot=n.getText(ast);if(!old&&ts.isJsxSelfClosingElement(n)&&n.tagName.getText(ast)==='MenuItem'&&n.attributes.properties.some(p=>p.name?.text==='title'&&p.initializer?.text==='Pesanan Digital'))newSlot=n.getText(ast);ts.forEachChild(n,c=>visit(c,ast,old));};visit(beforeAST,beforeAST,true);visit(afterAST,afterAST,false);assert.ok(oldSlot&&newSlot);assert.equal(current.replace(newSlot,oldSlot).replace('import { route } from "@/lib/utils";\n',''),original);
  });
  check('No runtime, React or act errors',()=>assert.deepEqual(errors,[]));
  check('All owned, shared and read-only source hashes stable',()=>{for(const [f,sha] of Object.entries(before))assert.equal(hash(f),sha);});
 }catch(e){console.error(e);process.exitCode=1;errors.push(e.stack);}
 finally{if(renderer)await act(async()=>renderer.unmount());console.error=originalError;fs.writeFileSync(path.join(__dirname,'model-results.json'),JSON.stringify({status:errors.length?'FAIL':'PASS',passed:checks.length,checks,errors,before,after:Object.fromEntries(Object.keys(before).map(f=>[f,hash(f)])),loaded,limitations:'Production schema/store/route/screen/RHF/Zod/shared Form and ManageListActions, with native/presentation/modal/router adapters. Isolated records; not application UI/native/fullrouter/backend/persistence/Figma.'},null,2)+'\n');console.log(checks.length+' model checks; errors '+errors.length);}
})();
