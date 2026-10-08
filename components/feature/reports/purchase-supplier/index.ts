import type { CardListSection } from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export type PurchaseRecommendationItem = {
	name: string;
	quantity: string;
	amount: number;
};

export type TopSupplierItem = {
	name: string;
	quantity: string;
	amount: number;
};

export type PriceChangeItem = {
	name: string;
	diff: number;
	direction: "up" | "down";
};

export type PurchaseSupplierReportData = {
	ringkasanPembelian: {
		totalPembelian: number;
		jumlahPesananPO: number;
		poAktif: number;
		poSelesai: number;
		penjualanBersih: number;
	};
	rekomendasiPembelian: PurchaseRecommendationItem[];
	rekomendasiPemasok: {
		pemasokAktif: number;
		supplierTerbaik: string;
		supplierTerlambat: string;
		produkHargaBeliNaik: number;
	};
	topPemasok: TopSupplierItem[];
	perubahanHargaBeli: PriceChangeItem[];
	perluPerhatian: {
		stokHabisDesc: string;
		hargaNaikDesc: string;
	};
};

export const DEFAULT_PURCHASE_SUPPLIER_REPORT: PurchaseSupplierReportData = {
	ringkasanPembelian: {
		totalPembelian: 48750000,
		jumlahPesananPO: 42,
		poAktif: 24,
		poSelesai: 18,
		penjualanBersih: 96000000,
	},
	rekomendasiPembelian: [
		{ name: "Susu UHT", quantity: "80 Liter", amount: 1760000 },
		{ name: "Roti Tawar", quantity: "60 Pack", amount: 1020000 },
		{ name: "Sirup Vanilla", quantity: "30 Botol", amount: 1500000 },
	],
	rekomendasiPemasok: {
		pemasokAktif: 32,
		supplierTerbaik: "Sinar Jaya Abadi",
		supplierTerlambat: "Maju Sentosa",
		produkHargaBeliNaik: 5,
	},
	topPemasok: [
		{ name: "Sinar Jaya Abadi", quantity: "128 Pack", amount: 18450000 },
		{ name: "Aneka Boga", quantity: "96 Pack", amount: 12860000 },
		{ name: "Maju Sentosa", quantity: "30 Pack", amount: 8970000 },
	],
	perubahanHargaBeli: [
		{ name: "Susu UHT", diff: 120000, direction: "up" },
		{ name: "Gula Pasir", diff: 80000, direction: "down" },
		{ name: "Biji Kopi Arabika", diff: 250000, direction: "up" },
		{ name: "Sirup Vanilla", diff: 40000, direction: "up" },
	],
	perluPerhatian: {
		stokHabisDesc: "6 produk berisiko habis\n7 hari",
		hargaNaikDesc: "5 produk utama naik\nharga",
	},
};

export function getPurchaseSupplierReportSections(
	customData?: Partial<PurchaseSupplierReportData>,
): CardListSection[] {
	const data: PurchaseSupplierReportData = {
		...DEFAULT_PURCHASE_SUPPLIER_REPORT,
		...customData,
		ringkasanPembelian: {
			...DEFAULT_PURCHASE_SUPPLIER_REPORT.ringkasanPembelian,
			...customData?.ringkasanPembelian,
		},
		rekomendasiPemasok: {
			...DEFAULT_PURCHASE_SUPPLIER_REPORT.rekomendasiPemasok,
			...customData?.rekomendasiPemasok,
		},
		perluPerhatian: {
			...DEFAULT_PURCHASE_SUPPLIER_REPORT.perluPerhatian,
			...customData?.perluPerhatian,
		},
		rekomendasiPembelian:
			customData?.rekomendasiPembelian ??
			DEFAULT_PURCHASE_SUPPLIER_REPORT.rekomendasiPembelian,
		topPemasok:
			customData?.topPemasok ?? DEFAULT_PURCHASE_SUPPLIER_REPORT.topPemasok,
		perubahanHargaBeli:
			customData?.perubahanHargaBeli ??
			DEFAULT_PURCHASE_SUPPLIER_REPORT.perubahanHargaBeli,
	};

	return [
		{
			title: "Ringkasan Pembelian",
			rows: [
				{
					label: "Total Pembelian",
					value: formatRp(data.ringkasanPembelian.totalPembelian),
				},
				{
					label: "Jumlah Pesanan Pembelian",
					value: `${data.ringkasanPembelian.jumlahPesananPO} PO`,
				},
				{
					label: "PO Aktif",
					value: `${data.ringkasanPembelian.poAktif} PO`,
				},
				{
					label: "PO Selesai",
					value: `${data.ringkasanPembelian.poSelesai} PO`,
				},
				{
					label: "Penjualan Bersih",
					value: formatRp(data.ringkasanPembelian.penjualanBersih),
					important: true,
					separator: true,
				},
			],
		},
		{
			title: "Rekomendasi Pembelian",
			rows: data.rekomendasiPembelian.map((item) => ({
				label: item.name,
				middleValue: item.quantity,
				value: formatRp(item.amount),
			})),
		},
		{
			title: "Rekomendasi Pemasok",
			rows: [
				{
					label: "Pemasok Aktif",
					value: `${data.rekomendasiPemasok.pemasokAktif} Pemasok`,
				},
				{
					label: "Supplier Terbaik",
					value: data.rekomendasiPemasok.supplierTerbaik,
					valueClassName: "text-primary-500",
				},
				{
					label: "Supplier Terlambat",
					value: data.rekomendasiPemasok.supplierTerlambat,
					variant: "negative",
				},
				{
					label: "Produk Harga Beli Naik",
					value: `${data.rekomendasiPemasok.produkHargaBeliNaik} Produk`,
				},
			],
		},
		{
			title: "Top Pemasok",
			rows: data.topPemasok.map((item) => ({
				label: item.name,
				middleValue: item.quantity,
				value: formatRp(item.amount),
			})),
		},
		{
			title: "Perubahan Harga Beli",
			rows: data.perubahanHargaBeli.map((item) => ({
				label: item.name,
				value: `${item.direction === "up" ? "↑" : "↓"} ${formatRp(item.diff)}`,
				variant: item.direction === "up" ? "negative" : "positive",
			})),
		},
		{
			title: "Perlu Perhatian",
			rows: [
				{
					label: "Stok Habis",
					value: data.perluPerhatian.stokHabisDesc,
					variant: "negative",
					valueClassName: "text-right",
				},
				{
					label: "Harga Naik",
					value: data.perluPerhatian.hargaNaikDesc,
					variant: "negative",
					valueClassName: "text-right",
				},
			],
		},
	];
}
