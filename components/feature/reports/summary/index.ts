import type { CardListSection } from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export type SummaryReportData = {
	kinerjaUtama: {
		omzet: number;
		penjualanBersih: number;
		labaBersih: number;
		totalTransaksi: number;
		saldoKas: number;
		piutang: number;
	};
	labaRugi: {
		penjualanBersih: number;
		hpp: number;
		labaKotor: number;
		bebanOperasional: number;
		labaBersih: number;
		marginBersih: string;
	};
	likuiditas: {
		saldoKas: number;
		pengeluaranRataRata: number;
		arusKasBersih: number;
		runway: string;
		rasioLancar: string;
	};
	piutangUsaha: {
		total: number;
		belumJatuhTempo: number;
		jatuhTempo1Sd30Hari: number;
		lebihDari30Hari: number;
	};
	utangPemasok: {
		total: number;
		jatuhTempo7Hari: number;
		jatuhTempo30Hari: number;
		lebihDari30Hari: number;
	};
	penjualan: {
		rataRataTransaksi: number;
		produkTerlaris: string;
		produkTerlambat: string;
		jamTersibuk: string;
		channelTerbaik: string;
		pembayaranDominan: string;
	};
	produkPersediaan: {
		totalProdukAktif: number;
		produkTanpaStok: number;
		produkBelumLengkap: number;
		paketTerlaris: string;
		nilaiStok: number;
		stokMenipis: number;
		stokHabis: number;
		stokMasuk: number;
		stokKeluar: number;
		penyesuaian: number;
		stokAkhir: number;
	};
	promoPelanggan: {
		promoAktif: number;
		voucherTerpakai: number;
		totalDiskon: number;
		promoTerbaik: string;
		dampakPromo: string;
		totalMember: number;
		memberBaru: number;
		memberAktif: number;
		repeatCustomer: number;
		topMember: string;
	};
};

export const DEFAULT_SUMMARY_REPORT: SummaryReportData = {
	kinerjaUtama: {
		omzet: 75000000,
		penjualanBersih: 71250000,
		labaBersih: 18250000,
		totalTransaksi: 1842,
		saldoKas: 48500000,
		piutang: 8045000,
	},
	labaRugi: {
		penjualanBersih: 71250000,
		hpp: -30000000,
		labaKotor: 41250000,
		bebanOperasional: -23000000,
		labaBersih: 18250000,
		marginBersih: "25,63%",
	},
	likuiditas: {
		saldoKas: 48500000,
		pengeluaranRataRata: 20450000,
		arusKasBersih: 12500000,
		runway: "2,4 bulan",
		rasioLancar: "1,8x",
	},
	piutangUsaha: {
		total: 8450000,
		belumJatuhTempo: 5300000,
		jatuhTempo1Sd30Hari: 1500000,
		lebihDari30Hari: -650000,
	},
	utangPemasok: {
		total: 10000000,
		jatuhTempo7Hari: 3200000,
		jatuhTempo30Hari: 4800000,
		lebihDari30Hari: -2000000,
	},
	penjualan: {
		rataRataTransaksi: 40715,
		produkTerlaris: "Es Kopi Susu",
		produkTerlambat: "Cheese Cake Slice",
		jamTersibuk: "18.00-19.00",
		channelTerbaik: "Toko Fisik",
		pembayaranDominan: "QRIS (58%)",
	},
	produkPersediaan: {
		totalProdukAktif: 152,
		produkTanpaStok: 7,
		produkBelumLengkap: 3,
		paketTerlaris: "Paket Hemat 2",
		nilaiStok: 96500000,
		stokMenipis: 11,
		stokHabis: 7,
		stokMasuk: 22500000,
		stokKeluar: 18750000,
		penyesuaian: 250000,
		stokAkhir: 96500000,
	},
	promoPelanggan: {
		promoAktif: 3,
		voucherTerpakai: 312,
		totalDiskon: 1850000,
		promoTerbaik: "Weekend Promo",
		dampakPromo: "+8% penjualan",
		totalMember: 2456,
		memberBaru: 186,
		memberAktif: 1102,
		repeatCustomer: 18750000,
		topMember: "Andi Pratama",
	},
};

