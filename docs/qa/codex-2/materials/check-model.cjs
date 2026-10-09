const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const project = path.resolve(__dirname, "../../../..");
const ts = require(path.join(project, "node_modules/typescript"));
const cache = new Map();
function load(file) {
	if (cache.has(file)) return cache.get(file);
	const module = { exports: {} };
	cache.set(file, module.exports);
	const js = ts.transpileModule(fs.readFileSync(file, "utf8"), {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
		},
	}).outputText;
	new Function("require", "module", "exports", js)(
		(id) =>
			id.startsWith("@/")
				? load(path.join(project, id.slice(2) + ".ts"))
				: id.startsWith(".")
					? load(path.resolve(path.dirname(file), id + ".ts"))
					: require(require.resolve(id, { paths: [project] })),
		module,
		module.exports,
	);
	cache.set(file, module.exports);
	return module.exports;
}
let assertions = 0;
function check(name, test) {
	test();
	assertions++;
}
const { materialSchema } = load(
	path.join(project, "schema/inventory/material.ts"),
);
const { stockOperationSchema, purchaseSchema } = load(
	path.join(project, "schema/inventory.ts"),
);
const { useInventoryMaterialStore: materials } = load(
	path.join(project, "store/inventoryMaterialStore.ts"),
);
const { useInventoryStore: inventory } = load(
	path.join(project, "store/inventoryStore.ts"),
);
const { getInventoryItems, getInventoryItem } = load(
	path.join(project, "lib/inventory.ts"),
);
const { materialStockStatus, allocateMaterialStock, recentMaterialMovements } =
	load(path.join(project, "lib/inventory-material.ts"));
const { parseExpiryDate, expiryDateText } = load(
	path.join(project, "lib/inventory/material-date.ts"),
);
const base = {
	stores: ["Toko Sushiro"],
	name: "Bahan Pengujian",
	sku: "TEST-01",
	unit: "Kg",
	stock: 12.5,
	minimumStock: 5,
	averagePrice: 10000,
	expiresAt: null,
	note: "Catatan",
};
const cases = [
	["Valid material", base, true],
	["Missing stores", { ...base, stores: [] }, false],
	["Unknown store", { ...base, stores: ["Missing"] }, false],
	[
		"Duplicate stores",
		{ ...base, stores: [base.stores[0], base.stores[0]] },
		false,
	],
	["Missing name", { ...base, name: " " }, false],
	["Unknown unit", { ...base, unit: "" }, false],
	["Optional code", { ...base, sku: "" }, true],
	["Negative stock", { ...base, stock: -1 }, false],
	["Zero initial stock", { ...base, stock: 0 }, true],
	["Fractional stock", { ...base, stock: 0.001 }, true],
	["Negative minimum", { ...base, minimumStock: -1 }, false],
	["Infinite stock", { ...base, stock: Infinity }, false],
	["Zero average price", { ...base, averagePrice: 0 }, false],
	["Infinite price", { ...base, averagePrice: Infinity }, false],
	[
		"Overflow stock value",
		{ ...base, stock: 1e300, averagePrice: 1e300 },
		false,
	],
	["Optional expiry", { ...base, expiresAt: null }, true],
	["Invalid date", { ...base, expiresAt: new Date(NaN) }, false],
];
for (const [name, data, expected] of cases)
	check(name, () =>
		assert.equal(materialSchema.safeParse(data).success, expected, name),
	);
check("Trimmed name and code", () => {
	const parsed = materialSchema.parse({
		...base,
		name: " Trimmed ",
		sku: " TEST ",
	});
	assert.equal(parsed.name, "Trimmed");
	assert.equal(parsed.sku, "TEST");
});
for (const date of ["2024-02-29", "2000-02-29", "2026-12-31"])
	check("Valid calendar " + date, () =>
		assert.equal(expiryDateText(parseExpiryDate(date)), date),
	);
for (const date of [
	"2026-02-29",
	"1900-02-29",
	"2026-04-31",
	"2026-13-01",
	"2026-00-01",
	"2026-12-00",
	"2026-1-1",
	"2",
])
	check("Invalid calendar " + date, () =>
		assert.equal(Number.isFinite(parseExpiryDate(date).getTime()), false),
	);
