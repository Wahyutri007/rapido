const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Module = require("node:module");
const appRoot = path.resolve(__dirname, "../../../..");
const ts = require(path.join(appRoot, "node_modules/typescript"));
const testRoot = path.join(appRoot, ".expo/senior7-test-tools/node_modules");
const React = require(path.join(testRoot, "react"));
const Renderer = require(path.join(testRoot, "react-test-renderer"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const sources = [
	{ name: "Role", domain: "role", prop: "role", file: "components/feature/manage/roles/RoleListScreen.tsx" },
	{ name: "Worker", domain: "worker", prop: "worker", file: "components/feature/manage/workers/WorkerListScreen.tsx" },
	{ name: "Member", domain: "member", prop: "member", file: "components/feature/manage/member/MemberListScreen.tsx" },
];
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const modules = new Map();
const hashes = {};
const checks = [];
const runtimeErrors = [];
const warnings = [];
const oldError = console.error;
const oldWarn = console.warn;
console.error = (...args) => { const text = args.map(String).join(" "); if (!text.includes("react-test-renderer is deprecated")) runtimeErrors.push(text); };
console.warn = (...args) => warnings.push(args.map(String).join(" "));
const state = { data: [], navigate: [] };
const host = (name) => function Host(props) { return React.createElement(name, props, props.children); };
const def = (component) => ({ __esModule: true, default: component });
function flat(props) { return React.createElement("FlatList", props, props.data.length ? props.data.map((item) => React.createElement(React.Fragment, { key: item.id }, props.renderItem({ item }))) : props.ListEmptyComponent); }
function resolve(request, parent) {
	const root = request.startsWith("@/") ? path.join(appRoot, request.slice(2)) : path.resolve(path.dirname(parent), request);
	for (const file of [root, `${root}.tsx`, `${root}.ts`, path.join(root, "index.ts"), path.join(root, "index.tsx")]) if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
	throw new Error(`Missing ${request}`);
}
function requireFor(request, parent) {
	if (request === "react") return React;
	if (request === "react/jsx-runtime") return require(path.join(testRoot, "react/jsx-runtime"));
	if (request === "react-native") return { View: host("View"), Pressable: host("Pressable"), FlatList: flat, RefreshControl: host("RefreshControl"), Switch: host("Switch"), Platform: { OS: "web" } };
	if (request === "expo-router") return { router: { push: (value) => state.navigate.push(value) } };
	if (request.startsWith("@/api/hooks/")) return { useRolesQuery: () => query(), useWorkersQuery: () => query(), useCustomersQuery: () => query() };
	if (request === "@/components/common/AlertModal") return { useAlertModal: load(path.join(appRoot, "hooks/useAlertModal.ts")).useAlertModal };
	if (request === "@/components/common/DataPlaceholder") return { LoadingPlaceholder: host("LoadingPlaceholder"), SearchNotFound: host("SearchNotFound") };
	if (request === "@/components/icons") return { EFeather: host("EFeather") };
	if (request === "@expo/vector-icons/Feather") return def(host("Feather"));
	if (request === "@/constants/Colors") return { Colors: { primary: "#ff0000", zinc: { 400: "#444444" }, red: { 500: "#ee0000" } } };
	if (request === "@/lib/utils") return { route: (pathname, params) => ({ pathname, params }), cn: (...parts) => parts.filter(Boolean).join(" ") };
	if (request === "@/components/ui/actionsheet") return Object.fromEntries(["Actionsheet", "ActionsheetBackdrop", "ActionsheetContent", "ActionsheetDragIndicator", "ActionsheetDragIndicatorWrapper"].map((name) => [name, host(name)]));
	if (request.endsWith("DeleteDialog")) return def(host("DeleteDialog"));
	if (request.endsWith("QueryError")) return def(host("QueryError"));
	if (request.endsWith("WorkerAvatar")) return def(host("WorkerAvatar"));
	if (request.endsWith("MemberIcon")) return def(host("MemberIcon"));
	for (const name of ["Text", "SearchBar", "Wrapper", "BottomActionButton", "BouncyPressable", "CatalogItemCard"]) if (request === `@/components/common/${name}` || request === `@/components/custom/${name}`) return def(host(name));
	if (request.startsWith("@/") || request.startsWith(".")) return load(resolve(request, parent));
	throw new Error(`Unexpected ${request}`);
}
function query() { return { data: state.data, isLoading: false, isError: false, refetch: () => Promise.resolve() }; }
function load(file) {
	if (modules.has(file)) return modules.get(file).exports;
	const bytes = fs.readFileSync(file);
	const relative = path.relative(appRoot, file).replaceAll("\\", "/");
	hashes[relative] = hash(bytes);
	const javascript = ts.transpileModule(bytes.toString("utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: file }).outputText;
	const module = new Module(file);
	module.filename = file;
	module.paths = Module._nodeModulePaths(path.dirname(file));
	module.require = (request) => requireFor(request, file);
	modules.set(file, module);
	module._compile(javascript, file);
	return module.exports;
}
function entity(domain, id, changed = false) {
	const name = `${domain} ${id}${changed ? " UPDATED" : ""}`;
	if (domain === "role") return { id, name, display_name: name, permissions: ["cashier"] };
	if (domain === "worker") return { id, name, email: `${id}@example.test`, phone: "0800000000", roles: [], worker_profile: null, assigned_store: null };
	return { id, name, email: `${id}@example.test`, phone: "0800000000" };
}
function check(name, actual, expected) { checks.push({ name, pass: Object.is(actual, expected), actual, expected }); }
function sheet(root) { return root.root.findByType(load(path.join(appRoot, "components/custom/ItemActionSheet.tsx")).default); }
function dialog(root) { return root.root.findByType("DeleteDialog"); }
function action(root, title) {
	const Row = load(path.join(appRoot, "components/custom/ItemActionSheet.tsx")).ItemActionSheetRow;
	return root.root.findAllByType(Row).find((row) => row.props.title.startsWith(title)).props.onPress;
}
function select(root, id) {
	const row = root.root.findAllByType("CatalogItemCard").find((item) => item.props.right.props.accessibilityLabel.endsWith(` ${id}`));
	row.props.right.props.onPress({ stopPropagation() {} });
}
async function act(fn) { await Renderer.act(fn); }
async function audit(definition, strict) {
	const { name, domain, file, prop } = definition;
	const label = `${name}/${strict ? "StrictMode" : "normal"}`;
	const Component = load(path.join(appRoot, file)).default;
	const element = () => strict ? React.createElement(React.StrictMode, null, React.createElement(Component)) : React.createElement(Component);
	state.data = [entity(domain, "A"), entity(domain, "B")];
	state.navigate = [];
	let root;
	await act(() => { root = Renderer.create(element()); });
	await act(() => select(root, "A"));
	check(`${label}: explicit A selection opens sheet`, sheet(root).props.isOpen, true);
	check(`${label}: selected A matches`, dialog(root).props[prop].id, "A");
	state.data = [entity(domain, "A", true), entity(domain, "B")];
	await act(() => root.update(element()));
	check(`${label}: renamed A sheet uses current query name`, sheet(root).props.title, entity(domain, "A", true).display_name ?? entity(domain, "A", true).name);
	check(`${label}: renamed A deletion target uses current query name`, dialog(root).props[prop].name, entity(domain, "A", true).name);
	state.data = [entity(domain, "B")];
	await act(() => root.update(element()));
	check(`${label}: removed A closes actions`, sheet(root).props.isOpen, false);
	await act(() => action(root, "Hapus")());
	check(`${label}: removed A cannot open new confirmation`, dialog(root).props.openState[0], false);
	await act(() => root.unmount());
	state.data = [entity(domain, "A"), entity(domain, "B")];
	await act(() => { root = Renderer.create(element()); });
	await act(() => select(root, "A"));
	const staleDelete = action(root, "Hapus");
	const staleEdit = action(root, "Edit");
	await act(() => root.root.findByType("Actionsheet").props.onClose());
	await act(() => select(root, "B"));
	check(`${label}: explicit B has current title`, sheet(root).props.title, entity(domain, "B").display_name ?? entity(domain, "B").name);
	await act(() => staleDelete());
	check(`${label}: stale A delete cannot open B confirmation`, dialog(root).props.openState[0], false);
	check(`${label}: stale A close cannot close B actions`, sheet(root).props.isOpen, true);
	await act(() => staleEdit());
	check(`${label}: stale A edit cannot navigate after B opens`, state.navigate.length, 0);
	await act(() => root.unmount());
}
(async () => {
	for (const item of sources) for (const strict of [false, true]) await audit(item, strict);
	console.error = oldError;
	console.warn = oldWarn;
	const result = {
		status: "READ_ONLY_AUDIT_REPRODUCTION",
		externalQcApproval: false,
		finishedAt: new Date().toISOString(),
		summary: { assertions: checks.length, passed: checks.filter((item) => item.pass).length, failed: checks.filter((item) => !item.pass).length, runtimeErrors: runtimeErrors.length, warnings: warnings.length },
		loadedSourceHashes: hashes,
		checks, runtimeErrors, warnings,
		adapters: "Production List/ItemActionSheet/useAlertModal/useRefreshControl and display helpers with query data, child delete dialog, native/presentation/router/Colors adapters. No actual request, browser/native or app source edits.",
	};
	const output = path.join(__dirname, "results.json");
	if (fs.existsSync(output)) throw new Error("Frozen results already exist.");
	fs.mkdirSync(path.join(__dirname, "before"), { recursive: true });
	for (const item of [...sources.map((item) => item.file), "components/feature/manage/roles/RoleWorkers.tsx", "components/custom/ItemActionSheet.tsx"]) fs.copyFileSync(path.join(appRoot, item), path.join(__dirname, "before", path.basename(item)));
	fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
	process.stdout.write(JSON.stringify(result.summary) + "\n");
	for (const check of checks.filter((item) => !item.pass)) process.stdout.write(JSON.stringify(check) + "\n");
})().catch((error) => { console.error = oldError; console.error(error); process.exitCode = 1; });
