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
replaceOnce("accounting/accounts/detail.tsx", "accounting/accounts/modify.tsx");
replaceOnce("detail.before.tsx.txt", "modify.before.tsx.txt");
replaceOnce(
	"return { useLocalSearchParams: () => ({ id: currentId }) };",
	'return { useLocalSearchParams: () => ({ id: currentId }), router:{back:()=>navigation.push("back"),replace:p=>navigation.push(p)} };',
);
replaceOnce(
	'return { View: "View", ScrollView: "ScrollView" };',
	'return {View:"View",ScrollView:"ScrollView",KeyboardAvoidingView:"KeyboardAvoidingView",Platform:{OS:"android"}};',
);
replaceOnce(
	'if (name.startsWith("@/components/"))',
	`
		if(name==="@/components/common/AlertModal") return {useAlertModal:load("hooks/useAlertModal.ts").useAlertModal};
		if(name==="@/components/common/Form") return Object.fromEntries(["Form","FormControl","FormField","FormInput","FormItem","FormLabel","FormMessage","FormSelect"].map(n=>[n,n]));
		if(name==="@/components/ui/button") return {Button:"Button",ButtonText:"ButtonText"};
		if (name.startsWith("@/components/"))`,
);
const cases = `
const navigation=[];
const store=load("store/accountingStore.ts").useAccountingStore;
const Screen=load(screen).default;
const a={id:"a",classification:"Harta",subClassification:"Harta Tetap",code:"100",name:"Cash A",currency:"IDR",debit:100,credit:0,description:"Desc A"};
const b={...a,id:"b",classification:"Modal",subClassification:"Laba Ditahan",code:"200",name:"Bank B",debit:0,credit:100,description:"Desc B"};
let renderer;
const element=()=>React.createElement(React.StrictMode,null,React.createElement(Screen));
const check=(name,actual,expected)=>checks.push({name,actual:structuredClone(actual),expected:structuredClone(expected),passed:JSON.stringify(actual)===JSON.stringify(expected)});
const forms=()=>renderer.root.findAllByType("Form");
const form=()=>forms()[0]?.props;
const value=key=>form()?.getValues(key);
const modal=()=>renderer.root.findAllByType("SuccessModal")[0]?.props;
const save=()=>renderer.root.findAllByType("Button").find(n=>n.props.children?.props?.children==="Simpan")?.props;
const change=async(key,value)=>act(async()=>form().setValue(key,value,{shouldDirty:true}));
async function route(id){await act(async()=>{currentId=id;renderer.update(element());});}
async function mount(id){currentId=id;await act(async()=>{renderer=create(element());});}
async function unmount(){await act(async()=>renderer.unmount());}
async function main(){
	store.setState({accounts:[a,b]});await mount("a");
	check("edit A prefill",[value("name"),value("debit"),value("description"),value("subClassification")],["Cash A",100,"Desc A","Harta Tetap"]);
	await change("name","Draft A");await change("debit",321);
	await act(async()=>store.getState().updateAccount("b",{name:"External B"}));
	check("other account update preserves draft",[value("name"),value("debit")],["Draft A",321]);
	await act(async()=>store.getState().updateAccount("a",{name:"External A",debit:555}));
	check("same account refetch preserves mounted draft",[value("name"),value("debit")],["Draft A",321]);
	await route("b");check("route A to B resets draft from current B",[value("name"),value("description"),value("subClassification")],["External B","Desc B","Laba Ditahan"]);
	await route(undefined);check("edit to create resets defaults",[value("name"),value("code"),value("debit"),value("credit"),value("description")],["","11001",0,0,""]);
	await change("name","New draft");await act(async()=>store.getState().resetBalance("a"));
	check("store change preserves create draft",value("name"),"New draft");
	await route(["b"]);check("array route selects B",value("name"),"External B");
	await route(["a","b"]);check("array route uses first ID",value("name"),"External A");
	for(const id of ["missing","",["missing"]]){await route(id);check("invalid ID "+JSON.stringify(id)+" has no editable form",forms().length,0);}
	check("invalid route does not automatically go back",navigation,[]);
	const backToList=renderer.root.findAllByType("Button").find(n=>n.props.children?.props?.children==="Kembali ke daftar");
	if(backToList) await act(async()=>backToList.props.onPress());
	check("not-found offers explicit return to account list",navigation.at(-1),"/report/accounting/accounts");navigation.length=0;
	await route("b");check("valid route recovers after invalid",value("name"),"External B");
	await act(async()=>store.getState().deleteAccount("b"));check("deleted edit target removes form",forms().length,0);
	await act(async()=>store.setState({accounts:[a,b]}));check("restored account starts from fresh defaults",value("name"),"Bank B");
	await change("classification","Kewajiban");check("classification updates invalid subclassification",value("subClassification"),"Kewajiban Jangka Pendek");
	await change("subClassification","Kewajiban Jangka Panjang");await act(async()=>store.getState().updateBalance("a",500,0));
	check("valid subclassification draft survives store update",value("subClassification"),"Kewajiban Jangka Panjang");
	await route(undefined);await change("name","");const beforeInvalid=store.getState().accounts.length;
	await act(async()=>save().onPress());check("schema invalid form does not add",store.getState().accounts.length,beforeInvalid);check("invalid form does not open success",modal().openState[0],false);
	await change("name","Created C");await change("debit",-1);await act(async()=>save().onPress());check("negative amount rejected",store.getState().accounts.length,beforeInvalid);
	await change("debit",75);const press=save().onPress;
	await act(async()=>Promise.all([press(),press()]));
	check("two pending valid submits create exactly one account",store.getState().accounts.length,beforeInvalid+1);
	check("created payload preserved",store.getState().accounts.filter(x=>x.name==="Created C").map(x=>[x.debit,x.credit,x.code]),[[75,0,"11001"]]);
	check("successful save opens modal",modal().openState[0],true);
	check("save disabled after success",save().disabled,true);
	await act(async()=>press());check("repeat saved submit does not duplicate",store.getState().accounts.length,beforeInvalid+1);
	const close=modal().onClose;await act(async()=>{close();close();});check("finish navigates back once",navigation.filter(x=>x==="back").length,1);
	await route("a");await change("name","Edited A");const editPress=save().onPress;let updates=0;
	const stop=store.subscribe((next,prev)=>{if(next.accounts!==prev.accounts)updates++;});await act(async()=>Promise.all([editPress(),editPress()]));stop();
	check("two pending edits write once",updates,1);check("edit updates correct account",store.getState().accounts.find(x=>x.id==="a").name,"Edited A");
	check("edit leaves other account unchanged",store.getState().accounts.find(x=>x.id==="b").name,"Bank B");
	await route("b");check("route change clears success modal",modal().openState[0],false);check("route change reenables save",Boolean(save().disabled),false);
	const navigationBeforeStaleClose=navigation.length;await act(async()=>close());check("old success callback cannot navigate new form",navigation.length,navigationBeforeStaleClose);
	await change("name","Should not save B");let pending;
	act(()=>{pending=save().onPress();currentId="a";renderer.update(element());});await act(async()=>pending);
	check("late resolver after route change cannot save previous form",store.getState().accounts.find(x=>x.id==="b").name,"Bank B");
	await change("name","Deleted target");act(()=>{pending=save().onPress();store.getState().deleteAccount("a");});await act(async()=>pending);
	check("pending submit after delete cannot resurrect account",store.getState().accounts.some(x=>x.id==="a"),false);check("pending deleted form cannot show success",renderer.root.findAllByType("SuccessModal").length,0);
	await route(undefined);await change("name","Unmount pending");const count=store.getState().accounts.length;act(()=>{pending=save().onPress();renderer.unmount();});await act(async()=>pending);
	check("pending create after unmount adds nothing",store.getState().accounts.length,count);
	check("no unexpected React errors",errors,[]);
	const result={baseline,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,files:[...cache].map(([file,m])=>({file,sha256:m.sha256})),limits:"Production screen/RHF/Zod/Zustand/useAlertModal; host Form fields/modal/router adapters, no native/browser/API."};
	fs.writeFileSync(path.join(__dirname,baseline?"baseline.json":"final.json"),JSON.stringify(result,null,2)+"\\n");console.log(JSON.stringify({passed:result.passed,failed:result.failed,failures:checks.filter(c=>!c.passed)}));process.exitCode=result.failed?1:0;
}
return main().catch(e=>{console.error(e);process.exitCode=2;});
`;
new Function("require", "__dirname", loader + cases)(require, __dirname);
