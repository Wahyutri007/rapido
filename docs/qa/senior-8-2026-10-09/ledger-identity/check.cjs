// Extend the historical filter regression without changing its source or outputs.
// Only harness setup/scenarios change; production source is loaded byte-for-byte.
const fs = require("node:fs");
const path = require("node:path");
let script = fs
	.readFileSync(path.join(__dirname, "../ledger-filters/check.cjs"), "utf8")
	.replaceAll("\r\n", "\n");
function replaceOnce(before, after) {
	if (script.split(before).length !== 2)
		throw Error("Harness anchor changed: " + before);
	script = script.replace(before, after);
}
replaceOnce(
	'".expo/senior8-ledger-filters/baseline-detail.tsx"',
	'path.join(__dirname, "detail.before.tsx.txt")',
);
replaceOnce(
	"let clockTick = 0;",
	"// Keep Date.now fixed; use production collision handling.",
);
replaceOnce("return clock.getTime() + clockTick++;", "return clock.getTime();");
script = script.replaceAll(
	"React.createElement(Screen)",
	"React.createElement(React.StrictMode, null, React.createElement(Screen))",
);
replaceOnce(
	"\tawait act(async () => renderer.unmount());",
	`
	await period("all"); await search(""); await type("all");
	const accountB = {...account, id:"b", name:"Bank", balance:222};
	const fixture = {a:[row("a-only","debit",10)], b:[row("b-only","credit",20,"2026-10-09","b")]};
	await act(async () => store.setState({ledgerAccounts:[account, accountB], ledgerEntries:fixture}));
	async function route(id) {
		await act(async () => {
			currentId = id;
			renderer.update(React.createElement(React.StrictMode,null,React.createElement(Screen)));
		});
	}
	function snapshot() {
		return {
			headers:renderer.root.findAllByType("LedgerDetailHeaderCard").map(n=>n.props.account.id),
			rows:rows(),
			summaries:renderer.root.findAllByType("LedgerDetailSummaryCard").map(n=>[n.props.totalDebit,n.props.totalCredit,n.props.endingBalance]),
			notFound:renderer.root.findAllByType("Text").some(n=>n.props.children==="Akun tidak ditemukan")
		};
	}
	const absent = {headers:[],rows:[],summaries:[],notFound:true};
	const expectedA = {headers:["a"],rows:["a-only"],summaries:[[10,0,111]],notFound:false};
	const expectedB = {headers:["b"],rows:["b-only"],summaries:[[0,20,222]],notFound:false};
	for (const [label,id] of [["unknown","missing"],["missing",undefined],["empty",""],["whitespace"," "],["empty array",[]],["unknown array",["missing"]],["empty first array",["","b"]]]) {
		await route(id);
		check("invalid route " + label + " has no unrelated account data",snapshot(),absent);
	}
	await route("a"); check("invalid to valid route recovers account A",snapshot(),expectedA);
	await route("b"); check("valid route B uses B header rows and balance",snapshot(),expectedB);
	await route(["b"]); check("single array parameter selects requested account",snapshot(),expectedB);
	await route(["b","a"]); check("array parameter uses first value like accounting modify routes",snapshot(),expectedB);
	await route("b");
	await act(async () => store.setState({ledgerAccounts:[accountB,account]}));
	check("reordering accounts does not change selected account",snapshot(),expectedB);
	await act(async () => store.setState({ledgerAccounts:[account]}));
	check("removing selected account does not fall back to first account",snapshot(),absent);
	await act(async () => store.getState().addLedgerEntry(row("orphan","debit",99,"2026-10-09","b")));
	check("orphan entries do not bypass missing account state",snapshot(),absent);
	await act(async () => store.setState({ledgerAccounts:[account,accountB],ledgerEntries:fixture}));
	check("restoring selected account recovers its own data",snapshot(),expectedB);
	await act(async () => store.setState({ledgerAccounts:[]}));
	check("empty collection shows missing account",snapshot(),absent);
	await act(async () => store.setState({ledgerAccounts:[accountB]}));
	check("collection arriving after mount resolves selected account",snapshot(),expectedB);
	await route(undefined);
	await act(async () => store.setState({ledgerAccounts:[account,accountB]}));
	check("populating accounts without an ID does not select first account",snapshot(),absent);
	await route("a");
	await search("b-only"); check("search cannot reveal another account's rows",rows(),[]);
	check("cross-account search retains zero totals",totals(),[0,0]);
	await act(async () => renderer.unmount());`,
);
replaceOnce("main().catch((error) => {", "return main().catch((error) => {");
new Function("require", "__dirname", script)(require, __dirname);
