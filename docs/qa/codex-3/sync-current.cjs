const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const appRoot = process.cwd(), mainFile = path.join(__dirname, "verification.json"), main = read(mainFile);
const heightFile = "docs/qa/codex-3/success-modal-height/verification.json", paymentFile = "docs/qa/codex-3/payment-method-session/verification.json";
const height = read(heightFile), payment = read(paymentFile);
for (const packet of [height, payment]) for (const [file, expected] of Object.entries(packet.sourceHashes)) assert.equal(hash(file), expected, file);
function overlay(packet, file) {
	return { ticket: packet.ticket, status: packet.status, handoff: file.replace("verification.json", "HANDOFF.md"), manifest: file, manifestSha256: hash(file), sourceHashes: packet.sourceHashes, checks: packet.checks, internalReview: packet.internalReview ?? null, externalQcApproval: false, publicationOwner: "PM", limits: packet.limits };
}
main.currentSupplements.sharedSuccessModalHeight = overlay(height, heightFile);
main.currentSupplements.paymentMethodSession = overlay(payment, paymentFile);
const dependencyUpdate = { ticket: "SD3-012", sourceHashes: height.sourceHashes, manifest: heightFile, manifestSha256: hash(heightFile), currentSourceReplay: height.checks, scope: "Current SuccessModal7508 dependency; previous F90 packet assertions remain historical, current renderer evidence321 executions with overlapping coverage; external QC-SUCCESS-001 OPEN pending actual application/native recheck" };
for (const key of ["deleteLifecycle", "sharedSuccessModalSize", "sharedDeleteModalSize", "sharedAlertModalSize", "detailIdentity", "listActions"]) main.currentSupplements[key].currentDependencyUpdate = dependencyUpdate;
main.currentSupplements.manageFormsQC.paymentMethodSourceUpdate = { ticket: "SD3-013", manifest: paymentFile, manifestSha256: hash(paymentFile), sourceHashes: payment.sourceHashes, scope: "PaymentMethod now user-entered session CRUD; previous preview/editor QC approval applies only to historical exact hashes. Extra/OrderType/Tax previews unchanged. No API/persistence/transaction approval." };
main.currentStatus = "SD3-012 applied height correction READY_FOR_QC_RECHECK; QC-SUCCESS-001 remains OPEN. SD3-013 payment-method UI/session CRUD READY_FOR_QA_QC. QA/QC/PM external approval pending.";
main.currentSupplements.historicalInventoryNote += main.currentSupplements.historicalInventoryNote.includes("SD3-012") ? "" : " SD3-012 SuccessModal7508 and SD3-013 payment-method session flow supersede old shared dependency/preview source hashes; frozen old manifests remain historical.";
fs.writeFileSync(mainFile, JSON.stringify(main, null, 2) + "\n");

const readmeFile = "docs/README.md";
let readme = fs.readFileSync(readmeFile, "utf8");
readme = readme.replace("# Manage payment methods (_layout, index, modify)", "# Manage payment methods (_layout, index, modify, detail)");
assert(readme.includes("# Manage payment methods (_layout, index, modify, detail)"), "Payment route map must exist");
const section = /### Form Pengaturan Kelola\r?\n[\s\S]*?(?=### Form Jurnal Umum dan Jurnal Penyesuaian)/;
assert(section.test(readme), "Owned form section must exist");
readme = readme.replace(section, `### Form Pengaturan Kelola

Tiga route \`/manage/extra/modify\`, \`/manage/order-type/modify\`, dan \`/manage/tax/modify\` memakai komposisi \`components/feature/manage/settings/\` dan nilai awal data contoh existing. Draft bertahan pada render ulang ID yang sama; pergantian ID/create membuat form baru. ID hilang atau kosong yang diberikan menampilkan pesan dan kembali ke daftar. RHF/Zod, Card, Wrapper dan BottomActionButton bersama digunakan; tombol **Periksa Data** hanya memvalidasi, belum menyimpan atau terhubung API/persistensi. Pajak mengikuti pilihan \`product_included\`/\`product_excluded\`/\`none\`. Bukti preview/editor lama tetap pada [handoff Codex-3](qa/codex-3/HANDOFF.md).

### Metode Pembayaran Kelola — data sesi pengguna

\`/manage/payment-method\` sekarang mulai dengan daftar kosong dan menampilkan metode yang ditambahkan pengguna, dengan pencarian nama/bank/pemilik rekening. \`/modify\` menambah atau mengedit berdasarkan ID; \`/detail?id=<id>\` menampilkan data serta aksi edit/hapus. Hapus terkonfirmasi mengubah daftar sesi dan baru menampilkan sukses. Header Detail Metode Pembayaran berada pada layout existing; daftar ini sebelumnya salah memakai data Tipe Pesanan.

Tujuh field nama, jenis transfer bank, tipe/nilai biaya admin, bank, nomor rekening dan pemilik dipertahankan. RHF/Zod memvalidasi field wajib/pilihan, angka finite/nonnegatif serta persentase maksimal 100. Default biaya 0 terlihat, input kosong ditolak, desimal titik/koma diterima dan angka nol awal rekening dipertahankan. Draft per ID, missing ID, callback lama, simpan ganda dan acknowledgement sekali dijaga.

**Simpan Sementara** menyimpan selama aplikasi terbuka. Belum ada API, persistensi atau penggunaan dalam transaksi/Kasir; biaya admin merupakan metadata UI. Kontrak API existing belum menampung semua field form Kelola, dan kode bank UI bukan referensi bank backend. Store mulai kosong tanpa seed baru. Bukti, exact hashes dan batas pada [handoff SD3-013](qa/codex-3/payment-method-session/HANDOFF.md) dan [progres Metode Pembayaran](PAYMENT_METHOD_UI_PROGRESS.md). Status READY_FOR_QA_QC; belum approval eksternal atau publikasi PM.

`);
// Trim only the pre-existing newly appended Payroll line flagged by diff --check.
readme = readme.replace(/^(Developer Codex-4 menjalankan 21 skenario[^\r\n]+)\r?$/m, "$1");
fs.writeFileSync(readmeFile, readme);

