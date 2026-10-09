const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(path.resolve(".expo/qc-startup-tools/node_modules/playwright-core"));
const out = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(out, "status-snapshot.json"), "utf8"));
const esc = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const pct = value => value.toFixed(1).replace(".", ",") + "%";
const labels = { done: "Selesai pada lingkup QC", ready: "Menunggu QA/QC / review", active: "Sedang dikerjakan", queued: "Antrean / belum terhubung" };
const colours = { done: "#168365", ready: "#2872bc", active: "#c18119", queued: "#929eaf" };
const table = items => `<table class="work"><thead><tr><th class="num">No.</th><th class="package">Paket pekerjaan</th><th class="owner">Pemilik</th><th>Status / pekerjaan berikutnya</th></tr></thead><tbody>${items.map(item => `<tr><td class="num">${String(item.id).padStart(2, "0")}</td><td class="package">${esc(item.name)}</td><td class="owner">${esc(item.owner)}</td><td>${esc(item.note)}</td></tr>`).join("")}</tbody></table>`;
const top = (number, tag) => `<div class="running"><span class="brand">RÁPIDO <b>QC</b></span><span>${esc(tag)}</span><span>${number} / 6</span></div>`;
const heading = (eyebrow, title, description) => `<div class="eyebrow">${esc(eyebrow)}</div><h2>${esc(title)}</h2><p class="intro">${esc(description)}</p>`;
const footer = text => `<div class="page-note">${esc(text)}</div>`;
const done = data.items.filter(item => item.status === "done");
const ready = data.items.filter(item => item.status === "ready");
const active = data.items.filter(item => item.status === "active");
const queued = data.items.filter(item => item.status === "queued");
const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(data.title)}</title><style>
@page{size:A4;margin:13mm 12mm 15mm}
*{box-sizing:border-box}body{margin:0;color:#192d42;background:white;font-family:"Segoe UI",Arial,sans-serif;font-size:12px;line-height:1.5}.sheet{width:186mm;height:257mm;position:relative;break-after:page;padding-bottom:24px}.sheet:last-child{break-after:auto}.running{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #d7e1ea;padding:0 0 13px;margin-bottom:25px;color:#6b7b8d;font-size:10px}.brand{font-size:15px;font-weight:800;letter-spacing:2px;color:#192d42}.brand b{display:inline-block;margin-left:5px;padding:2px 6px;font-size:10px;letter-spacing:.7px;background:#e7f1fa;color:#2872bc;border-radius:3px}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:1.7px;font-weight:700;color:#2872bc;margin-bottom:8px}h1{font-size:37px;line-height:1.14;margin:0 0 14px;letter-spacing:-1px;max-width:560px}h2{font-size:26px;line-height:1.2;margin:0 0 10px;letter-spacing:-.5px}h3{font-size:15px;margin:18px 0 9px}.intro{color:#586b7f;line-height:1.55;margin:0 0 19px;max-width:680px}.stamp{font-size:11px;color:#66788b;margin:18px 0 26px}.metrics{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;margin-bottom:23px}.metric{border:1px solid #dce5ed;border-radius:10px;background:#f7fafc;padding:16px}.metric span{display:block;color:#60748a;font-size:10px;text-transform:uppercase;font-weight:700;letter-spacing:.65px}.metric strong{display:block;font-size:39px;line-height:1.15;margin:7px 0}.metric small{color:#66798a;font-size:11px}.metric.done strong{color:#168365}.metric.remaining strong{color:#2872bc}.progress{display:flex;height:17px;overflow:hidden;border-radius:5px;margin:10px 0 14px}.legend{display:grid;grid-template-columns:1fr 1fr;gap:7px 12px;margin-bottom:20px;font-size:11px;color:#52677c}.legend span:before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--c);margin-right:7px}.summary{width:100%;border-collapse:collapse;margin:15px 0 18px}.summary td,.summary th{padding:9px 11px;border-bottom:1px solid #e1e8ef;text-align:left}.summary thead{background:#eef4f8;color:#51687f;font-size:10px;text-transform:uppercase;letter-spacing:.6px}.summary td:nth-child(2),.summary td:nth-child(3){text-align:right;font-weight:700}.summary th:nth-child(2),.summary th:nth-child(3){text-align:right}.callout{border-left:3px solid #2872bc;background:#eff5fb;padding:13px 15px;margin:15px 0;font-size:11.5px;line-height:1.55}.callout.green{border-color:#168365;background:#edf7f3}.callout.amber{border-color:#c18119;background:#fff6e9}.callout strong{display:block;margin-bottom:4px}.work{width:100%;border-collapse:collapse;margin-top:17px;table-layout:fixed}.work th{background:#edf3f8;color:#52677c;font-size:10px;text-transform:uppercase;letter-spacing:.4px;text-align:left;padding:9px 8px}.work td{border-bottom:1px solid #e2e9f0;padding:11px 8px;vertical-align:top;line-height:1.5;font-size:11.5px}.work .num{width:6%;color:#7b8999}.work .package{width:27%;font-weight:600;color:#1b334d}.work .owner{width:17%;font-size:10.5px;color:#697a8b}.sheet.compact .work td{padding:9px 8px;font-size:11px}.sheet.compact .work .owner{font-size:10px}.page-note{position:absolute;bottom:2px;left:0;right:0;border-top:1px solid #d7e1ea;padding-top:9px;font-size:9.5px;color:#7b8999}.details{font-size:11px;color:#586b7f;margin-top:17px}.details p{margin:9px 0}.status-box{display:flex;gap:10px;align-items:flex-start;background:#f6f9fb;border:1px solid #e0e8ef;border-radius:7px;padding:13px;margin:14px 0}.status-box b{color:#2872bc;font-size:21px;line-height:1.2;min-width:55px}.status-box span{font-size:11.5px;color:#526b82}.gaps{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:18px}.gap{border:1px solid #dce5ed;border-radius:7px;padding:13px;font-size:11px;color:#5a6e82}.gap b{display:block;font-size:12px;color:#203b56;margin-bottom:5px}.method{font-size:10.5px;line-height:1.6;color:#526b82}.method p{margin:8px 0}.sources{font-family:Consolas,"Courier New",monospace;font-size:9px;overflow-wrap:anywhere;color:#6e7e8e;margin-top:11px}.pill{display:inline-block;border-radius:4px;background:#e9f5ef;color:#168365;padding:3px 7px;font-size:10px;font-weight:600;margin-bottom:13px}.tight{margin:10px 0;font-size:11.5px}.priority{padding-left:21px;color:#52677c;font-size:11.5px;line-height:1.65}.priority li{margin-bottom:4px}
.sheet.compact .work td{padding:6px 8px}
@media screen{body{background:#edf2f6;padding:20px}.sheet{margin:0 auto 20px;background:white;box-shadow:0 1px 12px #193a5a17;padding-top:0} }
</style></head><body>
<section class="sheet" data-page="1">${top(1, "LAPORAN PROGRES")}
<div class="eyebrow">Laporan pekerjaan • 9 Oktober 2026</div><h1>Progres pekerjaan<br>Rapido</h1><p class="intro">Paket yang sudah selesai, menunggu pemeriksaan, sedang berjalan, serta antrean yang belum selesai.</p><div class="stamp">Snapshot: ${esc(data.snapshotWib)} &nbsp;|&nbsp; Disusun oleh QC</div>
<div class="metrics"><div class="metric done"><span>Selesai pada lingkup QC</span><strong>${pct(data.completedPercent)}</strong><small>${data.completed} dari ${data.total} paket tercatat</small></div><div class="metric remaining"><span>Masih perlu diselesaikan</span><strong>${pct(data.remainingPercent)}</strong><small>${data.remaining} paket belum ditutup</small></div><div class="metric"><span>Dasar penghitungan</span><strong>${data.total}</strong><small>paket kerja dengan bobot sama</small></div></div>
<div class="progress">${Object.keys(labels).map(status => `<div style="width:${100 * data.counts[status] / data.total}%;background:${colours[status]}"></div>`).join("")}</div>
<div class="legend">${Object.keys(labels).map(status => `<span style="--c:${colours[status]}">${labels[status]}: ${data.counts[status]}</span>`).join("")}</div>
<table class="summary"><thead><tr><th>Status paket</th><th>Jumlah</th><th>Persentase</th></tr></thead><tbody>${Object.keys(labels).map(status => `<tr><td>${labels[status]}</td><td>${data.counts[status]}</td><td>${pct(100 * data.counts[status] / data.total)}</td></tr>`).join("")}<tr><td><b>Total daftar pekerjaan</b></td><td>${data.total}</td><td>100,0%</td></tr></tbody></table>
<div class="callout"><strong>Persentase daftar paket, bukan kesiapan seluruh aplikasi.</strong>${pct(data.completedPercent)} dihitung dari paket yang telah lolos QC dalam lingkup yang dinyatakan. Belum ada baseline lengkap seluruh fitur dan estimasi jam kerja, sehingga persentase rilis produk tidak dapat ditentukan secara sah dari angka ini.</div>
<p class="tight"><b>25 dari 35 paket</b> sudah memiliki hasil implementasi/bukti: 9 lulus QC dan 16 menunggu review. Main/produksi belum memiliki keputusan kelulusan final yang ditemukan pada sumber laporan.</p>
${footer("Status berlaku pada waktu snapshot. Publikasi atau branch tersedia tidak otomatis berarti aplikasi siap rilis.")}</section>

<section class="sheet" data-page="2">${top(2, "PAKET SELESAI")}${heading("9 paket • lingkup QC lulus", "Pekerjaan yang sudah ditutup", "Selesai berarti perbaikan pada scope dan fingerprint yang diperiksa telah diterima QC. Cakupan fitur penuh, perangkat, API dan gate PM dapat tetap terbuka.")}
${table(done)}
<div class="callout green"><strong>Fingerprint cocok saat penyusunan laporan.</strong>${data.approvedSourceChecks.length} file dalam lingkup selesai cocok dengan hash keputusan QC. Buku Besar filter dan kontrak Batas Stok yang berubah setelah review lama ditempatkan pada antrean QA/QC, bukan diberi persetujuan lama otomatis.</div>
<p class="details">Paket Katalog dan Saldo Akun berbagi laporan Senior 8. Printer dan Pembulatan berbagi laporan SD6-001. Jumlah assertion di berbagai suite tidak dijumlahkan sebagai persentase proyek.</p>
${footer("Sumber utama: DECISION.json/REPORT.md QC Member, Senior8, SD6, Barcode, Pickers, SD5 dan CardList.")}</section>

<section class="sheet" data-page="3">${top(3, "ANTREAN PEMERIKSAAN 1/2")}${heading("16 paket • belum selesai QC", "Implementasi tersedia, review tersisa", "Bagian 1 dari 2. Hasil pembuat sebelumnya menjadi bukti awal; bukti tersebut belum sama dengan persetujuan QA/QC independen pada snapshot aplikasi terbaru.")}
${table(ready.slice(0, 8))}
<div class="status-box"><b>16</b><span>paket berada dalam kelompok menunggu pemeriksaan. Beberapa hanya memiliki pratinjau atau bukti historis, sehingga perlu pencocokan source sebelum dinyatakan siap diuji ulang.</span></div>
<div class="callout amber"><strong>UI selesai tidak berarti penyimpanan nyata selesai.</strong>Pendapatan, Pengeluaran, Inventory dan Pemasok masih memiliki batas data contoh/state sesi. Role dan Karyawan memiliki bukti API terpisah, tetapi tetap perlu review independen dan integrasi alur penuh.</div>
${footer("Sumber: SDK57_UPGRADE, preview modul, SUPPORT/ROLES/WORKERS_UI_PROGRESS dan handoff Codex-3.")}</section>

<section class="sheet" data-page="4">${top(4, "ANTREAN PEMERIKSAAN 2/2")}${heading("16 paket • lanjutan", "Perbaikan baru perlu QA/QC", "Bagian 2 dari 2. Perubahan lanjutan yang memiliki hash baru memerlukan keputusan sendiri, termasuk perbaikan startup HP, Batas Stok, Buku Besar dan empat form Kelola.")}
${table(ready.slice(8))}
<div class="callout"><strong>Update penting pada empat form Kelola.</strong>QC sebelumnya menemukan 7 masalah urutan import. Developer kini menyerahkan koreksi untuk recheck. Temuan belum dianggap ditutup oleh laporan progres ini; angka 92 adalah hasil browser pada snapshot sebelum koreksi import.</div>
<p class="details">Startup HP: dua cold launch berhasil merupakan hasil developer Senior 7. Guard cache yang baru belum memiliki keputusan QC independen yang ditemukan dalam snapshot laporan.</p>
${footer("Sumber: preview Place/Receipt/SalesTarget, handoff stock-contract, ledger-filters, startup, journal-validation dan manage-imports.")}</section>

<section class="sheet compact" data-page="5">${top(5, "BERJALAN DAN BELUM TERHUBUNG")}${heading("3 aktif + 7 antrean", "Pekerjaan yang masih terbuka", "IN_PROGRESS berdasarkan catatan terakhir yang dibaca. Antrean menunjukkan pekerjaan belum ditutup/ditautkan; ini bukan klaim bahwa seluruh domain belum memiliki source.")}
<h3>Sedang dikerjakan — 3 paket</h3>${table(active)}
<h3>Antrean / belum terhubung — 7 paket</h3>${table(queued.map(item => item.id >= 31 ? { ...item, note: "Belum memiliki href di hub; menu dinonaktifkan." } : item))}
<div class="callout amber"><strong>Lima menu Inventory belum memiliki tujuan navigasi.</strong>Source hub saat snapshot tidak memberikan href untuk Bahan Baku, Komposisi Produk, Pembayaran Tagihan, Riwayat Mutasi Stok dan Stok Akhir. NavList menonaktifkan menu tanpa href.</div>
${footer("Sumber: SESSION_COORDINATION, PM_TASK_BOARD, handoff Payroll/Senior5, Inventory hub dan NavList produksi.")}</section>

<section class="sheet" data-page="6">${top(6, "BATAS RILIS DAN METODE")}${heading("26 paket belum ditutup", "Apa yang masih membatasi selesai?", "Daftar paket memotret pekerjaan yang tercatat. Prasyarat rilis berikut tidak diberi bobot tambahan karena rincian tiket/estimasi lengkapnya belum tersedia.")}
<div class="gaps">
<div class="gap"><b>QA/QC dan temuan lanjutan</b>Tuntaskan 16 review, 3 pekerjaan aktif dan 7 antrean. Prioritaskan startup HP, recheck import Kelola, kontrak Batas Stok serta filter/ID Buku Besar.</div>
<div class="gap"><b>API dan persistensi nyata</b>Modul dengan state contoh memerlukan penyimpanan, data backend dan kontrak bisnis. Jurnal/saldo/target/printer tidak otomatis terintegrasi karena UI dapat dibuka.</div>
<div class="gap"><b>Perangkat dan alur penuh</b>Cold launch HP telah diuji pembuat, tetapi seluruh alur native, cetak fisik, reload, auth/izin dan integrasi backend belum disahkan secara menyeluruh.</div>
<div class="gap"><b>Desain dan menu belum terhubung</b>Lengkapi lima alur Inventory yang belum memiliki href. Kesamaan penuh Figma/native masih memerlukan verifikasi tersendiri.</div>
<div class="gap"><b>Gate snapshot integrasi</b>PM perlu satu snapshot stabil dengan lint/format/TypeScript dan regresi terkait. Angka 46 error/30 file pada review 8 Oktober adalah historis, bukan jumlah error sekarang.</div>
<div class="gap"><b>Publikasi dan keputusan PM</b>QA/QC delta bukan izin merge/rilis seluruh aplikasi. PM meninjau dependency, hasil integrasi, batas fitur dan final fingerprint sebelum publikasi.</div>
</div>
<h3>Metode penghitungan</h3><div class="method"><p><b>Daftar:</b> 35 paket fitur/perbaikan yang dipetakan dari board, koordinasi, handoff, keputusan QC, dokumentasi pratinjau dan menu Inventory. Satu paket mendapat bobot 1; ukuran/biaya masing-masing paket dapat berbeda.</p><p><b>Rumus:</b> selesai = 9 ÷ 35 × 100 = <b>25,7%</b>; sisa = 26 ÷ 35 × 100 = <b>74,3%</b>. Menunggu review dan sedang dikerjakan tetap dihitung belum selesai. Lulus QC berarti lingkup yang dinyatakan pada halaman 2, bukan seluruh fitur produksi.</p><p><b>Batas:</b> belum ada WBS produk lengkap, estimasi jam per paket, atau kelulusan integrasi final. Karena itu sisa 74,3% bukan estimasi hari atau persentase pasti seluruh aplikasi. Laporan tidak menjalankan tes baru, mengubah status PM, mengoperasikan HP/server atau memublikasikan Git.</p></div>
<h3>Rujukan dan jejak audit</h3><div class="sources">docs/SESSION_COORDINATION.md • docs/PM_TASK_BOARD.md<br>docs/PROJECT_MANAGER_REVIEW.md • docs/qa/*/HANDOFF.md / DECISION.json<br>docs/*_UI_PROGRESS.md • docs/previews/*/README.md<br>app/(back-office)/inventory/index.tsx • components/custom/NavList.tsx</div>
<p class="details">Daftar 35 paket tersedia dalam CSV. Status, waktu snapshot, path bukti, SHA-256 sumber dan 15 fingerprint QC tersedia pada status-snapshot.json yang menyertai PDF.</p>
${footer("Disusun QC • 9 Oktober 2026 • Data merupakan snapshot workspace, bukan akses langsung percakapan sesi lain.")}</section>
</body></html>`;
const htmlPath = path.join(out, "Laporan-Progres-Rapido-2026-10-09.html");
const pdfPath = path.join(out, "Laporan-Progres-Rapido-2026-10-09.pdf");
fs.writeFileSync(htmlPath, html);
(async () => {
	const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
	try {
		const page = await browser.newPage({ viewport: { width: 810, height: 1100 } });
		const errors = [];
		page.on("pageerror", error => errors.push(error.message));
		await page.goto(pathToFileURL(htmlPath).href);
		await page.emulateMedia({ media: "print" });
		await page.evaluate(() => document.fonts.ready);
		const bounds = await page.locator(".sheet").evaluateAll(sheets => sheets.map(sheet => ({ page: sheet.dataset.page, width: sheet.clientWidth, height: sheet.clientHeight, scrollHeight: sheet.scrollHeight, overflow: sheet.scrollHeight > sheet.clientHeight + 2, footerOverlap: Array.from(sheet.children).filter(child => !child.classList.contains("page-note")).some(child => child.getBoundingClientRect().bottom > sheet.querySelector(".page-note").getBoundingClientRect().top + 1) })));
		if (bounds.some(item => item.overflow || item.footerOverlap)) throw Error("Report page overflow: " + JSON.stringify(bounds));
		if (errors.length) throw Error("Report browser error: " + errors.join("; "));
		await page.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true });
		await page.locator('.sheet[data-page="1"]').screenshot({ path: path.join(out, "preview-page-1.png") });
		await page.locator('.sheet[data-page="5"]').screenshot({ path: path.join(out, "preview-page-5.png") });
		const pdf = fs.readFileSync(pdfPath);
		const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
		if (pageCount !== 6 || pdf.subarray(0, 5).toString() !== "%PDF-") throw Error("PDF structure mismatch: " + pageCount);
		const validation = { date: "2026-10-09", snapshotWib: data.snapshotWib, pages: pageCount, pdfBytes: pdf.length, pageBounds: bounds, browserErrors: errors, counts: data.counts, total: data.total, completedPercent: data.completedPercent, remainingPercent: data.remainingPercent, generatedOffline: true, browsersClosedAfterExport: true };
		fs.writeFileSync(path.join(out, "pdf-validation.json"), JSON.stringify(validation, null, 2) + "\n");
		console.log(JSON.stringify(validation));
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exitCode = 1; });
