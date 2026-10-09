const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
const { create, act } = require(path.resolve(".expo/senior7-test-tools/node_modules/react-test-renderer"));
global.IS_REACT_ACT_ENVIRONMENT = true;
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "audit.json"), "utf8"));
const sourceFile = "components/common/SuccessModal.tsx";
const source = fs.readFileSync(sourceFile, "utf8");
const sourceHash = crypto.createHash("sha256").update(source).digest("hex");
if (sourceHash !== audit.sourceHashes.find((item) => item.file === sourceFile).actual) throw Error("SuccessModal changed after audit");
const checks = [], errors = [];
const originalError = console.error;
console.error = (...args) => {
	if (String(args[0]).includes("react-test-renderer is deprecated")) return;
	errors.push(args.map(String).join(" "));
	originalError(...args);
};
const same = (name, actual, expected) => checks.push({ name, passed: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
let dimensions = { width: 320, height: 640, scale: 1, fontScale: 1 };
const listeners = new Set();
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => dimensions;
const useWindowDimensions = () => React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
const host = (names) => Object.fromEntries(names.map((name) => [name, name]));
const Modal = ({ isOpen, children, ...props }) => React.createElement("Modal", { isOpen, ...props }, isOpen ? children : null);
function compile(text, filename, customRequire) {
	const code = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
	const module = { exports: {} };
	vm.runInNewContext(code, { module, exports: module.exports, require: customRequire }, { filename });
	return module.exports;
}
const hook = compile(fs.readFileSync("hooks/useAlertModal.ts", "utf8"), "hooks/useAlertModal.ts", () => React);
const fixtureImage = { uri: "fixture-default.png" };
const compiled = compile(source, sourceFile, (name) => {
	if (name === "react") return React;
	if (name === "react/jsx-runtime") return require(path.resolve(".expo/senior7-test-tools/node_modules/react/jsx-runtime"));
	if (name === "react-native") return { ...host(["Image", "Pressable", "View"]), useWindowDimensions };
	if (name === "@expo/vector-icons/Feather") return { __esModule: true, default: "Feather" };
	if (name === "@/assets/images/illustrations") return { ILLUSTRATIONS: { actionSuccess: fixtureImage } };
	if (name === "@/components/common/Text") return { __esModule: true, default: "Text" };
	if (name === "@/components/ui/button") return host(["Button", "ButtonGroup", "ButtonText"]);
	if (name === "@/components/ui/modal") return { Modal, ...host(["ModalContent", "ModalHeader", "ModalBody", "ModalFooter", "ModalBackdrop"]) };
	if (name === "@/constants/Colors") return { Colors: { zinc: { 500: "fixture-color" } } };
	if (name === "@/hooks/useAlertModal") return hook;
	throw Error(`Unexpected import ${name}`);
});
const SuccessModal = compiled.default;
let renderer;
async function render(props) {
	if (renderer) await act(async () => renderer.unmount());
	await act(async () => { renderer = create(React.createElement(React.StrictMode, null, React.createElement(SuccessModal, { title: "  Berhasil  ", ...props }))); });
}
const propsOf = (name) => renderer.root.findByType(name).props;
const text = () => renderer.root.findAllByType("Text").map((node) => node.props.children);
const pressed = async (name) => act(async () => propsOf(name).onPress());
(async () => {
	let exception;
	try {
		await render({ isOpen: true });
		same("title remains trimmed", text(), ["Berhasil"]);
		same("default button label remains Tutup", propsOf("ButtonText").children, "Tutup");
		same("default illustration remains configured asset", propsOf("Image").source, fixtureImage);
		same("illustration uses contain sizing", propsOf("Image").resizeMode, "contain");
		same("initial geometry respects application window 320", propsOf("ModalContent").style, { width: 288, maxWidth: 380 });
		for (const [width, fontScale] of [[768, 1], [390, 1], [360, 1], [320, 1], [320, 2], [768, 2]]) {
			await act(async () => { dimensions = { ...dimensions, width, fontScale }; listeners.forEach((listener) => listener()); });
			same(`dimension subscription updates geometry without new props (${width}, fontScale ${fontScale})`, propsOf("ModalContent").style, { width: width - 32, maxWidth: 380 });
			same(`dimension notification preserves controlled visibility (${width}, fontScale ${fontScale})`, propsOf("Modal").isOpen, true);
		}
		let closes = [], setters = [];
		await render({ isOpen: false, openState: [true, (value) => setters.push(value)], onClose: () => closes.push("close") });
		same("openState true takes precedence over isOpen false", propsOf("Modal").isOpen, true);
		await pressed("Button");
		same("controlled action requests close once", setters, [false]);
		same("controlled action notifies close once", closes, ["close"]);
		await render({ isOpen: true, openState: [false, () => {}] });
		same("openState false takes precedence over isOpen true", propsOf("Modal").isOpen, false);
		same("closed shell renders no modal action", renderer.root.findAllByType("Button").length, 0);
		await render({});
		same("missing open props remain closed", propsOf("Modal").isOpen, false);
		closes = [];
		await render({ isOpen: true, onClose: () => closes.push("close") });
		await pressed("Button");
		same("legacy isOpen action notifies close once", closes, ["close"]);
		same("legacy visibility remains caller controlled", propsOf("Modal").isOpen, true);
		for (const trigger of ["icon", "modal-close"]) {
			closes = []; setters = [];
			await render({ openState: [true, (value) => setters.push(value)], onClose: () => closes.push("close") });
			await act(async () => trigger === "icon" ? propsOf("Pressable").onPress() : propsOf("Modal").onClose());
			same(`${trigger} requests controlled close once`, setters, [false]);
			same(`${trigger} notifies close once`, closes, ["close"]);
		}
		let actions = [];
		closes = []; setters = [];
		await render({ openState: [true, (value) => setters.push(value)], onClose: () => closes.push("close"), onButtonPress: () => actions.push("action") });
		await pressed("Button");
		same("custom action is invoked once", actions, ["action"]);
		same("custom action does not additionally invoke close", closes, []);
		same("custom action retains caller controlled dismissal", setters, []);
		await render({ isOpen: true, description: "Deskripsi", message: "Fallback", buttonText: "Lanjut", confirmText: "Fallback CTA" });
		same("description takes precedence over message", text(), ["Berhasil", "Deskripsi"]);
		same("buttonText takes precedence over confirmText", propsOf("ButtonText").children, "Lanjut");
		await render({ isOpen: true, message: "Fallback", confirmText: "Selesai" });
		same("message fallback renders", text(), ["Berhasil", "Fallback"]);
		same("confirmText fallback renders", propsOf("ButtonText").children, "Selesai");
		await render({ isOpen: true, description: "", message: "Fallback", buttonText: "", confirmText: "Fallback CTA" });
		same("explicit empty description does not fall through", text(), ["Berhasil"]);
		same("explicit empty buttonText does not fall through", propsOf("ButtonText").children, "");
		const node = React.createElement("DescriptionFixture", { testID: "caller-node" }, "Node pengguna");
		const custom = { uri: "fixture-category.png" };
		await render({ isOpen: true, description: node, image: custom, hideCloseButton: true });
		same("React-node description remains caller node", propsOf("DescriptionFixture").children, "Node pengguna");
		same("custom image is retained", propsOf("Image").source, custom);
		same("custom image retains contained bounds", propsOf("Image").style, { height: 176, width: "100%" });
		same("hideCloseButton suppresses X only", renderer.root.findAllByType("Pressable").length, 0);
		same("hideCloseButton retains primary action", renderer.root.findAllByType("Button").length, 1);
		same("useAlertModal public re-export points to production hook", compiled.useAlertModal === hook.useAlertModal, true);
		await act(async () => renderer.unmount()); renderer = null;
		same("unmount cleans dimension subscription", listeners.size, 0);
	} catch (error) { exception = error.stack; }
	finally {
		if (renderer) await act(async () => renderer.unmount());
		console.error = originalError;
		const result = { kind: "INTERNAL_QA_REVIEW", sourceHash, passed: checks.filter((item) => item.passed).length, failed: checks.filter((item) => !item.passed).length, runtimeErrors: errors, exception, checks, limits: ["Production SuccessModal and useAlertModal transpiled with actual existing React/test renderer", "Presentation primitives, image asset and dimension notification adapted; not browser layout, native dimension subscription or font accessibility certification", "No other production dependency loaded; no API/backend/Metro/HP/server actions", "Single-event contract assertions do not claim duplicate-event exactly-once protection inside SuccessModal"] };
		fs.writeFileSync(path.join(__dirname, "independent-results.json"), JSON.stringify(result, null, 2) + "\n");
		console.log(JSON.stringify({ passed: result.passed, failed: result.failed, runtimeErrors: errors.length, exception }));
		process.exitCode = result.failed || errors.length || exception ? 1 : 0;
	}
})();
