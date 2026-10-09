// Account-detail regression plus same-clock creation, selection and mutation.
const fs = require("node:fs"),
	path = require("node:path");
let script = fs
	.readFileSync(path.join(__dirname, "../account-detail/check.cjs"), "utf8")
	.replaceAll("\r\n", "\n");
function replaceOnce(before, after) {
	if (script.split(before).length !== 2)
		throw Error("Harness anchor changed: " + before);
	script = script.replace(before, after);
}
replaceOnce(
	"baseline && file === screen",
	'baseline && file === "store/accountingStore.ts"',
);
replaceOnce('"detail.before.tsx.txt"', '"accountingStore.before.ts.txt"');
replaceOnce(
	"\t\t\tDate,",
	"\t\t\tDate: class extends Date {static now(){return 1234;}},",
);
replaceOnce(
	"\tawait act(async () => renderer.unmount());",
	`
	await act(async()=>store.setState({accounts:[]}));
	let idA,idB;
	await act(async()=>{
		const {id:discardA,...dataA}=a;
		const {id:discardB,...dataB}=b;
		idA=store.getState().addAccount(dataA);
		idB=store.getState().addAccount(dataB);
	});
	check("same-clock creation returns distinct account IDs",idA!==idB,true);
	await route(idB);check("second created account detail selects B",details().Nama,"Bank B");
	check("second created account shows B nominal",details().Nominal,"Rp30");
	await act(async()=>store.getState().updateAccount(idB,{name:"Updated B"}));
	await route(idA);check("editing B preserves A detail",details().Nama,"Cash A");
	await act(async()=>store.getState().resetBalance(idB));
	check("resetting B preserves A nominal",details().Nominal,"Rp100");
	check("resetting B preserves global A debit",summary(),["Rp100","Rp0","Rp100"]);
	await act(async()=>store.getState().deleteAccount(idB));
	check("deleting B preserves A detail",details().Nama,"Cash A");
	await route(idB);
	check("deleted B shows not-found",absent(),{missing:true,rows:0,summary:[],accountNames:[]});
	await route(idA);check("A remains reachable after B deletion",details().Nominal,"Rp100");
	await act(async () => renderer.unmount());`,
);
new Function("require", "__dirname", script)(require, __dirname);
