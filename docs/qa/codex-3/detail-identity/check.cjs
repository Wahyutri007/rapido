const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), crypto = require("node:crypto"), ts = require("typescript");
const baseline = process.argv.includes("--baseline"), output = path.join(__dirname, baseline ? "baseline-results.json" : "results.json");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
require.cache[require.resolve("react")] = { exports: React };
const { create, act } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
const { QueryClient, QueryClientProvider } = require("@tanstack/react-query"), axios = require("axios");
global.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [], runtimeErrors = [], loaded = new Map(), loadedHashes = new Map();
const originalError = console.error;
console.error = (...args) => { if (String(args[0]).includes("react-test-renderer is deprecated")) return; runtimeErrors.push(args.map(String).join(" ")); originalError(...args); };
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const check = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
const sources = ["components/feature/manage/roles/RoleDetailScreen.tsx", "components/feature/manage/workers/WorkerDetailScreen.tsx", "components/feature/manage/member/MemberDetailScreen.tsx"];
const kinds = ["role", "worker", "member"];
let renderer, client, current, reads = {}, calls = [], navigations = [], queue = [];
const deferred = () => { let resolve; const promise = new Promise((yes) => { resolve = yes; }); return { promise, resolve }; };
const fixtureAxios = axios.create({ baseURL: "https://fixture.invalid", adapter: async (config) => {
	calls.push({ method: config.method, url: config.url });
	if (config.method !== "delete") throw Error("GET reads are an explicit parent query adapter; only DELETE transport allowed");
	const outcome = await (queue.shift() ?? Promise.resolve("success"));
	if (outcome === "network") throw new axios.AxiosError("Fixture network failure", "ERR_NETWORK", config);
	return { data: { success: true, data: null }, status: 200, statusText: "Fixture", headers: {}, config };
} });
const presentation = (names) => Object.fromEntries(names.map((name) => [name, name]));
const Modal = ({ children, isOpen, ...props }) => React.createElement("Modal", { ...props, isOpen }, isOpen ? children : null);
const resolveSource = (name, parent) => {
	const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(parent), name);
	return [base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")].find(fs.existsSync);
};
function load(file) {
	const absolute = path.resolve(file); if (loaded.has(absolute)) return loaded.get(absolute);
	const index = sources.indexOf(file.replaceAll("\\", "/")), before = index !== -1 && baseline;
	const snapshot = before ? path.join(__dirname, kinds[index] + ".before.tsx.txt") : absolute;
	loadedHashes.set(file, hash(snapshot));
	const code = ts.transpileModule(fs.readFileSync(snapshot, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const module = { exports: {} }, customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.resolve(".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return { ...presentation(["View", "Image", "Pressable"]), useWindowDimensions: () => ({ width: 360, height: 800 }) };
		if (name === "expo-router") return { router: { push: (target) => navigations.push({ action: "push", target }), back: () => navigations.push({ action: "back" }) } };
		if (name === "@/components/custom/JSStack") return { delayedBack: () => navigations.push({ action: "delayedBack" }) };
		if (name === "@/lib/utils") return { route: (target, params) => ({ target, params }) };
		if (["@/components/common/Card", "@/components/common/Text", "@/components/common/Wrapper", "@/components/common/SearchBar", "@/components/custom/DetailBottomActions", "@/components/custom/DetailRow"].includes(name)) return { __esModule: true, default: name.split("/").at(-1) };
		if (["./WorkerAvatar", "./MemberIcon", "./RoleWorkers"].includes(name)) return { __esModule: true, default: name.slice(2) };
		if (name === "@/components/icons") return presentation(["EFeather"]);
		if (name === "@/components/common/DataPlaceholder") return presentation(["LoadingPlaceholder"]);
		if (name === "@/components/ui/modal") return { Modal, ...presentation(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"]) };
		if (["@/components/ui/button", "../ui/button"].includes(name)) return presentation(["Button", "ButtonGroup", "ButtonText"]);
		if (name === "@expo/vector-icons/Feather") return { __esModule: true, default: "Feather" };
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { deleteConfirmation: "fixture-delete", actionSuccess: "fixture-success" } };
		if (name === "./axios") return { axios: fixtureAxios };
		if (["@/api/hooks/roles", "@/api/hooks/workers", "@/api/hooks/customers"].includes(name)) {
			const actual = load(resolveSource(name, absolute).replaceAll("\\", "/").replace(path.resolve(process.cwd()).replaceAll("\\", "/") + "/", ""));
			const hook = name.endsWith("roles") ? "useRoleQuery" : name.endsWith("workers") ? "useWorkerQuery" : "useCustomerQuery";
			return { ...actual, [hook]: (id) => ({ data: reads[id]?.data, isLoading: reads[id]?.isLoading ?? false, isError: reads[id]?.isError ?? false, refetch: () => { navigations.push({ action: "refetch", id }); return Promise.resolve(); } }), useRolePermissionsQuery: () => ({ data: undefined }) };
		}
		if (name.startsWith("@/") || name.startsWith(".")) {
			const resolved = resolveSource(name, absolute); if (!resolved) throw Error(`Cannot resolve ${name} from ${file}`);
			return load(path.relative(process.cwd(), resolved).replaceAll("\\", "/"));
		}
		return require(name);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Date, Error, setTimeout, clearTimeout }, { filename: absolute });
	loaded.set(absolute, module.exports); return module.exports;
}
const Delete = load("components/common/DeleteConfirmModal.tsx").default, Success = load("components/common/SuccessModal.tsx").default, Alert = load("components/common/AlertModal.tsx").default;
const specs = kinds.map((kind, index) => ({ kind, component: load(sources[index]).default, prefix: ["/contents/roles/", "/contents/workers/", "/customers/data/"][index] }));
const record = (id) => ({ id, name: `Fixture ${id}`, display_name: `Fixture ${id}`, permissions: ["manage roles", "manage customers"], roles: [], created_at: "", worker_profile: null, assigned_store: null, email: "fixture@example.invalid", phone: "0800000000" });
const element = (spec, id) => React.createElement(React.StrictMode, null, React.createElement(QueryClientProvider, { client }, React.createElement(spec.component, { id })));
async function unmount() { if (renderer) await act(async () => renderer.unmount()); renderer = null; client?.clear(); }
async function mount(spec, id = "A") {
	await unmount(); calls = []; navigations = []; queue = []; reads = { A: { data: record("A") }, B: { data: record("B") } }; current = { spec, id };
	client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
	await act(async () => { renderer = create(element(spec, id)); });
}
async function change(...ids) { if (ids.length) current.id = ids[0]; await act(async () => renderer.update(element(current.spec, current.id))); }
const props = (component) => renderer.root.findByType(component).props;
const visible = (component) => props(component).openState[0];
async function openDelete() { await act(async () => renderer.root.findByType("DetailBottomActions").props.onDelete()); }
const confirm = () => renderer.root.findByType(Delete).findAllByType("Button").find((node) => node.props.action === "negative").props.onPress;
async function begin() { const wait = deferred(); queue.push(wait.promise); await act(async () => { wait.submission = confirm()(); }); return wait; }
async function settle(wait, outcome = "success") { await act(async () => { wait.resolve(outcome); await wait.submission; }); }
async function closeSuccess() { await act(async () => renderer.root.findByType(Success).findByType("Button").props.onPress()); }
(async () => {
	for (const spec of specs) {
		const test = (name, actual, expected) => check(`${spec.kind}: ${name}`, actual, expected);
		await mount(spec); test("initial confirmation closed", visible(Delete), false);
		await openDelete(); test("detail action opens confirmation", visible(Delete), true);
		reads.A = { data: { ...record("A"), name: "Updated A", display_name: "Updated A" } }; await change();
		test("same-ID refetch preserves confirmation", [visible(Delete), props(Delete).itemName], [true, "Updated A"]);
		await change("B"); test("A->B closes inherited confirmation", visible(Delete), false);
		test("B has fresh notices and target", [visible(Success), visible(Alert), props(Delete).itemName], [false, false, "Fixture B"]);
		await change("A"); test("returning A starts a fresh closed confirmation", visible(Delete), false);
		await openDelete(); await change(undefined); test("missing ID resets confirmation", visible(Delete), false);
		test("missing ID has no edit/delete footer", renderer.root.findAllByType("DetailBottomActions").length, 0);
		await change("B"); test("recovered valid ID starts closed", visible(Delete), false);
		await openDelete(); await change(""); test("empty ID resets confirmation", visible(Delete), false);
		for (const flag of ["isLoading", "isError"]) {
			await mount(spec); reads.B = { [flag]: true }; await openDelete(); await change("B");
			test(`${flag} on new ID keeps dialog closed`, visible(Delete), false);
			reads.B = { data: record("B") }; await change(); test(`${flag} recovery does not reopen old confirmation`, visible(Delete), false);
		}
		for (const outcome of ["success", "network"]) {
			await mount(spec); await openDelete(); const oldConfirm = props(Delete).onConfirm, oldClose = props(Success).onClose; const pending = await begin();
			await change("B"); test(`${outcome}: pending A->B keeps B closed and idle`, [visible(Delete), props(Delete).isLoading], [false, false]);
			await settle(pending, outcome); await act(async () => { oldConfirm(); oldClose(); });
			test(`${outcome}: late A result has no B notice/back`, [visible(Delete), visible(Success), visible(Alert), navigations.length, calls.length], [false, false, false, 0, 1]);
			await openDelete(); const fresh = await begin(); await settle(fresh); await closeSuccess();
			test(`${outcome}: B can delete independently and acknowledge once`, [calls.map((item) => item.url), navigations], [[spec.prefix + "A", spec.prefix + "B"], [{ action: "delayedBack" }]]);
		}
		await mount(spec); await openDelete(); const completed = await begin(); await settle(completed);
		test("success notice opens before acknowledgement", visible(Success), true);
		await change("B"); test("completed A notice does not transfer to B", [visible(Delete), visible(Success), navigations.length], [false, false, 0]);
		await mount(spec); await openDelete(); const old = await begin(); await unmount(); await settle(old);
		test("pending success after screen unmount does not navigate", navigations, []);
		await mount(spec); await act(async () => renderer.root.findByType("DetailBottomActions").props.onEdit());
		test("edit retains existing route and current ID", navigations.at(-1), { action: "push", target: { target: `/manage/${spec.kind === "role" ? "roles" : spec.kind === "worker" ? "workers" : "member"}/modify`, params: { id: "A" } } });
		if (spec.kind === "role") {
			await mount(spec); await act(async () => renderer.root.findByType("SearchBar").props.setSearch("roles"));
			reads.A = { data: { ...record("A"), name: "Refetched A" } }; await change(); test("same-ID refetch preserves permission search", renderer.root.findByType("SearchBar").props.search, "roles");
			await change("B"); test("new role clears permission search", renderer.root.findByType("SearchBar").props.search, "");
			await change("A"); test("returning role starts a fresh search", renderer.root.findByType("SearchBar").props.search, "");
		}
		await unmount();
	}
	const result = { owner: "Codex-3", ticket: "SD3-010", mode: baseline ? "baseline" : "current-source", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, runtimeErrors, checks, sourceHashes: Object.fromEntries(sources.map((file) => [file, loadedHashes.get(file)])), productionModuleHashes: Object.fromEntries(loadedHashes), productionModules: loadedHashes.size,
		limits: "Three production detail+delete/shared-modal/useAlertModal/helper/mutation hook/factory/Common/QueryClient with local Axios; GET query states are a controlled parent adapter, presentation/router/RoleWorkers/avatar are host fixtures; not native/browser/full router/root auth/backend/Figma approval" };
	fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n"); console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: runtimeErrors.length, productionModules: loadedHashes.size })); process.exitCode = result.failed || runtimeErrors.length ? 1 : 0;
})().catch(async (error) => { console.error(error); await unmount(); process.exitCode = 2; });
