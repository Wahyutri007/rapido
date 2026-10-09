const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const files = ["components/feature/manage/roles/RoleDetailScreen.tsx", "components/feature/manage/workers/WorkerDetailScreen.tsx", "components/feature/manage/member/MemberDetailScreen.tsx"];
assert(!fs.existsSync(path.join(__dirname, "inputs-before.json")), "Preserve original baseline");
for (let index = 0; index < files.length; index++) fs.copyFileSync(files[index], path.join(__dirname, ["role", "worker", "member"][index] + ".before.tsx.txt"));
const contracts = ["components/feature/manage/roles/RoleDeleteDialog.tsx", "components/feature/manage/workers/WorkerDeleteDialog.tsx", "components/feature/manage/member/MemberDeleteDialog.tsx", "components/common/AlertModal.tsx", "components/common/SuccessModal.tsx", "components/common/DeleteConfirmModal.tsx", "hooks/useAlertModal.ts", "api/hooks/roles.ts", "api/hooks/workers.ts", "api/hooks/customers.ts", "api/factory.ts", "api/common.ts", "lib/api-utils.ts", "package.json", "package-lock.json", "tsconfig.json"];
fs.writeFileSync(path.join(__dirname, "inputs-before.json"), JSON.stringify({ sourceHashes: Object.fromEntries(files.map((file) => [file, hash(file)])), contractHashes: Object.fromEntries(contracts.map((file) => [file, hash(file)])), sourceScope: "Three detail components only; contracts read-only" }, null, 2) + "\n");
console.log("Captured three detail baselines and read-only contracts");
