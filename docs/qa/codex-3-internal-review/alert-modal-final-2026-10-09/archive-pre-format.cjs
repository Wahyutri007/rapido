const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const archive = path.join(__dirname, "pre-format");
if (fs.existsSync(path.join(__dirname, "verification.json"))) throw new Error("Already finalized; cannot archive outputs");
if (fs.existsSync(archive)) throw new Error("Pre-format archive exists; refuse overwrite");
const names = ["results.json", "alias-proof.json", "AlertModal.final.tsx.txt"];
const snapshot = Object.fromEntries(names.map((name) => [name, hash(fs.readFileSync(path.join(__dirname, name)))]));
fs.mkdirSync(archive);
for (const name of names) {
	const original = path.join(__dirname, name), destination = path.join(archive, name);
	if (!original.startsWith(`${__dirname}${path.sep}`) || !destination.startsWith(`${__dirname}${path.sep}`)) throw new Error("Archive outside own review packet");
	fs.renameSync(original, destination);
	if (hash(fs.readFileSync(destination)) !== snapshot[name]) throw new Error(`Archive hash mismatch ${name}`);
}
fs.writeFileSync(path.join(archive, "archive.json"), `${JSON.stringify({ status: "PREFORMAT_RESULTS_RETAINED", sourceHash: "3323ecad7976ed6f88c76d353f8cd392c70541fbc820721cd696f09ac2be7a95", reason: "Parent Biome requires multiline function signature; these60renderer+4proof outputs precede formatter delta, not final approval", artifacts: snapshot }, null, 2)}\n`);
console.log(JSON.stringify({ archive, moved: names.length, fingerprintsPreserved: true }, null, 2));
