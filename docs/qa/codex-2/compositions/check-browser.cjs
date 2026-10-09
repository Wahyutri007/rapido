const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const project = path.resolve(__dirname, "../../../..");
const { chromium } = require(
	path.join(project, ".expo/payroll-qa-tools/node_modules/playwright"),
);
const shots = path.join(project, "docs/previews/inventory/compositions");
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
	let checks = 0;
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (
			message.type() === "error" &&
			!message.text().includes("WebSocket") &&
			!message.text().includes("focused")
		)
			process.stderr.write(message.text().slice(0, 500) + "\n");
	});
	function visibleText(text) {
		return page.getByText(text, { exact: true }).filter({ visible: true });
	}
	async function wait(text) {
		await visibleText(text).first().waitFor();
		checks++;
	}
	async function shot(name) {
		await page.waitForTimeout(400);
		await page.screenshot({ path: path.join(shots, name + ".png") });
	}
	async function choose(placeholder, name) {
		await visibleText(placeholder).first().click();
		await visibleText(name).last().click();
		await page.waitForTimeout(500);
	}
	async function list() {
		await page
			.getByRole("button", { name: /^Atur resep /i })
			.first()
			.waitFor();
		await page.waitForTimeout(650);
	}
	async function hub() {
		await wait("Persediaan");
		await page.waitForTimeout(650);
	}
	async function overflow() {
		assert.ok(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		);
		checks++;
	}
	async function stickyDetail() {
		const height = page.viewportSize().height;
		const header = await visibleText("Detail Komposisi").last().boundingBox();
		const edit = await page
			.getByRole("button", { name: "Edit", exact: true })
			.boundingBox();
		const remove = await page
			.getByRole("button", { name: "Hapus", exact: true })
			.boundingBox();
		assert.ok(
			header && header.y >= 0 && header.y + header.height <= 64,
			"Detail header must remain visible while scrolling",
		);
		assert.ok(
			edit &&
				remove &&
				edit.y >= height - 96 &&
				edit.y + edit.height <= height &&
				remove.y >= height - 96,
			"Detail actions must remain at the viewport bottom",
		);
		checks++;
	}
	async function saveRecipe() {
		await page
			.getByRole("button", { name: "Simpan Resep", exact: true })
			.click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		await wait("Detail Komposisi");
		await page.waitForTimeout(650);
	}
	try {
		await page.goto("http://127.0.0.1:8091/inventory", { waitUntil: "commit" });
		await visibleText("Persediaan").waitFor({ timeout: 180000 });
		await page.evaluate(() => document.fonts.ready);
		await visibleText("Komposisi Produk").click();
		await list();
		assert.equal(
			await page.getByRole("button", { name: /^Atur resep /i }).count(),
			8,
		);
		checks++;
		await shot("list");
		await overflow();
		const search = page
			.getByPlaceholder("Cari...", { exact: true })
			.filter({ visible: true });
		await search.fill("AYM/GPK/01");
		await page.waitForTimeout(350);
		assert.equal(
			await page.getByRole("button", { name: /^Atur resep /i }).count(),
			1,
		);
		checks++;
		await search.fill("Tidak ada menu ini");
		await wait("Tidak ada produk ditemukan");
		await search.fill("");
		await page.waitForTimeout(350);
		await page
			.getByRole("button", { name: "Filter inventaris", exact: true })
			.click();
		await choose("Semua Status", "Sudah Teresep");
		await wait("Tidak ada produk ditemukan");
		await choose("Sudah Teresep", "Belum Teresep");
		assert.equal(
			await page.getByRole("button", { name: /^Atur resep /i }).count(),
			8,
		);
		checks++;
		await choose("Belum Teresep", "Semua Status");
		await page
			.getByRole("button", { name: "Filter inventaris", exact: true })
			.click();
		await page.setViewportSize({ width: 320, height: 812 });
		await shot("list-320");
		await overflow();
		await page.setViewportSize({ width: 390, height: 1004 });
		await page
			.getByRole("button", {
				name: "Detail komposisi Ayam Geprek",
				exact: true,
			})
			.click();
		await wait("Belum ada resep untuk produk ini");
		await shot("empty-detail");
		await page.getByRole("button", { name: "Atur Resep", exact: true }).click();
		await wait("Bahan Baku Digunakan");
		await shot("empty-form");
		await page
			.getByRole("button", { name: "Simpan Resep", exact: true })
			.click();
		await wait("Pilih setidaknya satu bahan baku");
		await choose("Tambah Bahan Baku", "Tepung Terigu");
		await page
			.getByRole("button", { name: "Simpan Resep", exact: true })
			.click();
		await wait("Jumlah harus lebih dari 0");
		const inputs = page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true });
		assert.equal(await inputs.nth(1).inputValue(), "30000");
		checks++;
		await inputs.nth(0).pressSequentially("0.25", { delay: 50 });
		assert.equal(await inputs.nth(0).inputValue(), "0.25");
		checks++;
		await choose("Tambah Bahan Baku", "Cabe");
		await page
			.getByRole("button", { name: "Hapus bahan Cabe", exact: true })
			.click();
		assert.equal(
			await page
				.getByRole("button", { name: "Hapus bahan Tepung Terigu", exact: true })
				.count(),
			1,
		);
		checks++;
		await shot("filled-form");
		await saveRecipe();
		await wait("Rp 7.500");
		await wait("Rp 20.500");
		await wait("73,2%");
		await page.mouse.move(195, 400);
		await page.mouse.wheel(0, -2000);
		await page.waitForTimeout(250);
		await shot("detail");
		await stickyDetail();
		await page.mouse.move(195, 700);
		await page.mouse.wheel(0, 700);
		await page.waitForTimeout(250);
		const portions = page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true });
		await portions.click();
		const inputBounds = await portions.boundingBox();
		assert.ok(
			inputBounds &&
				inputBounds.y >= 64 &&
				inputBounds.y + inputBounds.height < 928,
			"Custom portions input must be reachable above sticky actions",
		);
		checks++;
		await shot("simulation");
		await stickyDetail();
		await wait("Rp 37.500");
		await wait("Rp 75.000");
		await portions.fill("2.5");
		await wait("Rp 18.750");
		await wait("0,625 Kg");
		await portions.fill("0");
		await wait("Jumlah porsi tidak valid atau estimasi terlalu besar");
		await portions.fill("10");
		await page.setViewportSize({ width: 320, height: 812 });
		await page.mouse.move(160, 500);
		await page.mouse.wheel(0, 700);
		await portions.click();
		const smallInputBounds = await portions.boundingBox();
		assert.ok(
			smallInputBounds &&
				smallInputBounds.y >= 64 &&
				smallInputBounds.y + smallInputBounds.height < 736,
			"Custom portions input must be reachable at 320px",
		);
		checks++;
		await shot("simulation-320");
		await stickyDetail();
		await overflow();
		await page.setViewportSize({ width: 390, height: 1004 });
		await page.getByRole("button", { name: "Edit", exact: true }).click();
		await wait("Bahan Baku Digunakan");
		assert.equal(
			await page
				.getByPlaceholder("0", { exact: true })
				.filter({ visible: true })
				.nth(0)
				.inputValue(),
			"0.25",
		);
		checks++;
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(0)
			.fill("0.3");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(1)
			.fill("40000");
		await saveRecipe();
		await wait("Rp 12.000");
		await wait("57,1%");
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page.getByRole("button", { name: "Batal", exact: true }).click();
		await wait("Detail Komposisi");
		await page.goBack();
		await list();
		await page
			.getByRole("button", { name: "Filter inventaris", exact: true })
			.click();
		await choose("Semua Status", "Sudah Teresep");
		assert.equal(
			await page.getByRole("button", { name: /^Atur resep /i }).count(),
			1,
		);
		checks++;
		await choose("Sudah Teresep", "Semua Status");
		await page
			.getByRole("button", { name: "Filter inventaris", exact: true })
			.click();
		await page.goBack();
		await hub();
		process.stdout.write(
			"Recipe search/filter, per-unit cost/margin, decimal form/edit, simulation and 320px overflow passed\n",
		);
		await visibleText("Bahan Baku").click();
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.click();
		await wait("Informasi Pesanan");
		await visibleText("Pilih toko").first().click();
		await visibleText("Toko Sushiro").last().click();
		await visibleText("Selesai").click();
		await page
			.getByPlaceholder("Masukkan nama bahan baku")
			.fill("Bahan Resep Pengujian");
		await page.getByPlaceholder("Masukkan kode bahan").fill("BBK-RCP-QA");
		await choose("Pilih satuan", "Liter");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(0)
			.fill("3");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(2)
			.fill("20000");
		await page.getByRole("button", { name: "Simpan", exact: true }).click();
		await page
			.getByRole("button", { name: "Lihat Detail", exact: true })
			.click();
		await wait("Detail Bahan Baku");
		await page.goBack();
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.waitFor();
		await page.goBack();
		await hub();
		await visibleText("Komposisi Produk").click();
		await list();
		await page
			.getByRole("button", { name: "Atur resep Chicken Katsu", exact: true })
			.click();
		await wait("Bahan Baku Digunakan");
		await choose("Tambah Bahan Baku", "Bahan Resep Pengujian");
		await page
			.getByPlaceholder("0", { exact: true })
			.filter({ visible: true })
			.nth(0)
			.fill("0.01");
		await saveRecipe();
		await wait("Rp 200");
		await wait("Harga jual belum tersedia; margin belum dapat dihitung.");
		await page.goBack();
		await list();
		await page.goBack();
		await hub();
		await visibleText("Bahan Baku").click();
		await page
			.getByRole("button", {
				name: "Detail Bahan Resep Pengujian",
				exact: true,
			})
			.click();
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page
			.getByRole("button", { name: "Hapus", exact: true })
			.last()
			.click();
		await wait("Bahan baku masih digunakan pada resep produk");
		await shot("protected-material-delete");
		await page.getByRole("button", { name: "Mengerti", exact: true }).click();
		await page.goBack();
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.waitFor();
		await page.goBack();
		await hub();
		await visibleText("Komposisi Produk").click();
		await list();
		await page
			.getByRole("button", {
				name: "Detail komposisi Chicken Katsu",
				exact: true,
			})
			.click();
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page
			.getByRole("button", { name: "Hapus", exact: true })
			.last()
			.click();
		await list();
		await page
			.getByRole("button", {
				name: "Detail komposisi Chicken Katsu",
				exact: true,
			})
			.click();
		await wait("Belum ada resep untuk produk ini");
		await page.goBack();
		await list();
		await page.goBack();
		await hub();
		await visibleText("Bahan Baku").click();
		await page
			.getByRole("button", {
				name: "Detail Bahan Resep Pengujian",
				exact: true,
			})
			.click();
		await page.getByRole("button", { name: "Hapus", exact: true }).click();
		await page
			.getByRole("button", { name: "Hapus", exact: true })
			.last()
			.click();
		await page
			.getByRole("button", { name: "Tambah Bahan Baku", exact: true })
			.waitFor();
		assert.equal(
			await page
				.getByRole("button", {
					name: "Detail Bahan Resep Pengujian",
					exact: true,
				})
				.count(),
			0,
		);
		checks++;
		await page.goBack();
		await hub();
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
						"Actual recipe/material components, shared primitives and route layouts; auth/backend bypassed",
				},
				null,
				2,
			) + "\n",
		);
		process.stdout.write(
			"New material/recipe integration, unknown-price handling, recipe deletion and material deletion guard/release passed\n",
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
					error: error.message,
					pageErrors: errors,
				},
				null,
				2,
			) + "\n",
		);
		process.stderr.write(
			"Failure page: " +
				(await page.locator("body").innerText()).slice(-3500) +
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
