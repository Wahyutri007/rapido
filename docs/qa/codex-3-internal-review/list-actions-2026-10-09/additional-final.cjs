const fs = require("node:fs");
const path = require("node:path");
const initial = fs.readFileSync(path.join(__dirname, "additional.cjs"), "utf8");
const corrected = initial
	.replace('props.setSearch("B")', 'props.setSearch(definition.domain + " B")')
	.replace('"additional-results.json"', '"additional-final-results.json"');
if (corrected === initial || corrected.includes('props.setSearch("B")')) throw new Error("Unique filter correction did not apply.");
// Searching just B matched member's name and worker's fallback role label.
// The initial runner/result remain frozen; only the fixture query/output differ.
new Function("require", "__dirname", corrected)(require, __dirname);
