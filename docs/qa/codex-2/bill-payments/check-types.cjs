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
	"components/feature/inventory/bill-payment/BillPaymentSummary.tsx",
	"components/feature/inventory/bill-payment/BillPaymentListScreen.tsx",
	"components/feature/inventory/bill-payment/BillPaymentDateInput.tsx",
	"components/feature/inventory/bill-payment/BillPaymentFormScreen.tsx",
	"components/feature/inventory/bill-payment/BillPaymentDeleteDialog.tsx",
	"components/feature/inventory/bill-payment/BillPaymentDetailScreen.tsx",
	"constants/data/inventory-bill-payments.ts",
	"types/ui/inventory/bill-payment.ts",
	"schema/inventory/bill-payment.ts",
	"lib/inventory/bill-payment.ts",
	"store/inventoryBillPaymentStore.ts",
	"store/inventoryStore.ts",
	"components/feature/inventory/PurchaseListScreen.tsx",
	"components/feature/inventory/PurchaseDetailScreen.tsx",
	"app/(no-layout)/inventory/bill-payments/_layout.tsx",
	"app/(no-layout)/inventory/bill-payments/index.tsx",
	"app/(no-layout)/inventory/bill-payments/modify.tsx",
	"app/(no-layout)/inventory/bill-payments/detail.tsx",
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
	}) || "Focused billing TypeScript: 0 diagnostics\n",
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
				"20 changed production files, ambient declarations and imported dependency closure; not a project-wide gate",
		},
		null,
		2,
	) + "\n",
);
process.exitCode = diagnostics.length ? 1 : 0;
