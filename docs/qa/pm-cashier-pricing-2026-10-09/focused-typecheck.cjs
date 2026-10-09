const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "../../..");
const files = [
	"lib/cashier-cart-pricing.ts",
	"components/feature/cart/CartItem.tsx",
	"app/(no-layout)/(cashier)/cart/index.tsx",
];
const configPath = path.join(root, "tsconfig.json");
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error)
	throw new Error(
		ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
	);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const declarations = [
	"expo-env.d.ts",
	"nativewind-env.d.ts",
	".expo/types/router.d.ts",
]
	.map((file) => path.join(root, file))
	.filter((file) => fs.existsSync(file));
const program = ts.createProgram(
	[...files.map((file) => path.join(root, file)), ...declarations],
	{
		...parsed.options,
		noEmit: true,
		skipLibCheck: true,
		incremental: false,
	},
);
const diagnostics = ts.getPreEmitDiagnostics(program).map((diagnostic) => {
	const position =
		diagnostic.file && diagnostic.start !== undefined
			? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
			: null;
	return {
		file: diagnostic.file
			? path.relative(root, diagnostic.file.fileName).replaceAll("\\", "/")
			: null,
		line: position ? position.line + 1 : null,
		code: diagnostic.code,
		message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
	};
});
const report = {
	generatedAt: new Date().toISOString(),
	rootFiles: files,
	importClosureFiles: program.getSourceFiles().length,
	diagnostics,
};
if (process.env.CASHIER_PRICING_TYPECHECK_RESULT) {
	fs.writeFileSync(
		process.env.CASHIER_PRICING_TYPECHECK_RESULT,
		`${JSON.stringify(report, null, 2)}\n`,
	);
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = diagnostics.length ? 1 : 0;
