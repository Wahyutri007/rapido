const fs = require("node:fs"),
	path = require("node:path"),
	vm = require("node:vm"),
	crypto = require("node:crypto"),
	ts = require("typescript");
const React = require(
	path.resolve(".expo/senior7-test-tools/node_modules/react"),
);
const { act, create } = require(
	path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"),
);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [],
	errors = [],
	cache = new Map(),
	navigation = [];
let params = {},
	focused = true,
	canGoBack = false;
const originalError = console.error;
console.error = (...args) => {
	if (!String(args[0]).includes("react-test-renderer is deprecated")) {
		errors.push(args.map(String).join(" "));
		originalError(...args);
	}
};
const host = (name) => (props) =>
	React.createElement(name, props, props.children);
const router = {
	push: (value) => navigation.push(["push", value]),
	replace: (value) => navigation.push(["replace", value]),
	canGoBack: () => canGoBack,
	back: () => navigation.push(["back"]),
};
const JSStack = host("JSStack");
JSStack.Screen = (props) =>
	React.createElement("Screen", props, props.options.header());
const native = {
	View: host("View"),
	StyleSheet: { create: (value) => value },
	FlatList: (props) =>
		React.createElement(
			"FlatList",
			props,
			props.ListHeaderComponent,
			props.data.length
				? props.data.map((item, index) =>
						React.createElement(
							React.Fragment,
							{ key: props.keyExtractor(item, index) },
							props.renderItem({ item, index }),
						),
					)
				: props.ListEmptyComponent,
		),
};
function load(input) {
	let file = path.resolve(input);
	if (!path.extname(file))
		file = [file + ".ts", file + ".tsx", path.join(file, "index.ts")].find(
			fs.existsSync,
		);
	if (cache.has(file)) return cache.get(file).exports;
	const source = fs.readFileSync(file, "utf8"),
		module = {
			exports: {},
			sha256: crypto.createHash("sha256").update(source).digest("hex"),
		};
	cache.set(file, module);
	const requireHere = (id) => {
		if (id === "@/assets/images") return { IMAGES: { examples: {} } };
		if (id === "react") return React;
		if (id === "react-native") return native;
		if (id === "expo-router")
			return { router, useLocalSearchParams: () => params };
		if (id === "expo-router/react-navigation")
			return { useIsFocused: () => focused };
		if (id === "@/lib/utils")
			return { formatRp: (n) => `Rp ${n.toLocaleString("id-ID")}` };
		if (id === "@/components/custom/JSStack")
			return { JSStack, ScaleBackTransition: {} };
		if (id === "@/components/ui/button")
			return { Button: host("Button"), ButtonText: host("ButtonText") };
		if (
			id.startsWith("@/components/common/") ||
			[
				"@/components/custom/DetailRow",
				"@/components/custom/CatalogItemCard",
			].includes(id)
		)
			return { __esModule: true, default: host(path.basename(id)) };
		if (id.startsWith("@/")) return load(id.slice(2));
		if (id.startsWith(".")) return load(path.resolve(path.dirname(file), id));
		return require(id);
	};
	vm.runInNewContext(
		ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
				jsx: ts.JsxEmit.React,
			},
		}).outputText,
		{
			require: requireHere,
			exports: module.exports,
			module,
			console,
			Intl,
			JSON,
			React,
		},
		{ filename: file },
	);
	return module.exports;
}
function check(name, actual, expected) {
	checks.push({
		name,
		passed: JSON.stringify(actual) === JSON.stringify(expected),
		actual,
		expected,
	});
}
async function main() {
	const h = load("lib/cashier/bills.ts");
	const { TRANSACTION_ITEMS: items } = load(
		"constants/data/transaction/transaction.ts",
	);
	const before = JSON.stringify(items);
	check(
		"only unpaid",
		h.unpaidBills(items).map((i) => i.id),
		["4", "5"],
	);
	check(
		"processing status",
		h.unpaidBills(items, "", "processing").map((i) => i.id),
		["5"],
	);
	check(
		"finished status",
		h.unpaidBills(items, "", "finished").map((i) => i.id),
		["4"],
	);
	check("case/trim search", h.unpaidBills(items, "  CHELSEA ").length, 2);
	check(
		"invoice is not a unique ID",
		h.unpaidBills(items, "INV12345").length,
		2,
	);
	check("recordID search", h.unpaidBills(items, "5", "processing")[0].id, "5");
	check("no match empty", h.unpaidBills(items, "missing"), []);
	check("empty source", h.unpaidBills([]), []);
	check(
		"exact record identity",
		h.findUnpaidBill(items, "5").statuses.isFinished,
		false,
	);
	for (const id of [undefined, "", "unknown", "INV12345", "1", ["4"]])
		check(
			"reject invalid/paid ID " + JSON.stringify(id),
			h.findUnpaidBill(items, id),
			undefined,
		);
	check(
		"duplicateID fails closed",
		h.findUnpaidBill([items[3], items[3]], "4"),
		undefined,
	);
	check(
		"paid duplicate cannot be hidden by unpaid filter",
		h.findUnpaidBill(
			[items[3], { ...items[3], statuses: { isPaid: true, isFinished: true } }],
			"4",
		),
		undefined,
	);
	check(
		"UTC explicit",
		h.billDateUTC("2023-10-01T12:00:00Z"),
		"2023-10-01 12:00",
	);
	check("invalid date", h.billDateUTC("bad"), "Tidak tersedia");
	check("source immutable", JSON.stringify(items), before);
	const List = load("app/(cashier)/biling/index.tsx").default;
	let screen;
	await act(async () => {
		screen = create(
			React.createElement(React.StrictMode, null, React.createElement(List)),
		);
	});
	const cards = () => screen.root.findAllByType("CatalogItemCard");
	check("list two unpaid rows", cards().length, 2);
	await act(async () =>
		screen.root.findByType("SingleSelect").props.onValueChange("processing"),
	);
	check("picker updates list", cards().length, 1);
	await act(async () => cards()[0].props.onPress());
	check("route uses exact recordID", navigation.at(-1), [
		"push",
		{ pathname: "/(cashier)/biling/detail", params: { id: "5" } },
	]);
	await act(async () =>
		screen.root.findByType("SearchBar").props.setSearch("missing"),
	);
	check("search shows empty", cards().length, 0);
	check(
		"empty copy rendered",
		screen.root
			.findAllByType("Text")
			.some((n) => n.props.children === "Tidak ada tagihan sesuai filter."),
		true,
	);
	await act(async () => screen.root.findByType("Button").props.onPress());
	check("reset count", cards().length, 2);
	check("reset search", screen.root.findByType("SearchBar").props.search, "");
	check(
		"reset status",
		screen.root.findByType("SingleSelect").props.value,
		"all",
	);
	await act(async () => screen.unmount());
	const Detail = load("app/(cashier)/biling/detail.tsx").default;
	params = { id: "4" };
	await act(async () => {
		screen = create(React.createElement(Detail));
	});
	const value = (label) =>
		screen.root.findAllByType("DetailRow").find((n) => n.props.label === label)
			?.props.value;
	check("finished bill detail", value("Pesanan"), "Selesai");
	check(
		"preserves inconsistent source total",
		value("Total sumber"),
		"Rp 150.000",
	);
	check("preserves source subtotal", value("Subtotal sumber"), "Rp 173.000");
	check(
		"actual order item name and amount",
		value(items[3].orders[0].menu.name),
		"1 item",
	);
	check("no payment action", screen.root.findAllByType("Button").length, 0);
	params = { id: "5" };
	await act(async () => screen.update(React.createElement(Detail)));
	check("ID change updates detail", value("Pesanan"), "Diproses");
	params = { id: "1" };
	await act(async () => screen.update(React.createElement(Detail)));
	check(
		"paid record not a pending bill",
		screen.root.findAllByType("DetailRow").length,
		0,
	);
	await act(async () => screen.root.findByType("Button").props.onPress());
	check("missing return path", navigation.at(-1), [
		"replace",
		"/(cashier)/biling",
	]);
	await act(async () => screen.unmount());
	const Layout = load("app/(cashier)/biling/_layout.tsx");
	check(
		"direct-link anchor",
		Layout.unstable_settings.initialRouteName,
		"index",
	);
	await act(async () => {
		screen = create(React.createElement(Layout.default));
	});
	check(
		"registers nested screens",
		screen.root.findAllByType("Screen").map((n) => n.props.name),
		["index", "detail"],
	);
	const back = () => screen.root.findAllByType("Header")[1].props.back();
	await act(async () => back());
	check("empty-stack fallback", navigation.at(-1), [
		"replace",
		"/(cashier)/biling",
	]);
	canGoBack = true;
	await act(async () => back());
	check("history back", navigation.at(-1), ["back"]);
	focused = false;
	await act(async () => screen.update(React.createElement(Layout.default)));
	check(
		"inactive header pointer disabled",
		screen.root
			.findAllByType("View")
			.every((n) => n.props.style.pointerEvents === "none"),
		true,
	);
	await act(async () => screen.unmount());
	check("no runtime errors", errors, []);
	const report = {
		passed: checks.filter((c) => c.passed).length,
		failed: checks.filter((c) => !c.passed).length,
		checks,
		errors,
		files: [...cache].map(([file, mod]) => ({
			file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
			sha256: mod.sha256,
		})),
		limits:
			"Actual production data constants/helper/screens/layout; native/UI/router/image adapters. No device, full router or backend execution.",
	};
	fs.writeFileSync(
		path.join(__dirname, "results.json"),
		JSON.stringify(report, null, 2) + "\n",
	);
	console.log(
		JSON.stringify({
			passed: report.passed,
			failed: report.failed,
			failures: checks.filter((c) => !c.passed),
		}),
	);
	process.exitCode = report.failed ? 1 : 0;
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 2;
});
