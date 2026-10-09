const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const project = path.resolve(__dirname, "../../../..");
const { chromium } = require(
	path.join(project, ".expo/payroll-qa-tools/node_modules/playwright"),
);
const shots = path.join(project, "docs/previews/inventory/bill-payments");
fs.mkdirSync(shots, { recursive: true });
const resultFile = path.join(__dirname, "browser-results.json");
async function main() {
	fs.writeFileSync(
		resultFile,
		JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				passed: false,
				status: "running",
			},
			null,
			2,
		) + "\n",
	);
	// Build before opening Edge so startup does not compete with browser memory.
	process.stdout.write("Preparing the owned Inventory preview bundle...\n");
	for (let attempt = 0; ; attempt++) {
		try {
			const response = await fetch(
				"http://127.0.0.1:8081/preview-inventory/entry.bundle?platform=web&dev=true&hot=false&lazy=false",
				{ signal: AbortSignal.timeout(180000) },
			);
			if (!response.ok)
				throw new Error(`Preview bundle HTTP ${response.status}`);
			const reader = response.body.getReader();
			while (!(await reader.read()).done) {}
			break;
		} catch (error) {
			if (attempt >= 12) throw error;
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}
	process.stdout.write(
		"Preview bundle ready; checking actual routes and controls...\n",
	);
	const browser = await chromium.launch({
		headless: true,
		executablePath:
			"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
	});
	const page = await browser.newPage({
		viewport: { width: 390, height: 1004 },
		timezoneId: "Asia/Jakarta",
	});
	page.setDefaultTimeout(45000);
	const errors = [];
	let checks = 0;
	page.on("pageerror", (error) => errors.push(error.message));
	const text = (value) =>
		page.getByText(value, { exact: true }).filter({ visible: true });
	const button = (name) =>
		page.getByRole("button", { name, exact: true }).filter({ visible: true });
	const amounts = () =>
		page.getByPlaceholder("0", { exact: true }).filter({ visible: true });
	async function wait(value) {
		await text(value).first().waitFor();
		checks++;
	}
	async function money(value) {
		await page
			.getByText(new RegExp("Rp\\s*" + value.replaceAll(".", "\\.")))
			.filter({ visible: true })
			.first()
			.waitFor();
		checks++;
	}
	async function shot(name) {
		await page.waitForTimeout(400);
		await page.screenshot({ path: path.join(shots, name + ".png") });
	}
	async function choose(placeholder, value) {
		await text(placeholder).first().click();
		await text(value).last().click();
		await page.waitForTimeout(500);
	}
	async function overflow() {
		assert.ok(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		);
		checks++;
	}
	async function metricBounds() {
		for (const index of [0, 1]) {
			const metric = page
				.getByTestId(`bill-payment-metric-${index}`)
				.filter({ visible: true });
			const bounds = await metric.boundingBox();
			assert.ok(
				bounds &&
					bounds.x >= 16 &&
					bounds.x + bounds.width <= page.viewportSize().width - 16,
			);
			assert.ok(
				await metric.evaluate(
					(node) => node.scrollWidth <= node.clientWidth + 1,
				),
			);
		}
		checks++;
	}
	async function back() {
		// This isolated route root omits app boot/groups; browser history returns
		// across module boundaries. Production header navigation needs the full root.
		await page.goBack();
		await page.waitForTimeout(650);
	}
	async function hub() {
		for (
			let step = 0;
			step < 8 && (await text("Persediaan").count()) === 0;
			step++
		)
			await back();
		await wait("Persediaan");
	}
	async function save() {
		await button("Simpan Pembayaran").click();
		await button("Lihat Detail").click();
		await wait("Detail Pembayaran");
		await page.waitForTimeout(650);
	}
	async function fill(index, value) {
		await amounts().nth(index).fill("");
		await amounts().nth(index).pressSequentially(value, { delay: 35 });
	}
	async function sticky() {
		const height = page.viewportSize().height;
		const header = await text("Detail Pembayaran").last().boundingBox();
		const edit = await button("Edit").boundingBox();
		assert.ok(header && header.y >= 0 && header.y + header.height <= 64);
		assert.ok(edit && edit.y >= height - 96 && edit.y + edit.height <= height);
		checks++;
	}
	try {
		await page.goto("http://127.0.0.1:8091/inventory", { waitUntil: "commit" });
		await text("Persediaan").waitFor({ timeout: 180000 });
		await page.evaluate(() => document.fonts.ready);
		await text("Pembayaran Tagihan").click({ noWaitAfter: true });
		await button("Tambah Pembayaran Tagihan").waitFor();
		await wait("Belum ada pembayaran tagihan ditemukan");
		await money("19.432.000");
		await overflow();
		await metricBounds();
		await shot("empty-list");
		await page.setViewportSize({ width: 320, height: 812 });
		await overflow();
		await metricBounds();
		await shot("empty-list-320");
		await page.setViewportSize({ width: 390, height: 1004 });
		await button("Tambah Pembayaran Tagihan").click();
		await wait("Informasi Tagihan");
		await shot("empty-form");
		await button("Simpan Pembayaran").click();
		await wait("Pilih setidaknya satu tagihan");
		await choose("Pilih pemasok", "General Vendor");
		await wait("Tidak ada tagihan belum lunas untuk pemasok ini");
		await choose("General Vendor", "PT Cahaya Abadi");
		await choose("Pilih tagihan untuk ditambahkan", "PO/A004/2603/002");
		await button("Hapus tagihan PO/A004/2603/002").click();
		assert.equal(await amounts().count(), 0);
		checks++;
		await back();
		await hub();
		await text("Pembelian Barang").click();
		await button("Tambah Pesanan Pembelian").click();
		await wait("Informasi Pesanan");
		await choose("Pilih toko", "Toko Sushiro");
		await choose("Pilih pemasok", "PT Cahaya Abadi");
		await choose("Pilih metode pembelian", "Pesanan pembelian");
		await choose("Pilih metode pembayaran", "Transfer Bank");
		await page.getByRole("switch", { name: "Pesanan lunas" }).click();
		await choose("Tambah Produk", "Nasgor - Pedas");
		await amounts().first().fill("0.5");
		await page
			.getByPlaceholder("Rp", { exact: true })
			.filter({ visible: true })
			.fill("40000");
		await button("Simpan Pesanan Stok").click();
		await button("Lihat Detail").click();
		await wait("Detail Pesanan Pembelian");
		await money("20.000");
		await wait("Belum Lunas");
		await back();
		await hub();
		await text("Pembayaran Tagihan").click();
		await button("Tambah Pembayaran Tagihan").click();
		await wait("Informasi Tagihan");
		await choose("Pilih pemasok", "PT Cahaya Abadi");
		await choose("Pilih metode pembayaran", "Transfer Bank");
		await page
			.getByPlaceholder("Nomor referensi pembayaran")
			.fill("QA/BILL/01");
		await page
			.getByPlaceholder("Catatan pembayaran")
			.fill("Pembayaran beberapa PO");
		await choose("Pilih tagihan untuk ditambahkan", "PO/A004/2603/002");
		await fill(0, "200000");
		await fill(1, "1000000");
		await choose("Pilih tagihan untuk ditambahkan", "PO/A001/2603/005");
		await fill(2, "1000");
		await fill(3, "10000");
		await fill(1, "1000000.25");
		await money("1.010.000,25");
		await money("18.240.999,75");
		await fill(1, "1000000");
		await money("1.010.000");
		await money("18.241.000");
		const date = page.getByPlaceholder("YYYY-MM-DD").filter({ visible: true });
		await date.fill("2026-02-29");
		await button("Simpan Pembayaran").click();
		await wait("Masukkan tanggal valid dengan format YYYY-MM-DD");
		await date.fill("2025-10-07");
		await button("Simpan Pembayaran").click();
		await wait("Tanggal pembayaran tidak boleh sebelum tanggal tagihan");
		await date.fill("2026-10-09");
		await fill(1, "19432000");
		await button("Simpan Pembayaran").click();
		await wait("Pembayaran dan diskon melebihi sisa PO/A004/2603/002");
		await fill(1, "1000000");
		await shot("filled-form");
		await page.setViewportSize({ width: 320, height: 812 });
		await overflow();
		await amounts().last().scrollIntoViewIfNeeded();
		await page.mouse.move(200, 450);
		await page.mouse.wheel(0, 350);
		await page.waitForTimeout(300);
		const amountBounds = await amounts().last().boundingBox();
		assert.ok(
			amountBounds &&
				amountBounds.y >= 64 &&
				amountBounds.y + amountBounds.height <= 736,
		);
		checks++;
		await amounts().last().click();
		await shot("filled-form-320");
		await page.setViewportSize({ width: 390, height: 1004 });
		await save();
		const firstUrl = page.url();
		await money("1.010.000");
		await money("201.000");
		await money("18.241.000");
		await sticky();
		await shot("detail");
		await back();
		await button("Tambah Pembayaran Tagihan").waitFor();
		const search = page.getByPlaceholder("Cari..").filter({ visible: true });
		await search.fill("not-existing");
		await wait("Belum ada pembayaran tagihan ditemukan");
		await search.fill("QA/BILL/01");
		await page
			.getByRole("button", { name: /^Detail pembayaran KK/ })
			.filter({ visible: true })
			.first()
			.waitFor();
		assert.equal(
			await page
				.getByRole("button", { name: /^Detail pembayaran KK/ })
				.filter({ visible: true })
				.count(),
			1,
		);
		checks++;
		await search.fill("");
		await button("Filter inventaris").click();
		await choose("Semua Pemasok", "General Vendor");
		await wait("Belum ada pembayaran tagihan ditemukan");
		await choose("General Vendor", "PT Cahaya Abadi");
		await page.setViewportSize({ width: 320, height: 812 });
		await overflow();
		await metricBounds();
		await shot("list-320");
		await page.setViewportSize({ width: 390, height: 1004 });
		await shot("list");
		await page
			.getByRole("button", { name: /^Detail pembayaran KK/ })
			.filter({ visible: true })
			.click();
		await wait("Detail Pembayaran");
		await button("Hapus").click();
		await button("Batal").click();
		await button("Edit").click();
		await wait("Informasi Tagihan");
		assert.equal(await amounts().nth(1).inputValue(), "1000000");
		checks++;
		await fill(0, "0");
		await fill(1, "2000000");
		await save();
		assert.equal(page.url(), firstUrl);
		checks++;
		await money("2.010.000");
		await money("17.441.000");
		await page
			.getByRole("button", { name: "Lihat Pesanan Pembelian", exact: true })
			.filter({ visible: true })
			.first()
			.click();
		await wait("Detail Pesanan Pembelian");
		await wait("Sebagian");
		await money("17.432.000");
		await button("Bayar Tagihan").click();
		await wait("Informasi Tagihan");
		assert.equal(await amounts().nth(1).inputValue(), "17432000");
		checks++;
		await choose("Pilih metode pembayaran", "Tunai");
		await save();
		await money("17.432.000");
		await page
			.getByRole("button", { name: "Lihat Pesanan Pembelian", exact: true })
			.filter({ visible: true })
			.click();
		await wait("Lunas");
		assert.equal(await button("Bayar Tagihan").count(), 0);
		checks++;
		await back();
		await button("Hapus").click();
		await button("Hapus").last().click();
		await button("Tambah Pembayaran Tagihan").waitFor();
		assert.equal(
			await page
				.getByRole("button", { name: /^Detail pembayaran KK/ })
				.filter({ visible: true })
				.count(),
			1,
		);
		checks++;
		await hub();
		await text("Pembelian Barang").click();
		await button("Aksi PO/A004/2603/002").click();
		await text("Hapus Pesanan Pembelian").last().click();
		await page.waitForTimeout(500);
		await button("Hapus").last().click();
		await wait("Pesanan masih digunakan pada pembayaran tagihan");
		await shot("protected-purchase-delete");
		await button("Mengerti").click();
		assert.equal(await button("Detail PO/A004/2603/002").count(), 1);
		checks++;
		await hub();
		await text("Pembayaran Tagihan").click();
		await page
			.getByRole("button", { name: /^Detail pembayaran KK/ })
			.filter({ visible: true })
			.click();
		await page.setViewportSize({ width: 320, height: 812 });
		await page.mouse.move(200, 450);
		await page.mouse.wheel(0, 900);
		await page.waitForTimeout(400);
		await overflow();
		await sticky();
		await shot("detail-320");
		await button("Hapus").click();
		await button("Hapus").last().click();
		await wait("Belum ada pembayaran tagihan ditemukan");
		await money("19.452.000");
		await page.setViewportSize({ width: 390, height: 1004 });
		await hub();
		await text("Pembelian Barang").click();
		await button("Aksi PO/A001/2603/005").click();
		await text("Hapus Pesanan Pembelian").last().click();
		await page.waitForTimeout(500);
		await button("Hapus").last().click();
		await button("Detail PO/A001/2603/005").waitFor({ state: "hidden" });
		assert.equal(await button("Detail PO/A001/2603/005").count(), 0);
		checks++;
		await page.goto(
			"http://127.0.0.1:8091/inventory/bill-payments/detail?id=missing",
			{ waitUntil: "commit" },
		);
		await wait("Pembayaran tidak ditemukan");
		assert.equal(await button("Edit").count(), 0);
		checks++;
		await page.goto(
			"http://127.0.0.1:8091/inventory/bill-payments/modify?id=missing",
			{ waitUntil: "commit" },
		);
		await wait("Pembayaran atau tagihan tidak ditemukan");
		assert.equal(await button("Simpan Pembayaran").count(), 0);
		checks++;
		await page.goto(
			"http://127.0.0.1:8091/inventory/bill-payments/modify?id=",
			{ waitUntil: "commit" },
		);
		await wait("Pembayaran atau tagihan tidak ditemukan");
		await page.goto(
			"http://127.0.0.1:8091/inventory/bill-payments/modify?purchaseId=missing",
			{ waitUntil: "commit" },
		);
		await wait("Pembayaran atau tagihan tidak ditemukan");
		assert.deepEqual(errors, []);
		checks++;
		fs.writeFileSync(
			resultFile,
			JSON.stringify(
				{
					generatedAt: new Date().toISOString(),
					passed: true,
					assertions: checks,
					pageErrors: errors,
					viewports: ["390x1004", "320x812"],
					scope:
						"Actual payment/purchase components and production Inventory layouts; auth/backend bypassed",
				},
				null,
				2,
			) + "\n",
		);
		console.log(
			checks +
				" billing browser assertions passed: multi-PO/partial/edit/settle/delete/guard, date and latest balances, search/filter and 320px geometry",
		);
	} catch (error) {
		await page.screenshot({ path: path.join(shots, "failure.png") });
		fs.writeFileSync(
			resultFile,
			JSON.stringify(
				{
					generatedAt: new Date().toISOString(),
					passed: false,
					assertions: checks,
					error: String(error.stack ?? error),
					pageErrors: errors,
				},
				null,
				2,
			) + "\n",
		);
		throw error;
	} finally {
		await browser.close();
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
