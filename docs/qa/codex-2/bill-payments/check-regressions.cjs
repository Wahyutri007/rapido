const fs = require("node:fs");
const path = require("node:path");

// Replay previous module checks with outputs here, preserving their original packets.
for (const [moduleName, outputName] of [
	["materials", "material-regression-results.json"],
	["compositions", "composition-regression-results.json"],
]) {
	const sourcePath = path.join(__dirname, "..", moduleName, "check-model.cjs");
	const source = fs.readFileSync(sourcePath, "utf8");
	if (!source.includes('"model-results.json"'))
		throw new Error(
			`Model result path changed in ${moduleName}; inspect before replay`,
		);
	new Function(
		"require",
		"__dirname",
		source.replace('"model-results.json"', JSON.stringify(outputName)),
	)(require, __dirname);
}