check("Empty expiry clears", () => assert.equal(parseExpiryDate(""), null));
check("Fixture location totals", () => {
	for (const item of materials.getState().materials)
		assert.equal(
			item.stock,
			item.locations.reduce((sum, location) => sum + location.quantity, 0),
		);
});
check("Stock states", () => {
	assert.equal(materialStockStatus({ stock: 0, minimumStock: 0 }), "empty");
	assert.equal(materialStockStatus({ stock: 5, minimumStock: 5 }), "low");
	assert.equal(materialStockStatus({ stock: 6, minimumStock: 5 }), "safe");
});
for (const stock of [0, 0.000001, 0.1, 1.2345, 245, 999999, 1e305])
	check("Allocation " + stock, () => {
		const result = allocateMaterialStock(stock, [
			{ name: "A", quantity: 4 },
			{ name: "B", quantity: 2 },
			{ name: "C", quantity: 12 },
		]);
		assert.ok(
			result.every(
				(location) =>
					Number.isFinite(location.quantity) && location.quantity >= 0,
			),
		);
		assert.ok(
			Math.abs(
				result.reduce((sum, location) => sum + location.quantity, 0) - stock,
			) <= Math.max(1e-12, stock * 1e-12),
		);
	});
check("Missing IDs cannot create", () => {
	assert.equal(
		materials.getState().saveMaterial("missing", base).error,
		"Bahan baku tidak ditemukan",
	);
	assert.equal(
		materials.getState().deleteMaterial("missing").error,
		"Bahan baku tidak ditemukan",
	);
});
check("Empty edit ID cannot create", () =>
	assert.equal(
		materials.getState().saveMaterial("", base).error,
		"Bahan baku tidak ditemukan",
	),
);
check("Source movement prevents deletion", () =>
	assert.ok(materials.getState().deleteMaterial("tepung").error),
);
const created = materials.getState().saveMaterial(undefined, base);
check("New material visible in catalog", () => {
	assert.ok(created.id);
	assert.equal(getInventoryItem(created.id).name, base.name);
});
check("Duplicate name", () =>
	assert.equal(
		materials
			.getState()
			.saveMaterial(undefined, { ...base, sku: "", name: " bahan pengujian " })
			.field,
		"name",
	),
);
check("Duplicate code", () =>
	assert.equal(
		materials
			.getState()
			.saveMaterial(undefined, { ...base, name: "Other", sku: " test-01 " })
			.field,
		"sku",
	),
);
check("Blank codes may repeat", () => {
	assert.ok(
		materials
			.getState()
			.saveMaterial(undefined, { ...base, name: "Blank one", sku: "" }).id,
	);
	assert.ok(
		materials
			.getState()
			.saveMaterial(undefined, { ...base, name: "Blank two", sku: "" }).id,
	);
});
const purchase = {
	store: "Toko Sushiro",
	supplier: "General Vendor",
	supplierId: "supplier-1",
	purchaseMethod: "Pembelian langsung",
	paymentMethod: "Tunai",
	date: new Date(),
	paid: true,
	kind: "material",
	note: "",
	lines: [{ itemId: created.id, quantity: 2.5, price: 10000 }],
};
const transfer = {
	operation: "transfer",
	kind: "material",
	fromStore: "Toko Sushiro",
	toStore: "Toko Degri",
	note: "",
	lines: [{ itemId: created.id, stock: 999, quantity: 12.5 }],
};
check("New item passes purchase validation", () =>
	assert.ok(purchaseSchema.safeParse(purchase).success),
);
check("New item passes stock validation", () =>
	assert.ok(stockOperationSchema.safeParse(transfer).success),
);
check("Wrong kind rejected", () => {
	assert.equal(
		purchaseSchema.safeParse({ ...purchase, kind: "product" }).success,
		false,
	);
	assert.equal(
		stockOperationSchema.safeParse({ ...transfer, kind: "product" }).success,
		false,
	);
});
check("Fresh availability checked", () =>
	assert.equal(
		stockOperationSchema.safeParse({
			...transfer,
			lines: [{ ...transfer.lines[0], quantity: 13 }],
		}).success,
		false,
	),
);
check("Infinite purchase values rejected", () => {
	assert.equal(
		purchaseSchema.safeParse({
			...purchase,
			lines: [{ ...purchase.lines[0], quantity: Infinity }],
		}).success,
		false,
	);
	assert.equal(
		purchaseSchema.safeParse({
			...purchase,
			lines: [{ ...purchase.lines[0], price: Infinity }],
		}).success,
		false,
	);
});
check("Purchase overflow rejected", () =>
	assert.equal(
		purchaseSchema.safeParse({
			...purchase,
			lines: [{ ...purchase.lines[0], quantity: 1e300, price: 1e300 }],
		}).success,
		false,
	),
);
const { date, lines, ...purchaseFields } = purchase;
const snapshot = getInventoryItem(created.id);
const purchaseId = inventory.getState().addPurchase({
	...purchaseFields,
	createdAt: date.toISOString(),
	receivedBy: "Test",
	status: "completed",
	amount: 25000,
	lines: [{ item: snapshot, quantity: 2.5, price: 10000 }],
});
check("Purchase reference prevents deletion", () =>
	assert.ok(materials.getState().deleteMaterial(created.id).error),
);
check("Recent purchase movement uses snapshot unit", () => {
	const rows = recentMaterialMovements(
		getInventoryItem(created.id),
		inventory.getState().purchases,
		inventory.getState().stockRecords,
	);
	assert.equal(rows[0].quantity, 2.5);
	assert.equal(rows[0].unit, "Kg");
	assert.equal(rows[0].label, "Pembelian masuk");
});
check("Cancelled purchase is not a stock movement", () => {
	const record = inventory
		.getState()
		.purchases.find((record) => record.id === purchaseId);
	assert.equal(
		recentMaterialMovements(
			getInventoryItem(created.id),
			[{ ...record, status: "cancelled" }],
			[],
		).length,
		0,
	);
});
check("Edit keeps identity and location sum", () => {
	assert.equal(
		materials.getState().saveMaterial(created.id, {
			...base,
			name: "Renamed",
			stock: 10,
			expiresAt: parseExpiryDate("2026-12-31"),
		}).id,
		created.id,
	);
	const item = getInventoryItem(created.id);
	assert.equal(item.name, "Renamed");
	assert.equal(item.stock, 10);
	assert.equal(
		item.locations.reduce((sum, location) => sum + location.quantity, 0),
		10,
	);
});
check("Historical snapshot preserved", () => {
	const record = inventory
		.getState()
		.purchases.find((record) => record.id === purchaseId);
	assert.equal(record.lines[0].item.name, base.name);
	assert.equal(record.lines[0].item.unit, "Kg");
	assert.equal(record.lines[0].item.stock, 12.5);
});
inventory.getState().deletePurchase(purchaseId);
check("Delete after removing references", () =>
	assert.equal(materials.getState().deleteMaterial(created.id).id, created.id),
);
check("Deleted item rejected", () => {
	assert.equal(purchaseSchema.safeParse(purchase).success, false);
	assert.equal(stockOperationSchema.safeParse(transfer).success, false);
	assert.throws(() => getInventoryItem(created.id));
});
const recreated = materials.getState().saveMaterial(undefined, base);
check("IDs remain unique after deletion", () => {
	assert.notEqual(recreated.id, created.id);
	const ids = getInventoryItems().map((item) => item.id);
	assert.equal(new Set(ids).size, ids.length);
});
const previousTransfer = {
	operation: "transfer",
	kind: "product",
	fromStore: "Toko Sushiro",
	toStore: "Toko Degri",
	note: "",
	lines: [{ itemId: "nasgor-pedas", stock: 100, quantity: 12 }],
};
for (const [name, data, expected] of [
	["Product transfer", previousTransfer, true],
	[
		"Same stores",
		{ ...previousTransfer, toStore: previousTransfer.fromStore },
		false,
	],
	["Missing destination", { ...previousTransfer, toStore: "" }, false],
	["No items", { ...previousTransfer, lines: [] }, false],
	[
		"Over stock",
		{
			...previousTransfer,
			lines: [{ ...previousTransfer.lines[0], quantity: 101 }],
		},
		false,
	],
	[
		"Decimal product",
		{
			...previousTransfer,
			lines: [{ ...previousTransfer.lines[0], quantity: 0.5 }],
		},
		true,
	],
	[
		"Adjustment",
		{ ...previousTransfer, operation: "adjustment", toStore: "" },
		true,
	],
])
	check("Existing flow " + name, () =>
		assert.equal(stockOperationSchema.safeParse(data).success, expected),
	);
const report = {
	generatedAt: new Date().toISOString(),
	assertions,
	failures: 0,
	scope:
		"Production material/schema/store/helpers and inventory integration, with in-memory session fixtures",
};
fs.writeFileSync(
	path.join(__dirname, "model-results.json"),
	JSON.stringify(report, null, 2) + "\n",
);
process.stdout.write(
	assertions + " material/calendar/store/inventory assertions passed\n",
);
