const fs = require("node:fs");
process.env.TZ = "Asia/Jakarta";
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
const completed = [];
function result(passed, error) {
	fs.writeFileSync(
		path.join(__dirname, "model-results.json"),
		JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				passed,
				assertions: completed.length,
				checks: completed,
				...(error ? { error: String(error.stack ?? error) } : {}),
			},
			null,
			2,
		) + "\n",
	);
}
process.on("uncaughtException", (error) => {
	result(false, error);
	console.error(error);
	process.exitCode = 1;
});
function check(name, test) {
	try {
		test();
		completed.push(name);
	} catch (error) {
		error.message = name + ": " + error.message;
		throw error;
	}
}
const { billPaymentSchema } = load(
	path.join(project, "schema/inventory/bill-payment.ts"),
);
const {
	purchaseOutstanding,
	purchaseMatchesSupplier,
	billPaymentTotals,
	purchasePaymentStatus,
} = load(path.join(project, "lib/inventory/bill-payment.ts"));
const { useInventoryBillPaymentStore: paymentStore } = load(
	path.join(project, "store/inventoryBillPaymentStore.ts"),
);
const { useInventoryStore: inventory } = load(
	path.join(project, "store/inventoryStore.ts"),
);
const { useInventorySupplierStore: supplierStore } = load(
	path.join(project, "store/inventorySupplierStore.ts"),
);
const purchases = inventory.getState().purchases;
const suppliers = supplierStore.getState().suppliers;
const purchase = purchases.find((item) => item.id === "purchase-4");
const supplier = suppliers.find((item) => item.id === purchase.supplierId);
const base = {
	supplierId: supplier.id,
	paymentMethod: "Tunai",
	externalReference: " REF-01 ",
	date: "2026-10-09",
	note: " test ",
	lines: [{ purchaseId: purchase.id, amount: 500000, discount: 5000 }],
};
for (const [name, values, expected] of [
	["Valid payment", base, true],
	["Trim optional fields", { ...base, externalReference: "", note: "" }, true],
	["No supplier", { ...base, supplierId: "" }, false],
	["No method", { ...base, paymentMethod: "" }, false],
	["Unsupported method", { ...base, paymentMethod: "BCA invented" }, false],
	["No bills", { ...base, lines: [] }, false],
	["Duplicate bill", { ...base, lines: [base.lines[0], base.lines[0]] }, false],
	[
		"No bill ID",
		{ ...base, lines: [{ ...base.lines[0], purchaseId: "" }] },
		false,
	],
	["Zero cash", { ...base, lines: [{ ...base.lines[0], amount: 0 }] }, false],
	[
		"Negative cash",
		{ ...base, lines: [{ ...base.lines[0], amount: -1 }] },
		false,
	],
	["NaN cash", { ...base, lines: [{ ...base.lines[0], amount: NaN }] }, false],
	[
		"Infinite cash",
		{ ...base, lines: [{ ...base.lines[0], amount: Infinity }] },
		false,
	],
	[
		"Huge cash",
		{ ...base, lines: [{ ...base.lines[0], amount: 1e13 }] },
		false,
	],
	[
		"Negative discount",
		{ ...base, lines: [{ ...base.lines[0], discount: -1 }] },
		false,
	],
	[
		"Infinite discount",
		{ ...base, lines: [{ ...base.lines[0], discount: Infinity }] },
		false,
	],
	[
		"Two decimals",
		{ ...base, lines: [{ ...base.lines[0], amount: 0.12, discount: 0.01 }] },
		true,
	],
	[
		"Three decimals",
		{ ...base, lines: [{ ...base.lines[0], amount: 0.123 }] },
		false,
	],
	["Bad date", { ...base, date: "2026-02-29" }, false],
	[
		"Sub-cent cash rejected",
		{ ...base, lines: [{ ...base.lines[0], amount: 0.000001 }] },
		false,
	],
	[
		"Sub-cent discount rejected",
		{ ...base, lines: [{ ...base.lines[0], discount: 0.000001 }] },
		false,
	],
	[
		"Valid arithmetic noise normalized",
		{ ...base, lines: [{ ...base.lines[0], amount: 1.1 + 2.2 }] },
		true,
	],
	["Empty date", { ...base, date: "" }, false],
	["Leap date", { ...base, date: "2024-02-29" }, true],
	["Malformed date", { ...base, date: "09-10-2026" }, false],
	["Reference cap", { ...base, externalReference: "x".repeat(129) }, false],
])
	check(name, () =>
		assert.equal(billPaymentSchema.safeParse(values).success, expected),
	);
