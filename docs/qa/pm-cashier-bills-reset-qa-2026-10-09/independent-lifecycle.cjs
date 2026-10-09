const fs=require('node:fs'),path=require('node:path');
const {load,React,act,create,check,checks,errors,cache,navigation,clock}=require('./harness.cjs');
const resultPath=path.join(__dirname,'independent-results.json');
const inputOf=screen=>screen.root.findByType('InputField');
const rowsOf=screen=>screen.root.findByType('FlatList').props.data.map(item=>item.id);
const resetOf=screen=>screen.root.findByType('Button').props.onPress;
const statusOf=screen=>screen.root.findByType('SingleSelect').props.onValueChange;
async function mount(){const {BillsScreen}=load('components/feature/cashier/bills/BillsScreen.tsx');let screen;await act(()=>{screen=create(React.createElement(BillsScreen));});await clock.advance(150);return screen;}
async function type(screen,text){await act(()=>inputOf(screen).props.onChangeText(text));}
async function reset(screen){await act(()=>resetOf(screen)());}
async function main(){
 let screen=await mount();
 check('source fixture initial rows',rowsOf(screen),['4','5']);
 await type(screen,'no-match-before-150');
 check('draft appears before debounce, rows unchanged',JSON.stringify([inputOf(screen).props.value,rowsOf(screen)]),JSON.stringify(['no-match-before-150',['4','5']]));
 await clock.advance(149);
 check('one ms before deadline remains unapplied',rowsOf(screen),['4','5']);
 await reset(screen);
 check('reset before deadline clears draft and restores scope',JSON.stringify([inputOf(screen).props.value,screen.root.findByType('SingleSelect').props.value,rowsOf(screen)]),JSON.stringify(['','all',['4','5']]));
 await clock.advance(1);
 check('old query cannot apply at its original 150ms deadline',JSON.stringify([inputOf(screen).props.value,rowsOf(screen)]),JSON.stringify(['',['4','5']]));
 await clock.advance(149);
 check('reset blank debounce completes without changing rows',JSON.stringify([inputOf(screen).props.value,rowsOf(screen)]),JSON.stringify(['',['4','5']]));
 await type(screen,'no-match-after-150'); await clock.advance(150);
 check('query applies after full 150ms',rowsOf(screen),[]);
 await reset(screen);
 check('reset after settled query restores field and scope',JSON.stringify([inputOf(screen).props.value,screen.root.findByType('SingleSelect').props.value,rowsOf(screen)]),JSON.stringify(['','all',['4','5']]));
 await clock.advance(151);
 check('post-reset blank deadline cannot restore stale query',JSON.stringify([inputOf(screen).props.value,rowsOf(screen)]),JSON.stringify(['',['4','5']]));
 await act(()=>screen.unmount());

 screen=await mount();
 await type(screen,'not-found-yet'); await clock.advance(40); await reset(screen); await reset(screen);
 check('repeated reset clears both draft and status',JSON.stringify([inputOf(screen).props.value,screen.root.findByType('SingleSelect').props.value,rowsOf(screen)]),JSON.stringify(['','all',['4','5']]));
 await type(screen,'no-match-after-reset'); await clock.advance(149);
 check('typing after repeated reset is still pending',JSON.stringify([inputOf(screen).props.value,rowsOf(screen)]),JSON.stringify(['no-match-after-reset',['4','5']]));
 await clock.advance(1);
 check('latest unique query applies after repeated reset',rowsOf(screen),[]);
 await reset(screen); await clock.advance(151);
 check('second reset keeps restored list',rowsOf(screen),['4','5']);
 await act(()=>screen.unmount());

 screen=await mount();
 await type(screen,'5'); await clock.advance(50); await act(()=>statusOf(screen)('processing'));
 check('status update preserves draft and applies current status',JSON.stringify([inputOf(screen).props.value,screen.root.findByType('SingleSelect').props.value]),JSON.stringify(['5','processing']));
 await clock.advance(100);
 check('status and just-settled query combine',rowsOf(screen),['5']);
 await reset(screen); await clock.advance(151);
 check('reset during active status/search restores all defaults',JSON.stringify([inputOf(screen).props.value,screen.root.findByType('SingleSelect').props.value,rowsOf(screen)]),JSON.stringify(['','all',['4','5']]));
 await act(()=>screen.unmount());

 screen=await mount();
 await type(screen,'pending-on-unmount');
 check('input has pending debounce before unmount',clock.pending()>0,true);
 await act(()=>screen.unmount());
 check('unmount cancels pending debounce',clock.pending(),0);
 await clock.advance(500);
 check('unmount deadline leaves no delayed mutation',clock.pending(),0);

 screen=await mount();
 const beforeNavigation=navigation.length;
 const row=screen.root.findAllByType('CatalogItemCard')[0];
 await act(()=>row.props.onPress());
 check('detail route preserves stable record ID',navigation.slice(beforeNavigation),[['push',{pathname:'/(cashier)/biling/detail',params:{id:'4'}}]]);
 await act(()=>screen.unmount());
}
main().catch(error=>errors.push(error.stack||String(error))).finally(()=>{
 const inputs=[...cache].map(([file,record])=>({file:path.relative(process.cwd(),file).replaceAll('\\','/'),sha256:record.sha256}));
 const result={status:checks.every(x=>x.passed)&&errors.length===0?'PASS':'FAIL',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,errors,checks,inputs,boundary:'Actual BillsScreen, actual SearchBar effects, existing bills helper/fixtures, virtual clock and presentation/router adapters. No keyboard, native UI, browser, API or Figma certification.'};
 fs.writeFileSync(resultPath,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,passed:result.passed,failed:result.failed,errors}));process.exitCode=result.failed||errors.length?1:0;
});



