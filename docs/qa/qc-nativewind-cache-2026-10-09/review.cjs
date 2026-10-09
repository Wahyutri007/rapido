const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "../../..");
const handoff = path.join(root, "docs/qa/senior-7-2026-10-09/startup");
const manifest = JSON.parse(fs.readFileSync(path.join(handoff, "verification.json"), "utf8"));
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
const exact = [...manifest.files, manifest.dependency, ...manifest.evidence];
for (const entry of exact) assert.equal(hash(entry.file), entry.sha256, `handoff fingerprint ${entry.file}`);
const extra = [
  "tailwind.config.js",
  "node_modules/nativewind/dist/metro/index.js",
  "node_modules/expo-router/build/useScreens.js",
  "app/(no-layout)/_layout.tsx",
  "app/(no-layout)/catalog/_layout.tsx",
  "app/(no-layout)/(cashier)/catalog/_layout.tsx",
];
const snapshot = Object.fromEntries([...exact.map((entry) => entry.file), ...extra].map((file) => [file, hash(file)]));
const cache = "node_modules/react-native-css-interop/.cache/android.js";
const bytes = fs.readFileSync(path.join(root, cache));
const result = {
  recordedAt: new Date().toISOString(),
  status: "PASS",
  phase: process.argv[2] || "before",
  fingerprints: snapshot,
  currentAndroidCache: {
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    hasClassDarkFlag: bytes.includes(Buffer.from("class dark")),
  },
};
assert.ok(result.currentAndroidCache.bytes > 0, "active Android cache populated");
assert.equal(result.currentAndroidCache.hasClassDarkFlag, true, "active Android cache has class dark flag");
if (result.phase === "after") {
  const before = JSON.parse(fs.readFileSync(path.join(__dirname, "review-before.json"), "utf8"));
  assert.deepEqual(snapshot, before.fingerprints, "source/dependency/handoff fingerprints unchanged during QC");
}
fs.writeFileSync(path.join(__dirname, `review-${result.phase}.json`), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ status: result.status, phase: result.phase, fingerprints: Object.keys(snapshot).length, currentAndroidCache: result.currentAndroidCache }));
