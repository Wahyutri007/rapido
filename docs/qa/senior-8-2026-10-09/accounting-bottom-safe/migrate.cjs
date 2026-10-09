const fs = require("node:fs"),
	path = require("node:path"),
	ts = require("typescript"),
	crypto = require("node:crypto");
const root = "app/(no-layout)/(back-office)/report/accounting";
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const screens = [];
function walk(dir) {
	for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
		const file = dir + "/" + item.name;
		if (item.isDirectory()) walk(file);
		else if (
			file.endsWith(".tsx") &&
			/absolute bottom-0/.test(fs.readFileSync(file, "utf8"))
		)
			screens.push(file);
	}
}
walk(root);
if (fs.existsSync(path.join(__dirname, "migration.json")))
	throw Error("Already migrated; preserve before snapshots");
const changes = [];
function edit(file, modify) {
	const before = fs.readFileSync(file, "utf8");
	const after = modify(before);
	const snapshot = path.join(__dirname, "before", file + ".txt");
	fs.mkdirSync(path.dirname(snapshot), { recursive: true });
	fs.writeFileSync(snapshot, before);
	fs.writeFileSync(file, after);
	changes.push({
		file,
		before: hash(before),
		snapshot: path.relative(process.cwd(), snapshot).replaceAll("\\", "/"),
	});
}
for (const file of screens)
	edit(file, (before) => {
		const ast = ts.createSourceFile(
			file,
			before,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);
		const footers = [],
			scrollers = [];
		function visit(node) {
			if (ts.isJsxElement(node)) {
				const opening = node.openingElement;
				if (
					opening.tagName.getText(ast) === "View" &&
					opening.attributes.properties.some(
						(p) =>
							ts.isJsxAttribute(p) &&
							p.name.getText(ast) === "className" &&
							p.initializer &&
							ts.isStringLiteral(p.initializer) &&
							p.initializer.text.includes("absolute bottom-0"),
					)
				)
					footers.push(node);
				if (opening.tagName.getText(ast) === "ScrollView") scrollers.push(node);
			}
			ts.forEachChild(node, visit);
		}
		visit(ast);
		if (footers.length !== 1 || scrollers.length > 1)
			throw Error("Unexpected footer/scroll topology: " + file);
		const footer = footers[0],
			row = footer.openingElement.getText(ast).includes("flex-row");
		const edits = [
			[
				footer.openingElement.getStart(ast),
				footer.openingElement.end,
				row
					? '<BottomActionBar className="flex-row items-center gap-3">'
					: "<BottomActionBar>",
			],
			[
				footer.closingElement.getStart(ast),
				footer.closingElement.end,
				"</BottomActionBar>",
			],
		];
		if (scrollers[0])
			edits.push([
				scrollers[0].closingElement.getStart(ast),
				scrollers[0].closingElement.getStart(ast),
				"<BottomActionInset />\n",
			]);
		let after = before;
		for (const [start, end, value] of edits.sort((a, b) => b[0] - a[0]))
			after = after.slice(0, start) + value + after.slice(end);
		return (
			"import BottomActionBar" +
			(scrollers.length ? ", { BottomActionInset }" : "") +
			' from "@/components/common/BottomActionBar";\n' +
			after
		);
	});
for (const file of [
	"components/common/Wrapper.tsx",
	"components/common/AnimatedWrapper.tsx",
])
	edit(file, (before) => {
		const target = '{hasActionButton && <View className="h-32" />}';
		if (!before.includes(target)) throw Error("Spacer has changed: " + file);
		return (
			'import { BottomActionInset } from "@/components/common/BottomActionBar";\n' +
			before.replace(
				target,
				'{hasActionButton && <><View className="h-32" /><BottomActionInset /></>}',
			)
		);
	});
edit("components/feature/reports/ReportActionButton.tsx", (before) => {
	const ast = ts.createSourceFile(
		"report.tsx",
		before,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	let footer;
	function visit(node) {
		if (
			ts.isJsxElement(node) &&
			node.openingElement.tagName.getText(ast) === "View" &&
			node.openingElement.getText(ast).includes("absolute bottom-0")
		)
			footer = node;
		ts.forEachChild(node, visit);
	}
	visit(ast);
	if (!footer) throw Error("Report footer not found");
	return (
		'import BottomActionBar from "@/components/common/BottomActionBar";\n' +
		before.slice(0, footer.openingElement.getStart(ast)) +
		"<BottomActionBar bottomPadding={24} className={containerClassName}>" +
		before.slice(
			footer.openingElement.end,
			footer.closingElement.getStart(ast),
		) +
		"</BottomActionBar>" +
		before.slice(footer.closingElement.end)
	);
});
fs.writeFileSync(
	path.join(__dirname, "migration.json"),
	JSON.stringify({ screens, changes }, null, 2) + "\n",
);
console.log(JSON.stringify({ screens: screens.length, files: changes.length }));
