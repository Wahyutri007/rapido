// Curated evidence snapshot for the user's progress report. No app mutation.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const out = __dirname;
const items = [];
const add = (status, name, owner, note, evidence, decision) => items.push({ id: items.length + 1, status, name, owner, note, evidence, decision });
const qa = "docs/qa/";
add("done", "Member — lifecycle editor", "Codex-3 / QC", "Temuan identitas editor dan respons lama ditutup; 98 eksekusi assertion QC lulus.", qa + "qc-member-2026-10-09/recheck/REPORT.md", qa + "qc-member-2026-10-09/recheck/DECISION.json");
add("done", "Katalog — memoization 3 detail", "Senior 8 / QC", "Delta detail bundling, extra-menu dan menu lulus dalam paket QC Senior 8.", qa + "qc-senior8-2026-10-09/REPORT.md", qa + "qc-senior8-2026-10-09/DECISION.json");
add("done", "Saldo akun — AccountBalanceCard", "Senior 8 / QC", "Sinkronisasi saldo/draft lulus QC; bagian dari paket 72 assertion, bukan 72 khusus kartu.", qa + "qc-senior8-2026-10-09/REPORT.md", qa + "qc-senior8-2026-10-09/DECISION.json");
add("done", "Printer — lifecycle pengaturan", "Senior 6 / QC", "Delta lifecycle lulus; printer fisik dan applyTo tetap di luar persetujuan.", qa + "qc-sd6-2026-10-09/recheck/REPORT.md", qa + "qc-sd6-2026-10-09/recheck/DECISION.json");
add("done", "Pembulatan — kontrak pangkat", "Senior 6 / QC", "P1 nominal/pangkat ditutup; payload dan CartPricingService produksi diperiksa tanpa mutasi DB.", qa + "qc-sd6-2026-10-09/recheck/REPORT.md", qa + "qc-sd6-2026-10-09/recheck/DECISION.json");
add("done", "Barcode — picker/cetak/jumlah", "Senior 7 / QC", "ProductPicker, Print dan Incrementer lulus 105 assertion; cetak fisik belum disahkan.", qa + "qc-barcode-2026-10-09/REPORT.md", qa + "qc-barcode-2026-10-09/DECISION.json");
add("done", "Picker bersama — pilih dan urut", "Senior 7 / QC", "SingleSelect/SortActionSheet lulus 111 assertion; batas native/accessibility tetap berlaku.", qa + "qc-pickers-2026-10-09/REPORT.md", qa + "qc-pickers-2026-10-09/DECISION.json");
add("done", "Onboarding dan transisi mode", "Senior 5 / QC", "SD5-001 lulus 81 assertion; boot/auth SD5-002 merupakan paket terpisah.", qa + "qc-sd5-2026-10-09/REPORT.md", qa + "qc-sd5-2026-10-09/DECISION.json");
add("done", "CardList — filter laporan", "Senior 7 / QC", "Filter sheet/hook dan 7 pemanggil lulus 125 assertion; nominal laporan tidak disahkan.", qa + "qc-cardlist-2026-10-09/REPORT.md", qa + "qc-cardlist-2026-10-09/DECISION.json");

