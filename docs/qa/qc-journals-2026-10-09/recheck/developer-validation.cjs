// Production screens/store/schema and exact production parseNumber/formatRp declarations.
// Native/UI/router/calendar adapters; no API, persistence, browser or device.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const oldRunner = fs.readFileSync(path.resolve('docs/qa/codex-3/journals/lifecycle.cjs'),'utf8');
const testStart=oldRunner.indexOf('\n(async()=>{');
if(testStart<0)throw new Error('Lifecycle bootstrap boundary missing');
let bootstrap = oldRunner.slice(0,testStart);
const utilsFile='lib/utils/index.ts';
const utilsSource=ts.createSourceFile(utilsFile,fs.readFileSync(utilsFile,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const declarations=utilsSource.statements.filter(node=>ts.isFunctionDeclaration(node)&&['parseNumber','formatRp'].includes(node.name?.text));
if(declarations.length!==2)throw new Error('Expected the two production numeric declarations');
const utilsCode=ts.transpileModule(declarations.map(node=>node.getText(utilsSource)).join('\n'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const utilsModule={exports:{}};
vm.runInNewContext(utilsCode,{module:utilsModule,exports:utilsModule.exports},{filename:utilsFile});
const adapterLine=bootstrap.split('\n').find(line=>line.includes("if(name==='@/lib/utils')"));
if(!adapterLine)throw new Error('Production numeric adapter seam missing');
bootstrap=bootstrap.replace(adapterLine,"  if(name==='@/lib/utils')return {cn:(...v)=>v.filter(Boolean).join(' '),...productionUtils};");
const tests = `
(async()=>{
 const invalids=[
  {name:'invalid ISO day',change:j=>({...j,date:'2026-02-30'})},
  {name:'invalid abbreviated day',change:j=>({...j,date:'31 Apr 2026'})},
  {name:'non-leap date',change:j=>({...j,date:'29 Feb 2025'})},
  {name:'foreign date text',change:j=>({...j,date:'not a date'})},
  {name:'missing account ID',change:j=>({...j,lines:j.lines.map((l,i)=>i?l:{...l,accountId:''})})},
  {name:'whitespace account identity',change:j=>({...j,lines:j.lines.map((l,i)=>i?l:{...l,accountId:' ',accountCode:' ',accountName:' '})})},
  {name:'empty lines',change:j=>({...j,lines:[]})},
  {name:'one balanced line',change:j=>({...j,lines:[{...j.lines[0],credit:1000}]})},
  {name:'balanced negative netting',change:j=>({...j,lines:[{...j.lines[0],debit:1500},j.lines[1],{...line('negative',500),debit:-500}]})},
  {name:'balanced infinity',change:j=>({...j,lines:j.lines.map((l,i)=>({...l,debit:i?0:Infinity,credit:i?Infinity:0}))})},
  {name:'NaN hidden by totals fallback',change:j=>({...j,lines:[...j.lines,{...line('nan',0),debit:NaN}]})},
  {name:'finite rows overflowing total',change:j=>({...j,lines:[line('d1',1e308),line('d2',1e308),line('c1',1e308,true),line('c2',1e308,true)]})},
  {name:'unbalanced journal',change:j=>({...j,lines:j.lines.map((l,i)=>i?l:{...l,debit:1500})})},
  {name:'all zero journal',change:j=>({...j,lines:j.lines.map(l=>({...l,debit:0,credit:0}))})},
  {name:'whitespace reference',change:j=>({...j,referenceNumber:' '})},
  {name:'whitespace description',change:j=>({...j,description:' '})},
 ];
 for(kind of [{name:'general',folder:'general-journal',collection:'journals',add:'addJournal',update:'updateJournal',placeholder:'11001',factor:2},
              {name:'adjusting',folder:'adjusting-journal',collection:'adjustingJournals',add:'addAdjustingJournal',update:'updateAdjustingJournal',placeholder:'AJP-0626-005',factor:1}]){
  console.log('Validation '+kind.name);
  Route=load('app/(no-layout)/(back-office)/report/accounting/'+kind.folder+'/modify.tsx').default;
  const start=async record=>{
   await reset();
   await setList([record,fixture('b','REF-B',2000)]);
   let writes=0;
   const original=store.getState()[kind.update];
   await act(async()=>store.setState({[kind.update]:(...args)=>{writes++;return original(...args);}}));
   await render('a');return ()=>writes;
  };
  for(const test of [...invalids,...(kind.name==='adjusting'?[{name:'whitespace adjustment type',change:j=>({...j,adjustmentType:' '})}]:[])]){
   const record=test.change(fixture('a','REF-A',1000));
   const writes=await start(record);
   if(['balanced infinity','finite rows overflowing total'].includes(test.name)){
    check(kind.name+': '+test.name+' cannot show balanced badge',renderer.root.findAllByType('Text').some(n=>text(n)==='Seimbang'),false);
   }
   await act(async()=>save().props.onPress());
   check(kind.name+': '+test.name+' blocks mutation',writes(),0);
   check(kind.name+': '+test.name+' opens error',renderer.root.findByType('AlertModal').props.openState[0],true);
   check(kind.name+': '+test.name+' leaves save unlocked',Boolean(save().props.isDisabled),false);
   check(kind.name+': '+test.name+' retains description draft',desc().props.value,record.description);
  }
  for(const date of ['2026-06-30','17 Maret 2026','08 Oct 2025','08 Okt 2025','29 Feb 2024']){
   const writes=await start(fixture('a','REF-A',1000,date));
   await act(async()=>save().props.onPress());
   check(kind.name+': valid '+date+' saves once',writes(),1);
   check(kind.name+': valid '+date+' preserves date text',recordFor('a').date,date);
   check(kind.name+': valid '+date+' shows success',renderer.root.findByType('SuccessModal').props.openState[0],true);
  }
  const whitespaceRecord=fixture('a','  REF-A  ',1000);
  whitespaceRecord.description='  Description a  ';
  whitespaceRecord.lines=whitespaceRecord.lines.map(l=>({...l,accountId:'  '+l.accountId+'  '}));
  let writes=await start(whitespaceRecord);await act(async()=>save().props.onPress());
  check(kind.name+': surrounding whitespace stays compatible',writes(),1);
  check(kind.name+': valid record payload identity unchanged',recordFor('a').lines.map(l=>[l.id,l.accountId]),whitespaceRecord.lines.map(l=>[l.id,l.accountId]));
  writes=await start(fixture('a','REF-A',1000));
  await field(amounts()[0],'9'.repeat(400));await field(amounts()[kind.factor===2?3:1],'9'.repeat(400));
  await act(async()=>save().props.onPress());
  check(kind.name+': overflowing input through production numeric parser blocked',writes(),0);
  check(kind.name+': overflowing input leaves save unlocked',Boolean(save().props.isDisabled),false);
  writes=await start(fixture('a','REF-A',1000,'31 Apr 2026'));
  await field(ref(),'RETRY-REF');await field(desc(),'Retained retry draft');
  await act(async()=>save().props.onPress());
  const calendar=renderer.root.findAllByType('Pressable').find(n=>text(n)==='31 Apr 2026');
  await act(async()=>calendar.props.onPress());
  await act(async()=>picker.onChange({type:'set'},new Date(2026,3,30)));
  await act(async()=>save().props.onPress());
  check(kind.name+': invalid date can be corrected and retried once',writes(),1);
  check(kind.name+': successful retry keeps reference draft',recordFor('a').referenceNumber,'RETRY-REF');
  check(kind.name+': successful retry keeps description draft',recordFor('a').description,'Retained retry draft');
  check(kind.name+': successful retry saves selected date',recordFor('a').date,'30 Apr 2026');
  check(kind.name+': successful retry then locks action',Boolean(save().props.isDisabled),true);
  await act(async()=>save().props.onPress());check(kind.name+': retry cannot duplicate saved mutation',writes(),1);
  await unmount();
 }
 check('No unexpected React runtime errors',errors,[]);
 const sources=['app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx','app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx','lib/utils/index.ts','store/accountingStore.ts','schema/accounting/general-journal.ts','schema/accounting/adjusting-journal.ts','lib/accounting/journal-date.ts','lib/accounting/date.ts'];
 if(fs.existsSync('lib/accounting/journal-validation.ts'))sources.push('lib/accounting/journal-validation.ts');
 const result={owner:'Codex-3',ticket:'SD3-003',scope:'Actual journal routes/store and production numeric declarations; native/UI/router/calendar adapters. No API/persistence/browser/native.',passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,sourceHashes:Object.fromEntries(sources.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))};
 fs.writeFileSync(path.join(__dirname,process.argv.includes('--balance-baseline')?'balance-baseline.json':baseline?'baseline.json':'results.json'),JSON.stringify(result,null,2)+'\\n');
 console.log(JSON.stringify({passed:result.passed,failed:result.failed,failures:checks.filter(c=>!c.passed).map(c=>c.name)}));process.exitCode=result.failed?1:0;
})().catch(e=>{console.error(e);process.exitCode=2;});
`;
new Function('require','__dirname','productionUtils',bootstrap+tests)(require,__dirname,utilsModule.exports);
