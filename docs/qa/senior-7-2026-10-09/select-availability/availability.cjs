const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { React, act, create, errors, loadComponent, makeClock } = require("../barcode-lifecycle.cjs");
const sourceFile = "components/common/SingleSelect.tsx";
const fingerprint = file => ({ file, sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") });
const checks = [];
function record(name, actual, expected) {
	try { assert.deepEqual(actual, expected); checks.push({ name, pass: true }); }
	catch { checks.push({ name, pass: false, actual: structuredClone(actual), expected: structuredClone(expected) }); }
}
const items = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }, { value: "c", label: "Gamma", disabled: true }];
function controls(renderer) {
	const rows = () => renderer.root.findAllByType("BouncyPressable").slice(1);
	const trigger = () => renderer.root.findAllByType("BouncyPressable")[0];
	const save = () => renderer.root.findAllByType("Pressable")[1];
	return {
		rows, trigger, save,
		open: () => act(async () => trigger().props.onPress()),
		choose: label => act(async () => rows().find(r => r.findAllByType("Text")[0].props.children === label).props.onPress()),
		confirm: () => act(async () => save().props.onPress()),
		cancel: () => act(async () => renderer.root.findByType("Actionsheet").props.onClose()),
		isOpen: () => renderer.root.findByType("Actionsheet").props.isOpen,
		selected: () => rows().filter(r => r.props.className.includes("border-primary ")).map(r => r.findAllByType("Text")[0].props.children),
	};
}
async function fixture(extra = {}) {
	const clock = makeClock(), changes = [];
	const Component = loadComponent(sourceFile, clock);
	let props = { items, value: "a", onValueChange: v => changes.push(v), showConfirmButton: true, ...extra }, renderer;
	await act(async () => { renderer = create(React.createElement(Component, props)); });
	return { ...controls(renderer), changes, clock,
		update: patch => act(async () => { props = { ...props, ...patch }; renderer.update(React.createElement(Component, props)); }),
		unmount: () => act(async () => renderer.unmount()),
	};
}
async function main() {
	const before = fingerprint(sourceFile);
	let f = await fixture();
	await f.open(); await f.choose("Beta"); await f.update({ disabled: true });
	record("disabled while open disables every option", f.rows().every(r => r.props.disabled === true), true);
	record("disabled while open disables confirmation", f.save().props.disabled, true);
	await f.choose("Alpha");
	record("disabled option handler preserves pending draft", f.selected(), ["Beta"]);
	await f.confirm();
	record("disabled confirmation cannot emit draft", f.changes, []);
	record("disabled confirmation preserves sheet for cancel or reenable", f.isOpen(), true);
	await f.update({ disabled: false }); await f.confirm();
	record("reenabling can confirm preserved draft", f.changes, ["b"]);
	await f.open(); await f.update({ disabled: true }); await f.cancel();
	record("cancel remains usable while disabled", f.isOpen(), false);
	await f.unmount();

	for (const dismissOnSelect of [true, false]) {
		f = await fixture({ showConfirmButton: false, dismissOnSelect });
		await f.open(); await f.update({ disabled: true }); await f.choose("Beta");
		record(`immediate mode disabled blocks callback (dismiss=${dismissOnSelect})`, f.changes, []);
		record(`disabled action schedules no dismiss timer (dismiss=${dismissOnSelect})`, f.clock.pending(), 0);
		await f.update({ disabled: false }); await f.choose("Beta");
		record(`reenabling restores immediate selection (dismiss=${dismissOnSelect})`, f.changes, ["b"]);
		await f.unmount();
	}
	for (const kind of ["removed", "disabled"]) {
		f = await fixture(); await f.open(); await f.choose("Beta");
		await f.update({ items: kind === "removed" ? [items[0]] : items.map(i => i.value === "b" ? { ...i, disabled: true } : i) });
		record(`${kind} draft disables confirmation`, f.save().props.disabled, true);
		await f.confirm();
		record(`${kind} draft cannot emit stale value`, f.changes, []);
		record(`${kind} draft keeps sheet available for another choice`, f.isOpen(), true);
		await f.choose("Alpha"); await f.confirm();
		record(`${kind} draft can be replaced with an available option`, f.changes, ["a"]);
		await f.unmount();
	}
	f = await fixture(); await f.open(); await f.choose("Beta");
	await f.update({ items: items.map(i => ({ ...i, label: `${i.label} updated` })) });
	record("same values on refetch preserve draft", f.selected(), ["Beta updated"]);
	await f.confirm(); record("refreshed valid draft commits its value", f.changes, ["b"]);
	await f.unmount();
	f = await fixture({ items: [{ value: 0, label: "Zero" }], value: 0 });
	await f.open(); await f.confirm(); record("zero remains a valid confirm value", f.changes, [0]); await f.unmount();
	record("no runtime errors or act warnings", errors, []);
	record("source stable during checks", fingerprint(sourceFile).sha256, before.sha256);
	const result = { status: checks.every(c => c.pass) ? "PASS" : "FAIL", passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length, checks, source: before, scope: "Production SingleSelect with React test renderer and host UI adapters; not native UI." };
	fs.writeFileSync(path.join(__dirname, process.argv.includes("--baseline") ? "baseline-results.json" : "availability-results.json"), JSON.stringify(result, null, 2) + "\n");
	console.log(JSON.stringify(result, null, 2));
	if(result.failed) process.exitCode = 1;
}
module.exports = { controls, fingerprint, record, checks, items };
if(require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
