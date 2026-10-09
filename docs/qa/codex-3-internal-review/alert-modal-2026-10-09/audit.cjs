const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const ts = require(path.join(appRoot, "node_modules/typescript"));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const target = "components/common/AlertModal.tsx";
const baselinePath = path.join(__dirname, "AlertModal.before.tsx.txt");
if (fs.existsSync(baselinePath)) throw new Error("Baseline packet already captured; do not overwrite");
const source = fs.readFileSync(path.join(appRoot, target));
fs.writeFileSync(baselinePath, source);
const files = [];
function walk(directory) {
	if (!fs.existsSync(directory)) return;
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(absolute);
		else if (/\.[cm]?[jt]sx?$/.test(entry.name)) files.push(absolute);
	}
}
for (const name of ["app", "components", "hooks", "context", "store", "lib", "constants", "api", "types", "schema"]) walk(path.join(appRoot, name));
const relative = (absolute) => path.relative(appRoot, absolute).replaceAll("\\", "/");
const callers = [];
const importOnly = [];
const sourceReferences = [];
for (const absolute of files) {
	const text = fs.readFileSync(absolute, "utf8");
	if (!text.includes("AlertModal")) continue;
	const ast = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const aliases = new Set();
	const namespaces = new Set();
	const imports = [];
	for (const statement of ast.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
		const specifier = statement.moduleSpecifier.text;
		if (!/(^|\/)AlertModal$/.test(specifier)) continue;
		imports.push(statement.getText(ast));
		if (statement.importClause?.name) aliases.add(statement.importClause.name.text);
		const bindings = statement.importClause?.namedBindings;
		if (bindings && ts.isNamedImports(bindings)) {
			for (const element of bindings.elements) if ((element.propertyName?.text ?? element.name.text) === "default") aliases.add(element.name.text);
		}
		if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(`${bindings.name.text}.default`);
	}
	if (imports.length === 0) {
		sourceReferences.push({ file: relative(absolute), sha256: hash(text) });
		continue;
	}
	const usages = [];
	function visit(node) {
		if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
			const tag = node.tagName.getText(ast);
			if (aliases.has(tag) || namespaces.has(tag)) {
				const props = {};
				const spreads = [];
				for (const attribute of node.attributes.properties) {
					if (ts.isJsxSpreadAttribute(attribute)) spreads.push(attribute.expression.getText(ast));
					else props[attribute.name.getText(ast)] = attribute.initializer?.getText(ast) ?? true;
				}
				const parent = node.parent;
				const children = ts.isJsxOpeningElement(node) && ts.isJsxElement(parent) ? parent.children.filter((child) => !ts.isJsxText(child) || child.text.trim()).map((child) => child.getText(ast)) : [];
				usages.push({ line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, tag, props, spreads, children });
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(ast);
	const record = { file: relative(absolute), sha256: hash(text), imports, aliases: [...aliases], namespaceAliases: [...namespaces], usages };
	(usages.length ? callers : importOnly).push(record);
}
const properties = {};
for (const caller of callers) for (const usage of caller.usages) for (const [key, value] of Object.entries(usage.props)) {
	const expression = typeof value === "string" ? value : "<boolean true>";
	properties[key] ??= {};
	properties[key][expression] ??= [];
	properties[key][expression].push(`${caller.file}:${usage.line}`);
}
function imageSize(bytes) {
	if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { format: "png", width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
	if (bytes[0] === 255 && bytes[1] === 216) {
		let offset = 2;
		while (offset < bytes.length) {
			if (bytes[offset++] !== 255) continue;
			let marker = bytes[offset++];
			while (marker === 255) marker = bytes[offset++];
			if (marker === 216 || marker === 217 || marker === 1 || (marker >= 208 && marker <= 215)) continue;
			const length = bytes.readUInt16BE(offset);
			if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) return { format: "jpeg", height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
			offset += length;
		}
	}
	return { format: "unknown" };
}
const assets = {};
for (const registry of ["assets/images/alerts/index.ts", "assets/images/illustrations/index.ts", "assets/images/index.ts"]) {
	const bytes = fs.readFileSync(path.join(appRoot, registry));
	const definitions = {};
	for (const match of bytes.toString("utf8").matchAll(/(\w+):\s*require\("(.*?)"\)/g)) {
		const absolute = path.resolve(path.dirname(path.join(appRoot, registry)), match[2]);
		const assetBytes = fs.readFileSync(absolute);
		definitions[match[1]] = { file: relative(absolute), sha256: hash(assetBytes), ...imageSize(assetBytes) };
	}
	assets[registry] = { sha256: hash(bytes), definitions };
}
const companions = Object.fromEntries(["components/common/SuccessModal.tsx", "components/common/DeleteConfirmModal.tsx", "hooks/useAlertModal.ts", "components/ui/modal/index.tsx", "components/ui/button/index.tsx", "components/common/Text.tsx"].map((file) => [file, hash(fs.readFileSync(path.join(appRoot, file)))]));
const report = {
	status: "READ_ONLY_BASELINE_AUDIT", externalQcApproval: false,
	createdAt: new Date().toISOString(), target, sourceSha256: hash(source),
	sourceContract: { width: 'Dimensions.get("screen").width - 32', explicitMaxWidth: null, optionalImage: true, imageClass: "h-32 w-full", imageIntentHeight: 128, resizeMode: "cover", defaultOnClose: "setIsOpen(false)", customOnClose: "forwarded without implicit state update", onConfirmFallback: "onClose", loading: "confirm disabled, cancel remains enabled", childrenPosition: "after ModalHeader before optional message ModalBody", footer: "hidden iff both actions hidden; otherwise flex-1 groups, two/one button" },
	scannedFiles: files.length, callerCount: callers.length, usageCount: callers.reduce((sum, caller) => sum + caller.usages.length, 0),
	callers, importOnly, sourceReferences, properties, assets, companions,
	limitations: ["Read-only AST/source/assets audit; no browser/native geometry certification", "Current Figma tools unavailable per parent checked session", "Caller hashes identify snapshot; not execution of each screen", "No app, shared docs, frozen packets, HTTP/backend, Git, Metro/HP or dependency changes"]
};
fs.writeFileSync(path.join(__dirname, "audit-before.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ target, sha256: report.sourceSha256, scannedFiles: files.length, callerCount: report.callerCount, usageCount: report.usageCount, aliases: [...new Set(callers.flatMap((caller) => caller.aliases))], properties: Object.fromEntries(Object.entries(properties).map(([name, expressions]) => [name, expressions])), children: callers.flatMap((caller) => caller.usages.filter((usage) => usage.children.length).map((usage) => ({ file: caller.file, ...usage }))), companions }, null, 2));
