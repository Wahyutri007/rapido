const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), crypto = require("node:crypto"), ts = require("typescript");
const baseline = process.argv.includes("--baseline");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
require.cache[require.resolve("react")] = { exports: React };
const { create, act } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
const axiosPackage = require("axios");
global.IS_REACT_ACT_ENVIRONMENT = true;
const checks = [], runtimeErrors = [], controlFallbacks = [], loaded = new Map(), loadedHashes = new Map();
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	runtimeErrors.push(args.map(String).join(" ")); originalError(...args);
};
const check = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const sources = ["components/feature/manage/roles/RoleDeleteDialog.tsx", "components/feature/manage/workers/WorkerDeleteDialog.tsx", "components/feature/manage/member/MemberDeleteDialog.tsx"];
const snapshots = ["role.before.tsx.txt", "worker.before.tsx.txt", "member.before.tsx.txt"];
let renderer, client, current, openSetter, calls = [], invalidations = [], navigations = [], queue = [];
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const fixtureAxios = axiosPackage.create({ baseURL: "https://fixture.invalid", adapter: async (config) => {
	calls.push({ method: config.method, url: config.url });
	const outcome = await (queue.shift() ?? Promise.resolve("success"));
	const response = { data: { success: outcome === "success", data: null, message: "Fixture result" }, status: 200, statusText: "OK", headers: {}, config };
	if (outcome === "network") throw new axiosPackage.AxiosError("Network Error", "ERR_NETWORK", config);
	if (outcome === "forbidden") {
		response.status = 403; response.data = { success: false, message: "Fixture denied" };
		throw new axiosPackage.AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, response);
	}
	return response;
} });
const resolveSource = (name, parent) => {
	const base = name.startsWith("@/") ? path.resolve(name.slice(2)) : path.resolve(path.dirname(parent), name);
	return [base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")].find(fs.existsSync);
};
const Modal = ({ children, isOpen, ...props }) => React.createElement("Modal", { ...props, isOpen }, isOpen ? children : null);
const presentation = (names) => Object.fromEntries(names.map((name) => [name, name]));
function load(file) {
	const absolute = path.resolve(file);
	if (loaded.has(absolute)) return loaded.get(absolute);
	let text = fs.readFileSync(absolute === path.resolve("components/common/SuccessModal.tsx") ? path.resolve("docs/qa/qc-success-modal-2026-10-09/proposal/SuccessModal.tsx") : absolute, "utf8");
	const index = sources.indexOf(file.replaceAll("\\", "/"));
	if (baseline && index !== -1) text = fs.readFileSync(path.join(__dirname, snapshots[index]), "utf8");
	loadedHashes.set(absolute, index !== -1 && baseline ? hash(path.join(__dirname, snapshots[index])) : hash(absolute === path.resolve("components/common/SuccessModal.tsx") ? path.resolve("docs/qa/qc-success-modal-2026-10-09/proposal/SuccessModal.tsx") : absolute));
	const code = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const module = { exports: {} };
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.resolve(".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return { ...presentation(["View", "Image", "Pressable", "ScrollView"]), Dimensions: { get: () => ({ width: 360, height: 800 }) }, useWindowDimensions: () => ({ width: 360, height: 800 }) };
		if (name === "@/components/ui/modal") return { Modal, ...presentation(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"]) };
		if (["@/components/ui/button", "../ui/button"].includes(name)) return presentation(["Button", "ButtonGroup", "ButtonText"]);
		if (name === "@/components/common/Text") return { __esModule: true, default: "Text" };
		if (name === "@expo/vector-icons/Feather") return { __esModule: true, default: "Feather" };
		if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { deleteConfirmation: "fixture-delete", actionSuccess: "fixture-success" } };
		if (name === "./axios") return { axios: fixtureAxios };
		if (name.startsWith("@/") || name.startsWith(".")) {
			const resolved = resolveSource(name, absolute);
			if (!resolved) throw new Error(`Cannot resolve ${name} from ${file}`);
			return load(path.relative(process.cwd(), resolved).replaceAll("\\", "/"));
		}
		return require(name);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console, Date, Error, setTimeout, clearTimeout }, { filename: absolute });
	loaded.set(absolute, module.exports); return module.exports;
}
const Delete = load("components/common/DeleteConfirmModal.tsx").default;
const Success = load("components/common/SuccessModal.tsx").default;
const Alert = load("components/common/AlertModal.tsx").default;
const record = (id) => ({ id, name: `Fixture ${id}`, display_name: `Fixture ${id}`, permissions: [], created_at: "", updated_at: "" });
function Parent({ spec, target, open = true }) {
	const [isOpen, setOpen] = React.useState(open); openSetter = setOpen;
	return React.createElement(spec.component, { [spec.prop]: target, openState: [isOpen, setOpen], onDeleted: () => navigations.push(target?.id ?? null) });
}
const element = (spec, target, open) => React.createElement(React.StrictMode, null,
	React.createElement(QueryClientProvider, { client }, React.createElement(Parent, { spec, target, open })));
async function unmount() { if (renderer) await act(async () => renderer.unmount()); renderer = null; client?.clear(); }
async function mount(spec, target = record("A /?"), open = true) {
	await unmount(); calls = []; invalidations = []; navigations = []; queue = []; current = { spec, target };
	client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
	for (const key of spec.keys(target?.id)) client.setQueryData(key, "fixture-cache");
	const invalidate = client.invalidateQueries.bind(client);
	client.invalidateQueries = (options) => { invalidations.push(options.queryKey); return invalidate(options); };
	await act(async () => { renderer = create(element(spec, target, open)); });
}
async function change(target) { current.target = target; await act(async () => renderer.update(element(current.spec, target, true))); }
const props = (component) => renderer.root.findByType(component).props;
const visible = (component) => props(component).openState[0];
const confirmationPress = () => {
	const button = renderer.root.findByType(Delete).findAllByType("Button").find((node) => node.props.action === "negative");
	if (button) return button.props.onPress;
	controlFallbacks.push({ entity: current.spec.label, target: current.target?.id, reason: "Prior stale-result assertion left the confirmation hidden; use its props callback to continue regression" });
	return props(Delete).onConfirm;
};
async function begin() {
	const wait = deferred(); queue.push(wait.promise); let submission;
	await act(async () => { submission = confirmationPress()(); });
	return { ...wait, submission };
}
async function settle(wait, outcome = "success") { await act(async () => { wait.resolve(outcome); await wait.submission; }); }
const successClose = () => props(Success).onClose;
async function dismissError() {
	const node = renderer.root.findByType(Alert);
	const button = node.findAllByType("Button")[0];
	await act(async () => button.props.onPress());
}
const specs = [
	{ label: "Role", component: load(sources[0]).default, prop: "role", prefix: "/contents/roles/", keys: (id) => [["roles"], ["roles", id], ["workers"]] },
	{ label: "Worker", component: load(sources[1]).default, prop: "worker", prefix: "/contents/workers/", keys: (id) => [["workers"], ["workers", id]] },
	{ label: "Member", component: load(sources[2]).default, prop: "member", prefix: "/customers/data/", keys: (id) => [["customers"], ["customers", id]] },
];
(async () => {
	for (const spec of specs) {
		const test = (name, actual, expected) => check(`${spec.label}: ${name}`, actual, expected);
		await mount(spec);
		await act(async () => successClose()());
		test("hidden success callback cannot navigate", navigations, []);
		await mount(spec);
		const wait = deferred(); queue.push(wait.promise, wait.promise); let first, second;
		const confirm = confirmationPress();
		await act(async () => { first = confirm(); second = confirm(); });
		test("two callbacks before render issue one DELETE", calls.length, 1);
		test("confirmation stays busy while request is pending", props(Delete).isLoading, true);
		await act(async () => { wait.resolve("success"); await Promise.all([first, second]); });
		test("production request uses DELETE and encoded selected ID", calls, [{ method: "delete", url: spec.prefix + encodeURIComponent("A /?") }]);
		test("success invalidates list, exact detail and cross-module keys", invalidations, spec.keys("A /?"));
		test("production QueryClient caches are invalidated", spec.keys("A /?").map((key) => client.getQueryState(key).isInvalidated), spec.keys("A /?").map(() => true));
		test("successful deletion closes confirmation", visible(Delete), false);
		test("successful deletion opens success notice", visible(Success), true);
		test("success does not open error", visible(Alert), false);
		const successNode = renderer.root.findByType(Success);
		const closeSuccess = successNode.findByType("Button").props.onPress;
		const closeSuccessIcon = successNode.findByType("Pressable").props.onPress;
		await act(async () => { closeSuccess(); closeSuccessIcon(); });
		test("repeated success close navigates once", navigations, ["A /?"]);
		await act(async () => confirm());
		test("cached confirmation after success cannot delete again", calls.length, 1);
		for (const target of [null, record("")]) {
			await mount(spec, target); await act(async () => props(Delete).onConfirm());
			test(`missing target or empty ID ${target === null ? "null" : "empty"} cannot delete`, calls, []);
		}
		await mount(spec, record("A"), false);
		await act(async () => props(Delete).onConfirm());
		test("hidden confirmation cannot send DELETE", calls, []);
		await mount(spec); const closedHandler = props(Delete).onConfirm;
		await act(async () => openSetter(false));
		await act(async () => closedHandler());
		test("cached visible callback after dismissal cannot send DELETE", calls, []);
		for (const outcome of ["network", "forbidden", "failed-body"]) {
			await mount(spec); const failed = await begin(); await settle(failed, outcome);
			test(`${outcome} opens error and keeps confirmation`, [visible(Alert), visible(Delete), visible(Success)], [true, true, false]);
			test(`${outcome} releases busy and does not invalidate caches`, [props(Delete).isLoading, invalidations.length], [false, 0]);
			await dismissError(); test(`${outcome} production error button closes notice`, visible(Alert), false);
			const retry = await begin(); await settle(retry);
			test(`${outcome} retry succeeds with two total calls`, [calls.length, visible(Success)], [2, true]);
		}
		for (const outcome of ["success", "network"]) {
			await mount(spec, record("A")); const cachedConfirm = props(Delete).onConfirm, cachedClose = successClose();
			const old = await begin(); await change(record("B"));
			test(`${outcome} new target starts idle with fresh notices`, [props(Delete).isLoading, visible(Success), visible(Alert), props(Delete).itemName], [false, false, false, "Fixture B"]);
			const count = calls.length; await act(async () => cachedConfirm());
			test(`${outcome} queued old-target confirmation sends nothing`, calls.length, count);
			await settle(old, outcome);
			test(`${outcome} old result leaves B confirmation and notices unchanged`, [visible(Delete), visible(Success), visible(Alert)], [true, false, false]);
			await act(async () => cachedClose());
			test(`${outcome} old success-close cannot navigate B`, navigations, []);
			const next = await begin(); await settle(next);
			test(`${outcome} B deletion uses only correct ID`, calls.map((call) => call.url), [spec.prefix + "A", spec.prefix + "B"]);
			await act(async () => successClose()());
			test(`${outcome} B success navigates for B only`, navigations, ["B"]);
		}
		for (const outcome of ["success", "network"]) {
			await mount(spec, record("A")); const old = await begin(); await settle(old, outcome);
			const oldClose = successClose(); await change(record("B"));
			test(`${outcome} completed A notice resets when target changes`, [visible(Success), visible(Alert)], [false, false]);
			await act(async () => oldClose()); test(`${outcome} completed A close callback cannot navigate`, navigations, []);
		}
		for (const outcome of ["success", "network"]) {
			await mount(spec); const old = await begin(); await change(null); await settle(old, outcome);
			test(`${outcome} removed target receives no old notice`, [visible(Success), visible(Alert)], [false, false]);
			await mount(spec); const oldConfirm = props(Delete).onConfirm, oldClose = successClose(); const pending = await begin();
			await act(async () => renderer.unmount()); renderer = null;
			await act(async () => { oldConfirm(); oldClose(); }); await settle(pending, outcome);
			test(`${outcome} unmounted callbacks issue no new request/navigation`, [calls.length, navigations], [1, []]);
		}
		await mount(spec, record("A")); const same = await begin(); await change({ ...record("A"), name: "Refreshed", display_name: "Refreshed" });
		test("same ID rerender preserves pending request", props(Delete).isLoading, true);
		await settle(same); test("same ID result still succeeds", visible(Success), true);
		await mount(spec, record("A")); const firstA = await begin(); const firstAConfirm = props(Delete).onConfirm;
		await change(record("B")); const firstB = await begin(); await change(record("A"));
		await settle(firstB); await settle(firstA);
		test("A to B to A ignores reverse-order old completions", [visible(Delete), visible(Success), visible(Alert), props(Delete).isLoading], [true, false, false, false]);
		const count = calls.length; await act(async () => firstAConfirm());
		test("A to B to A cached first A callback stays inactive", calls.length, count);
		const latestA = await begin(); await settle(latestA);
		test("A to B to A fresh A can complete normally", [calls.at(-1).url, visible(Success)], [spec.prefix + "A", true]);
	}
	await unmount();
	const result = { owner: "Codex-3", ticket: "SD3-006", mode: baseline ? "before-snapshots" : "PROPOSAL_ONLY_NOT_APPLIED", passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, runtimeErrors, checks,
		sourceHashes: Object.fromEntries(sources.map((file, i) => [file, hash(baseline ? path.join(__dirname, snapshots[i]) : file)])),
		productionModules: [...loaded.keys()].map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/")),
		productionModuleHashes: Object.fromEntries([...loadedHashes].map(([file, value]) => [path.relative(process.cwd(), file).replaceAll("\\", "/"), value])),
		adapters: ["React test renderer/RN/button/modal/Text/vector-icon/image host presentation", "Axios adapter promise outcomes; API client/auth interceptor excluded; no HTTP", "Standalone parent state/QueryClient provider; no actual navigator/list/detail screen"], controlFallbacks, strictMode: true };
	fs.writeFileSync(path.join(__dirname, baseline ? "baseline.json" : "results.json"), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: runtimeErrors.length, productionModules: loaded.size, controlFallbacks: controlFallbacks.length }));
	if (!baseline && (result.failed || runtimeErrors.length || controlFallbacks.length)) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
