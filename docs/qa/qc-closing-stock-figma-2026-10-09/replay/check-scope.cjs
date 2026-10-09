const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const packet=__dirname,results=[];
const check=(name,run)=>{try{run();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}};
const printer=ts.createPrinter({removeComments:true});
function declarations(file){const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),found={};function visit(node){if((ts.isFunctionDeclaration(node)||ts.isVariableDeclaration(node))&&node.name&&ts.isIdentifier(node.name))found[node.name.text]=printer.printNode(ts.EmitHint.Unspecified,node,source);ts.forEachChild(node,visit);}visit(source);return found;}
for(const [file,names]of Object.entries({'components/common/Header.tsx':['handleBackPress'],'components/common/SearchBar.tsx':['handleSortClick'],'components/common/SingleSelect.tsx':['handleOpen','handleClose','handleSelectOption','handleSave','filteredItems'],'components/custom/BottomTab.tsx':['BottomTabPadding','handlePress','handlePressIn','handlePressOut']})){
 const old=declarations(path.join(packet,'before',file+'.txt')),current=declarations(file);
 for(const name of names)check(file+' '+name+' behavior AST unchanged',()=>{assert.ok(old[name]);assert.equal(current[name],old[name]);});
}
const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
let pathname='/inventory/closing-stock';const Bottom=Symbol('BottomTab'),TabScreen=Symbol('TabScreen');
const modules={'expo-router':{Tabs:{Screen:TabScreen},usePathname:()=>pathname},'@/components/common/Header':{__esModule:true,default:Symbol('Header')},'@/components/custom/BottomTab':{__esModule:true,default:Bottom},'@/components/icons':{EFeather:Symbol('Feather'),EMaterial:Symbol('Material'),Inventory:Symbol('Inventory'),Report:Symbol('Report')},'react/jsx-runtime':jsx};
const file='app/(back-office)/_layout.tsx',loaded={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports:loaded,require:name=>{assert.ok(modules[name],name);return modules[name];}});
for(const location of ['/inventory/closing-stock','/inventory','/home','/report','/catalog','/manage'])check('appearance isolation for '+location,()=>{pathname=location;const tree=loaded.default(),tab=tree.props.tabBar({state:{index:3}});assert.equal(tab.type,Bottom);assert.equal(tab.props.appearance,location==='/inventory/closing-stock'?'figma':'default');assert.equal(tree.props.children.length,5);});
const sourceHashes=Object.fromEntries(['app/(back-office)/_layout.tsx','components/common/Header.tsx','components/common/SearchBar.tsx','components/common/SingleSelect.tsx','components/custom/BottomTab.tsx'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const result={passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results,sourceHashes,scope:'Behavior callback AST guards and actual BO layout execution with JSX/router adapters. Not full default consumer/browser/native certification.'};
fs.writeFileSync(path.join(packet,'scope-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));process.exitCode=result.failed?1:0;
