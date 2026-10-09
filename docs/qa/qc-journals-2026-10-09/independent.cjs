// Additional QC cases using the audited developer loader and production numeric
// declarations. Cases and StrictMode integration are independent of its suite.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const proposal = process.argv.includes('--proposal');
const proposalRoot = path.join(__dirname, 'proposal');
const bootstrapSource = fs.readFileSync('docs/qa/codex-3/journals/lifecycle.cjs', 'utf8');
const boundary = bootstrapSource.indexOf('\n(async()=>{');
if (boundary < 0) throw new Error('Audited loader boundary changed');
let bootstrap = bootstrapSource.slice(0, boundary);
const utilsFile = 'lib/utils/index.ts';
const utilsAST = ts.createSourceFile(utilsFile, fs.readFileSync(utilsFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const numericDeclarations = utilsAST.statements.filter((node) => ts.isFunctionDeclaration(node) && ['parseNumber', 'formatRp'].includes(node.name?.text));
if (numericDeclarations.length !== 2) throw new Error('Numeric production declarations changed');
const numericModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(numericDeclarations.map((node) => node.getText(utilsAST)).join('\n'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module: numericModule, exports: numericModule.exports });
const adapter = bootstrap.split('\n').find((value) => value.includes("if(name==='@/lib/utils')"));
if (!adapter) throw new Error('Numeric adapter seam missing');
bootstrap = bootstrap.replace(adapter, "  if(name==='@/lib/utils')return {cn:(...v)=>v.filter(Boolean).join(' '),...productionUtils};");
const renderSeams = ['renderer.update(React.createElement(Route))', 'renderer=create(React.createElement(Route))'];
for (const seam of renderSeams) {
  if (!bootstrap.includes(seam)) throw new Error('StrictMode render seam missing');
  bootstrap = bootstrap.replace(seam, seam.replace('React.createElement(Route)', 'React.createElement(React.StrictMode,null,React.createElement(Route))'));
}
if (proposal) {
  const readSeam = "fs.readFileSync(absolute,'utf8')";
  if (!bootstrap.includes(readSeam)) throw new Error('Proposal source seam missing');
  bootstrap = bootstrap.replace(readSeam, "fs.readFileSync(/accounting[\\\\/](general-journal|adjusting-journal)[\\\\/]modify\\.tsx$/.test(absolute)?path.join(proposalRoot,absolute.includes('adjusting-journal')?'adjusting.tsx':'general.tsx'):absolute,'utf8')");
}
const tests = `
(async()=>{
 for(kind of [{name:'general',folder:'general-journal',collection:'journals',add:'addJournal',update:'updateJournal',placeholder:'11001',factor:2},
              {name:'adjusting',folder:'adjusting-journal',collection:'adjustingJournals',add:'addAdjustingJournal',update:'updateAdjustingJournal',placeholder:'AJP-0626-005',factor:1}]){
  Route=load('app/(no-layout)/(back-office)/report/accounting/'+kind.folder+'/modify.tsx').default;
  const start=async record=>{
   await reset();await setList([record,fixture('b','REF-B',2000)]);
   let writes=0;const original=store.getState()[kind.update];
   await act(async()=>store.setState({[kind.update]:(...args)=>{writes++;return original(...args);}}));
   await render('a');return ()=>writes;
  };
  const balancedBadge=()=>renderer.root.findAllByType('Text').some(node=>text(node)==='Seimbang');
  const nanRecord=fixture('a','REF-A',1000);
  nanRecord.lines.push({...line('nan-row',0),debit:NaN});
  let writes=await start(nanRecord);
  check(kind.name+': NaN row must not show balanced badge',balancedBadge(),false);
  await act(async()=>save().props.onPress());
  check(kind.name+': NaN prefill blocks actual store mutation',writes(),0);
  check(kind.name+': NaN validation leaves editor unlocked',Boolean(save().props.isDisabled),false);
  check(kind.name+': NaN validation exposes numeric error',renderer.root.findByType('AlertModal').props.message.includes('angka'),true);
  check(kind.name+': NaN validation does not open success',renderer.root.findByType('SuccessModal').props.openState[0],false);

  const negativeRecord=fixture('a','REF-A',1000);
  negativeRecord.lines[0].debit=1500;
  negativeRecord.lines.push(line('negative-row',0));
  writes=await start(negativeRecord);
  const third=amounts()[2*kind.factor];
  await field(third,'-500');
  check(kind.name+': negative typed through production parser must not show balanced badge',balancedBadge(),false);
  await act(async()=>save().props.onPress());
  check(kind.name+': negative input blocks actual store mutation',writes(),0);
  check(kind.name+': negative input shows its error',renderer.root.findByType('AlertModal').props.message.includes('negatif'),true);
  check(kind.name+': invalid input leaves reference draft',ref().props.value,'REF-A');
  await field(amounts()[2*kind.factor],'0');
  await field(amounts()[kind.factor===2?3:1],'1500');
  await field(desc(),'Corrected QC draft');
  check(kind.name+': corrected valid rows show balanced badge',balancedBadge(),true);
  await act(async()=>save().props.onPress());
  check(kind.name+': correction saves exactly once',writes(),1);
  check(kind.name+': correction keeps row IDs',recordFor('a').lines.map(item=>item.id),negativeRecord.lines.map(item=>item.id));
  check(kind.name+': correction keeps description draft',recordFor('a').description,'Corrected QC draft');
  check(kind.name+': saved correction locks editor',Boolean(save().props.isDisabled),true);

  writes=await start(fixture('a','REF-A',1000,'29 Feb 2024'));
  await act(async()=>press('29 Feb 2024').props.onPress());
  await act(async()=>picker.onChange({type:'dismissed'},new Date(2025,1,28)));
  await act(async()=>save().props.onPress());
  check(kind.name+': dismissed picker preserves valid leap-date payload',recordFor('a').date,'29 Feb 2024');
  check(kind.name+': dismissed picker still saves once',writes(),1);

  writes=await start(fixture('a','REF-A',1000));
  const cachedSave=save().props.onPress;
  await setList([fixture('b','REF-B',2000)]);
  await act(async()=>cachedSave());
  check(kind.name+': deleted record rejects previously captured save callback',writes(),0);
  check(kind.name+': deleted record stays absent',recordFor('a')===undefined,true);
  await unmount();
 }
 const validator=load('lib/accounting/journal-validation.ts').journalValidationError;
 for(const kindName of ['general','adjusting']){
  const record=fixture('frozen','  REF-FROZEN  ',1000,'  29 Feb 2024  ');
  record.description='  Description retained  ';
  record.lines=record.lines.map(item=>Object.freeze({...item,accountId:'  '+item.accountId+'  ',accountCode:'  '+item.accountCode+'  ',accountName:'  '+item.accountName+'  '}));
  Object.freeze(record.lines);Object.freeze(record);
  const before=JSON.stringify(record);
  check(kindName+': frozen valid draft accepts trim-only validation',validator(record,kindName),undefined);
  check(kindName+': trim-only validation cannot mutate original frozen payload',JSON.stringify(record),before);
 }
 check('No unexpected React runtime errors',errors,[]);
 const sourceFiles=['app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx','app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx','lib/accounting/journal-validation.ts','lib/accounting/journal-date.ts','lib/accounting/date.ts','lib/utils/index.ts','store/accountingStore.ts','schema/accounting/general-journal.ts','schema/accounting/adjusting-journal.ts'];
 const result={owner:'QC',mode:proposal?'PROPOSAL_ONLY':'CURRENT_SOURCE',createdAt:new Date().toISOString(),passed:checks.filter(item=>item.passed).length,failed:checks.filter(item=>!item.passed).length,checks,errors,sourceHashes:Object.fromEntries(sourceFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')])),proposalHashes:proposal?Object.fromEntries(['general.tsx','adjusting.tsx'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(proposalRoot,file))).digest('hex')])):undefined,scope:'Production routes/store/schema/numeric functions; audited developer loader plus independent StrictMode cases. UI/native/router/calendar adapters; no real API or device.'};
 fs.writeFileSync(path.join(__dirname,proposal?'proposal-results.json':'independent-results.json'),JSON.stringify(result,null,2)+'\\n');
 console.log(JSON.stringify({mode:result.mode,passed:result.passed,failed:result.failed,errors:errors.length,failures:checks.filter(item=>!item.passed).map(item=>item.name)}));
 process.exitCode=result.failed||errors.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=2;});
`;
new Function('require', '__dirname', 'productionUtils', 'proposal', 'proposalRoot', bootstrap + tests)(require, __dirname, numericModule.exports, proposal, proposalRoot);
