const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const ts = require("typescript");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function shape(node) {
	const children = [];
	ts.forEachChild(node, child => { children.push(shape(child)); });
	return [node.kind, ts.isIdentifier(node) || ts.isLiteralExpression(node) ? node.text : null, ...children];
}
const ast = text => shape(ts.createSourceFile("source.js", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
const results = [];
for (const name of ["metro.config.js", "verify-metro-cache.cjs", "preserve-nativewind-cache.cjs"]) {
	const file = name === "metro.config.js" ? name : `scripts/${name}`;
	const before = fs.readFileSync(path.join(__dirname, "before", `${name}.txt`), "utf8");
	let after = fs.readFileSync(file, "utf8");
	if (name === "preserve-nativewind-cache.cjs") {
		assert.ok(after.includes("(file, data, ...options) => {"));
		after = after.replace("(file, data, ...options) => {", "function (file, data, ...options) {");
	}
	assert.deepEqual(ast(after), ast(before));
	results.push({ file, pass: true, normalization: name === "preserve-nativewind-cache.cjs" ? "Anonymous function to arrow only; wrapper has no this/arguments/super/new.target" : "None; semantic AST excludes formatting/trailing commas" });
}
const copies = ["guard-boundaries.cjs", "queue-boundaries.cjs"].map(name => {
	const original = path.join("docs/qa/qc-nativewind-cache-2026-10-09", name);
	const copy = path.join(__dirname, name);
	const expected = fs.readFileSync(original, "utf8").replaceAll("../../../scripts/", "../../../../../scripts/").replace('path.resolve(__dirname, "../../..")', 'path.resolve(__dirname, "../../../../..")');
	assert.equal(fs.readFileSync(copy, "utf8"), expected);
	return { original, originalSha256: hash(original), copy, copySha256: hash(copy), adaptation: "Only relative root/require depth changed; original QC code and output untouched" };
});
const result = { status: "PASS", results, copies };
fs.writeFileSync(path.join(__dirname, "equivalence-results.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result));
