import type { CardListSection } from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export type PaymentMethodSummaryItem = {
	method: string;
	amount: number;
};

export type TopCashierTransactionItem = {
	name: string;
	transactions: number;
	amount: number;
};

export type CashReportData = {
	ringkasanTransaksi: {
		jumlahTransaksiRp: number;
		totalTransaksiCount: number;
		rataRataTransaksi: number;
		transaksiBerhasil: number;
		transaksiDibatalkan: number;
	};
	metodePembayaran: {
		items: PaymentMethodSummaryItem[];
		totalPembayaran: number;
	};
	ringkasanKasTunai: {
		kasSistem: number;
		kasFisik: number;
		selisihKas: number;
		setoranHariIni: number;
		sisaKasKecil: number;
	};
	ringkasanPotongan: {
		refundCount: number;
		nilaiRefund: number;
		promoCount: number;
		nilaiPromo: number;
		diskonCount: number;
		nilaiDiskon: number;
		voucherCount: number;
		nilaiVoucher: number;
	};
	kasirTransaksiTertinggi: TopCashierTransactionItem[];
};

export const DEFAULT_CASH_REPORT: CashReportData = {
	ringkasanTransaksi: {
		jumlahTransaksiRp: 96000000,
		totalTransaksiCount: 268,
		rataRataTransaksi: 358200,
		transaksiBerhasil: 265,
		transaksiDibatalkan: 3,
	},
	metodePembayaran: {
		items: [
			{ method: "Tunai", amount: 35000000 },
			{ method: "QRIS", amount: 42000000 },
			{ method: "Debit / Kredit", amount: 15000000 },
			{ method: "Transfer", amount: 4000000 },
		],
		totalPembayaran: 96000000,
	},
	ringkasanKasTunai: {
		kasSistem: 35000000,
		kasFisik: 34925000,
		selisihKas: -75000,
		setoranHariIni: 34000000,
		sisaKasKecil: 925000,
	},
	ringkasanPotongan: {
		refundCount: 100,
		nilaiRefund: 1000000,
		promoCount: 28,
		nilaiPromo: -250000,
		diskonCount: 5,
		nilaiDiskon: -50000,
		voucherCount: 1,
		nilaiVoucher: 15000,
	},
	kasirTransaksiTertinggi: [
		{ name: "Rahmanda Agist", transactions: 68, amount: 2368000 },
		{ name: "Arianja", transactions: 54, amount: 1872000 },
		{ name: "Julliandi Eka F", transactions: 41, amount: 1412000 },
	],
};

export function getCashReportSections(
	customData?: Partial<CashReportData>,
): CardListSection[] {
	const data: CashReportData = {
		...DEFAULT_CASH_REPORT,
		...customData,
		ringkasanTransaksi: {
			...DEFAULT_CASH_REPORT.ringkasanTransaksi,
			...customData?.ringkasanTransaksi,
		},
		metodePembayaran: {
			...DEFAULT_CASH_REPORT.metodePembayaran,
			...customData?.metodePembayaran,
		},
		ringkasanKasTunai: {
			...DEFAULT_CASH_REPORT.ringkasanKasTunai,
			...customData?.ringkasanKasTunai,
		},
		ringkasanPotongan: {
			...DEFAULT_CASH_REPORT.ringkasanPotongan,
			...customData?.ringkasanPotongan,
		},
		kasirTransaksiTertinggi:
			customData?.kasirTransaksiTertinggi ??
			DEFAULT_CASH_REPORT.kasirTransaksiTertinggi,
	};

	return [
		{
			title: "Ringkasan Transaksi",
			rows: [
				{
					label: "Jumlah Transaksi",
					value: formatRp(data.ringkasanTransaksi.jumlahTransaksiRp),
				},
				{
					label: "Total Transaksi",
					value: `${data.ringkasanTransaksi.totalTransaksiCount} Transaksi`,
				},
				{
					label: "Rata-rata Transaksi",
					value: formatRp(data.ringkasanTransaksi.rataRataTransaksi),
				},
				{
					label: "Transaksi Berhasil",
					value: `${data.ringkasanTransaksi.transaksiBerhasil} Transaksi`,
				},
				{
					label: "Transaksi Dibatalkan",
					value: `${data.ringkasanTransaksi.transaksiDibatalkan} Transaksi`,
				},
			],
		},
		{
			title: "Metode Pembayaran",
			rows: [
				...data.metodePembayaran.items.map((item) => ({
					label: item.method,
					value: formatRp(item.amount),
				})),
				{
					label: "Total Pembayaran",
					value: formatRp(data.metodePembayaran.totalPembayaran),
					important: true,
					separator: true,
				},
			],
		},
		{
			title: "Ringkasan Kas Tunai",
			rows: [
				{
					label: "Kas Sistem",
					value: formatRp(data.ringkasanKasTunai.kasSistem),
				},
				{
					label: "Kas Fisik",
					value: formatRp(data.ringkasanKasTunai.kasFisik),
				},
				{
					label: "Selisih Kas",
					value: `(${formatRp(Math.abs(data.ringkasanKasTunai.selisihKas))})`,
					variant: "negative",
				},
				{
					label: "Setoran Hari Ini",
					value: formatRp(data.ringkasanKasTunai.setoranHariIni),
				},
				{
					label: "Sisa Kas Kecil",
					value: formatRp(data.ringkasanKasTunai.sisaKasKecil),
				},
			],
		},
		{
			title: "Ringkasan Potongan",
			rows: [
				{
					label: "Refund",
					value: `${data.ringkasanPotongan.refundCount} Transaksi`,
				},
				{
					label: "Nilai Refund",
					value: formatRp(data.ringkasanPotongan.nilaiRefund),
				},
				{
					label: "Promo",
					value: `${data.ringkasanPotongan.promoCount} Transaksi`,
				},
				{
					label: "Nilai Promo",
					value: `(${formatRp(Math.abs(data.ringkasanPotongan.nilaiPromo))})`,
					variant: "negative",
				},
				{
					label: "Diskon",
					value: `${data.ringkasanPotongan.diskonCount} Transaksi`,
				},
				{
					label: "Nilai Diskon",
					value: `(${formatRp(Math.abs(data.ringkasanPotongan.nilaiDiskon))})`,
					variant: "negative",
				},
				{
					label: "Voucher",
					value: `${data.ringkasanPotongan.voucherCount} Transaksi`,
				},
				{
					label: "Nilai Voucher",
					value: formatRp(data.ringkasanPotongan.nilaiVoucher),
				},
			],
		},
		{
			title: "Kasir dengan Transaksi Tertinggi",
			colFlex: [3.8, 3.0, 3.2],
			rows: data.kasirTransaksiTertinggi.map((item) => ({
				label: item.name,
				middleValue: `${item.transactions} Transaksi`,
				value: formatRp(item.amount),
			})),
		},
	];
}
