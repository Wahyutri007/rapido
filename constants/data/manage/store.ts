import type { SelectItemProps } from "@/types";
import type { StoreItemProps } from "@/types/ui/manage/store";

export const BUSINESS_TYPE_OPTIONS: SelectItemProps[] = [
	{ label: "FnB", value: "FnB" },
	{ label: "Retail", value: "Retail" },
	{ label: "Jasa", value: "Jasa" },
	{ label: "Fashion", value: "Fashion" },
	{ label: "Lainnya", value: "Lainnya" },
];

export const PROVINCE_OPTIONS: SelectItemProps[] = [
	{ label: "Riau", value: "Riau" },
	{ label: "Jawa Barat", value: "Jawa Barat" },
	{ label: "DKI Jakarta", value: "DKI Jakarta" },
	{ label: "Jawa Tengah", value: "Jawa Tengah" },
	{ label: "Jawa Timur", value: "Jawa Timur" },
	{ label: "Bali", value: "Bali" },
	{ label: "Sumatera Utara", value: "Sumatera Utara" },
];

export const CITY_OPTIONS: SelectItemProps[] = [
	{ label: "Pekanbaru", value: "Pekanbaru" },
	{ label: "Bandung", value: "Bandung" },
	{ label: "Jakarta Selatan", value: "Jakarta Selatan" },
	{ label: "Jakarta Pusat", value: "Jakarta Pusat" },
	{ label: "Surabaya", value: "Surabaya" },
	{ label: "Medan", value: "Medan" },
];

export const DISTRICT_OPTIONS: SelectItemProps[] = [
	{ label: "Tampan", value: "Tampan" },
	{ label: "Bandung Kasi", value: "Bandung Kasi" },
	{ label: "Sukajadi", value: "Sukajadi" },
	{ label: "Menteng", value: "Menteng" },
	{ label: "Kebayoran Baru", value: "Kebayoran Baru" },
];

export type SubscriptionPlan = {
	id: string;
	name: string;
	badge: string;
	price: string;
	period: string;
	trial: string;
	features: string[];
	note: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
	{
		id: "basic",
		name: "Basic",
		badge: "Hemat 20%",
		price: "Rp1.919.000",
		period: "/tahun",
		trial: "Coba Gratis 7 Hari",
		features: [
			"Artificial Intelligence",
			"Kalkulasi Transaksi Perbulan & Pertahun",
			"Bisa Tambah Akun Karyawan",
			"Bisa Tambah Cabang Usaha",
		],
		note: "Lanjut Rp1.919.000 per tahun. Batalkan kapan saja.",
	},
	{
		id: "pro",
		name: "Pro",
		badge: "Hemat 20%",
		price: "Rp1.919.000",
		period: "/tahun",
		trial: "Coba Gratis 7 Hari",
		features: [
			"Artificial Intelligence",
			"Kalkulasi Transaksi Perbulan & Pertahun",
			"Bisa Tambah Akun Karyawan",
			"Bisa Tambah Cabang Usaha",
		],
		note: "Lanjut Rp1.919.000 per tahun. Batalkan kapan saja.",
	},
	{
		id: "ultra",
		name: "Ultra",
		badge: "Hemat 20%",
		price: "Rp1.919.000",
		period: "/tahun",
		trial: "Coba Gratis 7 Hari",
		features: [
			"Artificial Intelligence",
			"Kalkulasi Transaksi Perbulan & Pertahun",
			"Bisa Tambah Akun Karyawan",
			"Bisa Tambah Cabang Usaha",
		],
		note: "Lanjut Rp1.919.000 per tahun. Batalkan kapan saja.",
	},
];

export const STORE_ITEMS: StoreItemProps[] = [
	{
		id: "1",
		name: "Caffee - Jakarta",
		phone: "08127886234",
		business_type: "FnB",
		province: "Riau",
		city: "Pekanbaru",
		district: "Tampan",
		address: "Jl. Merdeka No. 123, Pekanbaru",
		postal_code: "28282",
		status: "active",
		statusLabel: "Aktif",
		plan: "pro",
		subscription: {
			planName: "Kasikoo Pro",
			expiryDate: "31 Desember 2026",
			remainingDays: "350 Hari",
		},
	},
	{
		id: "2",
		name: "Caffee - Pekanbaru",
		phone: "081178862222",
		business_type: "FnB",
		province: "Riau",
		city: "Pekanbaru",
		district: "Tampan",
		address: "Jl. Merdeka No. 123, Pekanbaru",
		postal_code: "28282",
		status: "trial",
		statusLabel: "Trial",
		expiryDate: "24 Mei 2025",
		plan: "basic",
		subscription: {
			planName: "Kasikoo Basic",
			expiryDate: "24 Mei 2025",
			remainingDays: "7 Hari",
		},
	},
];
