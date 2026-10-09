const fs = require("node:fs"),
	path = require("node:path"),
	ts = require("typescript"),
	vm = require("node:vm"),
	crypto = require("node:crypto");
const React = require(
	path.resolve(".expo/senior7-test-tools/node_modules/react"),
);
const { act, create } = require(
	path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"),
);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [],
	errors = [],
	files = new Map();
const originalError = console.error;
console.error = (...args) => {
	if (!String(args[0]).includes("react-test-renderer is deprecated")) {
		errors.push(args.map(String).join(" "));
		originalError(...args);
	}
};
const check = (name, actual, expected) =>
	checks.push({
		name,
		passed: JSON.stringify(actual) === JSON.stringify(expected),
		actual,
		expected,
	});
const migration = JSON.parse(
	fs.readFileSync(path.join(__dirname, "migration.json"), "utf8"),
);
function parse(file, text) {
	return ts.createSourceFile(
		file,
		text,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}
function read(file) {
	const source = fs.readFileSync(file, "utf8");
	files.set(file, crypto.createHash("sha256").update(source).digest("hex"));
	return source;
}
function footer(ast, tag) {
	let result;
	function visit(n) {
		if (
			ts.isJsxElement(n) &&
			n.openingElement.tagName.getText(ast) === tag &&
			(tag !== "View" ||
				n.openingElement.getText(ast).includes("absolute bottom-0"))
		)
			result = n;
		ts.forEachChild(n, visit);
	}
	visit(ast);
	return result;
}
function structure(node, oldFooter) {
	if (
		ts.isImportDeclaration(node) ||
		node.kind === ts.SyntaxKind.EndOfFileToken
	)
		return null;
	if (ts.isParenthesizedExpression(node))
		return structure(node.expression, oldFooter);
	if (ts.isJsxText(node))
		return node.text.trim()
			? { kind: node.kind, text: node.text.trim() }
			: null;
	if (
		ts.isJsxSelfClosingElement(node) &&
		node.tagName.getText() === "BottomActionInset"
	)
		return null;
	if (
		ts.isJsxElement(node) &&
		node.openingElement.tagName.getText() === "BottomActionBar"
	) {
		return {
			kind: node.kind,
			children: [
				structure(oldFooter.openingElement),
				...node.children.map((n) => structure(n, oldFooter)).filter(Boolean),
				structure(oldFooter.closingElement),
			],
		};
	}
	if (ts.isJsxFragment(node)) {
		const children = node.children
			.map((n) => structure(n, oldFooter))
			.filter(Boolean);
		if (children.length === 1 && /h-20|h-32/.test(node.getText()))
			return children[0];
	}
	const children = [];
	ts.forEachChild(node, (n) => {
		const value = structure(n, oldFooter);
		if (value) children.push(value);
	});
	return {
		kind: node.kind,
		...(typeof node.text === "string" && !ts.isSourceFile(node)
			? { text: node.text }
			: {}),
		children,
	};
}
let insets = { top: 0, left: 0, right: 0, bottom: 0 };
const host = (name) => (props) =>
	React.createElement(name, props, props.children);
const cache = new Map();
function load(file) {
	if (cache.has(file)) return cache.get(file).exports;
	const mod = { exports: {} };
	cache.set(file, mod);
	const source = read(file);
	const requireHere = (id) => {
		if (id === "react") return React;
		if (id === "react-native")
			return {
				View: host("View"),
				Pressable: host("Pressable"),
				ScrollView: host("ScrollView"),
				KeyboardAvoidingView: host("KeyboardAvoidingView"),
				RefreshControl: host("RefreshControl"),
				Platform: { OS: "android" },
			};
		if (id === "react-native-safe-area-context")
			return { useSafeAreaInsets: () => insets };
		if (id === "react-native-reanimated")
			return {
				__esModule: true,
				default: { ScrollView: host("AnimatedScrollView") },
			};
		if (id.endsWith("BottomActionBar"))
			return load("components/common/BottomActionBar.tsx");
		if (id === "@/lib/utils")
			return { cn: (...parts) => parts.filter(Boolean).join(" ") };
		if (id === "@/constants/Colors") return { Colors: { primary: "red" } };
		if (id === "@/lib/haptics") return { haptic: { light() {} } };
		if (id === "@/hooks/useScrollProgress")
			return { useScrollProgress: () => ({}) };
		if (id === "@expo/vector-icons")
			return { Feather: host("Icon"), FontAwesome: host("Icon") };
		if (id === "@/components/icons") return { DownloadIcon: host("Icon") };
		if (id === "@/components/ui/button")
			return { Button: host("Button"), ButtonText: host("ButtonText") };
		if (id === "@/components/ui/actionsheet")
			return Object.fromEntries(
				[
					"Actionsheet",
					"ActionsheetBackdrop",
					"ActionsheetContent",
					"ActionsheetDragIndicator",
					"ActionsheetDragIndicatorWrapper",
					"ActionsheetItem",
					"ActionsheetItemText",
				].map((n) => [n, host(n)]),
			);
		return { __esModule: true, default: host(path.basename(id)) };
	};
	vm.runInNewContext(
		ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
				jsx: ts.JsxEmit.React,
			},
		}).outputText,
		{ require: requireHere, exports: mod.exports, module: mod, React, console },
		{ filename: file },
	);
	return mod.exports;
}
async function main() {
	for (const entry of migration.changes) {
		const before = parse(entry.file, fs.readFileSync(entry.snapshot, "utf8"));
		const after = parse(entry.file, read(entry.file));
		check(
			"only declared footer/clearance delta: " + entry.file,
			JSON.stringify(structure(after, footer(before, "View"))) ===
				JSON.stringify(structure(before)),
			true,
		);
		if (migration.screens.includes(entry.file))
			check(
				"unsafe fixed footer replaced: " + entry.file,
				Boolean(footer(after, "BottomActionBar")) && !footer(after, "View"),
				true,
			);
	}
	const Bar = load("components/common/BottomActionBar.tsx").default;
	let renderer,
		pressed = 0;
	const render = (props = {}) =>
		React.createElement(
			Bar,
			props,
			React.createElement("Button", { onPress: () => pressed++ }),
		);
	await act(async () => {
		renderer = create(render());
	});
	for (const bottom of [0, 16, 24, 34, 48, 64]) {
		insets = { top: 30, left: 0, right: 0, bottom };
		await act(async () => renderer.update(render()));
		const style = renderer.root.findByType("View").props.style;
		check(
			"button retains 16px above nav inset " + bottom,
			style.paddingBottom - bottom,
			16,
		);
		check("no top status-bar padding " + bottom, style.paddingTop, 16);
	}
	insets = { top: 0, bottom: 0, left: 48, right: 24 };
	await act(async () => renderer.update(render()));
	check(
		"landscape left nav clearance",
		renderer.root.findByType("View").props.style.paddingLeft,
		64,
	);
	check(
		"landscape right nav clearance",
		renderer.root.findByType("View").props.style.paddingRight,
		40,
	);
	await act(async () => renderer.root.findByType("Button").props.onPress());
	check("wrapped button callback unchanged", pressed, 1);
	insets = { top: 0, bottom: 48, left: 0, right: 0 };
	await act(async () =>
		renderer.update(render({ bottomPadding: 24, topPadding: 8 })),
	);
	check(
		"report keeps24px usable gap",
		renderer.root.findByType("View").props.style.paddingBottom,
		72,
	);
	check(
		"report top follows4px grid",
		renderer.root.findByType("View").props.style.paddingTop,
		8,
	);
	await act(async () => renderer.unmount());
	for (const file of [
		"components/common/Wrapper.tsx",
		"components/common/AnimatedWrapper.tsx",
	]) {
		const Wrapper = load(file).default;
		for (const props of [
			{},
			{ hasActionButton: true },
			{ hasBottomBar: true },
		]) {
			await act(async () => {
				renderer = create(
					React.createElement(Wrapper, props, React.createElement("Content")),
				);
			});
			const spacers = () =>
				renderer.root
					.findAllByType("View")
					.filter((n) => n.props.pointerEvents === "none");
			check(
				file +
					" inset spacer enabled only for fixed footer " +
					JSON.stringify(props),
				spacers().length,
				props.hasActionButton || props.hasBottomBar ? 1 : 0,
			);
			if (spacers().length)
				check(
					file + " clearance matches footer inset " + JSON.stringify(props),
					spacers()[0].props.style.height,
					48,
				);
			await act(async () => renderer.unmount());
		}
	}
	const Report = load(
		"components/feature/reports/ReportActionButton.tsx",
	).default;
	let onPress = 0,
		onOpen = [];
	await act(async () => {
		renderer = create(
			React.createElement(Report, {
				onPress: () => onPress++,
				onOpenChange: (v) => onOpen.push(v),
			}),
		);
	});
	await act(async () =>
		renderer.root.findAllByType("Button")[0].props.onPress(),
	);
	check("report callback once", onPress, 1);
	check("report opens sheet", onOpen, [true]);
	check(
		"report uses safe footer",
		renderer.root
			.findAllByType("View")
			.some((n) => n.props.style?.paddingBottom === 72),
		true,
	);
	await act(async () =>
		renderer.update(React.createElement(Report, { standalone: true })),
	);
	check(
		"standalone report has no fixed footer",
		renderer.root
			.findAllByType("View")
			.some((n) => n.props.style?.paddingBottom === 72),
		false,
	);
	await act(async () => renderer.unmount());
	check("runtime errors", errors, []);
	const result = {
		passed: checks.filter((c) => c.passed).length,
		failed: checks.filter((c) => !c.passed).length,
		checks,
		files: [...files].map(([file, sha256]) => ({ file, sha256 })),
		limits:
			"Production component React renderer with safe-inset/native/presentation adapters; AST inverse verifies all previous handler/form bodies unchanged. Not native/device/UI geometry certification.",
	};
	fs.writeFileSync(
		path.join(__dirname, "results.json"),
		JSON.stringify(result, null, 2) + "\n",
	);
	console.log(
		JSON.stringify({
			passed: result.passed,
			failed: result.failed,
			failures: checks.filter((c) => !c.passed).map((c) => c.name),
		}),
	);
	process.exitCode = result.failed ? 1 : 0;
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 2;
});
