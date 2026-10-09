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
    if (id === '@/components/common/SearchBar') return load('components/common/SearchBar.tsx');
    if (id === 'expo-image') return {Image: host('Image')};
    if (id === 'lucide-react-native') return {ArrowUpDown: host('ArrowUpDown')};
    if (id === '@expo/vector-icons/Entypo') return {__esModule:true, default:host('Icon')};
    if (id === '../icons') return {FilterIcon:host('FilterIcon')};
    if (id === '../ui/input') return {Input:host('Input'), InputField:host('InputField')};
    if (id === '@/lib/ui/figma-stock') return {figmaStockShadows:{control:{}}};

		if (id === "@/assets/images") return { IMAGES: { examples: {} } };
		if (id === "react") return React;
		if (id === "react-native") return native;
		if (id === "expo-router")
			return { router, useLocalSearchParams: () => params };
		if (id === "expo-router/react-navigation")
			return { useIsFocused: () => focused };
		if (id === "@/lib/utils")
			return { cn: (...values) => values.filter(Boolean).join(" "), formatRp: (n) => `Rp ${n.toLocaleString("id-ID")}` };
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
			setTimeout: clock.setTimeout,
			clearTimeout: clock.clearTimeout,
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

let time = 0, sequence = 0;
const timers = new Map();
const clock = {
  setTimeout: (callback, delay) => { const id = ++sequence; timers.set(id, {callback, due:time + delay}); return id; },
  clearTimeout: id => timers.delete(id),
  advance: async ms => {
    const target = time + ms;
    while (true) {
      const next = [...timers].filter(([,v]) => v.due <= target).sort((a,b) => a[1].due - b[1].due)[0];
      if (!next) break;
      time = next[1].due; timers.delete(next[0]);
      await act(() => next[1].callback());
    }
    time = target;
  },
  pending: () => timers.size,
};
module.exports = {load, React, act, create, check, checks, errors, cache, navigation, clock};
