export type NotificationSchedule = {
	id: string;
	title: string;
	status: "active" | "inactive";
	frequency: string;
	time: string;
	channels: ("email" | "whatsapp")[];
	recipientCount: number;
	recipients: {
		type: "email" | "whatsapp";
		value: string;
	}[];
	reports: string[];
	outlet: string;
	createdAt: string;
	createdBy: string;
	nextRun: string;
	notes?: string;
	deliveryHistory?: {
		id: string;
		timestamp: string;
		status: "success" | "failed";
		message: string;
	}[];
};

export const INITIAL_NOTIFICATION_SCHEDULES: NotificationSchedule[] = [
	{
		id: "sched-1",
		title: "Laporan Penjualan Harian",
		status: "active",
		frequency: "Setiap hari",
		time: "08:00",
		channels: ["email", "whatsapp"],
		recipientCount: 5,
		recipients: [
			{ type: "email", value: "admin@gmail.com" },
			{ type: "email", value: "manajer@gmail.com" },
			{ type: "whatsapp", value: "+62 812-3456-7890" },
			{ type: "whatsapp", value: "+62 821-9876-5432" },
			{ type: "email", value: "ownertoko@gmail.com" },
		],
		reports: ["Laporan Penjualan", "Laporan Stok", "Laporan Omzet"],
		outlet: "Toko Utama",
		createdAt: "15 Mei 2024 14:30",
		createdBy: "Admin",
		nextRun: "15 Mei 2024 08:00",
		notes: "Kirim laporan ke grup manajerial sebelum jam operasional dimulai.",
		deliveryHistory: [
			{
				id: "h-1",
				timestamp: "23 Mei 2024 08:00",
				status: "success",
				message: "Berhasil dikirim ke 5 penerima",
			},
			{
				id: "h-2",
				timestamp: "22 Mei 2024 08:00",
				status: "success",
				message: "Berhasil dikirim ke 5 penerima",
			},
			{
				id: "h-3",
				timestamp: "21 Mei 2024 08:00",
				status: "success",
				message: "Berhasil dikirim ke 5 penerima",
			},
			{
				id: "h-4",
				timestamp: "20 Mei 2024 08:00",
				status: "success",
				message: "Berhasil dikirim ke 5 penerima",
			},
		],
	},
	{
		id: "sched-2",
		title: "Laporan Stok Harian",
		status: "active",
		frequency: "Setiap hari",
		time: "20:00",
		channels: ["email"],
		recipientCount: 3,
		recipients: [
			{ type: "email", value: "admin@gmail.com" },
			{ type: "email", value: "gudang@gmail.com" },
			{ type: "email", value: "supervisor@gmail.com" },
		],
		reports: ["Laporan Stok"],
		outlet: "Toko Utama",
		createdAt: "10 Mei 2024 10:00",
		createdBy: "Admin",
		nextRun: "15 Mei 2024 20:00",
	},
	{
		id: "sched-3",
		title: "Laporan Omzet Mingguan",
		status: "active",
		frequency: "Setiap senin",
		time: "09:00",
		channels: ["email", "whatsapp"],
		recipientCount: 4,
		recipients: [
			{ type: "email", value: "owner@gmail.com" },
			{ type: "email", value: "finance@gmail.com" },
			{ type: "whatsapp", value: "+62 811-2233-4455" },
			{ type: "whatsapp", value: "+62 813-4455-6677" },
		],
		reports: ["Laporan Omzet", "Laporan Penjualan"],
		outlet: "Semua Outlet",
		createdAt: "1 Mei 2024 12:00",
		createdBy: "Admin",
		nextRun: "20 Mei 2024 09:00",
	},
	{
		id: "sched-4",
		title: "Laporan Pembelian Bulanan",
		status: "inactive",
		frequency: "Tanggal 1 setiap bulan",
		time: "09:00",
		channels: ["email"],
		recipientCount: 2,
		recipients: [
			{ type: "email", value: "purchasing@gmail.com" },
			{ type: "email", value: "finance@gmail.com" },
		],
		reports: ["Laporan Pembelian", "Laporan Pengeluaran"],
		outlet: "Toko Utama",
		createdAt: "28 April 2024 16:00",
		createdBy: "Admin",
		nextRun: "1 Juni 2024 09:00",
	},
];

export const AVAILABLE_REPORTS = [
	{
		id: "sales",
		label: "Laporan Penjualan",
		description: "Ringkasan penjualan per produk, kategori, dll",
	},
	{
		id: "stock",
		label: "Laporan Stok",
		description: "Informasi stok masuk, keluar, dan tersedia",
	},
	{
		id: "omzet",
		label: "Laporan Omzet",
		description: "Ringkasan omzet, diskon, pajak, dll",
	},
	{
		id: "purchase",
		label: "Laporan Pembelian",
		description: "Ringkasan pembelian dari supplier",
	},
	{
		id: "expense",
		label: "Laporan Pengeluaran",
		description: "Ringkasan pengeluaran operasional",
	},
];
