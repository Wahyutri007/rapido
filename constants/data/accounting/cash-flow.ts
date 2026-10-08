import type Feather from "@expo/vector-icons/Feather";

export type CashFlowTab = "operasi" | "investasi" | "pendanaan";

export type CashFlowItem = {
	id: string;
	title: string;
	description: string;
	amount: string;
	variant: "positive" | "negative" | "neutral";
};

export type CashFlowTabData = {
	title: string;
	totalLabel: string;
	totalAmount: string;
	items: CashFlowItem[];
};

export type CashFlowAccountRow = {
	id: string;
	code: string;
	name: string;
	amount: string;
	variant: "positive" | "negative" | "neutral";
};

export type CashFlowCategorySection = {
	id: string;
	icon: keyof typeof Feather.glyphMap;
	title: string;
	subtitle: string;
	rows: CashFlowAccountRow[];
};

export const CASH_FLOW_SUMMARY = {
	operasi: {
		label: "Arus Kas Operasi",
		amount: "Rp235.750.000",
		variant: "positive" as const,
	},
	investasi: {
		label: "Arus Kas Investasi",
		amount: "(Rp168.350.000)",
		variant: "negative" as const,
	},
	pendanaan: {
		label: "Arus Kas Pendanaan",
		amount: "Rp92.600.000",
		variant: "positive" as const,
	},
	netCashChange: {
		label: "Kenaikan (penurunan) Kas Bersih",
		amount: "Rp159.000.000",
	},
	initialCash: {
		label: "Saldo Kas Awal",
		amount: "Rp245.300.000",
	},
	endingCash: {
		label: "Saldo Kas Akhir",
		amount: "Rp404.300.000",
	},
};

export const CASH_FLOW_TAB_DATA: Record<CashFlowTab, CashFlowTabData> = {
	operasi: {
		title: "Ringkasan Arus Kas Operasi",
		totalLabel: "Total Arus Kas Operasi",
		totalAmount: "Rp235.750.000",
		items: [
			{
				id: "op-1",
				title: "Penerimaan dari Pelanggan",
				description: "Piutang usaha, Penjualan dll",
				amount: "Rp512.450.000",
				variant: "positive",
			},
			{
				id: "op-2",
				title: "Pembayaran ke Pemasok",
				description: "Utang Usaha, Pembelian dll",
				amount: "(Rp287.600.000)",
				variant: "negative",
			},
			{
				id: "op-3",
				title: "Pembayaran Beban Operasional",
				description: "Gaji, Sewa, Listrik, Admin, dll",
				amount: "(Rp96.250.000)",
				variant: "negative",
			},
			{
				id: "op-4",
				title: "Pembayaran Pajak",
				description: "PPN, PPH, Pajak Lainnya",
				amount: "(Rp24.000.000)",
				variant: "negative",
			},
			{
				id: "op-5",
				title: "Pendapatan Lainnya",
				description: "Bunga, Jasa, Pendapatan Lain",
				amount: "Rp28.750.000",
				variant: "positive",
			},
			{
				id: "op-6",
				title: "Beban Lainnya",
				description: "Beban Luar Usaha, Beban Non Operasional",
				amount: "(Rp2.600.000)",
				variant: "negative",
			},
		],
	},
	investasi: {
		title: "Ringkasan Arus Kas Investasi",
		totalLabel: "Total Arus Kas Investasi",
		totalAmount: "Rp0",
		items: [
			{
				id: "inv-1",
				title: "Surat Berharga & Deposito",
				description: "Deposito",
				amount: "Rp0",
				variant: "positive",
			},
			{
				id: "inv-2",
				title: "Investasi",
				description: "Investasi Saham",
				amount: "Rp0",
				variant: "neutral",
			},
			{
				id: "inv-3",
				title: "Harta Tetap",
				description: "Tanah, Bangunan, Mesin & Peralatan, kendaraan, dll",
				amount: "Rp138.450.000",
				variant: "negative",
			},
			{
				id: "inv-4",
				title: "Pembayaran Pajak",
				description: "Piutang usaha, Penjualan dll",
				amount: "Rp0",
				variant: "neutral",
			},
			{
				id: "inv-5",
				title: "Pendapatan Lainnya",
				description: "Piutang usaha, Penjualan dll",
				amount: "Rp0",
				variant: "neutral",
			},
			{
				id: "inv-6",
				title: "Beban Lainnya",
				description: "Piutang usaha, Penjualan dll",
				amount: "Rp0",
				variant: "neutral",
			},
		],
	},
	pendanaan: {
		title: "Ringkasan Arus Kas Pendanaan",
		totalLabel: "Total Arus Kas Pendanaan",
		totalAmount: "Rp92.600.000",
		items: [
			{
				id: "fin-1",
				title: "Pajak Terutang",
				description: "PPN Keluaran, PPh 23, PPh 4(2), PPh 25",
				amount: "(Rp287.600.000)",
				variant: "negative",
			},
			{
				id: "fin-2",
				title: "Kewajiban Lancar Lainnya",
				description:
					"Utang gaji, biaya akrual, utang pajak, pendapatan diterima dimuka",
				amount: "(Rp287.600.000)",
				variant: "negative",
			},
			{
				id: "fin-3",
				title: "Kewajiban Jangka Panjang",
				description: "Utang Bank, Utang Pembiayaan",
				amount: "(Rp96.250.000)",
				variant: "negative",
			},
			{
				id: "fin-4",
				title: "Modal",
				description: "PPN, PPH, Pajak Lainnya",
				amount: "(Rp24.000.000)",
				variant: "negative",
			},
			{
				id: "fin-5",
				title: "Laba & Ekuitas",
				description: "Laba Ditahan, Laba Berjalan, Ekuitas Saldo Awal",
				amount: "Rp28.750.000",
				variant: "positive",
			},
		],
	},
};

