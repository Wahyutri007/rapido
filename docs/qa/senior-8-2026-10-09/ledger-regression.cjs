// Production hook prefix in React DOM; fixture external store, no native UI/API.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { launch } = require("./browser.cjs");
const { reactRuntime } = require("./catalog-regression.cjs");
const file =
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx";
async function main() {
	const text = fs.readFileSync(file, "utf8");
	const source = ts.createSourceFile(
		file,
		text,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const fn = source.statements.find(
		(node) =>
			ts.isFunctionDeclaration(node) &&
			node.name?.text === "GeneralLedgerDetailScreen",
	);
	const statements = [];
	for (const statement of fn.body.statements) {
		if (ts.isIfStatement(statement)) break;
		statements.push(statement.getText(source));
	}
	const code = ts.transpileModule(
		`function Screen(){${statements.join("\n")}
    globalThis.snapshot={account,rawEntries,filteredEntries,totalDebit,totalCredit,searchQuery,selectedType};
    globalThis.controls={setSearchQuery,setSelectedType};
    return React.createElement("pre",null,JSON.stringify(snapshot));
  }`,
		{ compilerOptions: { target: ts.ScriptTarget.ES2022 } },
	).outputText;
	const browser = await launch(),
		checks = [],
		errors = [];
	try {
		const page = await browser.newPage();
		page.on("pageerror", (error) => errors.push(error.message));
		await page.setContent('<div id="root"></div>');
		await page.addScriptTag({
			content: `${reactRuntime()}
      let params={id:"a"};
      let state={ledgerAccounts:[{id:"a",totalDebit:100,totalCredit:20},{id:"b",totalDebit:200,totalCredit:40}],ledgerEntries:{a:[{id:"one",title:"Sales",referenceNumber:"INV-1",description:"Cash",type:"debit",amount:100}],b:[]}};
      const listeners=new Set();
      const subscribe=callback=>{listeners.add(callback);return ()=>listeners.delete(callback);};
      const useAccountingStore=selector=>useSyncExternalStore(subscribe,()=>selector(state));
      const useLocalSearchParams=()=>params;
      ${code}
      globalThis.act=(kind,value)=>{flushSync(()=>{
        if(kind==="route") {params={id:value};root.render(React.createElement(Screen));}
        if(kind==="store") {state={...state,...value};for(const notify of listeners) notify();}
        if(kind==="search") controls.setSearchQuery(value);
        if(kind==="type") controls.setSelectedType(value);
      });return snapshot;};
      flushSync(()=>root.render(React.createElement(Screen)));`,
		});
		async function check(name, kind, value, verify) {
			const result = await page.evaluate(
				({ kind, value }) => act(kind, value),
				{ kind, value },
			);
			verify(result);
			checks.push(name);
		}
		await check("initial account and entries", "route", "a", (r) => {
			assert.equal(r.account.id, "a");
			assert.equal(r.rawEntries[0].id, "one");
			assert.equal(r.totalDebit, 100);
		});
		await check("switch route account", "route", "b", (r) => {
			assert.equal(r.account.id, "b");
			assert.deepEqual(r.rawEntries, []);
			assert.equal(r.totalDebit, 200);
		});
		await check(
			"unknown route retains first-account fallback",
			"route",
			"missing",
			(r) => assert.equal(r.account.id, "a"),
		);
		const rows = [
			{
				id: "new",
				title: "Purchase",
				referenceNumber: "INV-2",
				description: "Stock",
				type: "credit",
				amount: 30,
			},
			{
				id: "one",
				title: "Sales",
				referenceNumber: "INV-1",
				description: "Cash",
				type: "debit",
				amount: 100,
			},
		];
		await check(
			"entry collection update rerenders without route or account change",
			"store",
			{ ledgerEntries: { a: rows, b: [] } },
			(r) => {
				assert.equal(r.rawEntries.length, 2);
				assert.equal(r.totalCredit, 30);
			},
		);
		await check(
			"search matches reference case-insensitively",
			"search",
			" inv-2 ",
			(r) =>
				assert.deepEqual(
					r.filteredEntries.map((e) => e.id),
					["new"],
				),
		);
		rows.unshift({
			id: "newer",
			title: "Purchase",
			referenceNumber: "INV-20",
			description: "More stock",
			type: "credit",
			amount: 40,
		});
		await check(
			"store update preserves search and recalculates filtered totals",
			"store",
			{ ledgerEntries: { a: rows, b: [] } },
			(r) => {
				assert.equal(r.searchQuery, " inv-2 ");
				assert.equal(r.filteredEntries.length, 2);
				assert.equal(r.totalCredit, 70);
			},
		);
		await check("type filter combines with search", "type", "debit", (r) =>
			assert.deepEqual(r.filteredEntries, []),
		);
		await check("clearing search preserves debit filter", "search", "", (r) =>
			assert.deepEqual(
				r.filteredEntries.map((e) => e.id),
				["one"],
			),
		);
		await check("clearing type restores all entries", "type", "all", (r) =>
			assert.equal(r.filteredEntries.length, 3),
		);
		await check(
			"account metadata updates after external store change",
			"store",
			{
				ledgerAccounts: [
					{
						id: "a",
						name: "Updated account",
						totalDebit: 100,
						totalCredit: 70,
					},
				],
			},
			(r) => assert.equal(r.account.name, "Updated account"),
		);
		await check(
			"removed account entry collection clears list",
			"store",
			{ ledgerEntries: {} },
			(r) => assert.deepEqual(r.rawEntries, []),
		);
		await check(
			"empty account collection does not crash totals",
			"store",
			{ ledgerAccounts: [] },
			(r) => {
				assert.equal(r.account, undefined);
				assert.deepEqual(r.filteredEntries, []);
				assert.equal(r.totalDebit, 0);
				assert.equal(r.totalCredit, 0);
			},
		);
		await check(
			"accounts arriving after empty state restore detail",
			"store",
			{
				ledgerAccounts: [{ id: "b", totalDebit: 200, totalCredit: 40 }],
				ledgerEntries: { b: [] },
			},
			(r) => {
				assert.equal(r.account.id, "b");
				assert.equal(r.totalDebit, 200);
			},
		);
		assert.deepEqual(errors, []);
		fs.writeFileSync(
			path.join(__dirname, "ledger-results.json"),
			JSON.stringify(
				{
					kind: "production hook prefix in React DOM with fixture external store",
					file,
					checks,
					runtimeErrors: errors,
				},
				null,
				2,
			) + "\n",
		);
		console.log(
			`${checks.length} ledger regression scenarios passed; runtime errors: ${errors.length}`,
		);
	} finally {
		await browser.close();
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
