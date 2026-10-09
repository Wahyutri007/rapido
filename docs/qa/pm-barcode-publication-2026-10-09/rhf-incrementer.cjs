// Independent production Incrementer + real RHF integration. UI host adapters.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {React,act,create,errors}=require(path.resolve('docs/qa/senior-7-2026-10-09/barcode-lifecycle.cjs'));
const {load}=require(path.resolve('docs/qa/senior-7-2026-10-09/incrementer/lifecycle.cjs'));
const rhfModule={exports:{}};
new Function('module','exports','require',fs.readFileSync('node_modules/react-hook-form/dist/index.cjs.js','utf8'))(rhfModule,rhfModule.exports,id=>{if(id==='react')return React;throw Error(id);});
const {useForm,useController}=rhfModule.exports;
const sourceHash=()=>crypto.createHash('sha256').update(fs.readFileSync('components/custom/Incrementer.tsx')).digest('hex');
const before=sourceHash();
const commits=[],Incrementer=load('components/custom/Incrementer.tsx',undefined,commits);
let form;
function ControlledField({disabled}){
 form=useForm({defaultValues:{label_count:12}});
 const {field}=useController({control:form.control,name:'label_count'});
 return React.createElement(Incrementer,{value:field.value,onChange:field.onChange,min:1,max:999,variant:'outline',size:'xl',disabled});
}
async function main(){
 const checks=[];let renderer;
 const record=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);checks.push(name);};
 try{
  await act(async()=>{renderer=create(React.createElement(ControlledField,{disabled:false}));});
  const displayed=()=>renderer.root.findByType('Text').props.children;
  const press=async index=>act(async()=>renderer.root.findAllByType('Button')[index].props.onPress());
  record('RHF initial default displayed without minimum flicker',commits.every(v=>v===12),true);
  await press(1);record('real RHF accepts increment',form.getValues('label_count'),13);
  record('Incrementer displays RHF echo',displayed(),13);
  await act(async()=>form.reset({label_count:4}));record('real RHF reset updates counter',displayed(),4);
  await act(async()=>form.setValue('label_count',999));await press(1);record('maximum preserved in RHF payload',form.getValues('label_count'),999);
  await act(async()=>form.setValue('label_count',1));await press(0);record('minimum preserved in RHF payload',form.getValues('label_count'),1);
  await act(async()=>renderer.update(React.createElement(ControlledField,{disabled:true})));await press(1);
  record('disabled counter leaves RHF draft unchanged',form.getValues('label_count'),1);
  await act(async()=>renderer.update(React.createElement(ControlledField,{disabled:false})));await press(1);
  record('reenabling counter updates RHF draft',form.getValues('label_count'),2);
  record('no runtime warnings or errors',errors,[]);
  const result={passed:checks.length,checks,errors,source:{file:'components/custom/Incrementer.tsx',sha256:sourceHash(),before,stable:before===sourceHash()},scope:'Production Incrementer + production RHF useForm/useController, props matching Barcode label_count caller; host UI adapters. Full screen/router/native not rendered.'};
  fs.writeFileSync(path.join(__dirname,'rhf-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{if(renderer)await act(async()=>renderer.unmount());}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
