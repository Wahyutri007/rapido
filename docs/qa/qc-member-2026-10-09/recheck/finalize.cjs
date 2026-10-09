// Final fingerprint check: fails if reviewed Member source changed during QC.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const out = __dirname;
const read = name => JSON.parse(fs.readFileSync(path.join(out, name), "utf8"));
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const handoff = read("handoff-verification.json");
for (const source of handoff.memberSource) {
	if (!source.matched || hash(source.file) !== source.actual) {
		throw Error("Member fingerprint changed: " + source.file);
	}
}
const suites = [
	["original-results.json", 27],
	["developer-rerun-results.json", 40],
	["independent-results.json", 23],
	["lifecycle-results.json", 8],
];
for (const [file, count] of suites) {
	const result = read(file);
	if (result.failed !== 0 || result.passed !== count || result.errors.length !== 0) {
		throw Error("Suite did not pass: " + file);
	}
}
const files = fs.readdirSync(out).filter(file => /\.(cjs|json|md)$/.test(file) && file !== "DECISION.json");
const editor = "components/feature/manage/member/MemberModifyScreen.tsx";
const decision = {
	signal: "QC-MEMBER-20261009-PASS-DELTA",
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	status: "PASS_DELTA_FOR_PM_REVIEW",
	closedFindings: ["QC-MEMBER-001", "QC-MEMBER-002"],
	approvedDelta: { file: editor, sha256: hash(editor), kind: "Editor identity/reset and late-response handling" },
	head: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
	reviewedMemberSource: Object.fromEntries(handoff.memberSource.map(item => [item.file, item.actual])),
	sourceStableThroughoutRecheck: true,
	suites: suites.map(([file, passed]) => ({ file, passed, failed: 0 })),
	assertionExecutions: 98,
	assertionCountNote: "Includes overlapping coverage across suites; not 98 distinct features.",
	quality: { scopedEslint: "exit 0; 14 files; 0 errors/warnings", scopedBiome: "exit 0; 14 files; no fixes", scopedDiffCheck: "exit 0" },
	developerRouter: { passed: 16, sourceFingerprintsMatched: 7, rerunByQC: false, expected422Logs: 1 },
	artefacts: Object.fromEntries(files.map(file => [file, hash(path.join(out, file))])),
	limitations: ["API/query/native UI adapters in QC suites", "Router browser evidence reviewed, not rerun by QC", "No native, full auth/root/SSR or real Laravel CRUD rerun", "No Figma parity verification", "Full TypeScript and integration gate remain with PM", "Other modules and shared primitive deltas require separate approval"],
	publication: "No QC commit/push; PM owns final integration and publication.",
};
fs.writeFileSync(path.join(out, "DECISION.json"), JSON.stringify(decision, null, 2) + "\n");
console.log(JSON.stringify({ signal: decision.signal, sha256: decision.approvedDelta.sha256, passed: 98, failed: 0, reviewedMemberFiles: handoff.memberSource.length }));
