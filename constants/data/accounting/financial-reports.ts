import type { CardListSection } from "@/components/custom/CardList";

export const FINANCIAL_REPORTS_META = {
	businessName: "Recinto Portuario",
	balanceSheet: {
		title: "Laporan Posisi Keuangan",
		period: "28 DESEMBER 2024",
		totalKewajibanEkuitas: "Rp1.004.990.000",
		selisih: "-",
	},
	profitLoss: {
		title: "Laporan Laba Rugi",
		period: "31 Januari 2026",
		labaKotor: "Rp389.550.000",
		labaBersihSebelumPajak: "Rp389.550.000",
		labaBersihSetelahPajak: "Rp398.750.000",
	},
	capitalChanges: {
		title: "Laporan Perubahan Modal",
		period: "31 Januari 2026",
	},
};

export function getBalanceSheetSections(): CardListSection[] {
	return [
		{
			title: "Harta Lancar",
			rows: [
				{
					type: "group",
					title: "Kas & Setara Kas",
					variant: "plain",
					rows: [
						{ label: "Kas Kecil", value: "Rp5.000.000" },
						{ label: "Kas", value: "Rp150.000.000" },
						{ label: "Bank BCA", value: "Rp100.900.000" },
						{ label: "Bank BRI", value: "Rp100.900.000" },
						{ label: "Bank BNI", value: "Rp15.600.000" },
						{ label: "Bank Mandiri", value: "Rp15.600.000" },
						{ label: "Bank Lainnya", value: "-" },
						{ label: "Gopay", value: "Rp20.900.000" },
						{ label: "Ovo", value: "Rp20.900.000" },
						{ label: "ShopeePay", value: "Rp20.900.000" },
						{ label: "Dompet Digital Lainnya", value: "-" },
					],
				},
				{
					type: "group",
					title: "Piutang",
					variant: "plain",
					rows: [
						{ label: "Piutang Usaha", value: "Rp2.000.000" },
						{ label: "Piutang Lainnya", value: "Rp3.000.000" },
						{ label: "Piutang Karyawan", value: "Rp5.000" },
						{ label: "Piutang Pihak Ketiga", value: "Rp4.000.000" },
					],
				},
				{
					type: "group",
					title: "Persediaan",
					variant: "plain",
					rows: [
						{ label: "Persediaan Bahan Baku", value: "Rp100.900.000" },
						{ label: "Persediaan Produk", value: "Rp27.700.000" },
						{ label: "Persediaan Umum", value: "Rp10.000.000" },
					],
				},
				{
					type: "group",
					title: "Biaya Dibayar Dimuka",
					variant: "plain",
					rows: [
						{ label: "Sewa Dibayar Dimuka", value: "Rp2.000.000" },
						{ label: "Asuransi Dibayar Dimuka", value: "Rp3.000.000" },
						{ label: "Biaya Dibayar Dimuka Lainnya", value: "Rp3.000.000" },
					],
				},
				{
					type: "group",
					title: "Pajak",
					variant: "plain",
					rows: [
						{ label: "PPh Imbalan", value: "Rp50.900.000" },
						{ label: "PPh Pasal 23-2 Dibayar Dimuka", value: "-" },
						{ label: "PPh Pasal 23-4 Dibayar Dimuka", value: "-" },
					],
				},
				{
					label: "Total Aset Lancar",
					value: "Rp614.900.000",
					important: true,
					separator: true,
				},
			],
		},
		{
			title: "Harta Tetap",
			rows: [
				{
					type: "group",
					title: "Aset",
					variant: "plain",
					rows: [
						{ label: "Tanah", value: "Rp100.900.000" },
						{ label: "Bangunan", value: "Rp100.900.000" },
						{ label: "Mesin & Peralatan", value: "Rp50.900.000" },
						{ label: "Kendaraan", value: "Rp20.900.000" },
					],
				},
				{
					type: "group",
					title: "Akumulasi Penyusutan",
					variant: "plain",
					rows: [
						{
							label: "Akumulasi Penyusutan Bangunan",
							value: "-Rp20.000.000",
						},
						{
							label: "Akumulasi Penyusutan Mesin & Peralatan",
							value: "-Rp5.000.000",
						},
						{
							label: "Akumulasi Penyusutan Kendaraan",
							value: "-Rp2.000.000",
						},
					],
				},
				{
					label: "Total Aset Tetap",
					value: "Rp243.600.000",
					important: true,
					separator: true,
				},
			],
		},
		{
			title: "Kewajiban Lancar",
			rows: [
				{
					type: "group",
					title: "Utang",
					variant: "plain",
					rows: [
						{ label: "Utang Usaha", value: "Rp50.900.000" },
						{ label: "Utang Lainnya", value: "Rp50.900.000" },
					],
				},
				{
					type: "group",
					title: "Pajak Terutang",
					variant: "plain",
					rows: [
						{ label: "PPh Imbalan", value: "Rp24.460.000" },
						{ label: "Pajak Restoran", value: "Rp90.000.000" },
						{ label: "Pajak Daerah Lainnya", value: "-" },
						{ label: "PPh Pasal 23-2 Terutang", value: "-" },
						{ label: "PPh Pasal 21 Terutang", value: "-" },
						{ label: "PPh Pasal 23-4 Terutang", value: "-" },
						{ label: "PPh Pasal 25 Terutang", value: "-" },
					],
				},
				{
					type: "group",
					title: "Kewajiban Lancar Lainnya",
					variant: "plain",
					rows: [
						{ label: "Utang Gaji & Upah", value: "Rp5.200.000" },
						{ label: "Utang Komisi Penjualan", value: "-" },
						{ label: "Utang Konsinyasi", value: "-" },
						{ label: "Pendapatan Diterima Dimuka", value: "-" },
						{ label: "Sewa Diterima Dimuka", value: "-" },
						{ label: "Utang Pihak Ketiga", value: "-" },
					],
				},
				{
					type: "group",
					title: "Kewajiban Tidak Lancar",
					variant: "plain",
					rows: [],
				},
				{
					type: "group",
					title: "Kewajiban Jangka Panjang",
					variant: "plain",
					rows: [
						{ label: "Utang Bank", value: "Rp400.000.000" },
						{ label: "Utang Pembiayaan", value: "-" },
					],
				},
				{
					label: "Total Kewajiban",
					value: "Rp568.060.000",
					important: true,
					separator: true,
				},
			],
		},
		{
			title: "Ekuitas",
			rows: [
				{
					type: "group",
					title: "Modal",
					variant: "plain",
					rows: [
						{ label: "Modal Disetor", value: "Rp100.000.000" },
						{ label: "Saham Biasa", value: "Rp50.000.000" },
					],
				},
				{
					type: "group",
					title: "Laba",
					variant: "plain",
					rows: [
						{ label: "Laba Ditahan", value: "Rp45.950.000" },
						{ label: "Laba Berjalan", value: "Rp10.000.000" },
					],
				},
				{
					label: "Total Kewajiban",
					value: "Rp628.950.000",
					important: true,
					separator: true,
				},
			],
		},
	];
}