export const CASH_FLOW_DETAIL_DATA: Record<
	CashFlowTab,
	CashFlowCategorySection[]
> = {
	operasi: [
		{
			id: "op-sec-1",
			icon: "shopping-cart",
			title: "Penerimaan dari Pelanggan",
			subtitle: "4 akun • Total Rp0",
			rows: [
				{
					id: "op-r-1",
					code: "4100-00-001",
					name: "Penjualan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "op-r-2",
					code: "4100-00-001",
					name: "Penjualan Jasa",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "op-r-3",
					code: "4100-00-001",
					name: "Penjualan Umum",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "op-r-4",
					code: "4100-00-001",
					name: "Piutang Usaha",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "op-r-5",
					code: "4100-00-001",
					name: "Diskon Penjualan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-6",
					code: "4100-00-001",
					name: "Retur Penjualan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-7",
					code: "4100-00-001",
					name: "Retur Penjualan Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "op-sec-2",
			icon: "shopping-bag",
			title: "Penerimaan dari Pemasok",
			subtitle: "8 akun • Total Rp0",
			rows: [
				{
					id: "op-r-8",
					code: "1140-00-001",
					name: "Persediaan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-9",
					code: "1140-00-002",
					name: "Persediaan Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-10",
					code: "2110-00-001",
					name: "Utang Usaha",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-11",
					code: "5100-00-001",
					name: "Harga Pokok Penjualan Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-12",
					code: "5200-00-001",
					name: "Beban Pengiriman",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-13",
					code: "5300-00-001",
					name: "Diskon Pembelian",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-14",
					code: "5400-00-001",
					name: "Retur Penjualan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-15",
					code: "5400-00-002",
					name: "Retur Pembelian Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "op-sec-3",
			icon: "users",
			title: "Beban Operasional",
			subtitle: "4 akun • Total Rp0",
			rows: [
				{
					id: "op-r-16",
					code: "4100-00-001",
					name: "Beban Komisi Penjualan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-17",
					code: "4100-00-001",
					name: "Beban Piutang Tak Tertagih",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-18",
					code: "4100-00-001",
					name: "Beban Gaji & Upah",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-19",
					code: "4100-00-001",
					name: "Beban Staff Ahli & Perizinan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-20",
					code: "4100-00-001",
					name: "Beban Sistem & Teknologi",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-21",
					code: "4100-00-001",
					name: "Beban Sewa",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-22",
					code: "4100-00-001",
					name: "Beban Listrik",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-23",
					code: "4100-00-001",
					name: "Beban Air",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-24",
					code: "4100-00-001",
					name: "Beban Telepon",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-25",
					code: "4100-00-001",
					name: "Beban Internet",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-26",
					code: "4100-00-001",
					name: "Beban Perlengkapan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-27",
					code: "4100-00-001",
					name: "Beban Operasional Lainnya",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "op-sec-4",
			icon: "percent",
			title: "Pembayaran Pajak",
			subtitle: "5 akun • Total Rp0",
			rows: [
				{
					id: "op-r-28",
					code: "4600-00-009",
					name: "Pendapatan Usaha Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-29",
					code: "8100-00-001",
					name: "Pendapatan Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-30",
					code: "8100-00-002",
					name: "Pendapatan Bunga / Bagi Hasil",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-31",
					code: "8200-00-001",
					name: "Laba Selisih Kurs - Unrealize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-32",
					code: "8200-00-002",
					name: "Laba Selisih Kurs - Realize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "op-sec-5",
			icon: "home",
			title: "Pendapatan Lainnya",
			subtitle: "5 akun • Total Rp0",
			rows: [
				{
					id: "op-r-33",
					code: "4600-00-009",
					name: "Pendapatan Usaha Lain",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "op-r-34",
					code: "8100-00-001",
					name: "Pendapatan Lain",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "op-r-35",
					code: "8100-00-002",
					name: "Pendapatan Bunga / Bagi Hasil",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "op-r-36",
					code: "8200-00-001",
					name: "Laba Selisih Kurs - Unrealize",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "op-r-37",
					code: "8200-00-002",
					name: "Laba Selisih Kurs - Realize",
					amount: "Rp24.000.000",
					variant: "positive",
				},
			],
		},
		{
			id: "op-sec-6",
			icon: "minus-circle",
			title: "Beban Lainnya",
			subtitle: "5 akun • Total Rp0",
			rows: [
				{
					id: "op-r-38",
					code: "4600-00-009",
					name: "Beban Atas Pendapatan Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-39",
					code: "8100-00-001",
					name: "Beban Non Operasional",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-40",
					code: "8100-00-002",
					name: "Beban Administrasi Bank",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-41",
					code: "8200-00-001",
					name: "Beban Bunga / Bagi Hasil",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-42",
					code: "8200-00-002",
					name: "Beban Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-43",
					code: "8200-00-002",
					name: "Rugi Selisih Kurs - Unrealize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "op-r-44",
					code: "8200-00-002",
					name: "Rugi Selisih Kurs - Realize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
	],
	investasi: [
		{
			id: "inv-sec-1",
			icon: "shopping-cart",
			title: "Surat Berharga & Deposito",
			subtitle: "1 akun • Total Rp28.750.000",
			rows: [
				{
					id: "inv-r-1",
					code: "1120-00-001",
					name: "Deposito",
					amount: "Rp28.750.000",
					variant: "positive",
				},
			],
		},
		{
			id: "inv-sec-2",
			icon: "shopping-bag",
			title: "Investasi",
			subtitle: "1 akun • Total Rp28.750.000",
			rows: [
				{
					id: "inv-r-2",
					code: "1180-00-001",
					name: "Investasi Saham",
					amount: "Rp28.750.000",
					variant: "positive",
				},
			],
		},
		{
			id: "inv-sec-3",
			icon: "users",
			title: "Harta Tetap",
			subtitle: "5 akun • Total Rp143.750.000",
			rows: [
				{
					id: "inv-r-3",
					code: "1210-00-001",
					name: "Tanah",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-4",
					code: "1210-00-002",
					name: "Bangunan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-5",
					code: "1210-00-003",
					name: "Mesin & Peralatan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-6",
					code: "1210-00-004",
					name: "Kendaraan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-7",
					code: "1210-00-099",
					name: "Harga Tetap Lainnya",
					amount: "Rp28.750.000",
					variant: "positive",
				},
			],
		},
		{
			id: "inv-sec-4",
			icon: "percent",
			title: "Akumulasi Penyusutan",
			subtitle: "4 akun • Total Rp115.000.000",
			rows: [
				{
					id: "inv-r-8",
					code: "1220-00-002",
					name: "Akumulasi Penyusutan Bangunan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-9",
					code: "1220-00-003",
					name: "Akumulasi Penyusutan Mesin & Peralatan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-10",
					code: "1220-00-004",
					name: "Akumulasi Penyusutan Kendaraan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-11",
					code: "1220-00-099",
					name: "Akumulasi Penyusutan Harga Tetap Lainnya",
					amount: "Rp28.750.000",
					variant: "positive",
				},
			],
		},
		{
			id: "inv-sec-5",
			icon: "gift",
			title: "Uang Muka & Biaya Dibayar Dimuka",
			subtitle: "4 akun • Total Rp0",
			rows: [
				{
					id: "inv-r-12",
					code: "1150-00-001",
					name: "Uang Muka Pengeluaran Umum",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "inv-r-13",
					code: "1161-00-001",
					name: "Sewa Dibayar Dimuka",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "inv-r-14",
					code: "1161-00-002",
					name: "Asuransi Dibayar Dimuka",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "inv-r-15",
					code: "1161-00-099",
					name: "Biaya Dibayar Dimuka Lain",
					amount: "Rp24.000.000",
					variant: "positive",
				},
			],
		},
		{
			id: "inv-sec-6",
			icon: "minus-circle",
			title: "Pajak Dibayar Dimuka & Pendapatan",
			subtitle: "5 akun • Total Rp143.750.000",
			rows: [
				{
					id: "inv-r-16",
					code: "1162-00-001",
					name: "PPN Masukan",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-17",
					code: "1162-00-002",
					name: "PPh Pasal 23-2 Dibayar Dimuka",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-18",
					code: "1162-00-004",
					name: "PPh Pasal 4 ayat 2 Dibayar Dimuka",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-19",
					code: "1162-00-005",
					name: "PPh Pasal 25 Dibayar Dimuka",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "inv-r-20",
					code: "11-0007-001",
					name: "Pendapatan yang akan diterima",
					amount: "Rp28.750.000",
					variant: "positive",
				},
			],
		},
	],
	pendanaan: [
		{
			id: "fin-sec-1",
			icon: "shopping-cart",
			title: "Pajak Terutang",
			subtitle: "4 akun • Total Rp0",
			rows: [
				{
					id: "fin-r-1",
					code: "4100-00-001",
					name: "PPN Keluaran",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "fin-r-2",
					code: "4100-00-001",
					name: "PPh Pasal 23-2 Terutang",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "fin-r-3",
					code: "4100-00-001",
					name: "PPh Pasal 4 ayat 2 Terutang",
					amount: "Rp28.750.000",
					variant: "positive",
				},
				{
					id: "fin-r-4",
					code: "4100-00-001",
					name: "PPh Pasal 25 Terutang",
					amount: "Rp28.750.000",
					variant: "positive",
				},
			],
		},
		{
			id: "fin-sec-2",
			icon: "shopping-bag",
			title: "Penerimaan dari Pemasok",
			subtitle: "8 akun • Total Rp0",
			rows: [
				{
					id: "fin-r-5",
					code: "1140-00-001",
					name: "Persediaan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-6",
					code: "1140-00-002",
					name: "Persediaan Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-7",
					code: "2110-00-001",
					name: "Utang Usaha",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-8",
					code: "5100-00-001",
					name: "Harga Pokok Penjualan Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-9",
					code: "5200-00-001",
					name: "Beban Pengiriman",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-10",
					code: "5300-00-001",
					name: "Diskon Pembelian",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-11",
					code: "5400-00-001",
					name: "Retur Penjualan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-12",
					code: "5400-00-002",
					name: "Retur Pembelian Umum",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "fin-sec-3",
			icon: "users",
			title: "Beban Operasional",
			subtitle: "4 akun • Total Rp0",
			rows: [
				{
					id: "fin-r-13",
					code: "4100-00-001",
					name: "Beban Komisi Penjualan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-14",
					code: "4100-00-001",
					name: "Beban Piutang Tak Tertagih",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-15",
					code: "4100-00-001",
					name: "Beban Gaji & Upah",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-16",
					code: "4100-00-001",
					name: "Beban Staff Ahli & Perizinan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-17",
					code: "4100-00-001",
					name: "Beban Sistem & Teknologi",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-18",
					code: "4100-00-001",
					name: "Beban Sewa",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-19",
					code: "4100-00-001",
					name: "Beban Listrik",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-20",
					code: "4100-00-001",
					name: "Beban Air",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-21",
					code: "4100-00-001",
					name: "Beban Telepon",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-22",
					code: "4100-00-001",
					name: "Beban Internet",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-23",
					code: "4100-00-001",
					name: "Beban Perlengkapan",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-24",
					code: "4100-00-001",
					name: "Beban Operasional Lainnya",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "fin-sec-4",
			icon: "file-text",
			title: "Pembayaran Pajak",
			subtitle: "5 akun • Total Rp0",
			rows: [
				{
					id: "fin-r-25",
					code: "4600-00-009",
					name: "Pendapatan Usaha Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-26",
					code: "8100-00-001",
					name: "Pendapatan Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-27",
					code: "8100-00-002",
					name: "Pendapatan Bunga / Bagi Hasil",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-28",
					code: "8200-00-001",
					name: "Laba Selisih Kurs - Unrealize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-29",
					code: "8200-00-002",
					name: "Laba Selisih Kurs - Realize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
		{
			id: "fin-sec-5",
			icon: "file-text",
			title: "Pendapatan Lainnya",
			subtitle: "5 akun • Total Rp0",
			rows: [
				{
					id: "fin-r-30",
					code: "4600-00-009",
					name: "Pendapatan Usaha Lain",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "fin-r-31",
					code: "8100-00-001",
					name: "Pendapatan Lain",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "fin-r-32",
					code: "8100-00-002",
					name: "Pendapatan Bunga / Bagi Hasil",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "fin-r-33",
					code: "8200-00-001",
					name: "Laba Selisih Kurs - Unrealize",
					amount: "Rp24.000.000",
					variant: "positive",
				},
				{
					id: "fin-r-34",
					code: "8200-00-002",
					name: "Laba Selisih Kurs - Realize",
					amount: "Rp24.000.000",
					variant: "positive",
				},
			],
		},
		{
			id: "fin-sec-6",
			icon: "file-text",
			title: "Beban Lainnya",
			subtitle: "5 akun • Total Rp0",
			rows: [
				{
					id: "fin-r-35",
					code: "4600-00-009",
					name: "Beban Atas Pendapatan Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-36",
					code: "8100-00-001",
					name: "Beban Non Operasional",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-37",
					code: "8100-00-002",
					name: "Beban Administrasi Bank",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-38",
					code: "8200-00-001",
					name: "Beban Bunga / Bagi Hasil",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-39",
					code: "8200-00-002",
					name: "Beban Lain",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-40",
					code: "8200-00-002",
					name: "Rugi Selisih Kurs - Unrealize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
				{
					id: "fin-r-41",
					code: "8200-00-002",
					name: "Rugi Selisih Kurs - Realize",
					amount: "(Rp24.000.000)",
					variant: "negative",
				},
			],
		},
	],
};
