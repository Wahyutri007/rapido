import type { CardListSection } from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export type BestSellingProductItem = {
	name: string;
	quantity: string;
	amount: number;
};

export type MostProfitableProductItem = {
	name: string;
	profit: number;
};

export type CriticalStockItem = {
	name: string;
	quantity: string;
	status: string;
	level: "critical" | "warning";
};

export type UnsoldProductItem = {
	name: string;
	quantity: string;
	unsoldDays: number;
};

export type ProductStockReportData = {
	ringkasanProduk: {
		totalProdukAktif: number;
		produkTerjual: number;
		produkTidakTerjual: number;
		produkTidakLaku30Hari: number;
	};
	ringkasanPersediaan: {
		totalNilaiStok: number;
		stokTersedia: number;
		stokKritis: number;
		stokKosong: number;
		penyesuaianStok: number;
	};
	produkTerlaris: BestSellingProductItem[];
	produkPalingMenguntungkan: MostProfitableProductItem[];
	stokKritis: CriticalStockItem[];
	produkTidakLaku: UnsoldProductItem[];
	mutasiPenyesuaianStok: {
		stokMasuk: number;
		stokKeluar: number;
		transferStok: number;
		nilaiSelisihStok: number;
	};
};

export const DEFAULT_PRODUCT_STOCK_REPORT: ProductStockReportData = {
	ringkasanProduk: {
		totalProdukAktif: 1248,
		produkTerjual: 812,
		produkTidakTerjual: 436,
		produkTidakLaku30Hari: 18,
	},
	ringkasanPersediaan: {
		totalNilaiStok: 58750000,
		stokTersedia: 1248,
		stokKritis: 4,
		stokKosong: 12,
		penyesuaianStok: 12,
	},
	produkTerlaris: [
		{ name: "Teh Telur Pinang", quantity: "248 Item", amount: 12000000 },
		{ name: "Roti Bakar", quantity: "186 Item", amount: 12000000 },
		{ name: "Es Teh", quantity: "142 Item", amount: 12000000 },
	],
	produkPalingMenguntungkan: [
		{ name: "Kopi Susu", profit: 6300000 },
		{ name: "Roti Bakar", profit: 12000000 },
		{ name: "Matcha Latte", profit: 12000000 },
	],
	stokKritis: [
		{
			name: "Susu Full Cream",
			quantity: "2 Unit",
			status: "Sangat Kritis",
			level: "critical",
		},
		{
			name: "Sirup Vanilla",
			quantity: "3 Item",
			status: "Kritis",
			level: "critical",
		},
		{
			name: "Roti Tawar",
			quantity: "5 Pack",
			status: "Hampir Habis",
			level: "warning",
		},
	],
	produkTidakLaku: [
		{ name: "Teh Lemon Botol", quantity: "24 Item", unsoldDays: 45 },
		{ name: "Sirup Vanilla", quantity: "3 Item", unsoldDays: 10 },
		{ name: "Roti Tawar", quantity: "5 Pack", unsoldDays: 10 },
	],
	mutasiPenyesuaianStok: {
		stokMasuk: 320,
		stokKeluar: 812,
		transferStok: 28,
		nilaiSelisihStok: -850000,
	},
};