const handoffFile = path.join(__dirname, "HANDOFF.md");
let handoff = fs.readFileSync(handoffFile, "utf8");
const start = "## Kelanjutan terbaru — SD3-013 Metode Pembayaran dan SD3-012 modal sukses";
if (!handoff.includes(start)) {
	const block = `${start}

[Metode Pembayaran](payment-method-session/HANDOFF.md) kini menyelesaikan flow daftar/pencarian, tambah, detail, edit dan hapus dengan data sesi yang diisi pengguna. Daftar tidak lagi berisi Tipe Pesanan; hapus mengubah record sebelum memberi sukses. Tujuh field dipertahankan, validasi biaya/pilihan dan lifetime editor/menu dijaga. Developer **${payment.checks.passed}/${payment.checks.passed} PASS**, runtime 0, quality sepuluh root actual config/import/declaration closure bersih. Review independen exact source final ditautkan pada paket; review sebelum koreksi label tombol tetap histori. Data sementara tanpa API/persistensi/transaksi atau biaya Kasir, belum browser/native/Figma/full router/QC eksternal. [Progres](../../PAYMENT_METHOD_UI_PROGRESS.md) dan peta navigasi diperbarui.

[SuccessModal height](success-modal-height/HANDOFF.md) menerapkan proposal QC tepat hash7508: tinggi mengikuti window, pesan/header digulir dan footer tetap di luar. Current-source replay **156 lifecycle +165 list =321 PASS** dengan cakupan berulang; quality satu root bersih dan AST props/callback/copy tetap. QC proposal historis pada source identik mempunyai 27 orientation/scroll, 51 modal browser, 36 historical Stock dan 156 lifecycle PASS; angka itu tidak dihitung sebagai replay developer baru. Percobaan browser sendiri atas baseline F90 gagal memuat bundle, **0 assertion**, tersimpan. QC-SUCCESS-001 tetap OPEN menunggu recheck source aplikasi/native; source correction READY_FOR_QC_RECHECK, bukan approval eksternal. Paket F90 SD3-006—011 tetap frozen dan dependency terbaru ditautkan melalui overlay manifest utama.

Scope/results dicatat pada SESSION_COORDINATION; tidak mengubah pekerjaan Payroll/Stock/printer/native/session lain. Handoff melalui workspace untuk QA/QC, publikasi tetap gate PM.

`;
	const marker = "## Status terbaru Member";
	assert(handoff.includes(marker), "Parent handoff insertion point");
	handoff = handoff.replace(marker, block + marker);
	fs.writeFileSync(handoffFile, handoff);
}
for (const file of ["docs/ROLES_UI_PROGRESS.md", "docs/WORKERS_UI_PROGRESS.md", "docs/MEMBER_UI_PROGRESS.md"]) {
	const title = "## SD3-012 dependency SuccessModal height — 9 Oktober 2026";
	if (!fs.readFileSync(file, "utf8").includes(title)) fs.appendFileSync(file, `\n${title}\n\nSource dialog/list/detail domain tetap. Shared SuccessModal sekarang memakai hash7508, membatasi tinggi window dengan header/body yang dapat digulir dan footer di luar. [Height handoff](qa/codex-3/success-modal-height/HANDOFF.md) mencatat replay source sekarang: 156 lifecycle +165 list PASS, kualitas bersih. Bukti F90 paket lama tetap historis; overlay manifest utama menautkan dependency terbaru. QC-SUCCESS-001 masih OPEN menunggu recheck aplikasi/native; belum approval QC atau publikasi PM.\n`);
}
const coordination = "docs/SESSION_COORDINATION.md";
const coordinationTitle = "## Codex-3 — SD3-012/013 FINAL READY_FOR_QA_QC (9 Oktober 2026)";
if (!fs.readFileSync(coordination, "utf8").includes(coordinationTitle)) fs.appendFileSync(coordination, `
${coordinationTitle}

Software Developer Senior / Codex-3 menerapkan SuccessModal tepat sesuai proposal QC: 7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8. maxHeight mengikuti window height-32, header/message memakai ScrollView, footer di luar. SD3-012 frozen pada docs/qa/codex-3/success-modal-height/HANDOFF.md dan verification.json: 1 source/36 contracts/17 artifacts; replay sekarang 156 delete +165 list =321 PASS/runtime0 dengan cakupan berulang. Lint/Biome/diff/type satu root aktual bersih, inverse AST membuktikan props/callback/copy tetap. Audit independen mencocokkan 139 artefak QC; proposal historis pada7508 mempunyai 270 PASS (27 orientation, 51 shared browser, 36 historical Stock, 156 lifecycle). Bukti historis itu bukan browser ulang sekarang atau persetujuan penerapan. Percobaan sendiri atas baseline F90 tetap 0 checks/0 receipts/180s timeout, metadata inherited QC dijelaskan. Metro8088 PID9200 tidak direstart. QC-SUCCESS-001 tetap OPEN; developer READY_FOR_QC_RECHECK. Manifest F90 SD3-006—011 frozen dan overlay dependency diselaraskan; Stock terbaru milik sesi lain tidak disertifikasi.

SD3-013 Metode Pembayaran Kelola kini memakai koleksi sesi kosong awal yang diisi pengguna: daftar/pencarian, tambah, detail, edit per ID, hapus aktual dan acknowledgement. Sepuluh source tercatat pada manifest developer; form0451db3bf9f4f29f4f2f4c67814fa788edb4cb56a983824848443a0da1d40d4e, schema222b352adb4c7f020368d4db2f4c0d76c1dbc444626477d20a3719e5636e8c74. Tujuh field dipertahankan; default0 terlihat, kosong invalid, negatif/nonfinite ditolak, persentase maksimal100, desimal dan angka nol awal rekening dijaga. Daftar ORDER_TYPE_ITEMS/CTA dan sukses hapus palsu dikoreksi. Missing/empty ID, draft, pergantian ID, simpan ganda dan callback lama dijaga. Label error Kembali menjadi Tutup agar sesuai tindakan. Developer58 PASS/20 modules/runtime0; quality sepuluh root dengan config/import/declaration closure aktual bersih. Final review independen50 PASS =47 renderer+3 AST proof, runtime/warning0 pada0451. Paket ae40145 sebelumnya tetap frozen dan tidak dijumlah ulang. Final review: docs/qa/codex-3-internal-review/payment-method-session-close-copy-2026-10-09/REPORT.md; paket developer: docs/qa/codex-3/payment-method-session/HANDOFF.md dan verification.json. READY_FOR_QA_QC, belum persetujuan QC eksternal/PM.

Header Detail didaftarkan pada layout existing. docs/README route/flow, PAYMENT_METHOD_UI_PROGRESS.md, main HANDOFF/currentSupplements dan tiga progress domain diselaraskan. Tiga preview lain, ManagePreviewForm, API, catalog, constants, shared helper, Payroll, Stock, printer dan native source tidak ditulis. Data sementara selama aplikasi terbuka, belum API/persistensi/transaksi atau biaya Kasir; kontrak API existing belum menampung adminType/value dan kode bank UI bukan referenceID. Satu trailing CR pada baris tambahan Payroll di README dibersihkan hanya pada baris itu; konten/source Payroll tetap. Handoff melalui workspace ke QA/QC, tidak mengklaim penerimaan langsung, approval atau publikasi. Browser/native/full root router/auth/Figma/backend belum disertifikasi.

Execution Profile & Operator Tips: Medium, source selesai → assertions/quality → review independen → frozen manifest → recheck QA/QC → PM. Pertahankan ID stabil, seluruh field, bukti historis dan scope pemilik lain. Tidak ada install/server/cache/root config/HP/ADB/global TS/Git stage/commit/push/checkout/revert.
`);
console.log(JSON.stringify({ status: "SYNCHRONIZED", appRoot, currentStatus: main.currentStatus, paymentAssertions: payment.checks.passed, heightAssertions: height.checks.currentDeveloperAssertions }));