add("ready", "Migrasi SDK57 / snapshot integrasi", "Senior 5 / PM", "Branch integrasi tersedia; penerimaan QC independen dan gate main masih diperlukan.", "docs/SDK57_UPGRADE.md");
add("ready", "Pendapatan / penerimaan", "Developer modul / QA-QC", "UI/model memiliki bukti pembuat; API/persistensi/jurnal otomatis belum terhubung.", "docs/previews/income/README.md");
add("ready", "Biaya / pengeluaran", "Developer modul / QA-QC", "UI/model tersedia pada state contoh; menunggu review independen dan integrasi nyata.", "docs/previews/expenses/README.md");
add("ready", "Inventory — 5 alur yang terhubung", "Developer Inventory / QA-QC", "Hub/summary/transfer/adjustment/purchase memiliki pratinjau; backend/native belum disahkan.", "docs/previews/inventory/README.md");
add("ready", "Pemasok / kaitan pembelian", "Developer Inventory / QA-QC", "Alur pratinjau selesai; data sesi dan wilayah terbatas, belum persistensi backend.", "docs/previews/inventory/suppliers/README.md");
add("ready", "Bantuan — FAQ/feedback/fitur", "Codex-3 / QA-QC", "Handoff tersedia; API dan lampiran mengikuti batas laporan, belum QC independen terbaru.", "docs/SUPPORT_UI_PROGRESS.md");
add("ready", "Role / hak akses", "Codex-3 / QA-QC", "CRUD dan bukti API tersedia; cocokkan backend dan lakukan QC independen sebelum publikasi.", "docs/ROLES_UI_PROGRESS.md");
add("ready", "Karyawan", "Codex-3 / QA-QC", "UI/router/API memiliki bukti pembuat; audit independen/source backend masih diperlukan.", "docs/WORKERS_UI_PROGRESS.md");
add("ready", "Manajemen Tempat / denah", "Developer modul / PM-QC", "UI/model tersedia; fix Reanimated sudah dicek PM, fitur/native penuh belum disahkan.", "docs/previews/place/README.md");
add("ready", "Tampilan struk", "Developer modul / QA-QC", "Pratinjau/settings tersedia; belum API/persistensi perangkat/integrasi printer.", "docs/previews/receipt/README.md");
add("ready", "Target penjualan", "Developer modul / QA-QC", "UI/model tersedia; target masih contoh lokal, belum capaian transaksi nyata/persistensi.", "docs/previews/sales-target/README.md");
add("ready", "Batas Stok — kontrak ID/jenis", "Senior 6 / QA-QC", "SD6-002 source READY_FOR_QA; supplement Query/Axios masih dilengkapi, hash baru perlu QC.", qa + "senior-6-2026-10-09/stock-contract/HANDOFF.md");
add("ready", "Buku Besar — filter/total/periode", "Senior 8 / QA-QC", "Perbaikan QC-S8-LEGACY-001/002 READY_FOR_QA; belum keputusan QC pada delta baru.", qa + "senior-8-2026-10-09/ledger-filters/HANDOFF.md");
add("ready", "Startup HP — cache NativeWind", "Senior 7 / QA-QC", "Developer membuktikan 2 cold launch HP berhasil; guard cache baru menunggu QA/QC.", qa + "senior-7-2026-10-09/startup/HANDOFF.md");
add("ready", "Jurnal Umum / Penyesuaian", "Codex-3 / QA-QC", "Lifecycle SD3-002 dan validasi SD3-003 siap QA; gunakan supplement/hash terbaru.", qa + "codex-3/journal-validation/HANDOFF.md");
add("ready", "4 form Kelola / koreksi import", "Codex-3 / QC", "92 pemeriksaan browser lulus. P3 import sudah dikoreksi developer; QC recheck belum menutup temuan.", qa + "codex-3/manage-imports/HANDOFF.md");

add("active", "Payroll — router utama", "Senior 4", "IN_PROGRESS; verifikasi deep link, ID/periode, reload, pembayaran dan slip belum final.", qa + "payroll-navigation-2026-10-09/HANDOFF.md");
add("active", "Boot / tujuan auth", "Senior 5", "SD5-002 app/index.tsx IN_PROGRESS; belum handoff final yang ditemukan pada snapshot.", "docs/SESSION_COORDINATION.md");
add("active", "Buku Besar — alokasi ID", "Senior 8", "LEDGER-ID-001 IN_PROGRESS; perbaikan collision ID store belum handoff final pada snapshot.", "docs/SESSION_COORDINATION.md");

add("queued", "Tanggal Promo / Voucher", "PM / pemilik berikutnya", "WAITING_FOR_SOURCE_HANDOVER pada board; belum ada handoff final baru yang ditemukan.", "docs/PM_TASK_BOARD.md");
add("queued", "Choose-store / pemilihan toko", "PM / pemilik auth", "Antrean lanjutan; membutuhkan tiket/acknowledgment terpisah, belum klaim final pada snapshot.", qa + "senior-5-2026-10-09/HANDOFF.md");
for (const name of ["Bahan Baku", "Komposisi Produk", "Pembayaran Tagihan", "Riwayat Mutasi Stok", "Stok Akhir"]) {
	add("queued", "Inventory — " + name, "PM / developer Inventory", "Menu hub belum memiliki href. Alur ini belum terhubung; tidak menyimpulkan seluruh domain belum punya source.", "app/(back-office)/inventory/index.tsx");
}

