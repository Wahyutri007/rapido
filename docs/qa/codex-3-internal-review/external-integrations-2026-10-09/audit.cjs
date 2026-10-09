const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const ts = require(path.join(root, "node_modules/typescript"));
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const files = ["app/(no-layout)/manage/integrations/_layout.tsx", "app/(no-layout)/manage/integrations/index.tsx", "app/(no-layout)/manage/integrations/modify.tsx", "app/(no-layout)/manage/integrations/detail.tsx", "components/feature/manage/integrations/IntegrationListScreen.tsx", "components/feature/manage/integrations/IntegrationModifyScreen.tsx", "components/feature/manage/integrations/IntegrationDetailScreen.tsx", "components/feature/manage/integrations/IntegrationDeleteDialog.tsx", "schema/manage/integration.ts", "store/manageIntegrationStore.ts", "types/ui/manage/integration.ts"];
const shared = ["app/(back-office)/manage.tsx", "app/(no-layout)/manage/_layout.tsx"];
if (fs.existsSync(path.join(__dirname, "audit.json"))) throw new Error("Audit already captured; no overwrite");
const source = files.map((file) => {
	const bytes = fs.readFileSync(path.join(root, file)), text = bytes.toString("utf8");
	const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
	const imports = ast.statements.filter(ts.isImportDeclaration).map((node) => node.moduleSpecifier.text);
	const calls = [], jsx = [];
	function visit(node) {
		if (ts.isCallExpression(node)) calls.push(node.expression.getText(ast));
		if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) jsx.push({ tag: node.tagName.getText(ast), props: Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map((attribute) => [attribute.name.getText(ast), attribute.initializer?.getText(ast) ?? true])) });
		ts.forEachChild(node, visit);
	}
	visit(ast);
	const networkImports = imports.filter((value) => /(^axios$|@\/api\/|expo-secure-store|persist|AsyncStorage)/i.test(value));
	const networkCalls = calls.filter((value) => /(^fetch$|^XMLHttpRequest$|\.getDocumentAsync$|\.openURL$|\.send$|axios|createMutationHook|createGetHook|SecureStore|AsyncStorage|persist)/i.test(value));
	const screenHeaders = !file.endsWith("_layout.tsx") ? jsx.filter((node) => node.tag === "Header") : [];
	return { path: file, sha256: sha(bytes), imports, networkImports, networkCalls, screenHeaders, jsx };
});
const sharedSources = shared.map((file) => ({ path: file, sha256: sha(fs.readFileSync(path.join(root, file))), relevantLines: fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/).map((text, index) => ({ line: index + 1, text })).filter((row) => /external|integrations|Integrasi Eksternal/.test(row.text)) }));
const findings = source.filter((file) => file.networkImports.length || file.networkCalls.length || file.screenHeaders.length).map((file) => ({ path: file.path, networkImports: file.networkImports, networkCalls: file.networkCalls, screenHeaders: file.screenHeaders }));
const result = { status: findings.length ? "READ_ONLY_AUDIT_REQUIRES_REVIEW" : "READ_ONLY_AUDIT_NO_NETWORK_OR_SCREEN_HEADER", externalQcApproval: false, sourceCount: files.length, sources: source, sharedSources, findings, limitations: ["Static import/call/JSX audit, not runtime global-call proof", "Root owns shared hub/layout; hash captured as context, not whole-root behavior approval", "No browser/native/router/Figma/persist/network/activation/provider-event certification", "Shared DeleteDABC/Success7508 retain external QA/QC geometry gates"] };
fs.writeFileSync(path.join(__dirname, "audit.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, sourceCount: source.length, sharedSourceCount: sharedSources.length, findings }, null, 2));
if (findings.length) process.exitCode = 1;
