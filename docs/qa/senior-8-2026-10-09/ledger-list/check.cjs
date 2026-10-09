const fs = require("node:fs"),
	path = require("node:path");
let loader = fs
	.readFileSync(path.join(__dirname, "../account-detail/check.cjs"), "utf8")
	.replaceAll("\r\n", "\n");
const marker =
	'const store = load("store/accountingStore.ts").useAccountingStore;';
if (loader.split(marker).length !== 2) throw Error("Loader anchor changed");
loader = loader.slice(0, loader.indexOf(marker));
function replaceOnce(before, after) {
	if (loader.split(before).length !== 2)
		throw Error("Loader anchor changed: " + before);
	loader = loader.replace(before, after);
}
replaceOnce(
	"accounting/accounts/detail.tsx",
	"accounting/general-ledger/index.tsx",
);
replaceOnce("detail.before.tsx.txt", "index.before.tsx.txt");
replaceOnce(
	"return { useLocalSearchParams: () => ({ id: currentId }) };",
	"return {router:{push:p=>navigation.push(p)}};",
);
replaceOnce(
	'return { View: "View", ScrollView: "ScrollView" };',
	'return {View:"View",Pressable:"Pressable"};',
);
replaceOnce(
	'if (name.startsWith("@/components/"))',
	`
		if(name==="@/components/feature/accounting/general-ledger")return Object.fromEntries(["LedgerAccountCard","LedgerCategoryTabs","LedgerFilterActionSheet","LedgerSummaryCard"].map(n=>[n,n]));
		if (name.startsWith("@/components/"))`,
);
const cases = `
const navigation=[];
const store=load("store/accountingStore.ts").useAccountingStore;
const Screen=load(screen).default;
const accounts=Array.from({length:8},(_,i)=>({id:"a"+i,code:"10"+i,name:"Account "+i,classification:i<6?"Aset":"Beban",subClassification:"Test",currency:"IDR",balance:i*10,totalDebit:100,totalCredit:0}));
const summaryFixture={date:"2026-10-09",netBalance:280,totalDebit:800,totalCredit:0};
let renderer;
const element=()=>React.createElement(React.StrictMode,null,React.createElement(Screen));
const check=(name,actual,expected)=>checks.push({name,actual:structuredClone(actual),expected:structuredClone(expected),passed:JSON.stringify(actual)===JSON.stringify(expected)});
const cards=()=>renderer.root.findAllByType("LedgerAccountCard");
const ids=()=>cards().map(n=>n.props.account.id);
const toggle=()=>renderer.root.findAllByType("Pressable")[0];
const toggleLabel=()=>toggle()?.findByType("Text").props.children;
const summary=()=>renderer.root.findByType("LedgerSummaryCard").props.summary;
const search=async v=>act(async()=>renderer.root.findByType("SearchBar").props.setSearch(v));
const category=async v=>act(async()=>renderer.root.findByType("LedgerCategoryTabs").props.onSelectCategory(v));
const sort=async v=>act(async()=>renderer.root.findByType("LedgerFilterActionSheet").props.onSelectSort(v));
async function main(){
	store.setState({ledgerAccounts:accounts,ledgerSummary:summaryFixture});await act(async()=>{renderer=create(element());});
	check("initial preview contains first five accounts",ids(),["a0","a1","a2","a3","a4"]);
	check("initial toggle offers all",toggleLabel(),"Lihat Semua");
	check("collapsed last row ends list",cards().map(n=>n.props.isLast),[false,false,false,false,true]);
	await act(async()=>toggle().props.onPress());
	check("expand reveals every matching account",ids(),accounts.map(a=>a.id));
	check("expanded toggle offers fewer",toggleLabel(),"Tampilkan Sedikit");
	check("expanded last row ends list",cards().map(n=>n.props.isLast),[false,false,false,false,false,false,false,true]);
	check("expand leaves global summary unchanged",summary(),summaryFixture);
	await act(async()=>toggle().props.onPress());check("collapse restores preview",ids(),["a0","a1","a2","a3","a4"]);
	await search("  ACCOUNT 7 ");check("search finds item beyond original preview",ids(),["a7"]);check("single result hides toggle",Boolean(toggle()),false);
	await search("107");check("search by code uses all accounts",ids(),["a7"]);
	await search("missing");check("empty query result has no cards",ids(),[]);check("empty result has no toggle",Boolean(toggle()),false);
	check("empty message rendered",renderer.root.findAllByType("Text").some(n=>n.props.children==="Tidak ada akun buku besar yang ditemukan"),true);
	await search("");await category("Beban");check("category searches beyond original preview",ids(),["a6","a7"]);check("short category has no toggle",Boolean(toggle()),false);
	await category("Aset");check("six-result category starts with preview",ids(),["a0","a1","a2","a3","a4"]);
	await act(async()=>toggle().props.onPress());check("expand respects category",ids(),["a0","a1","a2","a3","a4","a5"]);
	await category("Semua");check("expanded preference survives category change",ids().length,8);
	await act(async()=>toggle().props.onPress());await sort("balance_desc");check("sort applies before preview",ids(),["a7","a6","a5","a4","a3"]);
	check("sort does not mutate store order",store.getState().ledgerAccounts.map(a=>a.id),accounts.map(a=>a.id));
	await sort("balance_asc");check("ascending balance preview",ids(),["a0","a1","a2","a3","a4"]);
	await sort("code_asc");check("code sort preview",ids(),["a0","a1","a2","a3","a4"]);
	await sort("name_asc");check("name sort preview",ids(),["a0","a1","a2","a3","a4"]);
	await act(async()=>renderer.root.findByType("SearchBar").props.onFilterPress());check("filter sheet opens",renderer.root.findByType("LedgerFilterActionSheet").props.isOpen,true);
	await act(async()=>renderer.root.findByType("LedgerFilterActionSheet").props.onClose());check("filter sheet closes",renderer.root.findByType("LedgerFilterActionSheet").props.isOpen,false);
	const target=cards()[1];await act(async()=>target.props.onPress(target.props.account));check("visible account opens its own detail",navigation,["/report/accounting/general-ledger/detail?id=a1"]);
	await act(async()=>store.setState({ledgerAccounts:accounts.slice(0,5)}));check("exactly five accounts render all",ids().length,5);check("five accounts need no toggle",Boolean(toggle()),false);
	await act(async()=>store.setState({ledgerAccounts:accounts.slice(0,6)}));check("growing collection remains collapsed",ids().length,5);check("growing collection offers expansion",toggleLabel(),"Lihat Semua");
	await act(async()=>toggle().props.onPress());await act(async()=>store.setState({ledgerAccounts:accounts}));check("expanded collection update reveals added accounts",ids().length,8);
	await search("7");await search("");check("expanded preference survives narrow search",ids().length,8);
	await act(async()=>store.setState({ledgerAccounts:[]}));check("empty store hides toggle",Boolean(toggle()),false);check("empty store leaves global summary contract",summary(),summaryFixture);
	await act(async()=>renderer.unmount());check("no unexpected React errors",errors,[]);
	const result={baseline,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,files:[...cache].map(([file,m])=>({file,sha256:m.sha256})),limits:"Full screen and production Zustand, host/presentation/router adapters, StrictMode. No native/browser/Figma validation."};
	fs.writeFileSync(path.join(__dirname,baseline?"baseline.json":"final.json"),JSON.stringify(result,null,2)+"\\n");console.log(JSON.stringify({passed:result.passed,failed:result.failed,failures:checks.filter(c=>!c.passed)}));process.exitCode=result.failed?1:0;
}
return main().catch(e=>{console.error(e);process.exitCode=2;});
`;
new Function("require", "__dirname", loader + cases)(require, __dirname);
