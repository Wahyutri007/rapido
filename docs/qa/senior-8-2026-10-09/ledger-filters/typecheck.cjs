const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
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
	"app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx",
	"lib/accounting/ledger-filter.ts",
	...config.fileNames.filter((file) => file.endsWith(".d.ts")),
];
const program = ts.createProgram(roots, {
	...config.options,
	noEmit: true,
	incremental: false,
});
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const report = {
	kind: "Selected production roots and dependency closure",
	roots,
	diagnosticCount: diagnostics.length,
	diagnostics: diagnostics.map((d) => ({
		file: d.file?.fileName,
		message: ts.flattenDiagnosticMessageText(d.messageText, " "),
	})),
};
fs.writeFileSync(
	path.join(__dirname, "typecheck.json"),
	JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify({ diagnosticCount: diagnostics.length }));
process.exitCode = diagnostics.length ? 1 : 0;
