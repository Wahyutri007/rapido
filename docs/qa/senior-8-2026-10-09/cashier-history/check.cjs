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
	const h = load("lib/cashier/transaction-history.ts");
	const { DEFAULT_TRANSACTION_GROUPS: groups } = load(
		"components/feature/reports/transaction/mockData.ts",
	);
	const before = JSON.stringify(groups),
		rows = h.historyRows(groups),
		empty = h.EMPTY_HISTORY_FILTERS;
	check("counts actual rows, not fictional group totals", rows.length, 8);
	check("stable unique composite IDs", new Set(rows.map((r) => r.key)).size, 8);
	check("latest first", rows[0].date, "2026-06-30");
	check("time descending within date", rows[0].time, "21:15");
	check(
		"date key wins over conflicting display label",
		rows.at(-1).date,
		"2026-06-29",
	);
	check("source not mutated", JSON.stringify(groups), before);
	check(
		"case and whitespace search",
		h.filterHistory(rows, { ...empty, search: "  RINI  " }).length,
		2,
	);
	check(
		"invoice search",
		h.filterHistory(rows, { ...empty, search: "TRX-0629-1842" }).length,
		1,
	);
	check(
		"cashier search",
		h.filterHistory(rows, { ...empty, search: "Budi" }).length,
		2,
	);
	check(
		"status filter",
		h.filterHistory(rows, { ...empty, status: "refund" }).length,
		2,
	);
	check(
		"date filter",
		h.filterHistory(rows, { ...empty, date: "2026-06-29" }).length,
		4,
	);
	check(
		"combined filters",
		h.filterHistory(rows, {
			...empty,
			date: "2026-06-29",
			status: "success",
			payment: "QRIS",
		}).length,
		1,
	);
	check(
		"unknown date no fallback",
		h.filterHistory(rows, { ...empty, date: "2030-01-01" }).length,
		0,
	);
	check(
		"cancelled empty",
		h.filterHistory(rows, { ...empty, status: "cancelled" }).length,
		0,
	);
	check(
		"date options newest first",
		h.historyOptions(rows, "date").map((o) => o.value),
		["", "2026-06-30", "2026-06-29"],
	);
	check(
		"payment options derived/deduplicated",
		h.historyOptions(rows, "paymentMethod").length,
		4,
	);
	check("empty source", h.historyRows([]), []);
	check("exact detail", h.findHistoryRow(rows, rows[2].key)?.id, rows[2].id);
	for (const key of [undefined, "", "missing", rows[0].id, [rows[0].key]])
		check(
			"invalid key fails closed " + JSON.stringify(key),
			h.findHistoryRow(rows, key),
			undefined,
		);
	check(
		"duplicate composite ID fails closed",
		h.findHistoryRow([rows[0], rows[0]], rows[0].key),
		undefined,
	);
	const repeated = h.historyRows([
		{ ...groups[0], items: [groups[0].items[0]] },
		{ ...groups[1], items: [groups[0].items[0]] },
	]);
	check(
		"same invoice on different date distinct",
		repeated[0].key !== repeated[1].key,
		true,
	);
	const Screen = load("app/(cashier)/report/history.tsx").default;
	let screen;
	await act(async () => {
		screen = create(
			React.createElement(React.StrictMode, null, React.createElement(Screen)),
		);
	});
	const cards = () => screen.root.findAllByType("CatalogItemCard");
	const picker = (label) =>
		screen.root
			.findAllByType("SingleSelect")
			.find((n) => n.props.label === label).props;
	check("list initially renders all actual records", cards().length, 8);
	await act(async () =>
		screen.root.findByType("SearchBar").props.setSearch("Rini"),
	);
	check("search updates displayed rows", cards().length, 2);
	await act(async () =>
		picker("Tanggal transaksi").onValueChange("2026-06-29"),
	);
	check("date combines with search", cards().length, 1);
	await act(async () => cards()[0].props.onPress());
	const selection = navigation.at(-1)[1];
	check(
		"selection uses cashier route group",
		selection.pathname,
		"/(cashier)/report/history-detail",
	);
	check(
		"selection carries exact source key",
		h.findHistoryRow(rows, selection.params.id)?.id,
		"TRX-0629-1836",
	);
	await act(async () => picker("Status transaksi").onValueChange("success"));
	check("conflicting filters show empty", cards().length, 0);
	check(
		"empty message rendered",
		screen.root
			.findAllByType("Text")
			.some((n) => n.props.children === "Tidak ada transaksi sesuai filter."),
		true,
	);
	await act(async () => screen.root.findByType("Button").props.onPress());
	check("reset restores rows", cards().length, 8);
	check(
		"reset restores search",
		screen.root.findByType("SearchBar").props.search,
		"",
	);
	check("reset restores status", picker("Status transaksi").value, "");
	await act(async () => picker("Metode pembayaran").onValueChange("QRIS"));
	check("payment picker filters", cards().length, 2);
	await act(async () => screen.unmount());
	const Detail = load("app/(cashier)/report/history-detail.tsx").default;
	params = { id: selection.params.id };
	await act(async () => {
		screen = create(React.createElement(Detail));
	});
	check(
		"detail uses selected customer",
		screen.root
			.findAllByType("DetailRow")
			.find((n) => n.props.label === "Pelanggan").props.value,
		"Rini Kusuma",
	);
	check(
		"detail uses selected date",
		screen.root
			.findAllByType("DetailRow")
			.find((n) => n.props.label === "Tanggal").props.value,
		"2026-06-29",
	);
	params = { id: "unknown" };
	await act(async () => screen.update(React.createElement(Detail)));
	check(
		"missing detail renders no record rows",
		screen.root.findAllByType("DetailRow").length,
		0,
	);
	await act(async () => screen.root.findByType("Button").props.onPress());
	check("missing detail returns to cashier history", navigation.at(-1), [
		"replace",
		"/(cashier)/report/history",
	]);
	params = { id: rows[0].key };
	await act(async () => screen.update(React.createElement(Detail)));
	check(
		"param changes refresh detail",
		screen.root
			.findAllByType("DetailRow")
			.find((n) => n.props.label === "Tanggal").props.value,
		"2026-06-30",
	);
	await act(async () => screen.unmount());
	const layout = load("app/(cashier)/report/_layout.tsx");
	check(
		"direct entry anchor",
		layout.unstable_settings.initialRouteName,
		"index",
	);
	await act(async () => {
		screen = create(React.createElement(layout.default));
	});
	const screens = () => screen.root.findAllByType("Screen");
	check(
		"registers list/detail alongside original index",
		screens().map((n) => n.props.name),
		["index", "history", "history-detail"],
	);
	for (const [i, fallback] of [
		[0, "/(cashier)/home"],
		[1, "/(cashier)/report"],
		[2, "/(cashier)/report/history"],
	]) {
		await act(async () => screens()[i].findByType("Header").props.back());
		check("empty-stack fallback " + i, navigation.at(-1), [
			"replace",
			fallback,
		]);
	}
	canGoBack = true;
	await act(async () => screens()[2].findByType("Header").props.back());
	check("existing stack back", navigation.at(-1), ["back"]);
	await act(async () =>
		screens()[0].findByType("Header").props.right.props.onPress(),
	);
	check("entry button opens history", navigation.at(-1), [
		"push",
		"/(cashier)/report/history",
	]);
	focused = false;
	await act(async () => screen.update(React.createElement(layout.default)));
	check(
		"inactive headers do not intercept pointer",
		screen.root
			.findAllByType("View")
			.every((n) => n.props.style.pointerEvents === "none"),
		true,
	);
	await act(async () => screen.unmount());
	check("runtime errors", errors, []);
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
			"Actual helper/screens/layout React renderer; UI/native/router adapters. No full router, browser visual, API or device execution.",
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
main().catch((e) => {
	console.error(e);
	process.exitCode = 2;
});
