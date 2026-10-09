const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const ts = require(path.join(appRoot, "node_modules/typescript"));
const React = require(path.join(appRoot, ".expo/senior7-test-tools/node_modules/react"));
const { act, create } = require(path.join(appRoot, ".expo/senior7-test-tools/node_modules/react-test-renderer"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const target = "components/common/AlertModal.tsx";
const expectedFinal = process.argv[2];
if (!/^[a-f0-9]{64}$/.test(expectedFinal ?? "")) throw new Error("Supply parent final SHA256 as the only argument");
if (fs.existsSync(path.join(__dirname, "results.json"))) throw new Error("Final review evidence already exists; do not overwrite");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const read = (relative) => fs.readFileSync(path.join(appRoot, relative), "utf8");
const source = read(target);
const before = fs.readFileSync(path.join(__dirname, "AlertModal.before.tsx.txt"), "utf8");
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "audit-before.json"), "utf8"));
const checks = [], errors = [], warnings = [];
const originalError = console.error, originalWarn = console.warn;
console.error = (...args) => {
	const text = args.map(String).join(" ");
	if (text.includes("react-test-renderer is deprecated")) return;
	errors.push(text); originalError(...args);
};
console.warn = (...args) => { warnings.push(args.map(String).join(" ")); originalWarn(...args); };
function check(name, actual, expected) {
	checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
}
check("Reviewed source matches final hash supplied by parent", hash(source), expectedFinal);
if (hash(source) !== expectedFinal) throw new Error("Source changed before independent review");
const canonical = (text) => ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(ts.createSourceFile("component.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX));
function replaceOnce(text, search, replacement, name) {
	check(name, (text.match(search) ?? []).length, 1);
	return text.replace(search, replacement);
}
const normalizedBefore = replaceOnce(before, /\tDimensions,\r?\n/g, "", "One baseline Dimensions import");
let normalizedFinal = replaceOnce(source, /\tuseWindowDimensions,\r?\n/g, "", "One final useWindowDimensions import");
normalizedFinal = replaceOnce(normalizedFinal, /\tconst \{ width \} = useWindowDimensions\(\);\r?\n/g, "", "One final dimension hook declaration");
normalizedFinal = replaceOnce(normalizedFinal, /style=\{\{ width: width - 32 \}\}/g, 'style={{ width: Dimensions.get("screen").width - 32 }}', "Window width minus32 remains without new explicit maximum");
normalizedFinal = replaceOnce(normalizedFinal, /\t+style=\{\{ height: 128, width: "100%" \}\}\r?\n/g, "", "One image explicit height128/content width");
check("Whole AST is identical after reversing only four geometry deltas", canonical(normalizedFinal), canonical(normalizedBefore));

let dimensions = { width: 320, height: 640, scale: 1, fontScale: 1 };
const listeners = new Set();
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const native = {
	Image: "Image", View: "View",
	useWindowDimensions: () => React.useSyncExternalStore(subscribe, () => dimensions, () => dimensions),
	Dimensions: { get: () => { throw new Error("Final AlertModal must not read static screen dimensions"); } },
};
const Modal = ({ isOpen, children, ...props }) => React.createElement("Modal", { ...props, isOpen }, isOpen ? children : null);
const names = (list) => Object.fromEntries(list.map((name) => [name, name]));
const loaded = new Map(), productionHashes = {};
const exportFixtures = { SuccessModal: () => null, DeleteConfirmModal: () => null };
function load(relative) {
	if (loaded.has(relative)) return loaded.get(relative);
	const source = read(relative); productionHashes[relative] = hash(source);
	const module = { exports: {} };
	const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const customRequire = (name) => {
		if (name === "react") return React;
		if (name === "react/jsx-runtime") return require(path.join(appRoot, ".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
		if (name === "react-native") return native;
		if (name === "@/components/ui/modal") return { Modal, ...names(["ModalBackdrop", "ModalBody", "ModalContent", "ModalFooter", "ModalHeader"]) };
		if (name === "../ui/button") return names(["Button", "ButtonGroup", "ButtonText"]);
		if (name === "@/components/common/Text") return { __esModule: true, default: "Text" };
		if (name === "@/hooks/useAlertModal") return load("hooks/useAlertModal.ts");
		if (name === "./SuccessModal") return { __esModule: true, default: exportFixtures.SuccessModal };
		if (name === "./DeleteConfirmModal") return { __esModule: true, default: exportFixtures.DeleteConfirmModal };
		throw new Error(`Unexpected dependency ${name}`);
	};
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire, console }, { filename: path.join(appRoot, relative) });
	loaded.set(relative, module.exports); return module.exports;
}
const actualModule = load(target), AlertModal = actualModule.default;
let renderer, stateEvents = [], callbackEvents = [], controller;
const StateHost = ({ modalProps = {}, startOpen = true }) => {
	const modal = actualModule.useAlertModal(startOpen);
	controller = modal;
	return React.createElement(AlertModal, { openState: [modal.isOpen, (value) => { stateEvents.push(value); modal.openState[1](value); }], ...modalProps });
};
const tree = (props = {}, startOpen = true) => React.createElement(React.StrictMode, null, React.createElement(StateHost, { modalProps: props, startOpen }));
const all = (type) => renderer.root.findAllByType(type);
const one = (type) => renderer.root.findByType(type);
const buttons = () => all("Button");
const labels = () => all("ButtonText").map((node) => node.props.children);
const texts = () => all("Text").map((node) => node.props.children);
async function mount(props = {}, startOpen = true) {
	if (renderer) await act(async () => renderer.unmount());
	stateEvents = []; callbackEvents = [];
	await act(async () => { renderer = create(tree(props, startOpen)); });
}
async function press(index) {
	const button = buttons()[index];
	if (!button.props.disabled) await act(async () => button.props.onPress());
}
async function resize(width, height = 640) {
	await act(async () => { dimensions = { ...dimensions, width, height }; for (const listener of listeners) listener(); });
}
(async () => {
	await mount();
	check("Default openState renders an open modal", one("Modal").props.isOpen, true);
	check("No image/title/message/children are invented", [all("Image").length, texts(), all("ModalBody").length], [0, [], 0]);
	check("Default action labels remain unchanged", labels(), ["Tidak, batal", "Iya, lanjut"]);
	check("Default cancel outline and confirm primary remain", buttons().map((node) => [node.props.variant ?? null, node.props.action ?? null]), [["outline", null], [null, "primary"]]);
	check("Footer preserves gap16 and two flex groups", [one("ModalFooter").props.className, all("ButtonGroup").map((node) => node.props.className)], ["mt-4 gap-4", ["flex-1", "flex-1"]]);
	check("Default confirm disabled flag is false", buttons()[1].props.disabled, false);
	check("Initial window320 yields width288 with no explicit maximum", one("ModalContent").props.style, { width: 288 });
	check("StrictMode keeps one active window listener", listeners.size, 1);
	const componentIdentity = renderer.root.findByType(AlertModal);
	await resize(390, 844);
	check("Same open instance follows window change without prop change", [one("ModalContent").props.style, renderer.root.findByType(AlertModal) === componentIdentity], [{ width: 358 }, true]);
	await resize(768, 1024);
	check("Tablet width retains Alert geometry, no explicit380 maximum", one("ModalContent").props.style, { width: 736 });
	await resize(320);
	check("Resizing back to320 restores width288", one("ModalContent").props.style, { width: 288 });
	await press(0);
	check("Default cancel calls state setter false once and hides modal", [stateEvents, one("Modal").props.isOpen, buttons().length], [[false], false, 0]);
	await mount(); await press(1);
	check("Confirm without callback falls back to default close", [stateEvents, one("Modal").props.isOpen], [[false], false]);
	await mount(); await act(async () => one("Modal").props.onClose());
	check("Default modal dismissal calls setter false", [stateEvents, one("Modal").props.isOpen], [[false], false]);
	const customClose = () => callbackEvents.push("close");
	await mount({ onClose: customClose }); await press(0);
	check("Custom cancel invokes callback directly without implicit state update", [callbackEvents, stateEvents, one("Modal").props.isOpen], [["close"], [], true]);
	await press(1);
	check("Missing confirm callback falls back to custom close", [callbackEvents, stateEvents], [["close", "close"], []]);
	await act(async () => one("Modal").props.onClose());
	check("Modal dismissal forwards custom close as given", [callbackEvents, one("Modal").props.onClose === customClose], [["close", "close", "close"], true]);
	await mount({ onClose: customClose, onConfirm: () => callbackEvents.push("confirm") }); await press(1);
	check("Explicit confirm invokes only its callback and stays open", [callbackEvents, stateEvents, one("Modal").props.isOpen], [["confirm"], [], true]);
	await mount({ isLoading: true, onClose: customClose, onConfirm: () => callbackEvents.push("confirm") });
	check("Loading disables confirm while preserving enabled cancel", buttons().map((node) => Boolean(node.props.disabled)), [false, true]);
	await press(1);
	check("Disabled host confirm dispatches no callback", callbackEvents, []);
	await press(0);
	check("Loading cancel still invokes custom close", callbackEvents, ["close"]);
	await act(async () => renderer.update(tree({ isLoading: false, onClose: customClose, onConfirm: () => callbackEvents.push("confirm") })));
	check("Busy-to-idle transition enables confirm", buttons()[1].props.disabled, false);
	await press(1);
	check("Enabled confirm dispatches normally after loading", callbackEvents, ["close", "confirm"]);
	await mount({ isLoading: true }); await press(0);
	check("Loading default cancel still hides through controlled setter", [stateEvents, one("Modal").props.isOpen], [[false], false]);
	await mount({ hideCancelButton: true });
	check("Cancel-hidden renders only confirm in one group", [labels(), all("ButtonGroup").length, all("ModalFooter").length], [["Iya, lanjut"], 1, 1]);
	await press(0);
	check("Sole confirm retains default close fallback", [stateEvents, one("Modal").props.isOpen], [[false], false]);
	await mount({ hideConfirmButton: true });
	check("Confirm-hidden renders only cancel in one group", [labels(), all("ButtonGroup").length, all("ModalFooter").length], [["Tidak, batal"], 1, 1]);
	await press(0);
	check("Sole cancel still closes", [stateEvents, one("Modal").props.isOpen], [[false], false]);
	await mount({ hideCancelButton: true, hideConfirmButton: true });
	check("Both actions hidden suppresses entire footer", [buttons().length, all("ButtonGroup").length, all("ModalFooter").length], [0, 0, 0]);
	await act(async () => one("Modal").props.onClose());
	check("No-footer modal keeps dismissal callback", [stateEvents, one("Modal").props.isOpen], [[false], false]);
	await mount({ title: "   Judul khusus   ", message: "Pesan khusus", cancelText: "Kembali", confirmText: "Mengerti", confirmAction: "negative", image: "fixture-category" });
	check("Title trimming/message/labels remain supported", [texts(), labels()], [["Judul khusus", "Pesan khusus"], ["Kembali", "Mengerti"]]);
	check("Custom confirm action is forwarded", buttons()[1].props.action, "negative");
	check("Optional image source retains class/cover and height128", [one("Image").props.source, one("Image").props.className, one("Image").props.resizeMode, one("Image").props.style], ["fixture-category", "h-32 w-full", "cover", { height: 128, width: "100%" }]);
	check("Image wrapper layout/corners/overflow remain unchanged", all("View").map((node) => node.props.className), ["w-full overflow-hidden rounded-2xl"]);
	check("Existing container/header/body classes remain unchanged", [one("ModalContent").props.className, one("ModalHeader").props.className, one("ModalBody").props.className], ["rounded-[20px] p-5 shadow-main", "flex-col items-center gap-5", "mx-0 mb-0 mt-4"]);
	const childNode = React.createElement("WarningChild", { fixture: true }, "warning"), messageNode = React.createElement("SalesOverview", { fixture: true }, "sales");
	await mount({ children: childNode, message: messageNode, title: "Overview" });
	check("ReactNode message renders unchanged, not converted to string", [all("SalesOverview").length, one("SalesOverview").props.children, texts()], [1, "sales", ["Overview"]]);
	check("Children remain distinct from message with original ordering", one("ModalContent").children.map((node) => node.type), ["ModalHeader", "WarningChild", "ModalBody", "ModalFooter"]);
	check("ReactNode child retains supplied identity/content", [one("WarningChild").props.fixture, one("WarningChild").props.children], [true, "warning"]);
	await mount({ image: 0, title: "", message: "" });
	check("Explicit falsy image/title/message retains suppression", [all("Image").length, texts(), all("ModalBody").length], [0, [], 0]);
	await mount({ image: { uri: "fixture://custom" }, title: "  " });
	check("Public custom image preserves source shape and intended geometry", [one("Image").props.source, one("Image").props.style, one("Image").props.resizeMode], [{ uri: "fixture://custom" }, { height: 128, width: "100%" }, "cover"]);
	check("Truthy whitespace title trims to empty content as before", texts(), [""]);
	let resolvePending;
	const pending = new Promise((resolve) => { resolvePending = resolve; });
	await mount({ onConfirm: () => pending });
	let actualPromise;
	await act(async () => { actualPromise = buttons()[1].props.onPress(); });
	check("Promise callback return is passed through unchanged", actualPromise === pending, true);
	check("Component does not infer loading or closing from promise", [one("Modal").props.isOpen, buttons()[1].props.disabled, stateEvents], [true, false, []]);
	resolvePending(); await pending;
	await mount({}, false);
	check("Controlled false openState keeps modal children hidden", [one("Modal").props.isOpen, all("ModalContent").length], [false, 0]);
	await resize(390, 844); await act(async () => controller.open());
	check("Opening after hidden resize uses current width", [one("Modal").props.isOpen, one("ModalContent").props.style], [true, { width: 358 }]);
	check("Public useAlertModal re-export remains production hook", actualModule.useAlertModal === loaded.get("hooks/useAlertModal.ts").useAlertModal, true);
	check("Sibling re-export references are untouched", [actualModule.SuccessModal === exportFixtures.SuccessModal, actualModule.DeleteConfirmModal === exportFixtures.DeleteConfirmModal], [true, true]);
	await act(async () => renderer.unmount()); renderer = null;
	check("Unmount removes dimension subscription", listeners.size, 0);
	await resize(320);
	check("Dimension events after unmount retain no listeners", listeners.size, 0);
	check("Runtime/React/act errors absent", errors, []);
	check("Runtime warnings absent except suppressed renderer deprecation", warnings, []);
	check("Source did not change while tests ran", hash(read(target)), expectedFinal);
	const callerDrift = audit.callers.filter((caller) => hash(read(caller.file)) !== caller.sha256).map((caller) => ({ file: caller.file, beforeSha256: caller.sha256, currentSha256: hash(read(caller.file)), note: "Context drift from another session is recorded separately and does not automatically fail geometry-only AlertModal review" }));
	const companionDrift = Object.entries(audit.companions).filter(([file, expected]) => hash(read(file)) !== expected).map(([file]) => file);
	check("Read-only sibling/primitive/hook hashes still match", companionDrift, []);
	fs.writeFileSync(path.join(__dirname, "AlertModal.final.tsx.txt"), source);
	const result = {
		status: checks.every((entry) => entry.passed) ? "INTERNAL_QA_REVIEW_PASS" : "INTERNAL_QA_REVIEW_CHANGES_REQUESTED",
		externalQcApproval: false, target, reviewedSourceHash: expectedFinal, baselineSourceHash: hash(before),
		pass: checks.filter((entry) => entry.passed).length, fail: checks.filter((entry) => !entry.passed).length, errors, warnings, checks, productionHashes,
		callerHashChecks: { count: audit.callers.length, usageCount: audit.usageCount, drift: callerDrift, driftNotAutomaticSourceFailure: true }, companionDrift,
		fixture: "Actual AlertModal and useAlertModal with React StrictMode; RN/dimension/Modal/Button/Text host adapters and inert unused sibling re-export adapters",
		limitations: ["Renderer contract/geometry props review only; not pixel/native/SSR/HP/browser certification", "Image/category data are fixtures; image asset byte/dimensions tracked in audit", "Disabled interaction simulated by host honoring Button disabled; actual browser Button behavior belongs to parent", "No execution of all71 callers; no HTTP/API/backend/persist/dependency/server/fullTS/Git mutations", "Internal review cannot close external QC findings or approve PM publication"]
	};
	fs.writeFileSync(path.join(__dirname, "results.json"), `${JSON.stringify(result, null, 2)}\n`);
	console.log(JSON.stringify({ status: result.status, pass: result.pass, fail: result.fail, reviewedSourceHash: expectedFinal, errors, warnings, failedChecks: checks.filter((entry) => !entry.passed).map((entry) => entry.name) }, null, 2));
	console.error = originalError; console.warn = originalWarn;
	if (result.fail) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