export function getSummaryReportSections(
	customData?: Partial<SummaryReportData>,
): CardListSection[] {
	const data: SummaryReportData = {
		...DEFAULT_SUMMARY_REPORT,
		...customData,
		kinerjaUtama: {
			...DEFAULT_SUMMARY_REPORT.kinerjaUtama,
			...customData?.kinerjaUtama,
		},
		labaRugi: {
			...DEFAULT_SUMMARY_REPORT.labaRugi,
			...customData?.labaRugi,
		},
		likuiditas: {
			...DEFAULT_SUMMARY_REPORT.likuiditas,
			...customData?.likuiditas,
		},
		piutangUsaha: {
			...DEFAULT_SUMMARY_REPORT.piutangUsaha,
			...customData?.piutangUsaha,
		},
		utangPemasok: {
			...DEFAULT_SUMMARY_REPORT.utangPemasok,
			...customData?.utangPemasok,
		},
		penjualan: {
			...DEFAULT_SUMMARY_REPORT.penjualan,
			...customData?.penjualan,
		},
		produkPersediaan: {
			...DEFAULT_SUMMARY_REPORT.produkPersediaan,
			...customData?.produkPersediaan,
		},
		promoPelanggan: {
			...DEFAULT_SUMMARY_REPORT.promoPelanggan,
			...customData?.promoPelanggan,
		},
	};

	return [
		{
			title: "Kinerja Utama",
			rows: [
				{ label: "Omzet", value: formatRp(data.kinerjaUtama.omzet) },
				{
					label: "Penjualan Bersih",
					value: formatRp(data.kinerjaUtama.penjualanBersih),
				},
				{
					label: "Laba Bersih",
					value: formatRp(data.kinerjaUtama.labaBersih),
				},
				{
					label: "Total Transaksi",
					value: data.kinerjaUtama.totalTransaksi.toLocaleString("id-ID"),
				},
				{
					label: "Saldo Kas",
					value: formatRp(data.kinerjaUtama.saldoKas),
				},
				{
					label: "Piutang",
					value: formatRp(data.kinerjaUtama.piutang),
				},
			],
		},
		{
			title: "Laba Rugi",
			rows: [
				{
					label: "Penjualan Bersih",
					value: formatRp(data.labaRugi.penjualanBersih),
				},
				{
					label: "Harga Pokok Penjualan",
					value: formatRp(data.labaRugi.hpp),
					variant: "negative",
				},
				{
					label: "Laba Kotor",
					value: formatRp(data.labaRugi.labaKotor),
					separator: true,
				},
				{
					label: "Beban Operasional",
					value: formatRp(data.labaRugi.bebanOperasional),
					variant: "negative",
				},
				{
					label: "Laba Bersih",
					value: formatRp(data.labaRugi.labaBersih),
					separator: true,
				},
				{ label: "Margin Bersih", value: data.labaRugi.marginBersih },
			],
		},
		{
			title: "Likuiditas",
			rows: [
				{
					label: "Saldo Kas",
					value: formatRp(data.likuiditas.saldoKas),
				},
				{
					label: "Pengeluaran Rata-rata/Bulan",
					value: formatRp(data.likuiditas.pengeluaranRataRata),
				},
				{
					label: "Arus Kas Bersih",
					value: formatRp(data.likuiditas.arusKasBersih),
				},
				{ label: "Runway", value: data.likuiditas.runway },
				{ label: "Rasio Lancar", value: data.likuiditas.rasioLancar },
			],
		},
		{
			title: "Piutang Usaha",
			rows: [
				{
					label: "Total",
					value: formatRp(data.piutangUsaha.total),
					important: true,
				},
				{
					label: "Belum Jatuh Tempo",
					value: formatRp(data.piutangUsaha.belumJatuhTempo),
				},
				{
					label: "Jatuh Tempo 1-30 Hari",
					value: formatRp(data.piutangUsaha.jatuhTempo1Sd30Hari),
				},
				{
					label: "Lebih dari 30 Hari",
					value: formatRp(data.piutangUsaha.lebihDari30Hari),
					variant: "negative",
				},
			],
		},
		{
			title: "Utang Pemasok",
			rows: [
				{
					label: "Total",
					value: formatRp(data.utangPemasok.total),
					important: true,
				},
				{
					label: "Jatuh Tempo 7 Hari",
					value: formatRp(data.utangPemasok.jatuhTempo7Hari),
				},
				{
					label: "Jatuh Tempo 30 Hari",
					value: formatRp(data.utangPemasok.jatuhTempo30Hari),
				},
				{
					label: "Lebih dari 30 Hari",
					value: formatRp(data.utangPemasok.lebihDari30Hari),
					variant: "negative",
				},
			],
		},
		{
			title: "Penjualan",
			rows: [
				{
					label: "Rata-rata Transaksi",
					value: formatRp(data.penjualan.rataRataTransaksi),
				},
				{ label: "Produk Terlaris", value: data.penjualan.produkTerlaris },
				{ label: "Produk Terlambat", value: data.penjualan.produkTerlambat },
				{ label: "Jam Tersibuk", value: data.penjualan.jamTersibuk },
				{ label: "Channel Terbaik", value: data.penjualan.channelTerbaik },
				{
					label: "Pembayaran Dominan",
					value: data.penjualan.pembayaranDominan,
				},
			],
		},
		{
			title: "Produk dan Persediaan",
			rows: [
				{
					label: "Total Produk Aktif",
					value: data.produkPersediaan.totalProdukAktif.toLocaleString("id-ID"),
				},
				{
					label: "Produk Tanpa Stok",
					value: data.produkPersediaan.produkTanpaStok.toLocaleString("id-ID"),
				},
				{
					label: "Produk Belum Lengkap",
					value: data.produkPersediaan.produkBelumLengkap.toLocaleString("id-ID"),
				},
				{
					label: "Paket Terlaris",
					value: data.produkPersediaan.paketTerlaris,
				},
				{
					label: "Nilai Stok",
					value: formatRp(data.produkPersediaan.nilaiStok),
				},
				{
					label: "Stok Menipis",
					value: data.produkPersediaan.stokMenipis.toLocaleString("id-ID"),
				},
				{
					label: "Stok Habis",
					value: data.produkPersediaan.stokHabis.toLocaleString("id-ID"),
					variant: "negative",
				},
				{
					label: "Stok Masuk",
					value: formatRp(data.produkPersediaan.stokMasuk),
				},
				{
					label: "Stok Keluar",
					value: formatRp(data.produkPersediaan.stokKeluar),
				},
				{
					label: "Penyesuaian",
					value: formatRp(data.produkPersediaan.penyesuaian),
				},
				{
					label: "Stok Akhir",
					value: formatRp(data.produkPersediaan.stokAkhir),
					important: true,
					separator: true,
				},
			],
		},
		{
			title: "Promo dan Pelanggan",
			rows: [
				{
					label: "Promo Aktif",
					value: data.promoPelanggan.promoAktif.toLocaleString("id-ID"),
				},
				{
					label: "Voucher Terpakai",
					value: data.promoPelanggan.voucherTerpakai.toLocaleString("id-ID"),
				},
				{
					label: "Total Diskon",
					value: formatRp(data.promoPelanggan.totalDiskon),
				},
				{ label: "Promo Terbaik", value: data.promoPelanggan.promoTerbaik },
				{
					label: "Dampak Promo",
					value: data.promoPelanggan.dampakPromo,
					variant: "positive",
				},
				{
					label: "Total Member",
					value: data.promoPelanggan.totalMember.toLocaleString("id-ID"),
				},
				{
					label: "Member Baru",
					value: data.promoPelanggan.memberBaru.toLocaleString("id-ID"),
				},
				{
					label: "Member Aktif",
					value: data.promoPelanggan.memberAktif.toLocaleString("id-ID"),
				},
				{
					label: "Repeat Customer",
					value: formatRp(data.promoPelanggan.repeatCustomer),
				},
				{
					label: "Top Member",
					value: data.promoPelanggan.topMember,
					important: true,
					separator: true,
				},
			],
		},
	];
}
