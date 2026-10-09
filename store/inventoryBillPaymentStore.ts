import { create } from "zustand";
import { MAX_BILL_PAYMENT_AMOUNT } from "@/constants/data/inventory-bill-payments";
import {
	billMoney,
	purchaseMatchesSupplier,
	purchaseOutstanding,
} from "@/lib/inventory/bill-payment";
import { expiryDateText } from "@/lib/inventory/material-date";
import { billPaymentSchema } from "@/schema/inventory/bill-payment";
import type { PurchaseRecord } from "@/types/ui/inventory";
import type {
	BillPayment,
	BillPaymentFields,
	BillPaymentLine,
	BillPaymentResult,
} from "@/types/ui/inventory/bill-payment";
import type { InventorySupplier } from "@/types/ui/inventory/supplier";

type BillPaymentState = {
	payments: BillPayment[];
	sequence: number;
	savePayment: (
		id: string | undefined,
		fields: BillPaymentFields,
		purchases: PurchaseRecord[],
		suppliers: InventorySupplier[],
	) => BillPaymentResult;
	deletePayment: (id: string) => BillPaymentResult;
};

// Session-only allocations; no cash/bank/stock ledger or backend posting.
// Catalog snapshots are supplied by the caller to avoid a circular store import.
export const useInventoryBillPaymentStore = create<BillPaymentState>(
	(set, get) => ({
		payments: [],
		sequence: 0,
		savePayment: (id, fields, purchases, suppliers) => {
			const current =
				id !== undefined
					? get().payments.find((payment) => payment.id === id)
					: undefined;
			if (id !== undefined && !current)
				return { error: "Pembayaran tidak ditemukan" };
			const parsed = billPaymentSchema.safeParse(fields);
			if (!parsed.success) return { error: parsed.error.issues[0].message };
			const data = parsed.data;
			const supplier = suppliers.find(
				(supplier) => supplier.id === data.supplierId && supplier.active,
			);
			if (!supplier)
				return { error: "Pemasok tidak tersedia", field: "supplierId" };
			const lines: BillPaymentLine[] = [];
			for (const line of data.lines) {
				const purchase = purchases.find(
					(purchase) => purchase.id === line.purchaseId,
				);
				if (!purchase || !purchaseMatchesSupplier(purchase, supplier))
					return {
						error: "Tagihan tidak tersedia untuk pemasok ini",
						field: "lines",
					};
				if (
					!Number.isFinite(purchase.amount) ||
					purchase.amount > MAX_BILL_PAYMENT_AMOUNT
				)
					return { error: "Nominal tagihan tidak valid", field: "lines" };
				const balance = purchaseOutstanding(purchase, get().payments, id);
				if (balance <= 0)
					return {
						error: "Tagihan sudah lunas atau dibatalkan",
						field: "lines",
					};
				if (
					Math.round(line.amount * 100) + Math.round(line.discount * 100) >
					Math.round(balance * 100)
				)
					return {
						error: `Pembayaran dan diskon melebihi sisa ${purchase.reference}`,
						field: "lines",
					};
				const purchaseDate = expiryDateText(new Date(purchase.createdAt));
				if (
					!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate) ||
					data.date < purchaseDate
				)
					return {
						error: "Tanggal pembayaran tidak boleh sebelum tanggal tagihan",
						field: "date",
					};
				lines.push({
					...line,
					purchaseReference: purchase.reference,
					purchaseDate,
					billAmount: billMoney(purchase.amount),
					outstandingBefore: balance,
					remaining: billMoney(balance - line.amount - line.discount),
				});
			}
			const sequence = current ? get().sequence : get().sequence + 1;
			const timestamp = new Date().toISOString();
			const paymentId = current?.id ?? `bill-payment-${Date.now()}-${sequence}`;
			const payment: BillPayment = {
				...data,
				lines,
				id: paymentId,
				reference:
					current?.reference ??
					`KK/${timestamp.slice(0, 7).replace("-", "")}/${String(sequence).padStart(3, "0")}`,
				supplierName: supplier.name,
				createdAt: current?.createdAt ?? timestamp,
				updatedAt: timestamp,
			};
			set((state) => ({
				sequence,
				payments: current
					? state.payments.map((item) =>
							item.id === paymentId ? payment : item,
						)
					: [payment, ...state.payments],
			}));
			return { id: paymentId };
		},
		deletePayment: (id) => {
			if (!get().payments.some((payment) => payment.id === id))
				return { error: "Pembayaran tidak ditemukan" };
			set((state) => ({
				payments: state.payments.filter((payment) => payment.id !== id),
			}));
			return { id };
		},
	}),
);