export function getProductStockReportSections(
	customData?: Partial<ProductStockReportData>,
): CardListSection[] {
	const data: ProductStockReportData = {
		...DEFAULT_PRODUCT_STOCK_REPORT,
		...customData,
		ringkasanProduk: {
			...DEFAULT_PRODUCT_STOCK_REPORT.ringkasanProduk,
			...customData?.ringkasanProduk,
		},
		ringkasanPersediaan: {
			...DEFAULT_PRODUCT_STOCK_REPORT.ringkasanPersediaan,
			...customData?.ringkasanPersediaan,
		},
		mutasiPenyesuaianStok: {
			...DEFAULT_PRODUCT_STOCK_REPORT.mutasiPenyesuaianStok,
			...customData?.mutasiPenyesuaianStok,
		},
		produkTerlaris:
			customData?.produkTerlaris ?? DEFAULT_PRODUCT_STOCK_REPORT.produkTerlaris,
		produkPalingMenguntungkan:
			customData?.produkPalingMenguntungkan ??
			DEFAULT_PRODUCT_STOCK_REPORT.produkPalingMenguntungkan,
		stokKritis:
			customData?.stokKritis ?? DEFAULT_PRODUCT_STOCK_REPORT.stokKritis,
		produkTidakLaku:
			customData?.produkTidakLaku ??
			DEFAULT_PRODUCT_STOCK_REPORT.produkTidakLaku,
	};

	return [
		{
			title: "Ringkasan Produk",
			rows: [
				{
					label: "Total Produk Aktif",
					value: `${data.ringkasanProduk.totalProdukAktif.toLocaleString("id-ID")} Produk`,
				},
				{
					label: "Produk Terjual",
					value: `${data.ringkasanProduk.produkTerjual.toLocaleString("id-ID")} Produk`,
				},
				{
					label: "Produk Tidak Terjual",
					value: `${data.ringkasanProduk.produkTidakTerjual.toLocaleString("id-ID")} Item`,
				},
				{
					label: "Produk Tidak Laku 30 Hari",
					value: `${data.ringkasanProduk.produkTidakLaku30Hari.toLocaleString("id-ID")} Produk`,
				},
			],
		},
		{
			title: "Ringkasan Persediaan",
			rows: [
				{
					label: "Total Nilai Stok",
					value: formatRp(data.ringkasanPersediaan.totalNilaiStok),
				},
				{
					label: "Stok Tersedia",
					value: `${data.ringkasanPersediaan.stokTersedia.toLocaleString("id-ID")} Item`,
				},
				{
					label: "Stok Kritis",
					value: `${data.ringkasanPersediaan.stokKritis} Produk`,
				},
				{
					label: "Stok Kosong",
					value: `${data.ringkasanPersediaan.stokKosong} Produk`,
				},
				{
					label: "Penyesuaian Stok",
					value: `${data.ringkasanPersediaan.penyesuaianStok} Transaksi`,
				},
			],
		},
		{
			title: "Produk Terlaris",
			rows: data.produkTerlaris.map((item) => ({
				label: item.name,
				middleValue: item.quantity,
				value: formatRp(item.amount),
			})),
		},
		{
			title: "Produk Paling Menguntungkan",
			rows: data.produkPalingMenguntungkan.map((item) => ({
				label: item.name,
				value: formatRp(item.profit),
			})),
		},
		{
			title: "Stok Kritis",
			rows: data.stokKritis.map((item) => ({
				label: item.name,
				middleValue: item.quantity,
				value: item.status,
				variant: item.level === "critical" ? "negative" : "default",
				valueClassName:
					item.level === "warning" ? "text-amber-500" : undefined,
			})),
		},
		{
			title: "Produk Tidak Laku",
			colFlex: [3.4, 2.0, 4.6],
			rows: data.produkTidakLaku.map((item) => ({
				label: item.name,
				middleValue: item.quantity,
				value: `${item.unsoldDays} hari tidak terjual`,
			})),
		},
		{
			title: "Mutasi & Penyesuaian Stok",
			rows: [
				{
					label: "Stok Masuk",
					value: `${data.mutasiPenyesuaianStok.stokMasuk.toLocaleString("id-ID")} Item`,
				},
				{
					label: "Stok Keluar",
					value: `${data.mutasiPenyesuaianStok.stokKeluar.toLocaleString("id-ID")} Item`,
				},
				{
					label: "Transfer Stok",
					value: `${data.mutasiPenyesuaianStok.transferStok} Transaksi`,
				},
				{
					label: "Nilai Selisih Stok",
					value: `(${formatRp(Math.abs(data.mutasiPenyesuaianStok.nilaiSelisihStok))})`,
					variant: "negative",
				},
			],
		},
	];
}
