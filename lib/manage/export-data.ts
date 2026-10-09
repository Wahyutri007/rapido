import type { TransactionGroup } from "@/components/feature/reports/transaction/types";
import { accountingDateISO } from "@/lib/accounting/date";
import { type ExportSchema, exportSchema } from "@/schema/manage/export";
import type { Expense } from "@/types/ui/accounting/expense";
import type { Income } from "@/types/ui/accounting/income";
import type { InventoryItem } from "@/types/ui/inventory";

export const ALL_EXPORT_STORES = "__all__";
export const EXPORT_TYPES = [
	{ label: "Riwayat transaksi (contoh)", value: "transaction" },
	{ label: "Stok barang (sesi)", value: "inventory" },
	{ label: "Pendapatan & pengeluaran (sesi)", value: "financial" },
];
export type ExportSources = {
	transactions: TransactionGroup[];
	items: InventoryItem[];
	incomes: Income[];
	expenses: Expense[];
};
type Cell = string | number | null | undefined;
type ExportRow = { date: string; store: string; cells: Cell[] };

// Quote every field and neutralize spreadsheet formulas in textual values.
export function csvCell(value: Cell): string {
	let text =
		typeof value === "number"
			? Number.isFinite(value)
				? String(value)
				: ""
			: (value ?? "");
	if (typeof value !== "number" && /^\s*[=+\-@]/.test(text)) text = `'${text}`;
	return `"${text.replace(/"/g, '""')}"`;
}
export function exportStoreOptions(
	sources: Pick<ExportSources, "incomes" | "expenses">,
) {
	return [
		{ label: "Semua toko, termasuk tanpa toko", value: ALL_EXPORT_STORES },
		...Array.from(
			new Set(
				[...sources.incomes, ...sources.expenses]
					.map((r) => r.store)
					.filter((s): s is string => Boolean(s)),
			),
		)
			.sort()
			.map((value) => ({ label: value, value })),
	];
}
export function buildDataExport(values: ExportSchema, sources: ExportSources) {
	const options = exportSchema.parse(values);
	let headers: string[];
	let rows: ExportRow[];
	if (options.type === "transaction") {
		headers = [
			"Sumber",
			"ID",
			"Tanggal",
			"Jam",
			"Pelanggan",
			"Kasir",
			"Kanal",
			"Metode pembayaran",
			"Status",
			"Nominal",
		];
		rows = sources.transactions.flatMap((group) =>
			group.items.map((item) => ({
				date: accountingDateISO(group.dateKey),
				store: "",
				cells: [
					"Contoh laporan transaksi",
					item.id,
					group.dateKey,
					item.time,
					item.customer,
					item.cashier,
					item.channel,
					item.paymentMethod,
					item.statusLabel,
					item.amount,
				],
			})),
		);
	} else if (options.type === "inventory") {
		headers = [
			"Sumber",
			"ID",
			"Jenis",
			"Nama",
			"SKU",
			"Kategori",
			"Stok agregat",
			"Satuan",
		];
		rows = sources.items.map((item) => ({
			date: "",
			store: "",
			cells: [
				"Pratinjau stok sesi",
				item.id,
				item.kind,
				item.name,
				item.sku,
				item.category,
				item.stock,
				item.unit,
			],
		}));
	} else {
		headers = [
			"Sumber",
			"ID",
			"Jenis",
			"Tanggal sumber",
			"Tanggal ISO",
			"Jam",
			"Toko",
			"Referensi",
			"Akun",
			"Kode akun",
			"Sumber dana",
			"Pembuat",
			"Nominal",
			"Deskripsi",
		];
		rows = [
			...sources.incomes.map((item) => ({
				item,
				source: "Pratinjau penerimaan sesi",
				kind: item.type,
			})),
			...sources.expenses.map((item) => ({
				item,
				source: "Pratinjau pengeluaran sesi",
				kind: item.type,
			})),
		].map(({ item, source, kind }) => ({
			date: accountingDateISO(item.date),
			store: item.store ?? "",
			cells: [
				source,
				item.id,
				kind,
				item.date,
				accountingDateISO(item.date),
				item.time,
				item.store,
				item.referenceNumber,
				item.accountName,
				item.accountCode,
				item.fundingSource,
				item.createdBy,
				item.amount,
				item.description,
			],
		}));
	}
	if (options.type !== "financial" && options.store !== ALL_EXPORT_STORES)
		throw new Error(
			"Data ini tidak memiliki stok atau transaksi per toko. Pilih Semua toko.",
		);
	if (
		options.type === "financial" &&
		!exportStoreOptions(sources).some((s) => s.value === options.store)
	)
		throw new Error(
			"Toko tidak tersedia pada data saat ini. Pilih kembali toko.",
		);
	const scoped = rows.filter(
		(row) => options.store === ALL_EXPORT_STORES || row.store === options.store,
	);
	const hasDates =
		options.type !== "inventory" && Boolean(options.start || options.end);
	const selected = scoped.filter(
		(row) =>
			!hasDates ||
			Boolean(
				row.date &&
					(!options.start || row.date >= options.start) &&
					(!options.end || row.date <= options.end),
			),
	);
	return {
		count: selected.length,
		excludedInvalidDates: hasDates
			? scoped.filter((row) => !row.date).length
			: 0,
		filename: `rapido-pratinjau-${options.type}.csv`,
		csv:
			"\uFEFF" +
			[headers, ...selected.map((row) => row.cells)]
				.map((row) => row.map(csvCell).join(","))
				.join("\r\n") +
			"\r\n",
	};
}