const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const approved = {};
function decisions(file) {
	const d = JSON.parse(fs.readFileSync(file, "utf8"));
	const entries = d.files || d.sources;
	return Array.isArray(entries) ? Object.fromEntries(entries.map(item => [item.file, item.sha256])) : entries;
}
const s8 = decisions(qa + "qc-senior8-2026-10-09/DECISION.json");
for (const [file, expected] of Object.entries(s8)) if (!file.includes("general-ledger")) approved[file] = expected;
const s6 = decisions(qa + "qc-sd6-2026-10-09/recheck/DECISION.json");
for (const [file, expected] of Object.entries(s6)) if (!file.includes("stock-limit")) approved[file] = expected;
for (const folder of ["qc-barcode-2026-10-09", "qc-pickers-2026-10-09", "qc-sd5-2026-10-09", "qc-cardlist-2026-10-09"]) Object.assign(approved, decisions(qa + folder + "/DECISION.json"));
const member = JSON.parse(fs.readFileSync(qa + "qc-member-2026-10-09/recheck/DECISION.json", "utf8")).approvedDelta;
approved[member.file] = member.sha256;
const hashChecks = Object.entries(approved).map(([file, expected]) => ({ file, expected, actual: hash(file), matched: hash(file) === expected }));
if (hashChecks.some(item => !item.matched)) throw Error("Approved scope changed; reconcile report before export: " + hashChecks.filter(item => !item.matched).map(item => item.file));
const sources = [...new Set(["docs/SESSION_COORDINATION.md", "docs/PM_TASK_BOARD.md", "docs/PROJECT_MANAGER_REVIEW.md", "docs/PROJECT_CONTEXT.md", ...items.flatMap(item => [item.evidence, item.decision].filter(Boolean))])];
const counts = { done: 0, ready: 0, active: 0, queued: 0 };
for (const item of items) counts[item.status]++;
const total = items.length;
const report = {
	title: "Laporan Progres Pekerjaan Rapido",
	date: "2026-10-09",
	timezone: "Asia/Jakarta",
	snapshotUtc: new Date().toISOString(),
	snapshotWib: new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date()) + " WIB",
	author: "QC",
	gitHead: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
	method: "Curated list of documented feature/fix work packages; equal weight 1. Done requires explicit QC approval for the stated limited scope and current matching fingerprints. Older builder previews count as awaiting independent review, not certified READY_FOR_QA or production-ready. Unconnected Inventory menu flows are queued. Release/API/native/Figma gaps are reported separately and not included in this denominator.",
	counts,
	total,
	completed: counts.done,
	remaining: total - counts.done,
	completedPercent: +(100 * counts.done / total).toFixed(1),
	remainingPercent: +(100 * (total - counts.done) / total).toFixed(1),
	items,
	approvedSourceChecks: hashChecks,
	evidence: sources.map(file => ({ file, sha256: hash(file) })),
	globalCompletionPercent: null,
	globalCompletionReason: "No complete signed-off product WBS/effort baseline or final integration approval available. Counts do not measure total application completion, elapsed work hours, or release readiness.",
};
fs.writeFileSync(path.join(out, "status-snapshot.json"), JSON.stringify(report, null, 2) + "\n");
const csv = ["No;Paket;Status;Pemilik;Catatan;Bukti", ...items.map(item => [item.id, item.name, item.status, item.owner, item.note, item.evidence].map(value => '"' + String(value).replaceAll('"', '""') + '"').join(";"))].join("\r\n");
fs.writeFileSync(path.join(out, "Daftar-Pekerjaan-Rapido-2026-10-09.csv"), "\uFEFF" + csv);
console.log(JSON.stringify({ total, counts, completedPercent: report.completedPercent, remainingPercent: report.remainingPercent, approvedFingerprintsMatched: hashChecks.length, snapshot: report.snapshotWib }));
