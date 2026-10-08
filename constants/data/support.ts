import type { FaqCategory, FaqEntry } from "@/types/ui/support";

export const FAQ_CATEGORIES: { value: FaqCategory | "all"; label: string }[] = [
	{ value: "all", label: "Semua" },
	{ value: "back-office", label: "Back Office" },
	{ value: "cashier", label: "Kasir" },
	{ value: "operator", label: "Operator" },
	{ value: "order", label: "Order" },
	{ value: "absence", label: "Absensi" },
];

// Questions follow Figma frame 1:19624. Answers are local guidance, not API data.
export const FAQ_ENTRIES: FaqEntry[] = [
	{
		id: "sales-summary",
		question: "Bagaimana cara melihat ringkasan penjualan?",
		answer:
			"Buka mode Back Office, lalu pilih Laporan → Ringkasan. Gunakan filter toko dan periode untuk melihat ringkasan yang dibutuhkan.",
		categories: ["back-office"],
		icon: "sales",
	},
	{
		id: "stock",
		question: "Bagaimana mengelola stok dan transfer stok?",
		answer:
			"Buka Inventory pada mode Back Office. Pilih Transfer Stok untuk memindahkan barang antar toko, atau Penyesuaian Stok untuk mencatat hasil pemeriksaan stok.",
		categories: ["back-office"],
		icon: "inventory",
	},
	{
		id: "cashier-transaction",
		question: "Bagaimana membuat transaksi di kasir?",
		answer:
			"Beralih ke mode Kasir dan pilih toko aktif. Pilih produk dari Katalog, masukkan ke keranjang, lalu lanjutkan ke konfirmasi pesanan dan pembayaran.",
		categories: ["cashier"],
		icon: "cashier",
	},
	{
		id: "attendance",
		question: "Bagaimana karyawan melakukan absensi?",
		answer:
			"Beralih ke mode Absensi dan buka form absensi. Pilih toko, lengkapi data yang diminta, ambil foto, lalu konfirmasi absensi.",
		categories: ["absence"],
		icon: "absence",
	},
	{
		id: "table-order",
		question: "Bagaimana waiter membuat order meja?",
		answer:
			"Order meja memerlukan pengaturan Manajemen Tempat dan halaman Tempat pada mode Kasir. Alur tersebut belum tersedia pada versi ini. Pesanan yang tersedia dapat dibuat melalui Katalog dan keranjang Kasir, lalu dipantau pada mode Operator.",
		categories: ["order", "operator", "cashier"],
		icon: "order",
	},
	{
		id: "catalog",
		question: "Bagaimana mengatur data produk, kategori, dan promo?",
		answer:
			"Buka Katalog pada mode Back Office, kemudian pilih Produk, Kategori, atau Promo. Gunakan tombol tambah untuk membuat data, atau menu aksi pada item untuk mengubah data yang sudah ada.",
		categories: ["back-office"],
		icon: "catalog",
	},
];
