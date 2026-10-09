export type BillPaymentFields = {
	supplierId: string;
	paymentMethod: string;
	externalReference: string;
	date: string;
	note: string;
	lines: { purchaseId: string; amount: number; discount: number }[];
};

export type BillPaymentLine = BillPaymentFields["lines"][number] & {
	purchaseReference: string;
	purchaseDate: string;
	billAmount: number;
	outstandingBefore: number;
	remaining: number;
};

export type BillPayment = Omit<BillPaymentFields, "lines"> & {
	id: string;
	reference: string;
	supplierName: string;
	createdAt: string;
	updatedAt: string;
	lines: BillPaymentLine[];
};

export type BillPaymentResult =
	| { id: string }
	| { error: string; field?: "supplierId" | "date" | "lines" };
