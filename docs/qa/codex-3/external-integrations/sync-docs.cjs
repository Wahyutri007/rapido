const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const manifestFile = path.join(__dirname, "verification.json"), manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
for (const [file, expected] of Object.entries(manifest.sourceHashes)) assert.equal(hash(file), expected, file);
const mainFile = "docs/qa/codex-3/verification.json", main = JSON.parse(fs.readFileSync(mainFile, "utf8"));
main.currentSupplements.externalIntegrations = { ticket: manifest.ticket, status: manifest.status, manifest: "docs/qa/codex-3/external-integrations/verification.json", manifestSha256: hash(manifestFile), handoff: "docs/qa/codex-3/external-integrations/HANDOFF.md", sourceHashes: manifest.sourceHashes, checks: manifest.checks, internalReview: manifest.internalReview, untouchedModuleProof: manifest.untouchedModuleProof, externalQcApproval: false, publicationOwner: "PM", limits: manifest.limits };
main.currentStatus += main.currentStatus.includes("SD3-014") ? "" : " SD3-014 new external integration draft UI/session flow READY_FOR_QA_QC; operational integration/backend/native approval pending.";
const qcFile = "docs/qa/qc-delete-modal-2026-10-09/DECISION.json", qc = JSON.parse(fs.readFileSync(qcFile, "utf8"));
main.currentSupplements.sharedDeleteModalSize.externalQcReview = { signal: qc.signal, status: qc.status, decision: qcFile, decisionSha256: hash(qcFile), source: qc.source, findings: qc.findings.map(item => ({ id: item.id, severity: item.severity, status: item.status, title: item.title })), scope: "Read-only acknowledgment of returned shared dependency finding; not edited in new-module SD3-014" };
fs.writeFileSync(mainFile, JSON.stringify(main, null, 2) + "\n");

const readmeFile = "docs/README.md";
let readme = fs.readFileSync(readmeFile, "utf8");
if (!readme.includes("├── integrations/")) {
	const anchor = /^(    │   ├── extra\/[^\r\n]*\r?\n)/m;
	assert(anchor.test(readme), "Route map insertion point");
	readme = readme.replace(anchor, "    │   ├── integrations/           # Integrasi Eksternal: draf tujuan webhook sesi (_layout, index, modify, detail)\n$1");
}
const title = "### Integrasi Eksternal — modul baru, draf webhook";
if (!readme.includes(title)) readme += `
${title}

Kelola → Integrasi Eksternal kini membuka \`/manage/integrations\`. Modul sebelumnya hanya Coming Soon tanpa rute/implementasi. Daftar mulai kosong, dapat dicari menurut nama, URL dan catatan. \`/modify\` menambah draf, \`/modify?id=<id>\` mengedit, dan \`/detail?id=<id>\` menampilkan konfigurasi beserta edit/hapus. Hapus terkonfirmasi mengubah koleksi sesi sebelum memberi sukses. Header berada pada layout modul dan parent mendaftarkan child dengan header nonaktif.

Draf berisi nama, endpoint HTTPS dan catatan opsional. RHF/Zod menjaga field wajib/panjang serta menolak URL invalid, HTTP, kredensial di URL dan fragmen. Path/query endpoint dipertahankan. Draft ID yang sama tidak ditimpa render ulang, perubahan ID/create membuat editor baru; missing/empty ID, callback lama, simpan ganda dan acknowledgement sekali dijaga. **Simpan Draf** menyimpan selama aplikasi terbuka.

Status selalu **Draf — belum aktif**: konfigurasi ini tidak mengirim data, belum API/persistensi/aktivasi/autentikasi webhook. Tidak menyediakan provider/event atau hasil koneksi buatan. Desain form merupakan pilihan implementasi frontend karena kontrak webhook dan desain layar spesifik belum tersedia; bukan klaim parity Figma. Bukti/hasil akhir ada pada [handoff SD3-014](qa/codex-3/external-integrations/HANDOFF.md) dan [progres modul](EXTERNAL_INTEGRATIONS_UI_PROGRESS.md). Native/browser/full router serta shared modal geometry dan approval QC/PM mengikuti gate terpisah.
`;
fs.writeFileSync(readmeFile, readme);

