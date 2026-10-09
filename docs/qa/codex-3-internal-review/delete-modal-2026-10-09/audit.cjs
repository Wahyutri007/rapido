const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const appRoot = path.resolve(__dirname, "../../../..");
const ts = require(path.join(appRoot, "node_modules/typescript"));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const expectedBaseline = "d5f8562ea6e29266ee89a5f5c1d3dc60682f8b4a7a1a473b632cf8b85b6117a0";
const target = "components/common/DeleteConfirmModal.tsx";
const source = fs.readFileSync(path.join(appRoot, target));
if (hash(source) !== expectedBaseline) throw new Error("Baseline changed before snapshot: do not retrofit audit");
if (fs.existsSync(path.join(__dirname, "audit-before.json"))) throw new Error("Baseline audit already frozen");

const usages = [];
function scan(folder) {
	for (const entry of fs.readdirSync(path.join(appRoot, folder), { withFileTypes: true })) {
		const relative = path.posix.join(folder, entry.name);
		if (entry.isDirectory()) scan(relative);
		else if (/\.tsx$/.test(relative)) {
			const bytes = fs.readFileSync(path.join(appRoot, relative));
			const text = bytes.toString("utf8");
			if (!text.includes("DeleteConfirmModal")) continue;
			const sf = ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
			function walk(node) {
				if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(sf) === "DeleteConfirmModal") {
					const props = Object.fromEntries(node.attributes.properties.map((attribute) => ts.isJsxAttribute(attribute) ? [attribute.name.getText(sf), attribute.initializer?.getText(sf) ?? "true"] : ["spread", attribute.getText(sf)]));
					usages.push({ file: relative, sha256: hash(bytes), line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, props });
				}
				ts.forEachChild(node, walk);
			}
			walk(sf);
		}
	}
}
scan("app");
scan("components");
const propCounts = {};
for (const usage of usages) for (const prop of Object.keys(usage.props)) propCounts[prop] = (propCounts[prop] ?? 0) + 1;
const imagePath = "assets/images/illustrations/delete-confirmation.png";
const image = fs.readFileSync(path.join(appRoot, imagePath));
const audit = {
	status: "INTERNAL_QA_REVIEW",
	phase: "before-parent-edit",
	reviewer: "/root/audit_delete_modal",
	scope: "Read-only source/caller/geometry audit; artifacts only in this packet",
	source: { path: target, sha256: hash(source) },
	usages: usages.length,
	files: new Set(usages.map((usage) => usage.file)).size,
	propCounts,
	defaultImage: { path: imagePath, sha256: hash(image), width: image.readUInt32BE(16), height: image.readUInt32BE(20) },
	findings: [
		"Width is computed from Dimensions.get(screen) with no dimension subscription; window-vs-screen and open-modal resize need browser reproduction.",
		"Image uses h-44/w-full className with no explicit style; default asset intrinsic dimensions are 708x490, requiring its own baseline rather than reusing SuccessModal measurements.",
		"Footer has two flex-1 button groups; do not copy SuccessModal's single-action footer structure.",
		"All actual descriptions are strings/template strings; no caller overrides image/message/cancelText/confirmText or spreads props.",
		"Loading disables both buttons, while Modal onClose remains available; geometry delta should preserve existing close semantics, not introduce lifecycle changes.",
	],
	recommendedDelta: ["Replace Dimensions import with useWindowDimensions", "Read width via useWindowDimensions at component top", "Retain width-32/maxWidth380 using window width", "Add Image style height176/width100% preserving contain"],
	limits: ["No browser/Metro/backend/native/Figma or full TypeScript executed by internal reviewer", "Not external QC approval", "No source edits; source diff was empty before capture", "No active DeleteConfirmModal implementation claim observed before parent SD3-008 scope"],
	callers: usages,
};
fs.writeFileSync(path.join(__dirname, "audit-before.json"), `${JSON.stringify(audit, null, 2)}\n`);
fs.writeFileSync(path.join(__dirname, "DeleteConfirmModal.before.tsx.txt"), source);
console.log(JSON.stringify({ status: audit.status, phase: audit.phase, usages: audit.usages, files: audit.files, sourceHash: audit.source.sha256 }));