check("No fabricated payment history", () =>
	assert.equal(paymentStore.getState().payments.length, 0),
);
check("Paid purchase has zero balance", () =>
	assert.equal(purchaseOutstanding(purchases[0], []), 0),
);
check("Cancelled purchase has zero balance", () =>
	assert.equal(purchaseOutstanding(purchases[2], []), 0),
);
check("Waiting unpaid balance", () =>
	assert.equal(purchaseOutstanding(purchase, []), 19432000),
);
check("Legacy supplier match", () =>
	assert.equal(
		purchaseMatchesSupplier(
			{
				...purchase,
				supplierId: undefined,
				supplier: "  " + supplier.name.toUpperCase() + "  ",
			},
			supplier,
		),
		true,
	),
);
check("Supplier ID survives name change", () =>
	assert.equal(
		purchaseMatchesSupplier(purchase, { ...supplier, name: "Renamed" }),
		true,
	),
);
check("Minor-unit addition", () =>
	assert.deepEqual(
		billPaymentTotals([
			{ amount: 0.1, discount: 0.1 },
			{ amount: 0.2, discount: 0.2 },
		]),
		{ amount: 0.3, discount: 0.3 },
	),
);
const save = (id, fields = base, bills = purchases, vendors = suppliers) =>
	paymentStore.getState().savePayment(id, fields, bills, vendors);
