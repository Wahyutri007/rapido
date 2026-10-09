const fs = require("node:fs"),
	path = require("node:path"),
	ts = require("typescript");
const raw = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (raw.error)
	throw Error(ts.flattenDiagnosticMessageText(raw.error.messageText, " "));
const config = ts.parseJsonConfigFileContent(raw.config, ts.sys, process.cwd());
const roots = [
	"store/accountingStore.ts",
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx",
	...config.fileNames.filter((p) => p.endsWith(".d.ts")),
];
const program = ts.createProgram(roots, {
	...config.options,
	noEmit: true,
	incremental: false,
});
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const result = {
	kind: "Store and ledger screen roots plus dependency closure",
	roots,
	diagnosticCount: diagnostics.length,
	diagnostics: diagnostics.map((d) => ({
		file: d.file?.fileName,
		message: ts.flattenDiagnosticMessageText(d.messageText, " "),
	})),
};
fs.writeFileSync(
	path.join(__dirname, "typecheck.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify({ diagnosticCount: diagnostics.length }));
process.exitCode = diagnostics.length ? 1 : 0;
