// Run from the app root. Does not install packages or change tsconfig.
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const configFile = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (configFile.error)
	throw Error(
		ts.flattenDiagnosticMessageText(configFile.error.messageText, " "),
	);
const config = ts.parseJsonConfigFileContent(
	configFile.config,
	ts.sys,
	process.cwd(),
);
const roots = [
	"components/feature/accounting/accounts/AccountBalanceCard.tsx",
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx",
	...config.fileNames.filter((file) => file.endsWith(".d.ts")),
];
const program = ts.createProgram(roots, {
	...config.options,
	noEmit: true,
	incremental: false,
});
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const report = {
	kind: "TypeScript selected roots plus dependency closure",
	roots,
	diagnosticCount: diagnostics.length,
	diagnostics: diagnostics.map((diagnostic) => ({
		file: diagnostic.file?.fileName,
		message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
	})),
};
fs.writeFileSync(
	path.join(__dirname, "typecheck-focused.json"),
	JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report));
process.exitCode = diagnostics.length ? 1 : 0;
