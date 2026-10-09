const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),ts=require('typescript');
const React=require('react');
const {owned,shared,read}=require('./sources.cjs');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashes=()=>Object.fromEntries([...owned,...shared,...read].map(file=>[file,sha(file)]));
const before=hashes(),checks=[];
const check=(name,run)=>{run();checks.push(name);};
const cache={};
function load(file,stubs={}) {
 if(cache[file])return cache[file];
 const source=fs.readFileSync(file,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const mod={exports:{}};
 const req=id=>id in stubs?stubs[id]:id.startsWith('@/lib/manage/')?load(id.slice(2)+'.ts'):require(id);
 new Function('module','exports','require',compiled)(mod,mod.exports,req);
 cache[file]=mod.exports;return mod.exports;
}
const api=load('lib/absence-history.ts');
const row=(id,date,checkIn='08:00',checkOut='-',storeName='Pusat',locationName='Jakarta')=>({id,date,checkIn,checkOut,storeName,locationName});
const records=[row('old','06 Maret 2026'),row('one','9 Oktober 2026','08:00','17:00','Timur','Surabaya'),row('two','2026-10-09'),row('unknown','invalid-date','-','-'),row('empty',''),row('spaces',' 9 Oktober 2026 ')];
const snapshot=JSON.stringify(records),filter={search:'',status:'all'};
const groups=api.groupAttendanceHistory(records,filter);
check('Equivalent ISO/local/trimmed dates form one group',()=>assert.deepEqual(groups[0].data.map(r=>r.id),['one','two','spaces']));
check('Valid groups sort newest first and unknown dates remain separate',()=>assert.deepEqual(groups.map(g=>g.key),['2026-10-09','2026-03-06','unknown:invalid-date','unknown:']));
check('No synthetic date assigned to invalid source',()=>assert.equal(groups[2].title,'invalid-date'));
check('Missing date has clear label',()=>assert.equal(groups[3].title,'Tanggal tidak dicatat'));
check('Rows retain source object identity',()=>assert.equal(groups[0].data[0],records[1]));
check('Production grouping never mutates source collection or records',()=>assert.equal(JSON.stringify(records),snapshot));
check('Location search ignores case and surrounding spaces',()=>assert.deepEqual(api.groupAttendanceHistory(records,{...filter,search:' SURABAYA '}).flatMap(g=>g.data.map(r=>r.id)),['one']));
check('Search empty result does not leave empty sections',()=>assert.deepEqual(api.groupAttendanceHistory(records,{...filter,search:'zzzz'}),[]));
check('Status and exact store filters combine',()=>assert.deepEqual(api.groupAttendanceHistory(records,{...filter,status:'open',storeName:'Pusat'}).flatMap(g=>g.data.map(r=>r.id)),['two','spaces','old','empty']));
check('Complete status only includes recorded entry and exit',()=>assert.deepEqual(api.groupAttendanceHistory(records,{...filter,status:'complete'}).flatMap(g=>g.data.map(r=>r.id)),['one']));
check('Unknown status remains explicitly selectable',()=>assert.deepEqual(api.groupAttendanceHistory(records,{...filter,status:'unknown'}).flatMap(g=>g.data.map(r=>r.id)),['unknown']));
check('Unknown store filters return no fabricated rows',()=>assert.deepEqual(api.groupAttendanceHistory(records,{...filter,storeName:'Missing'}),[]));
check('Empty source returns empty groups',()=>assert.deepEqual(api.groupAttendanceHistory([],filter),[]));
check('Opaque ID with slashes and leading zero is preserved',()=>{const item=row('001 / x','');assert.equal(api.findAttendanceHistory([item],item.id),item);});
for(const id of ['missing','',undefined,['one','two']])check(`Invalid ID ${JSON.stringify(id)} never falls back to first row`,()=>assert.equal(api.findAttendanceHistory(records,id),undefined));
check('Detail selection reads latest source, not stale copied object',()=>{const old=row('one','','08:00'),next={...old,checkOut:'18:00'};assert.equal(api.findAttendanceHistory([next],'one').checkOut,'18:00');assert.equal(api.findAttendanceHistory([],'one'),undefined);});

// Execute the real home handler body independently; full Home/auth UI remains outside this model.
const homeText=fs.readFileSync(shared[0],'utf8');
const homeAST=ts.createSourceFile(shared[0],homeText,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let handler;
function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(homeAST)==='handleMenuPress')handler=node.initializer;ts.forEachChild(node,visit);}
visit(homeAST);assert.ok(handler);
const nav=[],alerts=[];
const router={push:href=>nav.push(['push',href]),replace:href=>nav.push(['replace',href]),back:()=>nav.push(['back']),canGoBack:()=>false};
const emitted=ts.transpileModule('const handler = '+handler.getText(homeAST)+'; module.exports = handler;',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const handlerModule={exports:{}};new Function('module','router','Alert','route',emitted)(handlerModule,router,{alert:(...args)=>alerts.push(args)},value=>value);
check('Actual home Riwayat handler opens new mode route',()=>{handlerModule.exports('Riwayat',false);assert.deepEqual(nav.pop(),['push','/(absence)/history']);assert.equal(alerts.length,0);});
check('Locked menus keep existing lock behavior',()=>{handlerModule.exports('Izin',true);assert.equal(alerts.pop()[0],'Fitur Terkunci');assert.equal(nav.length,0);});
check('Other unimplemented menus keep their existing message',()=>{handlerModule.exports('Gaji',false);assert.equal(alerts.pop()[0],'Segera Hadir');assert.equal(nav.length,0);});

const Stack=({children})=>children;Stack.Screen=()=>null;
let focused=true;
const layout=load('app/(absence)/history/_layout.tsx',{'expo-router':{router},'expo-router/react-navigation':{useIsFocused:()=>focused},'react-native':{StyleSheet:{create:v=>v},View:()=>null},'@/lib/utils':{route:value=>value},'@/components/common/Header':()=>null,'@/components/custom/JSStack':{JSStack:Stack,ScaleBackTransition:{}}});
const screens=React.Children.toArray(layout.default().props.children);
check('History layout anchors list and registers both routes',()=>{assert.equal(layout.unstable_settings.initialRouteName,'index');assert.deepEqual(screens.map(s=>s.props.name),['index','detail']);});
check('No-history list header returns to mode home',()=>{screens[0].props.options.header().props.back();assert.deepEqual(nav.pop(),['replace','/(absence)/home']);});
check('No-history detail header returns to history list',()=>{screens[1].props.options.header().props.back();assert.deepEqual(nav.pop(),['replace','/(absence)/history']);});
check('Header uses existing back stack when available',()=>{router.canGoBack=()=>true;screens[1].props.options.header().props.back();assert.deepEqual(nav.pop(),['back']);});
check('Inactive nested header cannot intercept pointer events',()=>{focused=false;const e=screens[0].props.options.header();assert.equal(e.type(e.props).props.style.pointerEvents,'none');});
check('Refocusing restores nested header pointer events',()=>{focused=true;const e=screens[0].props.options.header();assert.equal(e.type(e.props).props.style.pointerEvents,'auto');});
check('New module source cannot write attendance or call business transport',()=>{for(const file of owned)assert.doesNotMatch(fs.readFileSync(file,'utf8'),/\b(addRecord|setState|axios|fetch|useMutation)\b/,file);});

const baseline=require('./baseline.json');
for(const file of read)check('Shared read-only contract unchanged: '+file,()=>assert.equal(sha(file),baseline[file]));
const normalized=s=>s.replace(/\r\n/g,'\n');
check('Home delta contains only Riwayat handler branch',()=>{
 const original=normalized(fs.readFileSync(path.join(__dirname,'before/0-home.tsx'),'utf8'));
 const current=normalized(homeText).replace('import { cn, route } from "@/lib/utils";','import { cn } from "@/lib/utils";').replace('if (label === "Riwayat" && !isLocked) {\n\t\t\trouter.push(route("/(absence)/history"));\n\t\t} else if (isLocked) {','if (isLocked) {');assert.equal(current,original);
});
check('Parent delta contains only child header registration',()=>{
 const original=normalized(fs.readFileSync(path.join(__dirname,'before/1-_layout.tsx'),'utf8'));
 const current=normalized(fs.readFileSync(shared[1],'utf8')).replace('\t\t\t<JSStack.Screen name="history" options={{ headerShown: false }} />\n','');assert.equal(current,original);
});
check('All source fingerprints stable throughout model execution',()=>assert.deepEqual(hashes(),before));
fs.writeFileSync(path.join(__dirname,'model-results.json'),JSON.stringify({status:'PASS',passed:checks.length,checks,before,after:hashes(),limitations:'Production helper and actual home-handler/layout callbacks with test records and router/native adapters; not full app/auth/browser/native.'},null,2)+'\n');
console.log(`${checks.length} model checks PASS`);
