const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), assert = require("node:assert/strict"), crypto = require("node:crypto"), ts = require("typescript");
const React = require(path.resolve(".expo/senior7-test-tools/node_modules/react"));
const files = ["app/(no-layout)/_layout.tsx", "app/(no-layout)/(cashier)/catalog/_layout.tsx", "app/(no-layout)/(cashier)/_layout.tsx", "app/(no-layout)/catalog/_layout.tsx"];
const fingerprint = file => ({ file, sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") });
const before = files.map(fingerprint);
const checks = [];
function check(name, actual, expected) {
	actual = structuredClone(actual); expected = structuredClone(expected);
	try { assert.deepEqual(structuredClone(actual), structuredClone(expected)); checks.push({ name, pass: true }); }
	catch { checks.push({ name, pass: false, actual, expected }); }
}
const JSStack = Object.assign(() => null, { Screen: () => null });
const transition = { gestureEnabled: true, fixture: "ScaleBackTransition identity" };
function layout(file) {
	const exported = {};
	const stubs = { react: React, "@/components/common/Header": "Header", "@/components/custom/JSStack": { JSStack, ScaleBackTransition: transition } };
	vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, { React, exports: exported, require: n => { if (!(n in stubs)) throw Error(n); return stubs[n]; } });
	const element = exported.default();
	return { options: element.props.screenOptions, screens: React.Children.toArray(element.props.children).map(e => e.props) };
}
function children(file) {
	const dir = path.dirname(file);
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "_layout.tsx")) ? [{ route: e.name }] : e.isFile() && e.name.endsWith(".tsx") && e.name !== "_layout.tsx" ? [{ route: e.name.slice(0, -4) }] : []);
}
const sorterFile = "node_modules/expo-router/build/useScreens.js";
const sorterSource = fs.readFileSync(sorterFile, "utf8");
const tree = ts.createSourceFile(sorterFile, sorterSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const fn = tree.statements.find(n => ts.isFunctionDeclaration(n) && n.name.text === "getSortedChildren");
assert.ok(fn);
const warnings = [];
const sort = new Function("Route_1", "console", `${fn.getText(tree)}; return getSortedChildren;`)(require(path.resolve("node_modules/expo-router/build/sortRoutes.js")), { warn: (...args) => warnings.push(args) });
const [parent, catalog, cashier, backOfficeCatalog] = files.map(layout);
const names = entries => entries.map(e => e.route.route).sort();
for (const [i, current] of [parent, catalog].entries()) {
	const nodes = children(files[i]); warnings.length = 0;
	const entries = sort(nodes, current.screens);
	check(`${files[i]} has no registration warning`, warnings, []);
	check(`${files[i]} preserves every direct child`, names(entries), nodes.map(n => n.route).sort());
	check(`${files[i]} retains transition options`, current.options, transition);
	check(`${files[i]} has unique registered names`, new Set(current.screens.map(s => s.name)).size, current.screens.length);
}
const screen = (l, name) => l.screens.find(s => s.name === name);
const header = (l, name) => screen(l, name)?.options?.header?.().props;
check("search header belongs to cashier catalog", header(catalog, "search"), { back: true, title: "Cari" });
check("index header remains Katalog", header(catalog, "index"), { title: "Katalog", back: true });
check("detail header remains Detail Pesanan", header(catalog, "detail"), { title: "Detail Pesanan", back: true });
check("terms header preserved", header(parent, "terms-and-condition"), { back: true, title: "Syarat & Ketentuan" });
check("root hides cashier parent header", screen(parent, "(cashier)").options.headerShown, false);
check("cashier hides catalog parent header", screen(cashier, "catalog").options.headerShown, false);
check("root hides back office catalog header", screen(parent, "catalog").options.headerShown, false);
check("back office menu retains child registration", screen(backOfficeCatalog, "menu").options.headerShown, false);
check("legacy registrations removed only at wrong parent", parent.screens.filter(s => ["menu/search", "menu", "catalog/menu"].includes(s.name)).map(s => s.name), []);
check("search screen file still exists", fs.existsSync("app/(no-layout)/(cashier)/catalog/search.tsx"), true);
check("catalog menu child still exists", fs.existsSync("app/(no-layout)/catalog/menu/_layout.tsx"), true);
check("inputs stable during verification", files.map(fingerprint), before);
const result = { status: checks.every(c => c.pass) ? "PASS" : "FAIL", passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length, checks, sources: before, sorter: fingerprint(sorterFile), scope: "Production layout functions and installed expo-router sorter + filesystem; JSStack/Header adapters; not native navigation" };
fs.writeFileSync(path.join(__dirname, process.argv.includes("--baseline") ? "baseline.json" : "results.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result)); process.exitCode = result.failed ? 1 : 0;
