const fs=require('fs');
const ts=require('typescript');
const vm=require('vm');
const root=process.cwd();
function loadTs(relativePath,mocks={}) {
 const source=fs.readFileSync(`${root}/${relativePath}`,'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const module={exports:{}};
 const localRequire=(name)=>Object.prototype.hasOwnProperty.call(mocks,name)?mocks[name]:require(name);
 vm.runInNewContext(output,{exports:module.exports,require:localRequire,Number,Array,Object});
 return module.exports;
}
const pricing=loadTs('lib/cashier-cart-pricing.ts');
const {getCartItemPricing,getCartSubtotal}=pricing;
const menu=(sell_price,discount)=>({name:'sample',sell_price,discount});
const item=(price=100,amount=1,variants=[])=>({id:'i',menu:menu(price),amount,variants});
const checks=[
 ['discount price zero',getCartItemPricing({...item(500,2),menu:menu(500,{price:0})}),{unitPrice:0,lineTotal:0}],
 ['discount snapshot wins',getCartItemPricing({...item(500,2),menu:menu(500,{price:375})}),{unitPrice:375,lineTotal:750}],
 ['base price fallback',getCartItemPricing(item(550,3)),{unitPrice:550,lineTotal:1650}],
 ['single variant',getCartItemPricing(item(1000,2,[{price:250}])),{unitPrice:1250,lineTotal:2500}],
 ['multiple variants',getCartItemPricing(item(1000,2,[{price:250},{price:75}])),{unitPrice:1325,lineTotal:2650}],
 ['quantity one',getCartItemPricing(item(999,1)),{unitPrice:999,lineTotal:999}],
 ['zero quantity rejected',getCartItemPricing(item(999,0)),null],
 ['fractional quantity rejected',getCartItemPricing(item(999,1.5)),null],
 ['negative price rejected',getCartItemPricing(item(-1)),null],
 ['fractional Rupiah unsupported',getCartItemPricing(item(99.5)),null],
 ['NaN variant rejected',getCartItemPricing(item(100,1,[{price:NaN}])),null],
 ['variant overflow rejected',getCartItemPricing(item(Number.MAX_SAFE_INTEGER,1,[{price:1}])),null],
 ['line overflow rejected',getCartItemPricing(item(Number.MAX_SAFE_INTEGER,2)),null],
 ['multiple groups summed',getCartSubtotal({details:[{items:[item(100,2)]},{items:[item(50,3)]}]}),350],
 ['empty cart is zero',getCartSubtotal({details:[]}),0],
 ['invalid nested item fails closed',getCartSubtotal({details:[{items:[item(100)]},{items:[item(-1)]}]}),null],
];
let failures=0;
for(const [label,actual,expected] of checks){const passed=JSON.stringify(actual)===JSON.stringify(expected);console.log(`${passed?'PASS':'FAIL'} ${label}: ${JSON.stringify(actual)}`);if(!passed)failures++;}
const mutable=item(100,2,[{price:3}]);const before=JSON.stringify(mutable);getCartItemPricing(mutable);const unchanged=JSON.stringify(mutable)===before;console.log(`NO_MUTATION ${unchanged}`);if(!unchanged)failures++;
// Load the real source fixture graph; only its irrelevant image asset module is stubbed.
const imageStub={examples:{menu_item:{safeAssetStub:true},menu_item_2:{safeAssetStub:true},menu_item_3:{safeAssetStub:true},menu_item_4:{safeAssetStub:true}}};
const menuModule=loadTs('constants/data/menu.ts',{'@/assets/images':{IMAGES:imageStub}});
const variantModule=loadTs('constants/data/variant.ts');
const cartModule=loadTs('constants/data/cart.ts',{'./menu':menuModule,'./variant':variantModule});
const fixture=cartModule.CART;
const fixtureLines=fixture.details.flatMap(group=>group.items.map(getCartItemPricing));
const fixtureSubtotal=getCartSubtotal(fixture);
console.log(`ACTUAL_CART_FIXTURE itemTotals=${JSON.stringify(fixtureLines)} subtotal=${fixtureSubtotal}`);
if(JSON.stringify(fixtureLines)!==JSON.stringify([{unitPrice:43000,lineTotal:43000},{unitPrice:50000,lineTotal:100000}])||fixtureSubtotal!==143000)failures++;
if(failures)process.exitCode=1;
