const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const appRoot = path.resolve(__dirname, "../../../..");
const out = __dirname;
const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const sources = [
	"components/feature/manage/roles/RoleDetailScreen.tsx",
	"components/feature/manage/workers/WorkerDetailScreen.tsx",
	"components/feature/manage/member/MemberDetailScreen.tsx",
];
const contracts = [
	"hooks/useAlertModal.ts",
	"components/feature/manage/roles/RoleDeleteDialog.tsx",
	"components/feature/manage/workers/WorkerDeleteDialog.tsx",
	"components/feature/manage/member/MemberDeleteDialog.tsx",
	"components/feature/manage/roles/RoleWorkers.tsx",
	"api/hooks/roles.ts",
	"api/hooks/workers.ts",
	"api/hooks/customers.ts",
	"api/factory.ts",
	"app/(no-layout)/(back-office)/manage/roles/detail.tsx",
	"app/(no-layout)/manage/workers/detail.tsx",
	"app/(no-layout)/manage/member/detail.tsx",
	"components/common/AlertModal.tsx",
	"components/common/DeleteConfirmModal.tsx",
	"components/common/SuccessModal.tsx",
	"lib/manage/roles.ts",
	"lib/manage/workers.ts",
	"lib/manage/members.ts",
];
const output = path.join(out, "baseline-capture.json");
if (fs.existsSync(output)) throw new Error("Baseline capture is frozen; do not overwrite.");
fs.mkdirSync(path.join(out, "before"), { recursive: true });
const sourceHashes = Object.fromEntries(sources.map((source) => {
	const bytes = fs.readFileSync(path.join(appRoot, source));
	fs.writeFileSync(path.join(out, "before", path.basename(source)), bytes);
	return [source, hash(bytes)];
}));
const contractHashes = Object.fromEntries(contracts.map((source) => [
	source, hash(fs.readFileSync(path.join(appRoot, source))),
]));
const result = {
	status: "READ_ONLY_BASELINE_CAPTURE",
	externalQcApproval: false,
	capturedAt: new Date().toISOString(),
	sourceHashes,
	contractHashes,
	figmaCallableTools: [],
	observedRisk: "Parent detail modal and Role permission search have no identity boundary when route id changes; keyed delete child receives retained parent openState.",
	limitations: "No application/source/shared/frozen edits. Contracts captured for independent reviewer checks; browser/native/API not exercised.",
};
fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
