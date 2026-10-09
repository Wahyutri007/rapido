// Selected production roots and their dependencies; not a full project check.
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const configFile = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, " "));
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
const roots = [
	"components/custom/CardList.tsx",
	"app/(no-layout)/(back-office)/report/summary.tsx",
	"app/(no-layout)/(back-office)/report/sales.tsx",
	"app/(no-layout)/(back-office)/report/purchase-supplier.tsx",
	"app/(no-layout)/(back-office)/report/product-stock.tsx",
	"app/(no-layout)/(back-office)/report/operational-team.tsx",
	"app/(no-layout)/(back-office)/report/customers-promos.tsx",
	"app/(no-layout)/(back-office)/report/cash.tsx",
	...config.fileNames.filter(file => file.endsWith(".d.ts")),
];
const program = ts.createProgram(roots, { ...config.options, noEmit: true, incremental: false });
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
const result = {
	kind: "Selected roots and dependency closure using project TypeScript options",
	roots,
	diagnosticCount: diagnostics.length,
	diagnostics: diagnostics.map(diagnostic => ({ file: diagnostic.file?.fileName, message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " ") })),
};
fs.writeFileSync(path.join(__dirname, "typecheck-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
process.exitCode = diagnostics.length ? 1 : 0;