const handoffFile = "docs/qa/codex-3/HANDOFF.md";
let handoff = fs.readFileSync(handoffFile, "utf8");
const marker = "## Modul baru — SD3-014 Integrasi Eksternal READY_FOR_QA_QC";
if (!handoff.includes(marker)) {
	const anchor = "## Kelanjutan terbaru — SD3-013";
	assert(handoff.includes(anchor), "Parent handoff insertion point");
	const block = `${marker}

[Integrasi Eksternal](external-integrations/HANDOFF.md) merupakan modul yang sebelumnya benar-benar belum diimplementasikan: hanya Coming Soon, tanpa route/screen/schema/store/API. Sebelas source baru ditambah, satu menu dan satu registrasi parent diaktifkan. Flow daftar/pencarian, tambah draf, detail, edit per ID dan hapus aktual tersedia. Nama/URL HTTPS/catatan opsional tersimpan dalam sesi pengguna kosong awal, status Draf dan tidak mengirim data. Backend/provider/event/aktivasi tidak diarang.

Developer ${manifest.checks.developerAssertions} pemeriksaan perilaku dan ${manifest.checks.integrationAssertions} pemeriksaan integrasi AST/source lulus; review independen final ${manifest.internalReview.passed} pemeriksaan lulus, tanpa runtime error. ESLint/Biome/diff dan TypeScript 13 root dengan actual import/declaration closure bersih. Exact source hashes dan fingerprint pada manifest; bukti baseline menunjukkan 11 file belum ada. [Progres baru](../../EXTERNAL_INTEGRATIONS_UI_PROGRESS.md), peta navigasi dan koordinasi diselaraskan. Paket/modul lama tetap histori.

Status READY_FOR_QA_QC untuk UI draf sesi. Browser/native/full router/root auth/Figma dan integrasi operasional belum disertifikasi. Dependency DeleteDABC mempunyai QC-DELETE-001 OPEN, Success7508 masih menunggu recheck QC-SUCCESS-001; perilaku renderer baru tidak menutup temuan geometri shared. Temuan dependency dicatat, source modal lama tidak diambil pada permintaan modul baru. Handoff melalui workspace, belum approval eksternal atau publikasi PM.

`;
	handoff = handoff.replace(anchor, block + anchor);
	fs.writeFileSync(handoffFile, handoff);
}
const progress = "docs/EXTERNAL_INTEGRATIONS_UI_PROGRESS.md";
let text = fs.readFileSync(progress, "utf8");
const finalMarker = "## Hasil akhir — READY_FOR_QA_QC";
if (!text.includes(finalMarker)) {
	text += `\n${finalMarker}\n\nDeveloper ${manifest.checks.developerAssertions}/${manifest.checks.developerAssertions} pemeriksaan perilaku serta ${manifest.checks.integrationAssertions} bukti integrasi source lulus; review internal ${manifest.internalReview.passed}/${manifest.internalReview.passed} lulus. Runtime/warning 0; ESLint/Biome/diff dan TypeScript terfokus 13 root bersih. Manifest menyegel 11 source baru +2 shared integration sources. QA/QC/PM eksternal belum menyetujui; aktivasi/backend/persistensi dan browser/native masih batas.\n`;
	fs.writeFileSync(progress, text);
}
const coordFile = "docs/SESSION_COORDINATION.md", coordMarker = "## Codex-3 — SD3-014 Integrasi Eksternal BARU FINAL READY_FOR_QA_QC";
if (!fs.readFileSync(coordFile, "utf8").includes(coordMarker)) fs.appendFileSync(coordFile, `
${coordMarker}

Instruksi modul yang sama sekali belum disentuh telah ditangani. Before hub hanya Coming Soon tanpa href, baseline 11 source baru null/tidak ada; semua proof pada docs/qa/codex-3/external-integrations/inputs-new-before.json dan snapshot dua shared source. Flow baru draf webhook sesi: nama/HTTPS endpoint/catatan, daftar kosong awal/pencarian, tambah/detail/edit/hapus aktual, status selalu Draf. URL/path/query valid dipertahankan, HTTP/userinfo/fragmen invalid, draft per ID dan callback/simpan/hapus/acknowledgement ganda dijaga. Tidak provider/event/aktivasi/network/backend/persistensi palsu.

Paket frozen docs/qa/codex-3/external-integrations/HANDOFF.md dan verification.json: developer${manifest.checks.developerAssertions} perilaku PASS, integration${manifest.checks.integrationAssertions} AST/source PASS, independent final${manifest.internalReview.passed} PASS, runtime/warning0. Quality13 roots actual config/import/declaration closure bersih. Sebelas source baru +hub menuItem external dan parent headerfalse registration tercatat hash; inverse AST membuktikan source shared lainnya tetap selain unused imports/format. Reviewer docs/qa/codex-3-internal-review/external-integrations-2026-10-09/REPORT.md. Native/browser/full router/auth/Figma/operasional integrasi belum disertifikasi. QA/QC diminta UI empty/create/search/detail/edit/delete, HTTPS error, keyboard/scroll dan exact hashes; PM pemilik publikasi.

README peta/flow, EXTERNAL_INTEGRATIONS_UI_PROGRESS.md dan main HANDOFF/currentSupplements diselaraskan. User meminta modul baru: Payment/Support/Role/Worker/Member serta source pemilik lain tidak dipoles ulang. QC-DELETE-001 OPEN pada DABC dan QC-SUCCESS-001 recheck7508 tetap inherited dependency gates; membaca keputusan QC baru hanya untuk mencatat batas, tidak memperbaiki primitive dalam SD3-014. Root hub/parent hanya satu entry/child, shared Form/NavList/modal/helper/API/store domain lain tetap. Server/Metro/cache/HP/ADB/dependency/global TS/Git publication tidak dioperasikan. Server HP Codex4 CI/watch mati: owner runtime perlu refresh/restart terarah sendiri untuk memuat source baru; root tidak mengoperasikannya.

Execution Profile & Operator Tips: Medium. Source baru selesai → meaningful checks/quality → independent QA → frozen manifest → QC → PM. Draf pengguna bukan koneksi aktif; lanjut integrasi operasional memerlukan kontrak API/event/auth yang disepakati. Handoff workspace bukan bukti penerimaan langsung atau approval eksternal.
`);
console.log(JSON.stringify({ status: "SYNCHRONIZED", newSourceCount: 11, sharedIntegrationCount: 2, developerAssertions: manifest.checks.developerAssertions, integrationAssertions: manifest.checks.integrationAssertions, internalAssertions: manifest.internalReview.passed }));
