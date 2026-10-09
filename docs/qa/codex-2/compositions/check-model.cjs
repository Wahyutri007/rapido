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
	const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
		},
	}).outputText;
	new Function("require", "module", "exports", code)(
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
let checks = 0;
function check(name, test) {
	try {
		test();
		checks++;
	} catch (error) {
		error.message = name + ": " + error.message;
		throw error;
	}
}
const { compositionSchema, compositionSimulationSchema } = load(
	path.join(project, "schema/inventory/composition.ts"),
);
const { compositionCost, compositionMargin, simulateComposition } = load(
	path.join(project, "lib/inventory/composition.ts"),
);
const { useInventoryCompositionStore: recipes } = load(
	path.join(project, "store/inventoryCompositionStore.ts"),
);
const { useInventoryMaterialStore: materials } = load(
	path.join(project, "store/inventoryMaterialStore.ts"),
);
const { COMPOSITION_PRODUCTS } = load(
	path.join(project, "constants/data/inventory-compositions.ts"),
);
const base = {
	lines: [
		{ materialId: "tepung", unit: "Kg", quantity: 0.25, unitPrice: 30000 },
	],
};
for (const [name, values, success] of [
	["Valid decimals", base, true],
	["No materials", { lines: [] }, false],
	["Missing ID", { lines: [{ ...base.lines[0], materialId: "" }] }, false],
	["Missing unit", { lines: [{ ...base.lines[0], unit: "" }] }, false],
	["Zero amount", { lines: [{ ...base.lines[0], quantity: 0 }] }, false],
	["Negative amount", { lines: [{ ...base.lines[0], quantity: -1 }] }, false],
	[
		"Infinite amount",
		{ lines: [{ ...base.lines[0], quantity: Infinity }] },
		false,
	],
	["NaN amount", { lines: [{ ...base.lines[0], quantity: NaN }] }, false],
	["Zero price", { lines: [{ ...base.lines[0], unitPrice: 0 }] }, false],
	["Negative price", { lines: [{ ...base.lines[0], unitPrice: -1 }] }, false],
	[
		"Infinite price",
		{ lines: [{ ...base.lines[0], unitPrice: Infinity }] },
		false,
	],
	["Duplicate material", { lines: [base.lines[0], base.lines[0]] }, false],
	[
		"Line overflow",
		{ lines: [{ ...base.lines[0], quantity: 1e300, unitPrice: 1e300 }] },
		false,
	],
	[
		"Sum overflow",
		{
			lines: [
				{ ...base.lines[0], quantity: 1e308, unitPrice: 1 },
				{ ...base.lines[0], materialId: "cabe", quantity: 1e308, unitPrice: 1 },
			],
		},
		false,
	],
])
	check(name, () =>
		assert.equal(compositionSchema.safeParse(values).success, success),
	);
check("Cost uses per-unit estimate", () =>
	assert.equal(compositionCost(base.lines), 7500),
);
check("Margin uses gross profit / sale price", () => {
	const result = compositionMargin(7500, 28000);
	assert.equal(result.profit, 20500);
	assert.ok(Math.abs(result.percentage - 73.21428571428571) < 1e-10);
});
check("Negative margin", () =>
	assert.deepEqual(compositionMargin(30000, 15000), {
		profit: -15000,
		percentage: -100,
	}),
);
check("Negative cost rejected", () =>
	assert.equal(compositionMargin(-1, 28000), null),
);
check("Overflow margin rejected", () =>
	assert.equal(compositionMargin(1e300, 1e-300), null),
);
check("Mixed unit simulation stays separate", () => {
	const lines = [
		...base.lines,
		{ materialId: "minyak", unit: "Liter", quantity: 0.01, unitPrice: 20000 },
	];
	assert.equal(compositionCost(lines), 7700);
	assert.deepEqual(
		simulateComposition(lines, 5).quantities.map((line) => [
			line.quantity,
			line.unit,
		]),
		[
			[1.25, "Kg"],
			[0.05, "Liter"],
		],
	);
});
check("Unknown and invalid prices", () => {
	for (const price of [undefined, 0, -1, Infinity, NaN])
		assert.equal(compositionMargin(7500, price), null);
	assert.equal(compositionMargin(Infinity, 28000), null);
});
for (const portions of [1, 5, 10, 0.5])
	check("Simulation " + portions, () => {
		const value = simulateComposition(base.lines, portions);
		assert.equal(value.cost, 7500 * portions);
		assert.equal(value.quantities[0].quantity, 0.25 * portions);
		assert.equal(value.quantities[0].unit, "Kg");
	});
for (const portions of [0, -1, Infinity, NaN])
	check("Invalid portions " + portions, () => {
		assert.equal(simulateComposition(base.lines, portions), null);
		assert.equal(
			compositionSimulationSchema.safeParse({ portions }).success,
			false,
		);
	});
check("Simulation multiplication overflow", () =>
	assert.equal(simulateComposition(base.lines, 1e308), null),
);
check("Only existing product menus", () => {
	assert.equal(COMPOSITION_PRODUCTS.length, 8);
	assert.ok(COMPOSITION_PRODUCTS.every((item) => item.kind === "product"));
});
check("Unknown product cannot save", () =>
	assert.ok(
		recipes
			.getState()
			.saveComposition("missing", base, materials.getState().materials).error,
	),
);
check("Empty product cannot save", () =>
	assert.ok(
		recipes.getState().saveComposition("", base, materials.getState().materials)
			.error,
	),
);
check("Material cannot be a product", () =>
	assert.ok(
		recipes
			.getState()
			.saveComposition("tepung", base, materials.getState().materials).error,
	),
);
check("Unavailable materials rejected", () =>
	assert.ok(
		recipes
			.getState()
			.saveComposition(
				"ayam-geprek",
				{ lines: [{ ...base.lines[0], materialId: "missing" }] },
				materials.getState().materials,
			).error,
	),
);
check("Unit must match material", () =>
	assert.ok(
		recipes
			.getState()
			.saveComposition(
				"ayam-geprek",
				{ lines: [{ ...base.lines[0], unit: "Liter" }] },
				materials.getState().materials,
			).error,
	),
);
check("First recipe saves", () =>
	assert.equal(
		recipes
			.getState()
			.saveComposition("ayam-geprek", base, materials.getState().materials)
			.productId,
		"ayam-geprek",
	),
);
const createdAt = recipes.getState().compositions[0].createdAt;
check("Snapshot is independent of material rename", () => {
	const original = materials
		.getState()
		.materials.find((item) => item.id === "tepung");
	materials.setState((state) => ({
		materials: state.materials.map((item) =>
			item.id === "tepung" ? { ...item, name: "Tepung Diubah" } : item,
		),
	}));
	assert.equal(
		recipes.getState().compositions[0].lines[0].material.name,
		original.name,
	);
});
check("Edit does not duplicate product recipe", () => {
	recipes
		.getState()
		.saveComposition(
			"ayam-geprek",
			{ lines: [{ ...base.lines[0], quantity: 0.5 }] },
			materials.getState().materials,
		);
	assert.equal(recipes.getState().compositions.length, 1);
	assert.equal(recipes.getState().compositions[0].createdAt, createdAt);
	assert.equal(
		compositionCost(recipes.getState().compositions[0].lines),
		15000,
	);
});
check("Edit uses current name snapshot", () =>
	assert.equal(
		recipes.getState().compositions[0].lines[0].material.name,
		"Tepung Diubah",
	),
);
const addedMaterial = materials.getState().saveMaterial(undefined, {
	stores: ["Toko Sushiro"],
	name: "Bahan Resep QA",
	sku: "RCP-QA",
	unit: "Liter",
	stock: 3,
	minimumStock: 0,
	averagePrice: 20000,
	expiresAt: null,
	note: "",
});
check("New material can be used immediately", () =>
	assert.equal(
		recipes.getState().saveComposition(
			"chicken-katsu",
			{
				lines: [
					{
						materialId: addedMaterial.id,
						quantity: 0.01,
						unit: "Liter",
						unitPrice: 20000,
					},
				],
			},
			materials.getState().materials,
		).productId,
		"chicken-katsu",
	),
);
check("Recipe prevents material deletion", () =>
	assert.equal(
		materials.getState().deleteMaterial(addedMaterial.id).error,
		"Bahan baku masih digunakan pada resep produk",
	),
);
check("Recipe amount is not a stock transaction", () => {
	assert.equal(
		materials.getState().materials.find((item) => item.id === addedMaterial.id)
			.stock,
		3,
	);
	assert.equal(
		recipes.getState().saveComposition(
			"chicken-katsu",
			{
				lines: [
					{
						materialId: addedMaterial.id,
						quantity: 100,
						unit: "Liter",
						unitPrice: 20000,
					},
				],
			},
			materials.getState().materials,
		).productId,
		"chicken-katsu",
	);
});
check("Changed material unit rejects stale draft", () => {
	materials.setState((state) => ({
		materials: state.materials.map((item) =>
			item.id === addedMaterial.id ? { ...item, unit: "Kg" } : item,
		),
	}));
	const prior = recipes
		.getState()
		.compositions.find((item) => item.productId === "chicken-katsu");
	const result = recipes
		.getState()
		.saveComposition(
			"chicken-katsu",
			{ lines: prior.lines },
			materials.getState().materials,
		);
	assert.equal(result.field, "lines.0.unit");
	assert.equal(
		recipes
			.getState()
			.compositions.find((item) => item.productId === "chicken-katsu").lines[0]
			.unit,
		"Liter",
	);
});
check("Delete recipe releases material guard", () => {
	assert.equal(
		recipes.getState().deleteComposition("chicken-katsu").productId,
		"chicken-katsu",
	);
	assert.equal(
		materials.getState().deleteMaterial(addedMaterial.id).id,
		addedMaterial.id,
	);
});
check("Deleted material rejected by stale form", () =>
	assert.ok(
		recipes.getState().saveComposition(
			"chicken-katsu",
			{
				lines: [
					{
						materialId: addedMaterial.id,
						quantity: 0.1,
						unit: "Kg",
						unitPrice: 10,
					},
				],
			},
			materials.getState().materials,
		).error,
	),
);
check("Repeated recipe delete reports missing", () =>
	assert.equal(
		recipes.getState().deleteComposition("chicken-katsu").error,
		"Resep tidak ditemukan",
	),
);
check("Clear and recreate recipe keeps one record", () => {
	recipes.getState().deleteComposition("ayam-geprek");
	assert.equal(recipes.getState().compositions.length, 0);
	recipes
		.getState()
		.saveComposition("ayam-geprek", base, materials.getState().materials);
	assert.equal(recipes.getState().compositions.length, 1);
});
check("Price override does not edit material catalog", () => {
	const material = materials
		.getState()
		.materials.find((item) => item.id === "tepung");
	recipes
		.getState()
		.saveComposition(
			"ayam-geprek",
			{ lines: [{ ...base.lines[0], unitPrice: 15000 }] },
			materials.getState().materials,
		);
	assert.equal(
		materials.getState().materials.find((item) => item.id === "tepung")
			.averagePrice,
		material.averagePrice,
	);
	assert.equal(compositionCost(recipes.getState().compositions[0].lines), 3750);
});
fs.writeFileSync(
	path.join(__dirname, "model-results.json"),
	JSON.stringify(
		{
			generatedAt: new Date().toISOString(),
			assertions: checks,
			failures: 0,
			scope:
				"Production recipe schema/store/cost/simulation and material-reference guard with session fixtures",
		},
		null,
		2,
	) + "\n",
);
process.stdout.write(checks + " composition model checks passed\n");
