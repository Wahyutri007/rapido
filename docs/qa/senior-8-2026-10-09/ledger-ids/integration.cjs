// Reuse the prior full-screen regression harness without editing its evidence.
// Only the fixture clock, baseline store selection, and test cases change here.
const fs = require("node:fs");
const path = require("node:path");
const sourcePath = path.join(__dirname, "../ledger-filters/check.cjs");
let script = fs.readFileSync(sourcePath, "utf8").replaceAll("\r\n", "\n");
function replaceOnce(before, after) {
	if (script.split(before).length !== 2)
		throw Error("Harness anchor changed: " + before);
	script = script.replace(before, after);
}
replaceOnce(
	"let clockTick = 0;",
	"// Date.now stays constant during each integration sequence.",
);
replaceOnce("return clock.getTime() + clockTick++;", "return clock.getTime();");
replaceOnce(
	'baseline && file === screenFile\n\t\t\t? ".expo/senior8-ledger-filters/baseline-detail.tsx"',
	'baseline && file === "store/accountingStore.ts"\n\t\t\t? path.join(__dirname, "accountingStore.before.ts.txt")',
);
replaceOnce(
	"\tawait act(async () => renderer.unmount());",
	`
	await act(async () => {
		currentId="a";
		store.setState({ledgerAccounts:[account],ledgerEntries:{a:[]}});
		renderer.update(React.createElement(Screen));
	});
	await period("all"); await search(""); await type("all");
	let returned=[];
	await act(async () => {
		for(let i=0;i<10;i++) returned.push(store.getState().addLedgerEntry(row("burst-"+i,i%2?"credit":"debit",i+1)));
	});
	check("ten same-clock actions return ten distinct IDs",new Set(returned).size,10);
	check("rendered row keys are distinct after burst",new Set(rows()).size,10);
	check("rendered IDs equal returned IDs in newest-first order",rows(),[...returned].reverse());
	check("burst preserves all ten rows",rows().length,10);
	check("burst totals count every debit and credit exactly once",totals(),[25,30]);
	await search("burst-3");
	check("search after burst selects one exact record",rows(),[returned[3]]);
	check("search after burst summary is accurate",totals(),[0,4]);
	await search(""); await type("debit");
	check("debit filter after burst retains five distinct rows",rows().length,5);
	check("debit filter after burst has no credit total",totals(),[25,0]);
	await act(async () => renderer.unmount());`,
);
replaceOnce(
	'"Complete production screen + Zustand in-memory fixtures; RN and presentation children adapted. No native/UI/API verification."',
	'"Complete production screen + Zustand with fixed Date.now; RN/presentation adapters; no native/UI/API verification."',
);
replaceOnce("main().catch((error) => {", "return main().catch((error) => {");
new Function("require", "__dirname", script)(require, __dirname);
