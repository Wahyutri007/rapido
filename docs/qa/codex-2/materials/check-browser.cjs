const path = require("node:path");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const project = path.resolve(__dirname, "../../../..");
const { chromium } = require(
	path.join(project, ".expo/payroll-qa-tools/node_modules/playwright"),
);
const shots = path.join(project, "docs/previews/inventory/materials");
fs.mkdirSync(shots, { recursive: true });
async function main() {
	const browser = await chromium.launch({
		headless: true,
		executablePath:
			"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
	});
	const page = await browser.newPage({
		viewport: { width: 390, height: 1004 },
		timezoneId: "Asia/Jakarta",
	});
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (
			message.type() === "error" &&
			!message.text().includes("WebSocket") &&
			!message.text().includes("focused")
		)
			process.stderr.write(message.text().slice(0, 500) + "\n");
	});
	async function choose(placeholder, value) {
		await page
			.getByText(placeholder, { exact: true })
			.filter({ visible: true })
			.first()
			.click();
		await page
			.getByText(value, { exact: true })
			.filter({ visible: true })
			.last()
			.click();
		await page.waitForTimeout(500);
	}
	async function shot(name) {
		await page.screenshot({ path: path.join(shots, name + ".png") });
	}
	async function list() {
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.waitFor();
		await page.waitForTimeout(700);
	}
	async function hub() {
		await page
			.getByText("Persediaan", { exact: true })
			.filter({ visible: true })
			.waitFor();
		await page.waitForTimeout(700);
	}
	async function noHorizontalOverflow() {
		assert.ok(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		);
	}
	try {
		for (let attempts = 0; attempts < 60; attempts++) {
			try {
				if (
					(
						await fetch("http://127.0.0.1:8081/status", {
							signal: AbortSignal.timeout(2000),
						})
					).ok
				)
					break;
			} catch {}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		await page.goto("http://127.0.0.1:8091/inventory", { waitUntil: "commit" });
		await page
			.getByText("Persediaan", { exact: true })
			.waitFor({ timeout: 180000 });
		await page.evaluate(() => document.fonts.ready);
		await page.getByText("Bahan Baku", { exact: true }).click();
		await list();
		assert.equal(
			await page.getByRole("button", { name: /^Detail / }).count(),
			5,
		);
		await shot("list");
		await noHorizontalOverflow();
		const search = page.getByPlaceholder("Cari...", { exact: true }).last();
		await search.fill("BBK-TPG-001");
		await page.waitForTimeout(350);
		assert.equal(
			await page.getByRole("button", { name: /^Detail / }).count(),
			1,
		);
		await search.fill("Tidak ada bahan ini");
		await page
			.getByText("Tidak ada bahan baku ditemukan", { exact: true })
			.waitFor();
		await search.fill("");
		await page.waitForTimeout(350);
		await page
			.getByRole("button", { name: "Filter inventaris", exact: true })
			.click();
		await choose("Semua Status", "Menipis");
		assert.equal(
			await page.getByRole("button", { name: /^Detail / }).count(),
			1,
		);
		await choose("Semua Toko", "Toko Degri");
		await page
			.getByText("Tidak ada bahan baku ditemukan", { exact: true })
			.waitFor();
		await choose("Toko Degri", "Semua Toko");
		await choose("Menipis", "Semua Status");
		await page
			.getByRole("button", { name: "Filter inventaris", exact: true })
			.click();
		await page.setViewportSize({ width: 320, height: 812 });
		await page.waitForTimeout(300);
		await noHorizontalOverflow();
		await shot("list-320");
		await page.setViewportSize({ width: 390, height: 1004 });
		await page
			.getByRole("button", { name: "Detail Tepung Terigu", exact: true })
			.click();
		await page.getByText("Detail Bahan Baku", { exact: true }).waitFor();
		await page.waitForTimeout(700);
		await page
			.getByText("18 Kg", { exact: true })
			.filter({ visible: true })
			.waitFor();
		await page.getByText("2 hari", { exact: true }).waitFor();
		await page
			.getByText(/540\.000/)
			.filter({ visible: true })
			.waitFor();
		await shot("detail");
		await page.setViewportSize({ width: 320, height: 812 });
		await page.waitForTimeout(300);
		await noHorizontalOverflow();
		await shot("detail-320");
		await page.setViewportSize({ width: 390, height: 1004 });
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page
			.getByRole("button", { name: "Hapus", exact: true })
			.last()
			.click();
		await page
			.getByText("Bahan baku masih digunakan pada transaksi atau mutasi stok", {
				exact: true,
			})
			.waitFor();
		await page.getByRole("button", { name: "Mengerti", exact: true }).click();
		await page.goBack();
		await list();
		process.stdout.write(
			"Material list/search/filter, source detail, 320px overflow and source-history deletion guard passed\n",
		);
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.click();
		await page
			.getByText("Tambah Bahan Baku", { exact: true })
			.filter({ visible: true })
			.waitFor();
		await page.waitForTimeout(700);
		await shot("empty-form");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByText("Nama bahan baku wajib diisi", { exact: true })
			.waitFor();
		await page
			.getByText("Pilih toko", { exact: true })
			.filter({ visible: true })
			.first()
			.click();
		for (const store of ["Toko Sushiro", "Toko Degri"])
			await page
				.getByText(store, { exact: true })
				.filter({ visible: true })
				.last()
				.click();
		await page.getByText("Selesai", { exact: true }).click();
		await page
			.getByPlaceholder("Masukkan nama bahan baku")
			.fill(" tepung terigu ");
		await page.getByPlaceholder("Masukkan kode bahan").fill("BBK-TPG-001");
		await choose("Pilih satuan", "Kg");
		const quantities = page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true });
		await quantities.nth(0).pressSequentially("12.5", { delay: 50 });
		assert.equal(await quantities.nth(0).inputValue(), "12.5");
		await quantities.nth(1).fill("5");
		await quantities.nth(2).fill("10000");
		const expiry = page.getByPlaceholder("YYYY-MM-DD");
		await expiry.pressSequentially("2026-02-29", { delay: 50 });
		assert.equal(await expiry.inputValue(), "2026-02-29");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByText("Tanggal kedaluwarsa tidak valid", { exact: true })
			.waitFor();
		await page
			.getByRole("button", { name: "Hapus tanggal expire", exact: true })
			.click();
		assert.equal(await expiry.inputValue(), "");
		await expiry.pressSequentially("2026-12-31", { delay: 50 });
		assert.equal(await expiry.inputValue(), "2026-12-31");
		await page
			.getByPlaceholder("Tambahkan catatan bahan baku")
			.fill("Catatan pengujian bahan");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByText("Nama bahan baku sudah digunakan", { exact: true })
			.waitFor();
		await page
			.getByPlaceholder("Masukkan nama bahan baku")
			.fill("Bahan Pengujian");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByText("Kode bahan sudah digunakan", { exact: true })
			.waitFor();
		await page.getByPlaceholder("Masukkan kode bahan").fill("BBK-QA-001");
		await page
			.getByPlaceholder("Masukkan nama bahan baku")
			.scrollIntoViewIfNeeded();
		await shot("filled-form");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		await page
			.getByText("12,5 Kg", { exact: true })
			.filter({ visible: true })
			.first()
			.waitFor();
		await page.waitForTimeout(700);
		await shot("created-detail");
		const createdId = new URL(page.url()).searchParams.get("id");
		assert.ok(createdId);
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page.getByRole("button", { name: "Batal", exact: true }).click();
		await page.getByRole("button", { name: "Edit", exact: true }).click();
		await page.getByText("Edit Bahan Baku", { exact: true }).waitFor();
		assert.equal(
			await page.getByPlaceholder("YYYY-MM-DD").inputValue(),
			"2026-12-31",
		);
		assert.equal(
			await page.getByPlaceholder("Tambahkan catatan bahan baku").inputValue(),
			"Catatan pengujian bahan",
		);
		await page
			.getByPlaceholder("Masukkan nama bahan baku")
			.fill("Bahan Diubah");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(0)
			.fill("20");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		assert.equal(new URL(page.url()).searchParams.get("id"), createdId);
		await page
			.getByText("20 Kg", { exact: true })
			.filter({ visible: true })
			.first()
			.waitFor();
		await page.goBack();
		await list();
		await page.goBack();
		await hub();
		process.stdout.write(
			"Material required/duplicate/date validation, decimal input, multi-store create/edit, expiry clear and retained ID passed\n",
		);
		await page.getByText("Pembelian Barang", { exact: true }).click();
		await page
			.getByRole("button", { name: "Tambah Pesanan Pembelian", exact: true })
			.click();
		await page
			.getByText("Informasi Pesanan", { exact: true })
			.filter({ visible: true })
			.waitFor();
		await choose("Pilih toko", "Toko Sushiro");
		await choose("Pilih pemasok", "General Vendor");
		await choose("Pilih metode pembelian", "Pembelian langsung");
		await choose("Pilih metode pembayaran", "Tunai");
		await choose("Produk", "Bahan Baku");
		await choose("Tambah Bahan Baku", "Bahan Diubah");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.fill("2.5");
		await page.getByPlaceholder("Rp", { exact: true }).fill("10000");
		await page
			.getByRole("button", { name: "Simpan Pesanan Stok", exact: true })
			.click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		await page
			.getByText("Bahan Diubah", { exact: true })
			.filter({ visible: true })
			.waitFor();
		await page.goBack();
		await page
			.getByRole("button", { name: "Tambah Pesanan Pembelian", exact: true })
			.waitFor();
		await page.goBack();
		await hub();
		await page.getByText("Bahan Baku", { exact: true }).click();
		await list();
		await page
			.getByRole("button", { name: "Detail Bahan Diubah", exact: true })
			.click();
		await page.getByText("Pembelian masuk", { exact: true }).waitFor();
		await page.waitForTimeout(700);
		await shot("purchase-movement");
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page
			.getByRole("button", { name: "Hapus", exact: true })
			.last()
			.click();
		await page
			.getByText("Bahan baku masih digunakan pada transaksi atau mutasi stok", {
				exact: true,
			})
			.waitFor();
		await shot("protected-delete");
		await page.getByRole("button", { name: "Mengerti", exact: true }).click();
		await page.goBack();
		await list();
		await page.goBack();
		await hub();
		await page.getByText("Transfer Stok", { exact: true }).click();
		await page
			.getByRole("button", { name: "Tambah Transfer Stok", exact: true })
			.click();
		await choose("Pilih toko", "Toko Sushiro");
		await choose("Pilih toko tujuan", "Toko Degri");
		await choose("Produk", "Bahan Baku");
		await choose("Tambah Bahan Baku", "Bahan Diubah");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.fill("21");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByText("Jumlah melebihi stok tersedia", { exact: true })
			.waitFor();
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.fill("1.5");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		await page
			.getByText("Bahan Diubah", { exact: true })
			.filter({ visible: true })
			.waitFor();
		await page.goBack();
		await page
			.getByRole("button", { name: "Tambah Transfer Stok", exact: true })
			.waitFor();
		await page.goBack();
		await hub();
		await page.getByText("Bahan Baku", { exact: true }).click();
		await list();
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.click();
		await page
			.getByText("Pilih toko", { exact: true })
			.filter({ visible: true })
			.first()
			.click();
		await page
			.getByText("Toko Sushiro", { exact: true })
			.filter({ visible: true })
			.last()
			.click();
		await page.getByText("Selesai", { exact: true }).click();
		await page
			.getByPlaceholder("Masukkan nama bahan baku")
			.fill("Bahan Dihapus");
		await choose("Pilih satuan", "Kg");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(2)
			.fill("1000");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page
			.getByRole("button", { name: "Hapus", exact: true })
			.last()
			.click();
		await list();
		assert.equal(
			await page
				.getByRole("button", { name: "Detail Bahan Dihapus", exact: true })
				.count(),
			0,
		);
		await page.goBack();
		await hub();
		assert.deepEqual(errors, []);
		fs.writeFileSync(
			path.join(__dirname, "browser-results.json"),
			JSON.stringify(
				{
					generatedAt: new Date().toISOString(),
					passed: true,
					pageErrors: errors,
					viewports: ["390x1004", "320x812"],
					scope:
						"Actual feature components, route layouts and shared controls; authentication/backend bypassed",
				},
				null,
				2,
			) + "\n",
		);
		process.stdout.write(
			"Material purchase/recent movement/stock-transfer integration, fresh stock limits and confirmed detail deletion passed\n",
		);
	} catch (error) {
		await page.screenshot({
			path: path.join(project, ".expo/inventory-material-tools/failure.png"),
		});
		process.stderr.write(
			"Failure page: " +
				(await page.locator("body").innerText()).slice(-3200) +
				"\n",
		);
		throw error;
	} finally {
		await browser.close();
	}
}
main().catch((error) => {
	process.stderr.write(error.stack + "\n");
	process.exitCode = 1;
});
