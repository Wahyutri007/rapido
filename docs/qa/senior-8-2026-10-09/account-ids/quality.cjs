const fs = require("node:fs"),
	path = require("node:path");
let script = fs.readFileSync(
	path.join(__dirname, "../account-detail/quality.cjs"),
	"utf8",
);
const source =
	'"app/(no-layout)/(back-office)/report/accounting/accounts/detail.tsx"';
if (script.split(source).length !== 2)
	throw Error("Quality harness source anchor changed");
script = script.replace(source, '"store/accountingStore.ts"');
new Function("require", "__dirname", script)(require, __dirname);
