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
require("react");
require.cache[require.resolve("react")].exports = React;
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
	React.createElement("Screen", props, props.options.header?.());
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
		if (id.endsWith("/BottomActionBar"))
			return { BottomActionInset: host("BottomActionInset") };
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
	const h = load("lib/accounting/trial-balance.ts");
	const account = (
		id,
		debit,
		credit,
		currency = "IDR",
		classification = "Harta",
	) => ({
		id,
		code: id,
		name: `Account ${id}`,
		classification,
		subClassification: "Lancar",
		currency,
		debit,
		credit,
	});
	const data = [
		account("10", 0.1, 0),
		account("2", 0.2, 0),
		account("3", 0, 0.3, "IDR", "Modal"),
		account("4", 99, 0, "USD"),
	];
	const before = JSON.stringify(data);
	check(
		"currencies separated",
		h.balanceCurrencies(data).map((c) => c.value),
		["IDR", "USD"],
	);
	check(
		"normalize currency",
		h.accountCurrency(account("a", 0, 0, " usd ")),
		"USD",
	);
	const report = h.trialBalance(data, "IDR");
	check("decimal equality exact", report.totals.balanced, true);
	check("decimal total", report.totals.debit, 0.3);
	check(
		"code numeric order",
		report.rows.map((r) => r.account.code),
		["2", "3", "10"],
	);
	check("USD isolated", h.trialBalance(data, "USD").totals.debit, 99);
	check(
		"filtered difference",
		h.trialBalance(data, "IDR", "", "Harta").totals.difference,
		0.3,
	);
	check(
		"search case trim",
		h.trialBalance(data, "IDR", " ACCOUNT 10 ").rows.length,
		1,
	);
	check(
		"classification search",
		h.trialBalance(data, "IDR", "Modal").rows.length,
		1,
	);
	check(
		"empty filter does not fall back to all totals",
		h.trialBalance(data, "IDR", "missing").totals,
		null,
	);
	check(
		"empty accounts no balance claim",
		h.trialBalance([], "IDR").totals,
		null,
	);
	check(
		"unknown currency no balance claim",
		h.trialBalance([account("1", 0, 0, "")], h.UNKNOWN_CURRENCY).totals,
		null,
	);
	check(
		"zero actual accounts can balance",
		h.trialBalance([account("1", 0, 0)], "IDR").totals.balanced,
		true,
	);
	for (const value of [NaN, Infinity, -1, 0.001, Number.MAX_SAFE_INTEGER]) {
		const invalid = h.trialBalance(
			[account("1", value, 0), account("2", 5, 0)],
			"IDR",
		);
		check(
			"invalid debit blocks total " + String(value),
			[invalid.invalidCount, invalid.totals],
			[1, null],
		);
	}
	check(
		"invalid credit blocks total",
		h.trialBalance([account("1", 0, Infinity)], "IDR").totals,
		null,
	);
	const overflow = h.trialBalance(
		[account("1", 50000000000000, 0), account("2", 50000000000000, 0)],
		"IDR",
	);
	check(
		"sum overflow blocked",
		[overflow.overflow, overflow.totals],
		[true, null],
	);
	check(
		"negative difference supported",
		h.trialBalance([account("1", 0, 1)], "IDR").totals.difference,
		-1,
	);
	check(
		"one cent difference retained",
		h.trialBalance([account("1", 1.01, 1)], "IDR").totals.difference,
		0.01,
	);
	check("source not mutated", JSON.stringify(data), before);
	const { useAccountingStore: store } = load("store/accountingStore.ts");
	store.setState({ accounts: data });
	const Screen = load(
		"app/(no-layout)/(back-office)/report/accounting/trial-balance.tsx",
	).default;
	let screen;
	await act(async () => {
		screen = create(
			React.createElement(React.StrictMode, null, React.createElement(Screen)),
		);
	});
	const list = () => screen.root.findByType("FlatList").props;
	const picker = (label) =>
		screen.root
			.findAllByType("SingleSelect")
			.find((n) => n.props.label === label).props;
	const total = (label) =>
		screen.root.findAllByType("DetailRow").find((n) => n.props.label === label)
			?.props.value;
	const texts = () =>
		screen.root.findAllByType("Text").map((n) => n.props.children);
	check("default IDR", picker("Mata uang").value, "IDR");
	check("initial visible records", list().data.length, 3);
	check("initial total visible", total("Total debit"), "0,30");
	check(
		"scroll clearance uses shared bottom inset",
		Boolean(list().ListFooterComponent),
		true,
	);
	await act(async () => picker("Mata uang").onValueChange("USD"));
	check("currency switch updates total", total("Total debit"), "99,00");
	await act(async () =>
		store.setState({ accounts: data.filter((a) => a.currency !== "USD") }),
	);
	check(
		"removed selected currency does not switch silently",
		[picker("Mata uang").value, list().data.length],
		["USD", 0],
	);
	check("empty currency no total", total("Total debit"), undefined);
	await act(async () => screen.root.findByType("Button").props.onPress());
	check("reset chooses available IDR", picker("Mata uang").value, "IDR");
	await act(async () => store.getState().updateBalance("10", 1, 0));
	check("live balance updates total", total("Total debit"), "1,20");
	await act(async () => picker("Klasifikasi akun").onValueChange("Modal"));
	check("classification updates rows", list().data.length, 1);
	check(
		"filtered total clearly changes",
		total("Selisih debit - kredit"),
		"-0,30",
	);
	await act(async () =>
		screen.root.findByType("SearchBar").props.setSearch("missing"),
	);
	check("empty search no total", total("Total debit"), undefined);
	await act(async () => screen.root.findByType("Button").props.onPress());
	check(
		"reset clears search",
		screen.root.findByType("SearchBar").props.search,
		"",
	);
	await act(async () => store.setState({ accounts: [account("1", NaN, 0)] }));
	check("invalid source no total", total("Total debit"), undefined);
	check("invalid source row visible", list().data.length, 1);
	await act(async () => store.setState({ accounts: [] }));
	check("empty store clears rows", list().data.length, 0);
	check(
		"empty store no false balanced label",
		texts().includes("Debit = kredit pada hasil filter"),
		false,
	);
	await act(async () => screen.unmount());
	check("valid cent survives binary representation", h.balanceMinor(0.29), 29);
	check(
		"tiny fractional cent is not hidden as zero",
		h.balanceMinor(0.000000001),
		null,
	);
	const Layout = load(
		"app/(no-layout)/(back-office)/report/accounting/_layout.tsx",
	).default;
	await act(async () => {
		screen = create(React.createElement(Layout));
	});
	const trial = screen.root
		.findAllByType("Screen")
		.find((n) => n.props.name === "trial-balance");
	check(
		"layout registers report header",
		trial.findByType("Header").props.title,
		"Neraca Saldo",
	);
	await act(async () => trial.findByType("Header").props.back());
	check("empty-stack fallback stays Back Office", navigation.at(-1), [
		"replace",
		"/(no-layout)/(back-office)/report/accounting",
	]);
	canGoBack = true;
	await act(async () => trial.findByType("Header").props.back());
	check("existing history back", navigation.at(-1), ["back"]);
	await act(async () => screen.unmount());
	check("runtime errors", errors, []);
	const result = {
		passed: checks.filter((c) => c.passed).length,
		failed: checks.filter((c) => !c.passed).length,
		checks,
		errors,
		files: [...cache].map(([file, mod]) => ({
			file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
			sha256: mod.sha256,
		})),
		limits:
			"Actual helper/screen/route/store/data on React renderer; UI/router adapters. No physical device, full router or financial backend coverage.",
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
main().catch((error) => {
	console.error(error);
	process.exitCode = 2;
});
