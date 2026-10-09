// Independent QC caller verification: actual SearchBar, SortActionSheet and useSearch.
// Input/native/actionsheet/animation/icon primitives are host adapters.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {React,act,create,errors,loadComponent,makeClock} = require('../senior-7-2026-10-09/barcode-lifecycle.cjs');
const clock = makeClock();
const sourceFiles = ['components/common/SortActionSheet.tsx','components/common/SearchBar.tsx','hooks/useSearch.ts'];
const hashes = () => Object.fromEntries(sourceFiles.map(file => [file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const before = hashes();
const Sort = loadComponent(sourceFiles[0],clock);
function load(file,dependencies) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{
    jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,
  }}).outputText;
  vm.runInNewContext(output,{exports,require:name => {
    if (!(name in dependencies)) throw Error('Unexpected dependency: '+name);
    return dependencies[name];
  },setTimeout:clock.setTimeout,clearTimeout:clock.clearTimeout},{filename:file});
  return exports.default;
}
const SearchBar = load(sourceFiles[1],{
  react:React,'@expo/vector-icons/Entypo':'Entypo','lucide-react-native':{ArrowUpDown:'ArrowUpDown'},
  'react-native':{View:'View'},'@/components/common/BouncyPressable':'BouncyPressable',
  '@/components/common/SortActionSheet':Sort,'@/constants/Colors':{Colors:{zinc:{400:'gray'}}},
  '@/lib/utils':{cn:(...parts)=>parts.filter(Boolean).join(' ')},'../icons':{FilterIcon:'FilterIcon'},
  '../ui/input':{Input:'Input',InputField:'InputField'},
});
const useSearch = load(sourceFiles[2],{react:React});
const data = [
  {label:'Menu Beta',created_at:'2026-10-01'},
  {label:'Menu Alpha',created_at:'2026-10-02'},
  {label:'Menu Gamma',created_at:'2026-10-03'},
];
const changes = [], checks = [];
let current, setExternalSort;
function Caller(props) {
  const [search,setSearch] = React.useState('');
  const [sort,setSort] = React.useState('newest');
  setExternalSort = setSort;
  const {results} = useSearch(data,search,item=>item.label,{sortBy:sort});
  // useSearch was loaded in a VM; normalize its array into this assertion realm.
  current = {search,sort,labels:Array.from(results,item=>item.label)};
  return React.createElement(SearchBar,{search,setSearch,debounce:false,withSort:true,sortBy:sort,
    onSortChange:value=>{changes.push(value);setSort(value);},...props});
}
function check(name,actual,expected) { assert.deepEqual(actual,expected,name);checks.push({name,pass:true}); }
async function main() {
  let renderer,props = {};
  await act(async()=>{renderer=create(React.createElement(Caller,props));});
  const update = patch => act(async()=>{props={...props,...patch};renderer.update(React.createElement(Caller,props));});
  const sheet = () => renderer.root.findByType('Actionsheet');
  const rows = () => renderer.root.findAllByType('Pressable').slice(2);
  const selected = () => rows().filter(row=>row.props.className.includes('border-primary ')).map(row=>row.findAllByType('Text')[0].props.children);
  const choose = label => act(async()=>rows().find(row=>row.findAllByType('Text')[0].props.children===label).props.onPress());
  const open = () => act(async()=>renderer.root.findByType('BouncyPressable').props.onPress());
  const save = () => act(async()=>renderer.root.findAllByType('Pressable')[1].props.onPress());
  const cancel = () => act(async()=>renderer.root.findAllByType('Pressable')[0].props.onPress());
  const search = value => act(async()=>renderer.root.findByType('InputField').props.onChangeText(value));
  const newest = ['Menu Gamma','Menu Alpha','Menu Beta'];
  const ascending = ['Menu Alpha','Menu Beta','Menu Gamma'];
  check('caller defaults to newest actual search results',current.labels,newest);
  await open();await choose('A - Z');
  check('sort draft leaves actual caller results unchanged',[current.sort,current.labels,changes],['newest',newest,[]]);
  await search('Menu');
  check('search rerender preserves pending sort draft',selected(),['A - Z']);
  await save();
  check('save updates actual search order and closes sheet',[current.labels,sheet().props.isOpen,changes],[ascending,false,['a-z']]);
  await open();
  check('reopen uses actual caller callback echo',selected(),['A - Z']);
  await choose('Z - A');await cancel();
  check('cancel leaves actual order and callback count unchanged',[current.labels,changes.length,sheet().props.isOpen],[ascending,1,false]);
  await open();await choose('Z - A');
  await act(async()=>setExternalSort('newest'));
  check('external reset during open sheet replaces pending sort',selected(),['Terbaru dibuat']);
  await save();
  check('confirm external reset uses actual newest results',[current.labels,changes.at(-1)],[newest,'newest']);
  await search('Alp');await open();await choose('Z - A');await save();
  check('sort preserves actual active search and filtered results',[current.search,current.labels],['Alp',['Menu Alpha']]);
  await search('');
  check('clearing search retains committed descending sort',current.labels,['Menu Gamma','Menu Beta','Menu Alpha']);
  await act(async()=>setExternalSort('a-z'));await open();await choose('Z - A');
  const count=changes.length;
  await act(async()=>sheet().props.onClose());
  await open();
  check('backdrop cancel discards draft through actual SearchBar state',[selected(),changes.length],[['A - Z'],count]);
  await cancel();
  let customOpens=0;
  await update({onSortPress:()=>customOpens++});await open();
  check('custom sort callback bypasses built-in opening',[customOpens,sheet().props.isOpen],[1,false]);
  await act(async()=>renderer.unmount());
  check('caller unmount clears timers and produces no runtime warnings',[clock.pending(),errors],[0,[]]);
  const after=hashes();
  check('caller sources stable before and after test',after,before);
  fs.writeFileSync(path.join(__dirname,'search-sort-results.json'),JSON.stringify({status:'PASS',passed:checks.length,
    failed:0,checks,before,after,errors,scope:'Actual SearchBar, SortActionSheet and useSearch with host primitive adapters; no full screen/API/native.'},null,2)+'\n');
  console.log(JSON.stringify({suite:'search-sort',passed:checks.length,failed:0}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
