// Production state/handlers in React DOM; no native input or parent store rendering.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ts = require("typescript");
const { launch } = require("./browser.cjs");
const { reactRuntime } = require("./catalog-regression.cjs");
const file = "components/feature/accounting/accounts/AccountBalanceCard.tsx";
async function main() {
	const source = ts.createSourceFile(
		file,
		fs.readFileSync(file, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const fn = source.statements.find(
		(node) =>
			ts.isFunctionDeclaration(node) &&
			node.name?.text === "AccountBalanceCard",
	);
	const statements = [];
	for (const statement of fn.body.statements) {
		if (ts.isReturnStatement(statement)) break;
		statements.push(statement.getText(source));
	}
	const code = ts.transpileModule(
		`function Screen({account,onBalanceChange}){${statements.join("\n")}
    globalThis.snapshot={debitText,creditText};
    globalThis.controls={handleDebitChange,handleCreditChange};
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
      let account={id:"a",debit:100,credit:20};let echo=true;const calls=[];
      ${code}
      function onBalanceChange(id,debit,credit){calls.push({id,debit,credit});if(echo){account={...account,id,debit,credit};render();}}
      function render(){root.render(React.createElement(Screen,{account,onBalanceChange}));}
      globalThis.act=(kind,value)=>{flushSync(()=>{
        if(kind==="props"){account={...account,...value};render();}
        if(kind==="debit") controls.handleDebitChange(value);
        if(kind==="credit") controls.handleCreditChange(value);
        if(kind==="echo") echo=value;
        if(kind==="remount"){root.render(null);}
        if(kind==="mount") render();
        if(kind==="nan"){account={...account,debit:NaN};render();}
      });return {...snapshot,calls};};
      flushSync(render);`,
		});
		async function check(name, kind, value, verify) {
			const result = await page.evaluate(
				({ kind, value }) => act(kind, value),
				{ kind, value },
			);
			verify(result);
			checks.push(name);
		}
		await check(
			"initial external debit and credit prefill",
			"props",
			{},
			(r) => {
				assert.equal(r.debitText, "100");
				assert.equal(r.creditText, "20");
				assert.equal(r.calls.length, 0);
			},
		);
		await check(
			"debit sanitizes text and preserves credit in callback",
			"debit",
			"Rp 1.234",
			(r) => {
				assert.equal(r.debitText, "1234");
				assert.deepEqual(r.calls.at(-1), { id: "a", debit: 1234, credit: 20 });
			},
		);
		await check("credit edit preserves current debit", "credit", "56", (r) => {
			assert.equal(r.creditText, "56");
			assert.deepEqual(r.calls.at(-1), { id: "a", debit: 1234, credit: 56 });
		});
		await check(
			"numeric echo retains leading-zero debit draft",
			"debit",
			"0012",
			(r) => {
				assert.equal(r.debitText, "0012");
				assert.equal(r.calls.at(-1).debit, 12);
			},
		);
		await check(
			"metadata-only refetch retains draft",
			"props",
			{ name: "New name" },
			(r) => assert.equal(r.debitText, "0012"),
		);
		await check(
			"external credit update does not discard debit draft",
			"props",
			{ credit: 99 },
			(r) => {
				assert.equal(r.creditText, "99");
				assert.equal(r.debitText, "0012");
			},
		);
		await check(
			"external reset clears both fields without write-back",
			"props",
			{ debit: 0, credit: 0 },
			(r) => {
				assert.equal(r.debitText, "");
				assert.equal(r.creditText, "");
				assert.equal(r.calls.length, 3);
			},
		);
		await check(
			"credit accepts zero text and emits numeric zero",
			"credit",
			"000",
			(r) => {
				assert.equal(r.creditText, "000");
				assert.equal(r.calls.at(-1).credit, 0);
			},
		);
		await check(
			"account identity switch resets drafts even for same balances",
			"props",
			{ id: "b", debit: 0, credit: 0 },
			(r) => {
				assert.equal(r.debitText, "");
				assert.equal(r.creditText, "");
			},
		);
		await check("new identity used by callback", "debit", "25", (r) =>
			assert.deepEqual(r.calls.at(-1), { id: "b", debit: 25, credit: 0 }),
		);
		await check("clear debit emits zero and stays blank", "debit", "", (r) => {
			assert.equal(r.debitText, "");
			assert.equal(r.calls.at(-1).debit, 0);
		});
		await check("disable parent echo for draft test", "echo", false, (r) =>
			assert.equal(r.debitText, ""),
		);
		await check("unacknowledged edit retains draft", "debit", "0075", (r) =>
			assert.equal(r.debitText, "0075"),
		);
		await check(
			"same external balances do not discard unacknowledged draft",
			"props",
			{ debit: 0, credit: 0, name: "Refetch" },
			(r) => assert.equal(r.debitText, "0075"),
		);
		await check(
			"delayed matching acknowledgment retains draft",
			"props",
			{ debit: 75 },
			(r) => assert.equal(r.debitText, "0075"),
		);
		await check(
			"different external value replaces draft",
			"props",
			{ debit: 80 },
			(r) => assert.equal(r.debitText, "80"),
		);
		await check(
			"credit draft survives external debit update",
			"credit",
			"0042",
			(r) => assert.equal(r.creditText, "0042"),
		);
		await check(
			"only changed side adopts external value",
			"props",
			{ debit: 90 },
			(r) => {
				assert.equal(r.debitText, "90");
				assert.equal(r.creditText, "0042");
			},
		);
		await check(
			"credit acknowledgment keeps numeric-equivalent text",
			"props",
			{ credit: 42 },
			(r) => assert.equal(r.creditText, "0042"),
		);
		await check(
			"stable NaN prop does not trigger render loop",
			"nan",
			null,
			(r) => assert.equal(r.debitText, ""),
		);
		await check(
			"ordinary render with NaN remains stable",
			"props",
			{ name: "Stable" },
			(r) => assert.equal(r.debitText, ""),
		);
		await check(
			"external valid balance recovers after NaN",
			"props",
			{ debit: 10, credit: 15 },
			(r) => {
				assert.equal(r.debitText, "10");
				assert.equal(r.creditText, "15");
			},
		);
		assert.deepEqual(errors, []);
		fs.writeFileSync(
			path.join(__dirname, "balance-results.json"),
			JSON.stringify(
				{
					kind: "production state and handlers in React DOM with prop/callback fixtures",
					file,
					checks,
					runtimeErrors: errors,
				},
				null,
				2,
			) + "\n",
		);
		console.log(
			`${checks.length} balance regression scenarios passed; runtime errors: ${errors.length}`,
		);
	} finally {
		await browser.close();
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
