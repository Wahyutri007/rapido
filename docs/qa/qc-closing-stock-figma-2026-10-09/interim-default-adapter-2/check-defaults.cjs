const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),base=path.join(__dirname,'replay/before'),results=[],errors=[];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'Fragment'};
const noop=()=>{},tag=name=>name,cn=(...args)=>args.flat(Infinity).filter(Boolean).join(' ');
let width=390;
const React={useState:initial=>[typeof initial==='function'?initial():initial,noop],useRef:value=>({current:value}),useMemo:fn=>fn(),useEffect:noop};
const stubs={
 'react':{__esModule:true,default:React,...React},'react/jsx-runtime':jsx,
 'react-native':{View:tag('View'),Text:tag('NativeText'),Pressable:tag('Pressable'),useWindowDimensions:()=>({width,height:844})},
 'expo-router':{useRouter:()=>({push:noop}),router:{canGoBack:()=>false,back:noop}},
 'expo-image':{Image:tag('Image')},'expo-status-bar':{StatusBar:tag('StatusBar')},
 '@expo/vector-icons':{Entypo:tag('Entypo'),Feather:tag('Feather')},
 '@expo/vector-icons/Entypo':{__esModule:true,default:tag('Entypo')},
 'react-native-reanimated':{__esModule:true,default:{View:tag('AnimatedView')},useSharedValue:v=>({get:()=>v,set:noop}),useAnimatedStyle:fn=>fn(),withSpring:v=>v,withSequence:(...values)=>values.at(-1)},
 'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,left:0,right:0,bottom:0})},
 '@/lib/utils':{cn,tw:n=>4*n},'@/constants':{Constants:{statusBarHeight:0}},
 '@/constants/Colors':{Colors:{zinc:{100:'#f4f4f5',400:'#a1a1aa',500:'#71717a'},primary:'#2878ff',neutral:'#222222'}},
 '@/constants/Fonts':{FONT_NAMES:{regular:'InterRegular',medium:'InterMedium',semibold:'InterSemiBold',bold:'InterBold'}},
 '@/lib/haptics':{haptic:{selection:noop}},
 '@/lib/ui/figma-stock':{figmaStockTheme:{'--local':'figma'},figmaStockShadows:{control:{boxShadow:'control'},card:{boxShadow:'card'},tab:{boxShadow:'tab'}}},
 '@gluestack-ui/utils/nativewind-utils':{tva:config=>args=>cn(config.base,...Object.entries(config.variants).map(([key,values])=>values[args[key]]),args.className)},
 '../ui/input':{Input:tag('Input'),InputField:tag('InputField')},'../icons':{FilterIcon:tag('FilterIcon')},
 'lucide-react-native':{ArrowUpDown:tag('ArrowUpDown')},
 '@/components/ui/actionsheet':Object.fromEntries(['Actionsheet','ActionsheetBackdrop','ActionsheetContent','ActionsheetDragIndicator','ActionsheetDragIndicatorWrapper','ActionsheetScrollView'].map(n=>[n,tag(n)])),
};
for(const name of ['Text','BouncyPressable','SearchBar','SortActionSheet'])stubs['@/components/common/'+name]={__esModule:true,default:tag(name)};
function load(file,extra=''){
 const source=fs.readFileSync(file,'utf8'),exports={};
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(output+extra,{exports,require:name=>{if(name.endsWith('.svg'))return name;assert(stubs[name],'Unsupported adapter '+name);return stubs[name];},setTimeout:()=>1,clearTimeout:noop},{filename:file});return exports;
}
function style(value){if(Array.isArray(value))return Object.assign({},...value.filter(Boolean).map(style));return value||{};}
function normalize(value,key=''){
 if(key==='className')return [...new Set(String(value).split(/\s+/).filter(Boolean))].sort().join(' ');
 if(key==='style')return normalize(style(value));
 if(typeof value==='function')return '<callback>';
 if(Array.isArray(value))return value.flat(Infinity).filter(v=>v!==false&&v!==null&&v!==undefined&&v!==true).map(v=>normalize(v));
 if(value&&typeof value==='object'){
  if(typeof value.type==='function')return normalize(value.type(value.props));
  const result={};for(const [k,v]of Object.entries(value)){if(k==='style'&&!Object.keys(style(v)).length)continue;if(v!==undefined&&v!==false&&v!==null)result[k]=k==='children'?normalize([v]):normalize(v,k);}return result;
 }
 return value;
}
function check(name,run){try{run();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}}
const files=['components/common/Header.tsx','components/common/SearchBar.tsx','components/common/SingleSelect.tsx','components/common/Card.tsx','components/custom/BottomTab.tsx'];
// Execute the actual Text primitive so implicit and explicit size=body are compared
// after its defaults, and execute nested TabItemButton instead of comparing unused props.
stubs['@/components/common/Text']={__esModule:true,default:load(path.join(root,'components/common/Text.tsx')).default};
const pairs=Object.fromEntries(files.map(file=>[file,{before:load(path.join(base,file+'.txt'),file.includes('BottomTab')?'\nexports.__QC_TabItemButton=TabItemButton;':''),current:load(path.join(root,file),file.includes('BottomTab')?'\nexports.__QC_TabItemButton=TabItemButton;':'')}])) ;
const sharedChild={type:'SentinelChild',props:{children:'existing caller child'}};
const props={
 'components/common/Header.tsx':[{title:'Persediaan'},{title:'Detail',back:noop,right:sharedChild}],
 'components/common/SearchBar.tsx':[{search:'stok',setSearch:noop},{search:'',setSearch:noop,withFilter:true,onFilterPress:noop},{search:'',setSearch:noop,withSort:true,onSortChange:noop,sortBy:'oldest'}],
 'components/common/SingleSelect.tsx':[{items:[{label:'Semua Toko',value:'all'}],value:'all',onValueChange:noop},{items:[{label:'Toko',value:'a'}],value:undefined,disabled:true,leftIcon:sharedChild},{items:[{label:'Toko',value:'a'}],value:'a',searchable:true,showConfirmButton:true}],
 'components/common/Card.tsx':[{children:sharedChild},{children:sharedChild,density:'compact',style:{marginTop:8}},{children:sharedChild,density:'flush',className:'gap-4'}],
 'components/custom/BottomTab.tsx':[{state:{index:3,routes:['home','report','catalog','inventory','manage'].map(n=>({name:n,key:n}))},descriptors:Object.fromEntries(['home','report','catalog','inventory','manage'].map(n=>[n,{options:{tabBarLabel:n,tabBarIcon:noop}}])),navigation:{navigate:noop}}]
};
for(const w of [320,360,390,844]){width=w;for(const file of files)for(const [index,input]of props[file].entries()){
 check(file+' default output matches baseline '+w+' / '+index,()=>{
  const pair=pairs[file],before=normalize(pair.before.default(input)),after=normalize(pair.current.default(input));assert.deepEqual(after,before);
 });
}}
for(const focused of [false,true])check('TabItemButton default label/icon/weight matches baseline focused='+focused,()=>{
 const pair=pairs['components/custom/BottomTab.tsx'],input={label:'Inventory',isFocused:focused,itemColor:'#222222',tabBarIcon:noop,onPress:noop};assert.deepEqual(normalize(pair.current.__QC_TabItemButton(input)),normalize(pair.before.__QC_TabItemButton(input)));
});
const result={scope:'Executed current/baseline shared component JSX with hook/native/router host adapters. Presentation/props comparison only; callback bodies independently checked by scope suite. Not browser/default caller/native certification.',passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results,sourceHashes:Object.fromEntries(files.map(f=>[f,hash(path.join(root,f))]))};
fs.writeFileSync(path.join(__dirname,'default-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,failed:result.failed,failedNames:result.results.filter(r=>!r.pass).slice(0,4).map(r=>({name:r.name,error:r.error.slice(0,1600)}))}));process.exitCode=result.failed?1:0;
