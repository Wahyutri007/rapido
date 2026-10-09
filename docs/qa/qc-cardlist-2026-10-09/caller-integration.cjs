// Run from application root. Seven actual report screens, report builders and CardList.
// FilterRow/action controls, native/UI/formatter/container primitives are adapters.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
const assert=require('node:assert/strict');
const {React,act,create,errors}=require('../senior-7-2026-10-09/barcode-lifecycle.cjs');
const names=['summary','sales','purchase-supplier','product-stock','operational-team','customers-promos','cash'];
const builderFile=name=>'components/feature/reports/'+name+'/index.'+(name==='sales'?'tsx':'ts');
const screenFile=name=>'app/(no-layout)/(back-office)/report/'+name+'.tsx';
const files=['components/custom/CardList.tsx',...names.map(screenFile),...names.map(builderFile)];
const hashes=()=>Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before=hashes(),checks=[];
const hosts=names=>Object.fromEntries(names.map(name=>[name,name]));
const utils={cn:(...parts)=>parts.filter(Boolean).join(' '),tw:value=>value*4,
  formatRp:value=>Number(value).toLocaleString('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})};
function load(file,dependencies){const exports={};
  const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{
    jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,
  }}).outputText;
  new Function('exports','require',output)(exports,name=>{
    if(name==='react')return React;if(name in dependencies)return dependencies[name];throw Error('Unexpected '+name+' in '+file);
  });return exports;
}
const card=load(files[0],{
  'react-native':hosts(['Pressable','ScrollView','View']),'@expo/vector-icons':{Feather:'Feather'},
  '@gluestack-ui/utils/nativewind-utils':{tva:()=>()=>''},'@/components/common/Text':'Text',
  '@/components/ui/actionsheet':hosts(['Actionsheet','ActionsheetBackdrop','ActionsheetContent','ActionsheetDragIndicator','ActionsheetDragIndicatorWrapper']),
  '@/components/ui/button':hosts(['Button','ButtonText']),'@/constants/Colors':{Colors:{zinc:{50:'white'}}},'@/lib/utils':utils,
});
const builderDependencies={'@/lib/utils':utils,'react-native':hosts(['Pressable','View']),
  '@/components/common/Text':'Text','@/components/custom/CardList':card};
const reports={FilterRow:'FilterRow',ReportActionButton:'ReportActionButton'};
for(const name of names)Object.assign(reports,load(builderFile(name),builderDependencies));
function check(name,actual,expected){assert.deepEqual(actual,expected,name);checks.push({name,passed:true});}
const cases=[];
async function main(){
  for(const name of names){
    const Screen=load(screenFile(name),{
      'react-native':{View:'View'},'@/components/common/AnimatedWrapper':'AnimatedWrapper',
      '@/components/common/Text':'Text','@/components/custom/CardList':card,
      '@/components/feature/reports':reports,'@/lib/utils':utils,
    }).default;
    let renderer,key=0;
    const element=()=>React.createElement(React.StrictMode,null,React.createElement(Screen,{key}));
    await act(async()=>{renderer=create(element());});
    const sheet=()=>renderer.root.findByType(card.CardListFilterSheet);
    const rows=()=>sheet().findAllByType('Pressable');
    const rowLabel=row=>row.findAllByType('Text')[0].props.children;
    const selected=()=>rows().filter(row=>row.props.className.includes('border-primary-500')).map(rowLabel);
    const ids=()=>renderer.root.findAllByType(card.CardListSections).flatMap(node=>node.props.sections.map(section=>section.id??section.title));
    const open=()=>act(async()=>renderer.root.findByType('FilterRow').props.onFilterPress());
    const toggle=label=>act(async()=>rows().find(row=>rowLabel(row)===label).props.onPress());
    const apply=()=>act(async()=>sheet().findAllByType('Button')[1].props.onPress());
    const reset=()=>act(async()=>sheet().findAllByType('Button')[0].props.onPress());
    const cancel=()=>act(async()=>sheet().findByType('Actionsheet').props.onClose());
    const isOpen=()=>sheet().props.isOpen;
    const allSections=sheet().props.sections;
    const allIds=allSections.map(section=>section.id??section.title);
    const allLabels=allSections.map(section=>section.filterLabel??section.title);
    assert.ok(allIds.length>1,'Representative reports need multiple default sections');
    check(name+': default section IDs are unique',new Set(allIds).size,allIds.length);
    check(name+': actual screen initially displays all builder sections',ids(),allIds);
    await open();check(name+': actual FilterRow callback opens filter sheet',isOpen(),true);
    await toggle(allLabels[0]);
    check(name+': checkbox draft leaves actual report sections unchanged',ids(),allIds);
    await act(async()=>renderer.root.findByType('ReportActionButton').props.onOpenChange(true));
    check(name+': action-state rerender preserves local draft and report',
      [selected(),ids()],[allLabels.slice(1),allIds]);
    await apply();
    check(name+': apply filters actual screen and closes sheet',[ids(),isOpen()],[allIds.slice(1),false]);
    await open();await toggle(allLabels[0]);await cancel();
    check(name+': cancelled restoration keeps committed report subset',[ids(),isOpen()],[allIds.slice(1),false]);
    await open();await reset();
    check(name+': Reset immediately restores actual report while sheet stays open',[ids(),isOpen()],[allIds,true]);
    await toggle(allLabels[0]);await cancel();
    check(name+': cancel after Reset keeps the committed reset',ids(),allIds);
    await open();for(const label of allLabels)await toggle(label);await apply();
    check(name+': empty selection hides all actual report sections',[ids(),isOpen()],[[],false]);
    await open();await reset();await cancel();
    check(name+': Reset restores an empty report without Apply',ids(),allIds);
    await open();await toggle(allLabels[0]);await apply();
    key++;await act(async()=>renderer.update(element()));
    check(name+': route-instance remount starts with all sections again',ids(),allIds);
    cases.push({screen:name,sections:allIds.length,assertions:12});
    await act(async()=>renderer.unmount());
  }
  check('all seven StrictMode caller runs have no runtime or act errors',errors,[]);
  const after=hashes();check('report, builder and CardList sources stable during caller runs',after,before);
  fs.writeFileSync(path.join(__dirname,'caller-results.json'),JSON.stringify({status:'PASS',passed:checks.length,failed:0,
    checks,errors,cases,before,after,scope:'Seven production report screens, data builders and CardList under React StrictMode. RN/UI/FilterRow/action/formatter/container adapters; no browser/native/router/backend or report amount certification.',
  },null,2)+'\n');
  console.log(JSON.stringify({suite:'report-callers',passed:checks.length,failed:0,cases}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
