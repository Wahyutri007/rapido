const fs = require("node:fs"), crypto = require("node:crypto"), path = require("node:path"), ts = require("typescript"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const file = "app/(no-layout)/(back-office)/report/accounting/accounts/index.tsx", output = path.join(__dirname, "results.json");
assert(!fs.existsSync(output), "Preserve caller drift audit");
const before = JSON.parse(fs.readFileSync("docs/qa/codex-3/alert-modal-size/callers.json", "utf8")).entries.find((entry) => entry.file === file);
const capturedHash = hash(file), parsed = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), current = [];
const visit = (node) => { if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(parsed) === "AlertModal") current.push(node.getText(parsed)); ts.forEachChild(node, visit); };
visit(parsed);
const normalize = (jsx) => {
	const text = jsx.endsWith("/>") ? jsx : `${jsx}</AlertModal>`;
	const source = ts.createSourceFile("caller.tsx", `const preview = (${text});`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	return ts.createPrinter().printFile(source);
};
const jsxContractUnchanged = JSON.stringify(before.uses.map((item) => normalize(item.jsx))) === JSON.stringify(current.map(normalize));
const result = { owner: "Codex-3", ticket: "SD3-009-caller-drift", kind: "READ_ONLY_STATIC_CALLER_RECHECK", source: file, expectedBeforeHash: before.sha256, capturedCurrentHash: capturedHash, baselineUsages: before.uses.length, currentUsages: current.length, jsxContractUnchanged, sourceStableThroughRead: capturedHash === hash(file), beforeJsx: before.uses.map((item) => item.jsx), currentJsx: current, limits: "Static AlertModal JSX props/callback expressions only; no execution or approval of accounts screen/helper/store/lifecycle changes owned by Senior8" };
fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
assert(jsxContractUnchanged && result.sourceStableThroughRead);
console.log(JSON.stringify({ source: file, capturedCurrentHash: capturedHash, jsxContractUnchanged, usages: current.length }));
