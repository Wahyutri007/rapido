const fs = require("node:fs"),
	path = require("node:path"),
	vm = require("node:vm"),
	crypto = require("node:crypto"),
	ts = require("typescript");
const toolsPath = path.resolve(".expo/senior7-test-tools/node_modules");
const React = require(path.join(toolsPath, "react"));
require("react");
require.cache[require.resolve("react")].exports = React;
const { act, create } = require(path.join(toolsPath, "react-test-renderer"));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [],
	errors = [],
	cache = new Map(),
	downloads = [],
	shared = [],
	cleanup = [];
let params = {},
	shareHandler = async () => ({ action: "sharedAction" }),
	clickError = false;
const Platform = { OS: "web" };
const Share = {
	sharedAction: "sharedAction",
	share: (input) => {
		shared.push(input);
		return shareHandler(input);
	},
};
let blob;
const revoked = [];
const browserURL = {
	createObjectURL: (b) => {
		blob = b;
		return "blob:fixture";
	},
	revokeObjectURL: (url) => revoked.push(url),
};
const document = {
	body: { appendChild: () => {} },
	createElement: () => ({
		remove() {},
		click() {
			if (clickError) throw Error("Download rejected");
			downloads.push({ filename: this.download, blob });
		},
	}),
};
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	errors.push(args.map(String).join(" "));
	originalError(...args);
};
function load(file) {
	file = path.resolve(file);
	if (!path.extname(file))
		file = [file + ".ts", file + ".tsx", path.join(file, "index.ts")].find(
			fs.existsSync,
		);
	if (cache.has(file)) return cache.get(file).exports;
	const content = fs.readFileSync(file, "utf8"),
		module = {
			exports: {},
			sha256: crypto.createHash("sha256").update(content).digest("hex"),
		};
	cache.set(file, module);
	function localRequire(name) {
		if (name === "react") return React;
		if (name === "react/jsx-runtime")
			return require(path.join(toolsPath, "react/jsx-runtime"));
		if (name === "react-native") return { Platform, Share, View: "View" };
		if (name === "expo-router") return { useLocalSearchParams: () => params };
		if (name === "@/components/common/Form")
			return Object.fromEntries(
				[
					"Form",
					"FormControl",
					"FormField",
					"FormInput",
					"FormItem",
					"FormLabel",
					"FormMessage",
					"FormSelect",
				].map((n) => [n, n]),
			);
		if (name.startsWith("@/components/common/")) return name.split("/").at(-1);
		if (name.startsWith("@/")) return load(name.slice(2));
		if (name.startsWith("."))
			return load(path.resolve(path.dirname(file), name));
		return require(name);
	}
	const code = ts.transpileModule(content, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			jsx: ts.JsxEmit.ReactJSX,
			esModuleInterop: true,
		},
	}).outputText;
	vm.runInNewContext(
		code,
		{
			module,
			exports: module.exports,
			require: localRequire,
			console,
			Date,
			Error,
			Blob,
			URL: browserURL,
			document,
			setTimeout: file.endsWith("export-delivery.ts")
				? (fn) => cleanup.push(fn)
				: setTimeout,
			clearTimeout,
		},
		{ filename: file },
	);
	return module.exports;
}
const check = (name, actual, expected) =>
	checks.push({
		name,
		actual: structuredClone(actual),
		expected: structuredClone(expected),
		passed: JSON.stringify(actual) === JSON.stringify(expected),
	});
