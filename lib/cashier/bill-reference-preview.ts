// Deliberately separate from TRANSACTION_ITEMS and all business record IDs.
// Values transcribed from official get_design_context for frame 29:26627.
export type BillReferencePreview = {
	referenceNode: string;
	customer: string;
	table: string;
	ageLabel: string;
	date: string;
	quantity: number;
	paidQuantity?: number;
	total: number;
};

export const BILL_REFERENCE_PREVIEW: {
	referenceNode: string;
	unpaidCountInDesign: number;
	cards: readonly BillReferencePreview[];
} = {
	referenceNode: "29:26627",
	// The design shows a count of 13 and only these three example cards.
	// This is a reference label, never a live/store count or 13 invented records.
	unpaidCountInDesign: 13,
	cards: [
		{
			referenceNode: "29:26637",
			customer: "Arif",
			table: "01",
			ageLabel: "12 menit yang lalu",
			date: "2026-02-20T00:00:00Z",
			quantity: 5,
			paidQuantity: 3,
			total: 150000,
		},
		{
			referenceNode: "29:26658",
			customer: "Julian",
			table: "02",
			ageLabel: "30 menit yang lalu",
			date: "2026-02-27T00:00:00Z",
			quantity: 15,
			total: 250000,
		},
		{
			referenceNode: "29:26677",
			customer: "Amek",
			table: "03",
			ageLabel: "12 menit yang lalu",
			date: "2026-03-02T00:00:00Z",
			quantity: 5,
			total: 350000,
		},
	],
};

export const BILL_PREVIEW_TABLE_OPTIONS = [
	{ label: "Semua meja", value: "all" },
	...BILL_REFERENCE_PREVIEW.cards.map((card) => ({
		label: `Meja ${card.table}`,
		value: card.table,
	})),
];

export function filterBillReferencePreview(search: string, table: string) {
	const query = search.trim().toLocaleLowerCase("id-ID");
	return BILL_REFERENCE_PREVIEW.cards.filter(
		(card) =>
			(table === "all" || card.table === table) &&
			[card.customer, `Meja ${card.table}`, card.date].some((value) =>
				value.toLocaleLowerCase("id-ID").includes(query),
			),
	);
}
