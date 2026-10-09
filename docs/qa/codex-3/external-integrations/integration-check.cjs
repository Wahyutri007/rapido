const fs = require("node:fs"), path = require("node:path"), ts = require("typescript"), crypto = require("node:crypto");
const files = { hub: "app/(back-office)/manage.tsx", parent: "app/(no-layout)/manage/_layout.tsx" };
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const beforeHub = fs.readFileSync(path.join(__dirname, "manage.before.tsx.txt"), "utf8").replaceAll("\r\n", "\n");
const beforeParent = fs.readFileSync(path.join(__dirname, "parent.before.tsx.txt"), "utf8").replaceAll("\r\n", "\n");
const hub = fs.readFileSync(files.hub, "utf8"), parent = fs.readFileSync(files.parent, "utf8");
const checks = [], check = (name, passed) => checks.push({ name, passed: Boolean(passed) });
function canonical(text) {
	const tree = ts.createSourceFile("source.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const transformed = ts.transform(tree, [context => {
		const visit = node => ts.isJsxText(node) && !node.text.trim() ? undefined : ts.visitEachChild(node, visit, context);
		return node => ts.visitNode(node, visit);
	}]);
	const result = ts.createPrinter({ removeComments: false }).printFile(transformed.transformed[0]); transformed.dispose(); return result;
}
const oldExternal = /\{\s*id: "external",[\s\S]*?\n\t\t\t\},/;
check("before hub: disabled Coming Soon external entry, no integration href", oldExternal.test(beforeHub) && beforeHub.includes("Coming Soon") && !beforeHub.includes("/manage/integrations"));
const expectedHub = beforeHub.replace(oldExternal, 'menuItem("Integrasi Eksternal", "/manage/integrations", "external"),')
	.replace(/^import \{ View \} from "react-native";\n/m, "").replace(/^import Text from "@\/components\/common\/Text";\n/m, "");
check("hub delta: only external entry and its unused presentation imports", canonical(expectedHub) === canonical(hub));
check("hub destination registered exactly once", (hub.match(/"\/manage\/integrations"/g) ?? []).length === 1);
const registration = /<JSStack\.Screen\s+name="integrations"\s+options=\{\{\s*headerShown:\s*false\s*\}\}\s*\/>/;
const expectedParent = beforeParent.replace(/^import React from "react";\n/m, "");
check("parent before: no integration registration", !beforeParent.includes('name="integrations"'));
check("parent delta: one headerfalse child plus unused React import/format", registration.test(parent) && canonical(parent.replace(registration, "")) === canonical(expectedParent));
check("parent destination registered exactly once", (parent.match(/name="integrations"/g) ?? []).length === 1);
const directory = "app/(no-layout)/manage/integrations/";
for (const file of ["index.tsx", "modify.tsx", "detail.tsx", "_layout.tsx"]) check("new route exists: " + file, fs.existsSync(directory + file));
if (fs.existsSync(directory + "_layout.tsx")) {
	const layout = fs.readFileSync(directory + "_layout.tsx", "utf8");
	const tree = ts.createSourceFile("_layout.tsx", layout, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), headers = new Set();
	function hasHeader(node) {
		let found = false;
		function visit(child) {
			if ((ts.isJsxSelfClosingElement(child) || ts.isJsxOpeningElement(child)) && child.tagName.getText(tree) === "Header") found = true;
			ts.forEachChild(child, visit);
		}
		visit(node); return found;
	}
	function visit(node) {
		if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(tree) === "JSStack.Screen") {
			const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
			const name = attributes.find(attribute => attribute.name.getText(tree) === "name")?.initializer;
			const options = attributes.find(attribute => attribute.name.getText(tree) === "options")?.initializer;
			if (name && ts.isStringLiteral(name) && options && ts.isJsxExpression(options) && options.expression && ts.isObjectLiteralExpression(options.expression)) {
				const header = options.expression.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(tree) === "header");
				if (header && ts.isArrowFunction(header.initializer) && hasHeader(header.initializer.body)) headers.add(name.text);
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(tree);
	for (const name of ["index", "modify", "detail"]) check("layout registers header for: " + name, headers.has(name));
}
const result = { owner: "Software Developer Senior / Codex-3", ticket: "SD3-014", passed: checks.filter(item => item.passed).length, failed: checks.filter(item => !item.passed).length, checks,
	sourceHashes: Object.fromEntries(Object.values(files).map(file => [file, hash(file)])), baselineHashes: { hub: hash(path.join(__dirname, "manage.before.tsx.txt")), parent: hash(path.join(__dirname, "parent.before.tsx.txt")) },
	limits: "AST/source routing and scope proof only; not a full navigator/root auth/browser/native execution or webhook/backend contract" };
fs.writeFileSync(path.join(__dirname, "integration-results.json"), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ passed: result.passed, failed: result.failed, failures: checks.filter(item => !item.passed) })); process.exitCode = result.failed ? 1 : 0;