const {
	buildDataExport: build,
	csvCell,
	exportStoreOptions,
	ALL_EXPORT_STORES: ALL,
} = load("lib/manage/export-data.ts");
const { exportSchema } = load("schema/manage/export.ts");
const { deliverDataExport: deliver } = load("lib/manage/export-delivery.ts");
const defaults = { type: "financial", store: ALL, start: "", end: "" };
const income = (id, date, store) => ({
	id,
	date,
	store,
	type: "manual",
	referenceNumber: id,
	time: "12:00",
	createdBy: "Tester",
	amount: 100,
	description: 'comma, quote" and\nnewline',
});
const source = {
	transactions: [
		{
			dateKey: "2026-10-09",
			date: "wrong label",
			totalTransactions: 999,
			totalAmount: 999,
			items: [
				{
					id: "t1",
					time: "12:00",
					customer: "=1+1",
					cashier: "Tester",
					channel: "QRIS",
					paymentMethod: "QRIS",
					statusLabel: "Berhasil",
					amount: 12,
				},
			],
		},
	],
	items: [
		{
			id: "p",
			name: "Produk",
			sku: "001",
			kind: "product",
			category: "Food",
			stock: 3,
			unit: "Pcs",
		},
	],
	incomes: [
		income("a", "9 Oktober 2026", "A"),
		income("b", "2026-10-10", "B"),
		income("c", "bad", undefined),
	],
	expenses: [
		{
			...income("e", "2026-10-09", "A"),
			type: "expense",
			accountName: "Kas",
			accountCode: "101",
			fundingSource: "Tunai",
		},
	],
};
async function main() {
	check(
		"all finance rows including unknown dates retained",
		build(defaults, source).count,
		4,
	);
	check(
		"specific store includes only matching records",
		build({ ...defaults, store: "A" }, source).count,
		2,
	);
	check(
		"single day inclusive and Indonesian date parsed",
		build({ ...defaults, start: "2026-10-09", end: "2026-10-09" }, source)
			.count,
		2,
	);
	check(
		"invalid dates excluded and reported",
		build({ ...defaults, start: "2026-10-09" }, source).excludedInvalidDates,
		1,
	);
	check(
		"open ended lower bound",
		build({ ...defaults, start: "2026-10-10" }, source).count,
		1,
	);
	check(
		"open ended upper bound",
		build({ ...defaults, end: "2026-10-09" }, source).count,
		2,
	);
	check(
		"empty range has header but no records",
		build({ ...defaults, start: "2027-01-01" }, source).count,
		0,
	);
	check(
		"store options derived without fictional store",
		exportStoreOptions(source).map((x) => x.value),
		[ALL, "A", "B"],
	);
	for (const value of [
		{ start: "2026-02-30" },
		{ end: "no-date" },
		{ start: "2026-10-10", end: "2026-10-09" },
		{ type: "unknown" },
	])
		check(
			"invalid options rejected " + JSON.stringify(value),
			exportSchema.safeParse({ ...defaults, ...value }).success,
			false,
		);
	check(
		"valid leap date accepted",
		exportSchema.safeParse({ ...defaults, start: "2024-02-29" }).success,
		true,
	);
	check(
		"inventory ignores period bounds",
		build({ ...defaults, type: "inventory", start: "bad" }, source).count,
		1,
	);
	check(
		"transaction count uses real rows not fixture summary",
		build({ ...defaults, type: "transaction" }, source).count,
		1,
	);
	check(
		"transaction period uses dateKey",
		build({ ...defaults, type: "transaction", start: "2026-10-10" }, source)
			.count,
		0,
	);
	for (const type of ["transaction", "inventory"]) {
		let threw = false;
		try {
			build({ ...defaults, type, store: "A" }, source);
		} catch {
			threw = true;
		}
		check(type + " disallows invented per-store data", threw, true);
	}
	let missing = false;
	try {
		build({ ...defaults, store: "Deleted" }, source);
	} catch {
		missing = true;
	}
	check("unknown store rejected", missing, true);
	check(
		"CSV quotes embedded comma quote and newline",
		csvCell('a,"b\nc'),
		'"a,""b\nc"',
	);
	for (const text of ["=1+1", " +SUM(1)", "\t@x", "-cmd"]) {
		check(
			"formula text neutralized " + text,
			csvCell(text).startsWith("\"'"),
			true,
		);
	}
	check("negative numbers remain numeric", csvCell(-3), '"-3"');
	check("non-finite numbers left blank", csvCell(Infinity), '""');
	check("missing values blank", csvCell(undefined), '""');
	const output = build(defaults, source);
	check("UTF8 BOM included", output.csv.charCodeAt(0), 65279);
	check(
		"source included in CSV",
		output.csv.includes("Pratinjau penerimaan sesi"),
		true,
	);
	check(
		"web dispatch reports request only",
		await deliver(output.csv, output.filename),
		"download",
	);
	check("browser filename correct", downloads[0].filename, output.filename);
	check(
		"browser Blob contains complete CSV",
		await downloads[0].blob.text(),
		output.csv.replace(/^\uFEFF/, ""),
	);
	cleanup.splice(0).forEach((fn) => fn());
	check("blob URL released", revoked.length, 1);
	clickError = true;
	let failed = false;
	try {
		await deliver("x", "x.csv");
	} catch {
		failed = true;
	}
	clickError = false;
	cleanup.splice(0).forEach((fn) => fn());
	check("download failure propagates", failed, true);
	check("failed download releases URL", revoked.length, 2);
	Platform.OS = "android";
	shareHandler = async () => ({ action: "dismissedAction" });
	check(
		"native cancellation distinguished",
		await deliver("CSV", "x.csv"),
		"cancelled",
	);
	shareHandler = async () => ({ action: "sharedAction" });
	check("native share distinguished", await deliver("CSV", "x.csv"), "shared");
	check("native share receives CSV text", shared.at(-1).message, "CSV");
	shareHandler = async () => {
		throw Error("Share rejected");
	};
	failed = false;
	try {
		await deliver("x", "x.csv");
	} catch {
		failed = true;
	}
	check("share failure propagates", failed, true);
	const store = load("store/accountingStore.ts").useAccountingStore;
	const materials = load(
		"store/inventoryMaterialStore.ts",
	).useInventoryMaterialStore;
	store.setState({ incomes: source.incomes, expenses: source.expenses });
	materials.setState({ materials: [] });
	const Screen = load(
		"components/feature/manage/export/ExportDataScreen.tsx",
	).default;
	let renderer;
	const element = () =>
		React.createElement(React.StrictMode, null, React.createElement(Screen));
	await act(async () => {
		renderer = create(element());
	});
	const form = () => renderer.root.findByType("Form").props,
		button = () => renderer.root.findByType("BottomActionButton").props;
	const texts = () =>
		renderer.root
			.findAllByType("Text")
			.map((n) => n.props.children)
			.filter((x) => typeof x === "string");
	const set = async (name, value) =>
		act(async () => form().setValue(name, value));
	check(
		"screen shows actual preview row count",
		texts().includes("4 baris siap diekspor"),
		true,
	);
	await set("start", "invalid");
	let count = shared.length;
	await act(async () => button().onPress());
	check("invalid dates prevent delivery", shared.length, count);
	await set("start", "");
	let resolve;
	shareHandler = () =>
		new Promise((r) => {
			resolve = r;
		});
	const press = button().onPress;
	let p1, p2;
	await act(async () => {
		p1 = press();
		p2 = press();
		await Promise.resolve();
		await Promise.resolve();
	});
	check("pending double submit delivers once", shared.length, count + 1);
	check("pending action disables button", button().isDisabled, true);
	await act(async () => {
		resolve({ action: "dismissedAction" });
		await Promise.all([p1, p2]);
	});
	check("cancel shown honestly", texts().includes("Berbagi dibatalkan."), true);
	check("cancel allows retry", button().isDisabled, false);
	shareHandler = async () => {
		throw Error("Share rejected");
	};
	await act(async () => button().onPress());
	check("failure displayed", texts().includes("Share rejected"), true);
	shareHandler = async () => ({ action: "sharedAction" });
	await act(async () =>
		store.setState({
			incomes: [income("live", "2026-10-11", "C")],
			expenses: [],
		}),
	);
	check(
		"live update changes preview",
		texts().includes("1 baris siap diekspor"),
		true,
	);
	await act(async () => button().onPress());
	check(
		"submit captures latest store",
		shared.at(-1).message.includes('"live"'),
		true,
	);
	await set("store", "Deleted");
	check("removed store blocks export", button().isDisabled, true);
	await set("type", "inventory");
	await set("store", "");
	await set("start", "invalid");
	check(
		"inventory preview ignores hidden date and store",
		texts().some((t) => t.endsWith("baris siap diekspor")),
		true,
	);
	count = shared.length;
	await act(async () => button().onPress());
	check(
		"hidden empty store does not block inventory",
		shared.length,
		count + 1,
	);
	check(
		"inventory export uses aggregate headers",
		shared.at(-1).message.includes("Stok agregat"),
		true,
	);
	await set("type", "financial");
	await set("start", "");
	await set("store", ALL);
	await act(async () => store.setState({ incomes: [], expenses: [] }));
	check("empty source disables export", button().isDisabled, true);
	await act(async () =>
		store.setState({ incomes: [income("later", "2026-10-11", "C")] }),
	);
	shareHandler = () =>
		new Promise((r) => {
			resolve = r;
		});
	let pending;
	await act(async () => {
		pending = button().onPress();
		await Promise.resolve();
		await Promise.resolve();
	});
	await act(async () => renderer.unmount());
	await act(async () => {
		resolve({ action: "sharedAction" });
		await pending;
	});
	check("no unexpected React errors", errors, []);
	fs.writeFileSync(path.join(__dirname, "sample.csv"), output.csv);
	const result = {
		passed: checks.filter((c) => c.passed).length,
		failed: checks.filter((c) => !c.passed).length,
		checks,
		errors,
		files: [...cache].map(([file, m]) => ({
			file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
			sha256: m.sha256,
		})),
		limits:
			"Production helpers, screen/RHF/Zod/Zustand; host UI, browser DOM and Share adapters; no real API/device download.",
	};
	fs.writeFileSync(
		path.join(__dirname, "results.json"),
		JSON.stringify(result, null, 2) + "\n",
	);
	console.log(
		JSON.stringify({
			passed: result.passed,
			failed: result.failed,
			failures: checks.filter((c) => !c.passed),
		}),
	);
	process.exitCode = result.failed ? 1 : 0;
}
main().catch((e) => {
	console.error(e);
	process.exitCode = 2;
});
