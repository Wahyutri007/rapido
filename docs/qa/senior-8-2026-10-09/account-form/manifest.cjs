const fs = require("node:fs"),
	path = require("node:path"),
	crypto = require("node:crypto"),
	assert = require("node:assert/strict"),
	ts = require("typescript");
const sha = (file) =>
	crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = (name) =>
	JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const source =
	"app/(no-layout)/(back-office)/report/accounting/accounts/modify.tsx";
const before = fs.readFileSync(
		path.join(__dirname, "modify.before.tsx.txt"),
		"utf8",
	),
	after = fs.readFileSync(source, "utf8");
function formJSX(text, name) {
	const ast = ts.createSourceFile(
		"screen.tsx",
		text,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const fn = ast.statements.find(
		(n) => ts.isFunctionDeclaration(n) && n.name?.text === name,
	);
	assert.ok(fn);
	const expression = fn.body.statements
		.filter(ts.isReturnStatement)
		.at(-1).expression;
	const transformed = ts.transform(expression, [
		(context) => {
			const visit = (n) => {
				if (ts.isJsxAttribute(n)) {
					if (n.name.getText(ast) === "disabled") {
						assert.equal(n.getText(ast), "disabled={isSaved}");
						return undefined;
					}
					if (
						n.name.getText(ast) === "onPress" &&
						n.getText(ast).includes("form.handleSubmit")
					) {
						assert.equal(
							n.getText(ast),
							name === "AccountForm"
								? "onPress={() => form.handleSubmit(onSubmit)()}"
								: "onPress={form.handleSubmit(onSubmit)}",
						);
						return undefined;
					}
				}
				return ts.visitEachChild(n, visit, context);
			};
			return (node) => ts.visitNode(node, visit);
		},
	]);
	const printed = ts
		.createPrinter({ removeComments: true })
		.printNode(ts.EmitHint.Expression, transformed.transformed[0], ast);
	transformed.dispose();
	const scanner = ts.createScanner(
			ts.ScriptTarget.Latest,
			true,
			ts.LanguageVariant.JSX,
			printed,
		),
		tokens = [];
	for (
		let k = scanner.scan();
		k !== ts.SyntaxKind.EndOfFileToken;
		k = scanner.scan()
	)
		tokens.push([k, scanner.getTokenText()]);
	return tokens;
}
assert.deepEqual(
	formJSX(before, "AccountModifyScreen"),
	formJSX(after, "AccountForm"),
);
const results = read("final.json"),
	quality = read("quality.json"),
	baseline = read("baseline.json");
assert.equal(results.failed, 0);
assert.equal(results.passed, 38);
assert.deepEqual(results.errors, []);
assert.ok(quality.checks.every((c) => c.status === 0));
assert.deepEqual(quality.diagnostics, []);
for (const file of results.files)
	assert.equal(sha(file.file), file.sha256, file.file);
const runtime = ["react-hook-form", "@hookform/resolvers/zod", "zod"].map(
	(name) => ({
		name,
		file: require.resolve(name),
		sha256: sha(require.resolve(name)),
	}),
);
for (const name of ["react", "react-test-renderer"]) {
	const file = require.resolve(
		path.resolve(".expo/senior7-test-tools/node_modules", name),
	);
	runtime.push({ name, file, sha256: sha(file) });
}
const shared = ["account-detail/check.cjs", "account-detail/quality.cjs"].map(
	(file) => ({ file, sha256: sha(path.join(__dirname, "..", file)) }),
);
const artifacts = fs
	.readdirSync(__dirname)
	.filter((n) => n !== "verification.json")
	.sort()
	.map((file) => ({ file, sha256: sha(path.join(__dirname, file)) }));
const result = {
	date: "2026-10-09",
	ticket: "ACCOUNT-FORM-001",
	status: "READY_FOR_QA",
	source: { file: source, sha256: sha(source) },
	baseline: { passed: baseline.passed, failed: baseline.failed },
	checks: {
		passed: results.passed,
		failed: 0,
		runtimeErrors: 0,
		quality:
			"ESLint/Biome/diff exit 0; root screen/dependency TypeScript 0 diagnostic",
	},
	existingFormJSXUnchangedExceptSubmitAndDisabled: true,
	dependencies: results.files,
	runtime,
	sharedHarnesses: shared,
	artifacts,
	limits: results.limits,
};
fs.writeFileSync(
	path.join(__dirname, "verification.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(
	JSON.stringify({ source: result.source, assertions: results.passed }),
);
