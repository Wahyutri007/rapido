const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "../../..");
const sourcePath = path.join(root, "lib/cashier-cart-pricing.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
	compilerOptions: {
		module: ts.ModuleKind.CommonJS,
		target: ts.ScriptTarget.ES2020,
	},
});
const compiledExports = {};
vm.runInThisContext(`(exports => { ${compiled.outputText}\n })`, {
	filename: sourcePath,
})(compiledExports);
const { getCartItemPricing, getCartSubtotal } = compiledExports;

function item(overrides = {}) {
	return {
		id: "item",
		menu: { sell_price: 50000 },
		amount: 1,
		variants: [],
		...overrides,
	};
}
function cart(...groups) {
	return {
		id: "cart",
		details: groups.map((items, index) => ({ id: String(index), items })),
	};
}

const results = [];
function test(name, run) {
	try {
		run();
		results.push({ name, status: "PASS" });
	} catch (error) {
		results.push({ name, status: "FAIL", error: error.message });
	}
}

test("normal selling price and quantity", () => {
	assert.deepEqual(getCartItemPricing(item({ amount: 2 })), {
		unitPrice: 50000,
		lineTotal: 100000,
	});
});
test("discount snapshot is authoritative, not recalculated from percentage", () => {
	assert.deepEqual(
		getCartItemPricing(
			item({
				menu: {
					sell_price: 45000,
					discount: { type: "percentage", value: 10, price: 40000 },
				},
			}),
		),
		{ unitPrice: 40000, lineTotal: 40000 },
	);
});
test("zero discount snapshot remains free", () => {
	assert.deepEqual(
		getCartItemPricing(
			item({ menu: { sell_price: 50000, discount: { price: 0 } }, amount: 3 }),
		),
		{ unitPrice: 0, lineTotal: 0 },
	);
});
test("nullish snapshot uses known selling price", () => {
	assert.deepEqual(
		getCartItemPricing(
			item({ menu: { sell_price: 50000, discount: { price: null } } }),
		),
		{ unitPrice: 50000, lineTotal: 50000 },
	);
});
test("variants are per unit before multiplying quantity", () => {
	assert.deepEqual(
		getCartItemPricing(
			item({ variants: [{ price: 1000 }, { price: 2000 }], amount: 3 }),
		),
		{ unitPrice: 53000, lineTotal: 159000 },
	);
});
test("zero-price variants remain valid", () => {
	assert.deepEqual(getCartItemPricing(item({ variants: [{ price: 0 }] })), {
		unitPrice: 50000,
		lineTotal: 50000,
	});
});
test("all detail groups contribute to subtotal", () => {
	assert.equal(
		getCartSubtotal(
			cart(
				[
					item({
						menu: { sell_price: 40000 },
						variants: [{ price: 1000 }, { price: 2000 }],
					}),
				],
				[],
				[item({ amount: 2 })],
			),
		),
		143000,
	);
});
test("empty cart and empty detail groups subtotal zero", () => {
	assert.equal(getCartSubtotal(cart()), 0);
	assert.equal(getCartSubtotal(cart([], [])), 0);
});
test("null or absent cart is unavailable", () => {
	assert.equal(getCartSubtotal(null), null);
	assert.equal(getCartSubtotal(undefined), null);
});
test("null or absent item is unavailable", () => {
	assert.equal(getCartItemPricing(null), null);
	assert.equal(getCartItemPricing(undefined), null);
});

for (const [label, price] of [
	["negative", -1],
	["NaN", NaN],
	["Infinity", Infinity],
	["negative Infinity", -Infinity],
	["fractional", 1000.5],
	["unsafe integer", Number.MAX_SAFE_INTEGER + 1],
	["missing", undefined],
	["null", null],
	["numeric string", "1000"],
]) {
	test(`invalid selling price: ${label}`, () => {
		assert.equal(
			getCartItemPricing(item({ menu: { sell_price: price } })),
			null,
		);
	});
	test(`invalid variant price: ${label}`, () => {
		assert.equal(getCartItemPricing(item({ variants: [{ price }] })), null);
	});
	if (price !== null && price !== undefined) {
		test(`invalid discount snapshot does not fall back: ${label}`, () => {
			assert.equal(
				getCartItemPricing(
					item({ menu: { sell_price: 50000, discount: { price } } }),
				),
				null,
			);
		});
	}
}

for (const [label, amount] of [
	["zero", 0],
	["negative", -1],
	["fractional", 1.5],
	["NaN", NaN],
	["Infinity", Infinity],
	["unsafe", Number.MAX_SAFE_INTEGER + 1],
	["missing", undefined],
	["numeric string", "2"],
]) {
	test(`invalid quantity: ${label}`, () =>
		assert.equal(getCartItemPricing(item({ amount })), null));
}

test("missing menu or variants does not imply a free item", () => {
	assert.equal(getCartItemPricing(item({ menu: null })), null);
	assert.equal(getCartItemPricing(item({ variants: null })), null);
});
test("missing cart group items is unavailable", () => {
	assert.equal(getCartSubtotal({ details: [{ items: null }] }), null);
	assert.equal(getCartSubtotal({ details: null }), null);
});
test("one invalid item invalidates the whole subtotal", () => {
	assert.equal(
		getCartSubtotal(cart([item()], [item({ variants: [{ price: -1 }] })])),
		null,
	);
});
test("safe money boundary is accepted", () => {
	assert.deepEqual(
		getCartItemPricing(item({ menu: { sell_price: Number.MAX_SAFE_INTEGER } })),
		{ unitPrice: Number.MAX_SAFE_INTEGER, lineTotal: Number.MAX_SAFE_INTEGER },
	);
});
test("variant addition overflow is unavailable", () => {
	assert.equal(
		getCartItemPricing(
			item({
				menu: { sell_price: Number.MAX_SAFE_INTEGER },
				variants: [{ price: 1 }],
			}),
		),
		null,
	);
});
test("quantity multiplication overflow is unavailable", () => {
	assert.equal(
		getCartItemPricing(
			item({ menu: { sell_price: Number.MAX_SAFE_INTEGER }, amount: 2 }),
		),
		null,
	);
});
test("subtotal accumulation overflow is unavailable", () => {
	assert.equal(
		getCartSubtotal(
			cart(
				[item({ menu: { sell_price: Number.MAX_SAFE_INTEGER } })],
				[item({ menu: { sell_price: 1 } })],
			),
		),
		null,
	);
});
test("helpers preserve source snapshots", () => {
	const input = cart([item({ variants: [{ price: 1000 }], amount: 2 })]);
	const before = structuredClone(input);
	getCartSubtotal(input);
	assert.deepEqual(input, before);
});

const summary = {
	generatedAt: new Date().toISOString(),
	sourcePath: "lib/cashier-cart-pricing.ts",
	sourceSha256: require("node:crypto")
		.createHash("sha256")
		.update(source)
		.digest("hex"),
	passed: results.filter((result) => result.status === "PASS").length,
	failed: results.filter((result) => result.status === "FAIL").length,
	results,
};
if (process.env.CASHIER_PRICING_RESULT) {
	fs.writeFileSync(
		process.env.CASHIER_PRICING_RESULT,
		`${JSON.stringify(summary, null, 2)}\n`,
	);
}
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
process.exitCode = summary.failed ? 1 : 0;
