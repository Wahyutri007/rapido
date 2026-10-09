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
	"components/feature/inventory/composition/CompositionUi.tsx",
	"components/feature/inventory/composition/CompositionListScreen.tsx",
	"components/feature/inventory/composition/CompositionFormScreen.tsx",
	"components/feature/inventory/composition/CompositionDetailScreen.tsx",
	"components/feature/inventory/composition/CompositionSimulation.tsx",
	"components/feature/inventory/composition/CompositionDeleteDialog.tsx",
	"types/ui/inventory/composition.ts",
	"schema/inventory/composition.ts",
	"constants/data/inventory-compositions.ts",
	"lib/inventory/composition.ts",
	"store/inventoryCompositionStore.ts",
	"store/inventoryMaterialStore.ts",
	"app/(no-layout)/inventory/compositions/_layout.tsx",
	"app/(no-layout)/inventory/compositions/index.tsx",
	"app/(no-layout)/inventory/compositions/modify.tsx",
	"app/(no-layout)/inventory/compositions/detail.tsx",
	"app/(no-layout)/inventory/_layout.tsx",
	"app/(back-office)/inventory/index.tsx",
	"expo-env.d.ts",
	"nativewind-env.d.ts",
];
const program = ts.createProgram(
	roots.map((file) => path.join(project, file)),
	{ ...parsed.options, noEmit: true },
);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
process.stdout.write(
	ts.formatDiagnostics(diagnostics, {
		getCanonicalFileName: (file) => file,
		getCurrentDirectory: () => project,
		getNewLine: () => "\n",
	}) || "Focused composition TypeScript: 0 diagnostics\n",
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
				"18 changed production files, ambient declarations and imported dependency closure; not a project-wide gate",
		},
		null,
		2,
	) + "\n",
);
process.exitCode = diagnostics.length ? 1 : 0;
