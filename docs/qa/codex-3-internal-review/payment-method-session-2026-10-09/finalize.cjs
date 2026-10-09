const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../../../..");
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const manifestPath = path.join(__dirname, "verification.json");
const readJson = (absolute) => JSON.parse(fs.readFileSync(absolute, "utf8"));
if (process.argv.includes("--finalize")) {
	if (fs.existsSync(manifestPath)) throw new Error("Review packet already sealed; no overwrite");
	const results = readJson(path.join(__dirname, "results.json"));
	const qualityPath = "docs/qa/codex-3/payment-method-session/quality-results.json";
	const quality = readJson(path.join(root, qualityPath));
	if (results.status !== "INTERNAL_QA_REVIEW_PASS" || results.fail !== 0 || results.errors.length || results.warnings.length) throw new Error("Cannot seal failing internal review as PASS");
	if (Object.keys(quality.sourceHashes).length !== 10 || quality.status !== "PASS") throw new Error("Expected stable ten-source developer quality packet");
	const sourceHashes = { ...results.sourceHashes, ...quality.sourceHashes };
	for (const [file, hash] of Object.entries(sourceHashes)) {
		if (sha(fs.readFileSync(path.join(root, file))) !== hash) throw new Error(`Source drift before final freeze: ${file}`);
		if (results.sourceHashes[file] && results.sourceHashes[file] !== hash) throw new Error(`Test loaded an older source: ${file}`);
	}
	const inputs = ["node_modules/react/package.json", "node_modules/react-hook-form/package.json", "node_modules/zod/package.json", "node_modules/zustand/package.json", "node_modules/typescript/package.json", ".expo/senior7-test-tools/node_modules/react/package.json", ".expo/senior7-test-tools/node_modules/react-test-renderer/package.json", "node_modules/@hookform/resolvers/package.json"].map((file) => ({ path: file, sha256: sha(fs.readFileSync(path.join(root, file))) }));
	const report = `# SD3-013 Metode Pembayaran internal QA\n\nStatus **INTERNAL_QA_REVIEW_PASS**, external QC approval **false**. Scope sepuluh source frontend Manage Metode Pembayaran, source final sesuai quality developer. Form final \`${quality.sourceHashes["components/feature/manage/settings/PaymentMethodModifyScreen.tsx"]}\`; SuccessModal dependency actual7508 \`${results.sourceHashes["components/common/SuccessModal.tsx"]}\`. Semua hash per file tersedia dalam verification.json.\n\n45/45 pemeriksaan independen lulus; runtime/React/act errors0 dan warning0. Enam belas modul produksi dimuat: schema/store, modify/index route, list/detail/form/delete/notfound, shared Form/useAlertModal/three modals/ManageListActions serta bank options. RHF/Zod/Zustand nyata dengan React StrictMode; RN/UI/primitive/router/dimensions/picker adapters. Paket input source dan package difingerprint. Tidak mengulang suite55 developer yang stabil; hasil ini45 terpisah dengan cakupan berulang.\n\nTemuan awal UI fee create kosong vs RHF0 telah diperbaiki implementer menjadi visible0 sesuai policy nonnegative. Final suite membuktikan zero fee eksplisit valid dan input yang sengaja dikosongkan invalid, serta decimal comma1.25 dipertahankan. Tidak ada temuan correctness baru dari cakupan ini.\n\nSchema: nama/account/bank trim, bank lower-case empat opsi valid, unsupported type/admin/bank ditolak, fee negative/NaN/±Infinity ditolak, percentage100 diterima dan100.01 ditolak, nominal5000 valid, leading zero rekening terjaga. Bank selalu wajib karena satu-satunya type yang ditawarkan ialah bank_transfer; tidak mengasumsikan conditional type lain yang belum dibuat.\n\nStore: initialempty tanpa dummy, add menghasilkan ID berbeda, invalid add/update tidak mutasi, missing update ditolak, update/delete exactID terisolasi, remove sekali, deleted ID tidak dipakai lagi. Source tidak mengimpor persist/API. Data schema diperiksa lagi sebelum masuk store.\n\nFlow renderer: rapid RHF submit dua callback hanya menyimpan satu item; success acknowledgement navigasi sekali; callback submit yang disimpan lalu dijalankan setelah route unmount tidak menambah record. ArrayID pertama tepat, unrelated store update menjaga draft, pergantian ID/edit->create reset keyed form. Detail menunjukkan rekening/fee tepat, delete exactA tidak mengenaiB, success tetap dapat diakui setelah recordgone, acknowledgement sekali, missingID tidak fallback akun/metode pertama. Listempty, CTA metode pembayaran, trimmed bank search dan hasil kosong teruji.\n\nStatic audit empat route/layout menempatkan header di layout, detail/edit/hapus memakai route sendiri dan IDs sesi. UI source memakai shared semantic components; saldo/fee/bank hanya metadata sesi, bukan mapping transaksi atau kontrak bank backend. Developer quality10source lint/Biome/diff/type0 ditinjau per hash tanpa rerun full TS. Pembatasan sementara/nontransaction ada pada list/form/detail/success; reload aplikasi tidak dipromosikan sebagai persistence.\n\nTidak disertifikasi: browser/native/HP/keyboard/accessibility/Figma/full auth/router/allapp/realAPI/storage/backend/cashiertransactionbinding. Figma callable tidak tersedia pada review. Adapter footer/sheet/list tidak membuktikan pixel/gesture geometry. Tidak ada app/shared/frozen packet edit, dependency install, HTTP/server/Metro/HP/backend/full TS atau operasi Git mutation oleh reviewer. QC eksternal dan PM publikasi tetap gate masing-masing.\n\nExecution Profile & Operator Tips: Medium. Cocokkan sepuluh final source dan loaded dependencies -> independent session/RHF checks -> QA/QC interaction/visual -> PM gate. Jangan menambahkan dummy, mengklaim temporary CRUD sebagai backend/persist, atau menutup finding QC shared dari packet ini.\n`;
	const readableReport = report
		.replaceAll("actual7508", "7508 yang aktual")
		.replaceAll("errors0", "error 0")
		.replaceAll("warning0", "warning 0")
		.replaceAll("suite55", "suite 55")
		.replaceAll("ini45", "ini 45")
		.replaceAll("RHF0", "RHF 0")
		.replaceAll("visible0", "nilai 0 yang terlihat")
		.replaceAll("decimal comma1.25", "angka desimal 1,25 menjadi 1.25")
		.replaceAll("percentage100", "persentase 100")
		.replaceAll("dan100.01", "dan 100.01")
		.replaceAll("nominal5000", "nominal 5000")
		.replaceAll("initialempty", "awalnya kosong")
		.replaceAll("exactID", "ID yang tepat")
		.replaceAll("ArrayID", "ID dari array parameter")
		.replaceAll("edit->create", "edit ke tambah")
		.replaceAll("exactA", "ID A")
		.replaceAll("mengenaiB", "mengenai B")
		.replaceAll("recordgone", "record terhapus")
		.replaceAll("missingID", "ID yang tidak ditemukan")
		.replaceAll("Listempty", "Daftar kosong")
		.replaceAll("quality10source", "quality sepuluh source")
		.replaceAll("type0", "type 0 diagnostic")
		.replaceAll("nontransaction", "belum terhubung ke transaksi")
		.replaceAll("allapp", "seluruh aplikasi")
		.replaceAll("realAPI", "API nyata")
		.replaceAll("cashiertransactionbinding", "integrasi transaksi kasir");
	fs.writeFileSync(path.join(__dirname, "REPORT.md"), readableReport);
	const artifacts = [];
	function walk(directory) {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const absolute = path.join(directory, entry.name);
			if (entry.isDirectory()) walk(absolute);
			else if (absolute !== manifestPath) artifacts.push({ path: path.relative(__dirname, absolute).replaceAll("\\", "/"), sha256: sha(fs.readFileSync(absolute)) });
		}
	}
	walk(__dirname);
	const manifest = {
		status: "INTERNAL_QA_REVIEW_PASS", internalReviewOnly: true, externalQcApproval: false, reviewer: "/root/audit_alert_modal", scope: "SD3-013 payment-method-session", createdAt: new Date().toISOString(),
		checks: { passed: results.pass, failed: results.fail, runtimeErrors: results.errors.length, runtimeWarnings: results.warnings.length },
		sourceHashes: quality.sourceHashes, loadedProductionSourceHashes: results.sourceHashes,
		sourceFingerprints: Object.entries(sourceHashes).map(([file, sha256]) => ({ path: file, sha256 })), runtimeInputs: inputs,
		developerQualityReviewed: { path: qualityPath, sha256: sha(fs.readFileSync(path.join(root, qualityPath))), sourceCount: 10, lint: quality.lint.exitCode, biome: quality.biome.exitCode, diff: quality.diff.exitCode, typeDiagnostics: quality.diagnostics.length, rerunByReviewer: false },
		findings: [{ id: "SD3-013-INTERNAL-FEE-001", status: "ADDRESSED_BEFORE_FINAL_REVIEW", detail: "Create fee text now explicit0 consistent with RHF0; clear input invalid; no source edits by reviewer" }],
		artifacts, limits: results.limits,
	};
	fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
const manifest = readJson(manifestPath), mismatches = [];
for (const entry of [...manifest.sourceFingerprints, ...manifest.runtimeInputs]) {
	const actual = sha(fs.readFileSync(path.join(root, entry.path)));
	if (actual !== entry.sha256) mismatches.push({ type: "source/runtime", ...entry, actual });
}
for (const entry of manifest.artifacts) {
	const actual = sha(fs.readFileSync(path.join(__dirname, entry.path)));
	if (actual !== entry.sha256) mismatches.push({ type: "artifact", ...entry, actual });
}
console.log(JSON.stringify({ status: manifest.status, externalQcApproval: false, checks: manifest.checks, applicationSourceCount: Object.keys(manifest.sourceHashes).length, productionSourceChecks: manifest.sourceFingerprints.length, runtimeInputChecks: manifest.runtimeInputs.length, artifactChecks: manifest.artifacts.length, mismatches }, null, 2));
if (mismatches.length) process.exitCode = 1;
