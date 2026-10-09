import { z } from "zod";
import {
	BILL_PAYMENT_METHODS,
	MAX_BILL_PAYMENT_AMOUNT,
} from "@/constants/data/inventory-bill-payments";
import { parseExpiryDate } from "@/lib/inventory/material-date";
import { billMoney } from "@/lib/inventory/bill-payment";

const money = z
	.number()
	.finite("Nominal tidak valid")
	.nonnegative("Nominal tidak boleh negatif")
	.max(MAX_BILL_PAYMENT_AMOUNT, "Nominal terlalu besar")
	.refine(
		(value) =>
			Math.abs(value - billMoney(value)) <= Number.EPSILON * Math.max(1, value),
		"Gunakan maksimal dua angka desimal",
	)
	.transform(billMoney);

export const billPaymentSchema = z
	.object({
		supplierId: z.string().min(1, "Pilih pemasok"),
		paymentMethod: z
			.string()
			.refine(
				(value) => BILL_PAYMENT_METHODS.includes(value),
				"Pilih metode pembayaran",
			),
		externalReference: z
			.string()
			.trim()
			.max(128, "Referensi maksimal 128 karakter"),
		date: z.string().refine((value) => {
			const date = parseExpiryDate(value);
			return date !== null && Number.isFinite(date.getTime());
		}, "Masukkan tanggal valid dengan format YYYY-MM-DD"),
		note: z.string().trim().max(5000, "Catatan maksimal 5000 karakter"),
		lines: z
			.array(
				z.object({
					purchaseId: z.string().min(1, "Pilih tagihan"),
					amount: money.refine(
						(value) => value >= 0.01,
						"Pembayaran harus lebih dari 0",
					),
					discount: money,
				}),
			)
			.min(1, "Pilih setidaknya satu tagihan")
			.max(100, "Maksimal 100 tagihan"),
	})
	.superRefine((data, context) => {
		const ids = new Set<string>();
		data.lines.forEach((line, index) => {
			if (ids.has(line.purchaseId))
				context.addIssue({
					code: "custom",
					path: ["lines", index, "purchaseId"],
					message: "Tagihan sudah dipilih",
				});
			ids.add(line.purchaseId);
		});
		if (
			data.lines.reduce((sum, line) => sum + line.amount + line.discount, 0) >
			MAX_BILL_PAYMENT_AMOUNT
		)
			context.addIssue({
				code: "custom",
				path: ["lines"],
				message: "Total pembayaran dan diskon terlalu besar",
			});
	});
