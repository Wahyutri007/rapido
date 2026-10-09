const fs = require("node:fs");
const path = require("node:path");
const project = path.resolve(__dirname, "../../../..");
const ts = require(path.join(project, "node_modules/typescript"));
const config = ts.readConfigFile(
	path.join(project, "tsconfig.json"),
	ts.sys.readFile,
);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, project);
const roots = [
	"components/feature/inventory/material/MaterialUi.tsx",
	"components/feature/inventory/material/MaterialDeleteDialog.tsx",
	"components/feature/inventory/material/MaterialListScreen.tsx",
	"components/feature/inventory/material/MaterialDetailScreen.tsx",
	"components/feature/inventory/material/MaterialExpiryInput.tsx",
	"components/feature/inventory/material/MaterialFormScreen.tsx",
	"components/feature/inventory/PurchaseFormScreen.tsx",
	"components/feature/inventory/StockOperationForm.tsx",
	"app/(no-layout)/inventory/materials/_layout.tsx",
	"app/(no-layout)/inventory/materials/index.tsx",
	"app/(no-layout)/inventory/materials/modify.tsx",
	"app/(no-layout)/inventory/materials/detail.tsx",
	"app/(no-layout)/inventory/_layout.tsx",
	"app/(back-office)/inventory/index.tsx",
	"types/ui/inventory/material.ts",
	"constants/data/inventory-materials.ts",
	"schema/inventory/material.ts",
	"schema/inventory.ts",
	"store/inventoryMaterialStore.ts",
	"lib/inventory.ts",
	"lib/inventory-material.ts",
	"lib/inventory/material-date.ts",
	"expo-env.d.ts",
	"nativewind-env.d.ts",
];
const program = ts.createProgram(
	roots.map((file) => path.join(project, file)),
	{ ...parsed.options, noEmit: true },
);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
const formatHost = {
	getCanonicalFileName: (file) => file,
	getCurrentDirectory: () => project,
	getNewLine: () => "\n",
};
process.stdout.write(
	ts.formatDiagnostics(diagnostics, formatHost) ||
		"Focused TypeScript roots and imported dependency closure: 0 diagnostics\n",
);
fs.writeFileSync(
	path.join(__dirname, "type-results.json"),
	JSON.stringify(
		{
			generatedAt: new Date().toISOString(),
			typescript: ts.version,
			diagnostics: diagnostics.length,
			roots,
			scope:
				"22 changed production files, ambient declarations and their imported dependency closure; not a project-wide gate",
		},
		null,
		2,
	) + "\n",
);
process.exitCode = diagnostics.length ? 1 : 0;
