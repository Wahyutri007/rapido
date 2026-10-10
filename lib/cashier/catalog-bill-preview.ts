import {
	type BillReferencePreview,
	filterBillReferencePreview,
} from "@/lib/cashier/bill-reference-preview";

// Frame 29:48148 uses the same three examples as 29:26627, with different IDs.
// These are design node IDs, never invoice/customer IDs for API requests.
const referenceNodes: Record<string, string> = {
	"29:26637": "29:48158",
	"29:26658": "29:48170",
	"29:26677": "29:48181",
};

export function filterCatalogBillPreview(
	search: string,
	table: string,
): BillReferencePreview[] {
	return filterBillReferencePreview(search, table).map((bill) => ({
		...bill,
		referenceNode: referenceNodes[bill.referenceNode],
	}));
}
