// Run from application root. Production Member component + React DOM + RHF.
// API responses and UI primitives are stubs; this is not a router/native test.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const crypto = require('node:crypto');
const {chromium} = require(path.resolve('.expo/qc-startup-tools/node_modules/playwright-core'));
const launch = () => chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const sourcePath = 'components/feature/manage/member/MemberModifyScreen.tsx';
const transpile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022, jsx:ts.JsxEmit.ReactJSX, esModuleInterop:false}}).outputText;
const modules = {
  react:'react/cjs/react.production.js',
  'react/jsx-runtime':'react/cjs/react-jsx-runtime.production.js',
  'react-dom':'react-dom/cjs/react-dom.production.js',
  'react-dom/client':'react-dom/cjs/react-dom-client.production.js',
  scheduler:'scheduler/cjs/scheduler.production.js',
  'react-hook-form':'react-hook-form/dist/index.cjs.js',
};
const factories = Object.entries(modules).map(([id,file])=>`${JSON.stringify(id)}:function(module,exports,require){${fs.readFileSync(path.join('node_modules',file),'utf8')}\n}`).join(',');
const defaults={name:'',phone:'',email:'',id_number:'',address:'',date_of_birth:'',gender:'',notes:''};
async function main(){
 const browser=await launch(), checks=[], errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<div id="root"></div>');
  await page.addScriptTag({content:`
   const factories={${factories}}, cache={};
   function require(id){if(!cache[id]){const m={exports:{}};cache[id]=m;if(!factories[id])throw Error('Missing '+id);factories[id](m,m.exports,require);}return cache[id].exports;}
   const React=require('react'), {flushSync}=require('react-dom');
   const root=require('react-dom/client').createRoot(document.getElementById('root'));
   let query={data:null,isLoading:false,isError:false}, capturedForm, calls=[];
   const defaults=${JSON.stringify(defaults)};
   const pass=({children})=>React.createElement('div',null,children);
   const nil=()=>null;
   factories['react-native']=(m)=>m.exports={View:pass};
   factories['@hookform/resolvers/zod']=(m)=>m.exports={zodResolver:()=>async(values)=>({values,errors:{}})};
   factories['@/schema/add/customer']=(m)=>m.exports={customerSchema:{}};
   factories['@/lib/manage/members']=(m,exports,require)=>{${transpile('lib/manage/members.ts')}};
   factories['@/api/common']=(m)=>m.exports={handleFormError:()=>{}};
   factories['@/api/hooks/customers']=(m)=>m.exports={useCustomerQuery:()=>query,
    useCustomerRequest:()=>({isLoading:false,call:async(payload)=>{calls.push({method:'POST',payload});return[{},null];}}),
    useCustomerUpdateRequest:(options,id)=>({isLoading:false,call:async(payload)=>{calls.push({method:'PUT',id,payload});return[{},null];}})};
   factories['@/components/common/Form']=(m)=>m.exports={Form:props=>{capturedForm=props;return React.createElement('div');},FormControl:pass,FormField:nil,FormInput:nil,FormItem:pass,FormLabel:pass,FormMessage:nil,FormSelect:nil};
   factories['@/components/common/AlertModal']=(m)=>m.exports={default:nil,useAlertModal:()=>{const state=React.useState(false);return{openState:state,open:()=>state[1](true),close:()=>state[1](false)};}};
   factories['@/components/common/BottomActionButton']=(m)=>m.exports={default:props=>React.createElement('button',{disabled:props.isDisabled,onClick:props.onPress},props.children)};
   factories['@/components/common/Card']=(m)=>m.exports={default:pass};
   factories['@/components/common/Wrapper']=(m)=>m.exports={default:pass};
   factories['@/components/common/DataPlaceholder']=(m)=>m.exports={LoadingPlaceholder:nil};
   factories['@/components/common/SuccessModal']=(m)=>m.exports={default:nil};
   factories['@/components/custom/JSStack']=(m)=>m.exports={delayedBack:()=>{}};
   factories['./MemberQueryError']=(m)=>m.exports={default:nil};
   factories.screen=(m,exports,require)=>{${transpile(sourcePath)}};
   const Screen=require('screen').default;
   window.renderMember=async({id,data,remount})=>{query={data,isLoading:false,isError:false};flushSync(()=>root.render(React.createElement(Screen,{id,key:remount||'stable'})));await new Promise(r=>setTimeout(r,30));return capturedForm.getValues();};
   window.draftMember=name=>capturedForm.setValue('name',name);
   window.submitMember=async()=>{await capturedForm.handleSubmit(()=>{})();document.querySelector('button').click();await new Promise(r=>setTimeout(r,50));return{calls,disabled:document.querySelector('button').disabled};};
  `});
  const a={...defaults,id:'a',name:'Alice',phone:'081111'}, b={...defaults,id:'b',name:'Bob',phone:'082222'};
  const render=(id,data,remount)=>page.evaluate(v=>renderMember(v),{id,data,remount});
  const record=(name,actual,expected)=>checks.push({name,actual,expected,pass:JSON.stringify(actual)===JSON.stringify(expected)});
  record('initial edit hydrates A',(await render('a',a)).name,'Alice');
  await page.evaluate(()=>draftMember('Alice draft'));
  record('refetch preserves same-ID draft',(await render('a',{...a,name:'Alice server'})).name,'Alice draft');
  record('changing A to B hydrates B',(await render('b',b)).name,'Bob');
  record('edit to create clears old customer fields',(await render(undefined,null)).name,'');
  await page.evaluate(()=>draftMember('New customer draft'));
  record('return to B after create restores B',(await render('b',b)).name,'Bob');
  await render('a',a,'second-instance');
  const saved=await page.evaluate(()=>submitMember());
  record('successful save locks current form',saved.disabled,true);
  await render('b',b,'second-instance');
  record('new customer after saved customer can submit',await page.evaluate(()=>document.querySelector('button').disabled),false);
  record('no unhandled runtime exception',errors.length,0);
  const result={date:'2026-10-09',source:sourcePath,sha256:crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex'),checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,errors,scope:'Actual production component, React DOM and RHF; UI/API/resolver stubs. No router/native/visual verification.'};
  fs.writeFileSync(path.join(__dirname,'lifecycle-results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
  process.exitCode=result.failed?1:0;
 }catch(error){console.error(JSON.stringify({error:String(error),errors,checks}));throw error;}finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