check("Missing edit ID", () => assert.ok(save("missing").error));
check("Empty edit ID", () => assert.ok(save("").error));
check("Missing supplier", () =>
	assert.ok(save(undefined, base, purchases, []).error),
);
check("Inactive supplier", () =>
	assert.ok(
		save(
			undefined,
			base,
			purchases,
			suppliers.map((item) => ({ ...item, active: false })),
		).error,
	),
);
check("Missing purchase", () =>
	assert.ok(
		save(undefined, {
			...base,
			lines: [{ ...base.lines[0], purchaseId: "missing" }],
		}).error,
	),
);
check("Wrong supplier", () =>
	assert.ok(save(undefined, { ...base, supplierId: suppliers[0].id }).error),
);
check("Already paid purchase", () =>
	assert.ok(
		save(undefined, {
			...base,
			supplierId: purchases[0].supplierId,
			lines: [{ ...base.lines[0], purchaseId: purchases[0].id }],
		}).error,
	),
);
check("Cancelled purchase", () =>
	assert.ok(
		save(undefined, {
			...base,
			supplierId: purchases[2].supplierId,
			lines: [{ ...base.lines[0], purchaseId: purchases[2].id }],
		}).error,
	),
);
check("Date before bill", () =>
	assert.ok(save(undefined, { ...base, date: "2025-10-07" }).error),
);
check("Overpayment plus discount", () =>
	assert.ok(
		save(undefined, {
			...base,
			lines: [{ ...base.lines[0], amount: purchase.amount, discount: 1 }],
		}).error,
	),
);
check("Invalid purchase amount", () =>
	assert.ok(
		save(
			undefined,
			base,
			purchases.map((item) =>
				item.id === purchase.id ? { ...item, amount: Infinity } : item,
			),
		).error,
	),
);
let first;
check("Create partial allocation", () => {
	first = save(undefined).id;
	assert.ok(first);
});
const original = paymentStore.getState().payments[0];
check("Trimmed snapshot fields", () => {
	assert.equal(original.externalReference, "REF-01");
	assert.equal(original.note, "test");
});
check("Balance reduced by cash and discount", () =>
	assert.equal(
		purchaseOutstanding(purchase, paymentStore.getState().payments),
		18927000,
	),
);
check("Partial payment status", () =>
	assert.equal(
		purchasePaymentStatus(purchase, paymentStore.getState().payments),
		"Sebagian",
	),
);
check("Snapshot totals retained", () => {
	assert.equal(original.lines[0].billAmount, 19432000);
	assert.equal(original.lines[0].remaining, 18927000);
});
check("Purchase state not overwritten", () => {
	assert.equal(
		inventory.getState().purchases.find((item) => item.id === purchase.id).paid,
		false,
	);
	assert.equal(purchase.amount, 19432000);
});
check("Purchase deletion guard", () =>
	assert.ok(inventory.getState().deletePurchase(purchase.id).error),
);
check("Edited allocation excluded from balance", () =>
	assert.equal(
		purchaseOutstanding(purchase, paymentStore.getState().payments, first),
		19432000,
	),
);
let second;
check("Settle remaining bill", () => {
	second = save(undefined, {
		...base,
		lines: [{ purchaseId: purchase.id, amount: 18927000, discount: 0 }],
	}).id;
	assert.ok(second);
	assert.equal(
		purchaseOutstanding(purchase, paymentStore.getState().payments),
		0,
	);
});
check("Paid status derived", () =>
	assert.equal(
		purchasePaymentStatus(purchase, paymentStore.getState().payments),
		"Lunas",
	),
);
check("Fresh balance rejects stale draft", () =>
	assert.ok(save(undefined).error),
);
check("Edit respects other allocations", () =>
	assert.ok(
		save(first, { ...base, lines: [{ ...base.lines[0], amount: 500001 }] })
			.error,
	),
);
check("Edit preserves ID/reference/createdAt", () => {
	assert.equal(
		save(first, {
			...base,
			lines: [{ purchaseId: purchase.id, amount: 400000, discount: 0 }],
		}).id,
		first,
	);
	const edited = paymentStore
		.getState()
		.payments.find((item) => item.id === first);
	assert.equal(edited.reference, original.reference);
	assert.equal(edited.createdAt, original.createdAt);
	assert.equal(paymentStore.getState().payments.length, 2);
});
check("Edit releases difference", () =>
	assert.equal(
		purchaseOutstanding(purchase, paymentStore.getState().payments),
		105000,
	),
);
check("Stale missing catalog rejects save", () =>
	assert.ok(save(first, base, []).error),
);
check("Deleting later allocation restores balance", () => {
	assert.equal(paymentStore.getState().deletePayment(second).id, second);
	assert.equal(
		purchaseOutstanding(purchase, paymentStore.getState().payments),
		19032000,
	);
});
check("Missing delete rejected", () =>
	assert.ok(paymentStore.getState().deletePayment("missing").error),
);
check("Delete releases purchase guard", () => {
	paymentStore.getState().deletePayment(first);
	assert.equal(
		inventory.getState().deletePurchase(purchase.id).id,
		purchase.id,
	);
});
check("Stale deleted purchase cannot be paid", () =>
	assert.ok(save(undefined, base, inventory.getState().purchases).error),
);
const next = save(undefined);
check("Reference sequence does not reuse deletion", () => {
	assert.ok(next.id);
	assert.equal(paymentStore.getState().sequence, 3);
	assert.notEqual(
		paymentStore.getState().payments[0].reference,
		original.reference,
	);
});
const secondBill = {
	...purchase,
	id: "second-bill",
	reference: "PO/test/2",
	amount: 1000,
};
check("Multiple PO allocation", () =>
	assert.ok(
		save(
			undefined,
			{
				...base,
				lines: [
					{ purchaseId: purchase.id, amount: 100, discount: 0 },
					{ purchaseId: secondBill.id, amount: 200, discount: 50 },
				],
			},
			[purchase, secondBill],
		).id,
	),
);
check("Supplier snapshot captured", () =>
	assert.equal(paymentStore.getState().payments[0].supplierName, supplier.name),
);
check("Payment date follows local purchase day across UTC midnight", () => {
	assert.ok(
		save(
			undefined,
			{ ...base, date: "2026-10-08" },
			purchases.map((item) =>
				item.id === purchase.id
					? { ...item, createdAt: "2026-10-08T20:00:00Z" }
					: item,
			),
		).error,
	);
});
check("Fractional settlement keeps a positive zero snapshot", () => {
	const fractional = {
		...purchase,
		id: "fraction-bill",
		reference: "PO/fraction/1",
		amount: 0.3,
	};
	const id = save(
		undefined,
		{
			...base,
			lines: [{ purchaseId: fractional.id, amount: 0.1, discount: 0.2 }],
		},
		[fractional],
	).id;
	assert.ok(id);
	assert.equal(
		paymentStore.getState().payments.find((item) => item.id === id).lines[0]
			.remaining,
		0,
	);
});
result(true);
console.log(
	completed.length +
		" billing schema/balance/snapshot/reference scenarios passed",
);