export function getProfitLossSections(): {
	section1Penjualan: CardListSection;
	section2Hpp: CardListSection;
	section3BebanPembelian: CardListSection;
	section4BebanAdmin: CardListSection;
	section5PendapatanLain: CardListSection;
	section6BebanNonOperasional: CardListSection;
	section7BebanPajak: CardListSection;
} {
	return {
		section1Penjualan: {
			title: "Penjualan",
			rows: [
				{ label: "Penjualan Usaha", value: "Rp100.000.000" },
				{ label: "Penjualan Umum", value: "Rp100.000.000" },
				{ label: "Penjualan Jasa", value: "Rp100.000.000" },
				{ label: "Penjualan Lainnya", value: "Rp100.000.000" },
				{
					label: "Diskon Penjualan Usaha",
					value: "(Rp500.000)",
				},
				{
					label: "Diskon Penjualan Umum",
					value: "(Rp500.000)",
				},
				{
					label: "Diskon Penjualan Jasa",
					value: "(Rp500.000)",
				},
				{
					label: "Diskon Penjualan Lainnya",
					value: "(Rp500.000)",
				},
				{
					label: "Retur Penjualan Usaha",
					value: "(Rp500.000)",
				},
				{
					label: "Retur Penjualan Jasa",
					value: "(Rp500.000)",
				},
				{
					label: "Retur Penjualan Lainnya",
					value: "(Rp500.000)",
				},
				{
					label: "Penjualan Bersih",
					value: "Rp396.000.000",
					important: true,
					separator: true,
				},
			],
		},
		section2Hpp: {
			title: "Harga Pokok Penjualan",
			rows: [
				{
					label: "Harga Pokok Penjualan Usaha",
					value: "(Rp2.000.000)",
				},
				{
					label: "Harga Pokok Penjualan Umum",
					value: "(Rp2.000.000)",
				},
				{
					label: "Harga Pokok Penjualan Lainnya",
					value: "(Rp2.000.000)",
				},
				{
					label: "Total Harga Pokok Penjualan",
					value: "(Rp6.000.000)",
					important: true,
					separator: true,
				},
			],
		},
		section3BebanPembelian: {
			title: "Beban Pembelian",
			rows: [
				{
					label: "Beban Pengiriman",
					value: "(Rp50.000)",
				},
				{
					label: "Diskon Pembelian Usaha",
					value: "(Rp50.000)",
				},
				{
					label: "Diskon Pembelian Umum",
					value: "(Rp50.000)",
				},
				{
					label: "Diskon Pembelian Jasa",
					value: "(Rp50.000)",
				},
				{
					label: "Diskon Pembelian Lainnya",
					value: "(Rp50.000)",
				},
				{
					label: "Retur Pembelian Usaha",
					value: "(Rp50.000)",
				},
				{
					label: "Retur Pembelian Umum",
					value: "(Rp50.000)",
				},
				{
					label: "Retur Pembelian Jasa",
					value: "(Rp50.000)",
				},
				{
					label: "Retur Pembelian Lainnya",
					value: "(Rp50.000)",
				},
				{
					label: "Total Beban Pembelian",
					value: "(Rp450.000)",
					important: true,
					separator: true,
				},
			],
		},
		section4BebanAdmin: {
			title: "Beban Administrasi & Umum",
			rows: [
				{
					label: "Beban Komisi Penjualan",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Piutang Tak Tertagih",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Gaji & Upah",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Staff Ahli & Perizinan",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Sistem & Teknologi",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Sewa",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Listrik",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Air",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Telepon",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Internet",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Perlengkapan",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Operasional Lainnya",
					value: "(Rp50.000)",
				},
				{
					label: "Total Beban Operasional",
					value: "(Rp600.000)",
					important: true,
					separator: true,
				},
			],
		},
		section5PendapatanLain: {
			title: "Pendapatan Lainnya",
			rows: [
				{ label: "Pendapatan Usaha Lainnya", value: "Rp1.000.000" },
				{ label: "Pendapatan Bunga", value: "Rp1.000.000" },
				{ label: "Pendapatan Penjualan Aset", value: "Rp1.000.000" },
				{ label: "Pendapatan Dividen", value: "Rp1.000.000" },
				{
					label: "Total Pendapatan Lainnya",
					value: "Rp4.000.000",
					important: true,
					separator: true,
				},
			],
		},
		section6BebanNonOperasional: {
			title: "Beban Non Operasional",
			rows: [
				{
					label: "Beban Administrasi Bank",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Bunga",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Bagi Hasil",
					value: "(Rp50.000)",
				},
				{
					label: "Beban Non Operasional Lainnya",
					value: "(Rp50.000)",
				},
				{
					label: "Total Beban Operasional",
					value: "(Rp200.000)",
					important: true,
					separator: true,
				},
			],
		},
		section7BebanPajak: {
			title: "Beban Pajak",
			rows: [
				{
					label: "Beban Pajak Kini",
					value: "(Rp2.000.000)",
				},
				{
					label: "Beban Pajak Tangguhan",
					value: "(Rp2.000.000)",
				},
				{
					label: "Total Beban Operasional",
					value: "(Rp4.000.000)",
					important: true,
					separator: true,
				},
			],
		},
	};
}

export function getCapitalChangesSections(): CardListSection[] {
	return [
		{
			title: "Modal Akhir",
			rows: [
				{ label: "Modal Awal, 1 Januari 2025", value: "Rp200.000.000" },
				{ label: "Laba Bersih Tahun 2025", value: "Rp75.000.000" },
				{
					label: "Penambahan Bersih pada Madal",
					value: "Rp55.000.000",
				},
				{
					label: "Modal Akhir, 31 Desember 2025",
					value: "Rp255.000.000",
					important: true,
					separator: true,
				},
			],
		},
	];
}
