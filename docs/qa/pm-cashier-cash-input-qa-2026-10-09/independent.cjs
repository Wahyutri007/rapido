const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const {fixture,keypadFixture,loader,check,checks,errors,actionRejections}=require('./adapter.cjs');
const resultFile=path.join(__dirname,'independent-results.json');
const route=(value,totalPrice)=>({pathname:'/cart/input-money-confirm',params:{value,totalPrice}});
async function main(){
 let f=await fixture({totalPrice:'5000',value:'50000'}), snapshots=[f.value()];
 await f.press('BACK');snapshots.push(f.value());await f.press('7');snapshots.push(f.value());await f.press('C');snapshots.push(f.value());await f.press('BACK');snapshots.push(f.value());
 check('prefill/backspace/append/C remain synchronized with RHF',snapshots,['50000','5000','50007','','']);
 f=await fixture({totalPrice:'5000',value:'50000'});await f.press('C');await f.submit();check('clear disables action and cannot reuse prefill',JSON.stringify([f.enabled(),f.routes]),JSON.stringify([false,[]]));await f.dispose();
 f=await fixture({totalPrice:'5000'});await f.type('5000');const enabled=f.enabled();await f.submit(2);check('exact amount permits only one route on double submit',JSON.stringify([enabled,f.routes]),JSON.stringify([true,[route(5000,5000)]]));await f.dispose();
 f=await fixture({totalPrice:undefined,value:'50000'});await f.submit();check('missing total fails closed instead of fallback zero',JSON.stringify([f.enabled(),f.routes,f.message().includes('Total pembayaran belum tersedia')]),JSON.stringify([false,[],true]));await f.dispose();
 f=await fixture({totalPrice:'0'});await f.type('1');await f.submit();check('explicit zero total is distinct from absent total',f.routes,[route(1,0)]);await f.dispose();
 for(const [label,total] of [['negative','-1'],['fractional','1.5'],['multiple',['5000','6000']],['unsafe','9007199254740992']]){f=await fixture({totalPrice:total,value:'9000'});await f.submit();check(`${label} total stays invalid and never routes`,JSON.stringify([f.enabled(),f.routes]),JSON.stringify([false,[]]));await f.dispose();}
 f=await fixture({totalPrice:'9007199254740991'});await f.type('9007199254740991');await f.submit();check('maximum safe amount and total roundtrip exactly',JSON.stringify([f.enabled(),f.routes]),JSON.stringify([true,[route(9007199254740991,9007199254740991)]]));await f.dispose();
 f=await fixture({totalPrice:'5000'});await f.type('9007199254740992');await f.submit();check('unsafe received amount fails closed',JSON.stringify([f.value(),f.enabled(),f.routes]),JSON.stringify(['9007199254740992',false,[]]));await f.dispose();
 f=await fixture({totalPrice:'5000'});await f.type('12345678901234567');check('rapid keypad input cannot exceed cap',f.value().length,16);await f.dispose();
 f=await fixture({totalPrice:'5000'});await f.type('12000');await f.local({totalPrice:'5000',irrelevant:'changed'});const afterLocal=f.value();await f.global({totalPrice:'80000',value:'1'});await f.submit();check('irrelevant local and global params preserve local draft/total',JSON.stringify([afterLocal,f.value(),f.routes]),JSON.stringify(['12000','12000',[route(12000,5000)]]));await f.dispose();
 f=await fixture({totalPrice:'5000'});await f.type('12000');const old=f.saved();await f.local({totalPrice:'20000',value:'25000'});const afterRelevant=[f.value(),f.enabled()];await f.invoke(old);const afterStale=[...f.routes];await f.submit();check('relevant params reset pair and stale callback is rejected',JSON.stringify([afterRelevant,afterStale,f.routes]),JSON.stringify([['25000',true],[],[route(25000,20000)]]));await f.dispose();
 f=await fixture({totalPrice:'5000',value:'10000'});const blurred=f.saved();await f.focus(false);const blurEnabled=f.enabled();await f.invoke(blurred);const blurRoutes=[...f.routes];const beforeKey=f.value();await f.press('1');const afterKey=f.value();await f.focus(true);check('blur blocks submit/keypad writes and refocus retains draft',JSON.stringify([blurEnabled,blurRoutes,beforeKey,afterKey,f.value()]),JSON.stringify([false,[],beforeKey,beforeKey,beforeKey]));await f.dispose();
 f=await fixture({totalPrice:'5000',value:'10000'});const unmounted=f.saved();await f.dispose();await f.invoke(unmounted);check('unmounted submit callback cannot navigate',f.routes,[]);
 f=await fixture({totalPrice:'5000',value:'10000'});await f.pending(({key})=>key('C').props.onPress());check('clear during async validation prevents stale submit',f.routes,[]);await f.dispose();
 f=await fixture({totalPrice:'5000',value:'10000'});f.env.failNavigation=true;await f.submit();const retryMessage=f.message().includes('Coba lagi');f.env.failNavigation=false;await f.submit();check('route rejection releases lock and permits retry',JSON.stringify([retryMessage,f.routes]),JSON.stringify([true,[route(10000,5000)]]));await f.dispose();

 const {parseCashAmount,parseCashRouteAmount,createCashInputSchema}=loader({router:{},local:{},global:{},focused:true},false)('schema/cashier/cash-input.ts');
 check('safe integer boundary parser',JSON.stringify([parseCashAmount('9007199254740991'),parseCashAmount('9007199254740992')]),JSON.stringify([9007199254740991,null]));
 check('route parser rejects duplicates and accepts singleton array',JSON.stringify([parseCashRouteAmount('0010'),parseCashRouteAmount(['0010']),parseCashRouteAmount(['10','20'])]),JSON.stringify([10,10,null]));
 check('money parser rejects coercion, separators and non-digits',JSON.stringify([parseCashAmount(10),parseCashAmount('1.5'),parseCashAmount('1e3'),parseCashAmount('5,000'),parseCashAmount('5000\n')]),JSON.stringify([null,null,null,null,null]));
 check('RHF resolver schema enforces positive exact-or-higher received amount',JSON.stringify(['0','4999','5000','5001'].map(value=>createCashInputSchema(5000).safeParse({value}).success)),JSON.stringify([false,false,true,true]));
 check('resolver refuses missing or invalid total, accepts explicit zero with positive received',JSON.stringify([createCashInputSchema(null).safeParse({value:'5000'}).success,createCashInputSchema(1.5).safeParse({value:'5000'}).success,createCashInputSchema(0).safeParse({value:'1'}).success]),JSON.stringify([false,false,true]));
 const keypad=await keypadFixture(false,{maxLength:4,nullable:true}),legacyValues=[];legacyValues.push(keypad.value());await keypad.press('1');legacyValues.push(keypad.value());await keypad.press('2');legacyValues.push(keypad.value());await keypad.press('BACK');legacyValues.push(keypad.value());await keypad.press('C');legacyValues.push(keypad.value());check('default legacy Keypad sequence remains nullable/uncontrolled',legacyValues,[null,'1','12','1',null]);await keypad.dispose();
 const callers={
  'app/(onboarding)/choose-store/pin.tsx':'1f9da1aa275426c0e4b1db06e49f9c03fccec8b288fe205c829eb30599f2532a',
  'app/(no-layout)/manage/pin.tsx':'125f120968796b6fe3529e3a93de4e9515648c6b9cc3792e502847b0fe18b2cd',
  'app/(no-layout)/order-detail/refund.tsx':'393fb9e69484f3fa702480dd53cd8f99f57eb9ba4b9c2494c5f2e3284357a8fe'
 };
 for(const [file,expected] of Object.entries(callers)){const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');check(`legacy PIN/refund caller unchanged: ${file}`,actual,expected);}
}
main().catch(error=>errors.push(error.stack||String(error))).finally(()=>{
 const result={ticket:'SD5-014',status:checks.every(c=>c.passed)&&errors.length===0?'PASS':'FAIL',cases:checks.length,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,runtimeErrors:errors,actionRejections,checks,scope:'Actual input screen, RHF, Zod/resolver, Keypad, and cash input schema; native hosts, icons, router and focus are adapters. Three legacy PIN/refund callers are read-only fingerprint checked; default Keypad mode is rendered separately.'};
 fs.writeFileSync(resultFile,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,cases:result.cases,passed:result.passed,failed:result.failed,runtimeErrors:errors,actionRejections}));process.exitCode=result.failed||errors.length||actionRejections.length?1:0;
});
