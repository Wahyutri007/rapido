const fs = require("node:fs"), path = require("node:path"), assert = require("node:assert/strict");
for (const [from, directory] of [["docs/qa/codex-3/alert-modal-size/delete-lifecycle/check.cjs", "delete-replay"], ["docs/qa/codex-3/list-actions/check.cjs", "list-replay"]]) {
	const target = path.join(__dirname, directory); fs.mkdirSync(target, { recursive: true });
	let code = fs.readFileSync(from, "utf8");
	const fixture = directory === "delete-replay" ? '["View", "Image", "Pressable"]' : '["View", "Image", "Pressable", "RefreshControl", "Switch"]';
	assert(code.includes(fixture), from + " expected native fixture");
	code = code.replace(fixture, fixture.replace('"Pressable"', '"Pressable", "ScrollView"'));
	const file = path.join(target, "check.cjs");
	if (fs.existsSync(file)) assert.equal(fs.readFileSync(file, "utf8"), code, "Preserve existing replay");
	else fs.writeFileSync(file, code);
}
console.log("Owned current-source renderer copies prepared; only native ScrollView fixture added, prior packets untouched.");
