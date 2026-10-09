import { z } from "zod";
import { formatRp } from "@/lib/utils";

export function parseCashAmount(value: unknown): number | null {
	if (typeof value !== "string" || value.length === 0 || /\D/.test(value)) {
		return null;
	}
	const amount = Number(value);
	return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

export function parseCashRouteAmount(value: unknown): number | null {
	if (Array.isArray(value)) {
		return value.length === 1 ? parseCashAmount(value[0]) : null;
	}
	return parseCashAmount(value);
}

export function createCashInputSchema(totalPrice: number | null) {
	return z
		.object({
			value: z.string({
				required_error: "Uang diterima tidak boleh kosong",
			}),
		})
		.superRefine((data, context) => {
			let message: string | undefined;
			const amount = parseCashAmount(data.value);
			if (
				totalPrice === null ||
				!Number.isSafeInteger(totalPrice) ||
				totalPrice < 0
			) {
				message = "Total pembayaran belum tersedia. Kembali ke pesanan.";
			} else if (data.value.length === 0) {
				message = "Uang diterima tidak boleh kosong";
			} else if (amount === null) {
				message = "Nominal uang diterima tidak valid";
			} else if (amount === 0) {
				message = "Uang diterima harus lebih dari nol";
			} else if (amount < totalPrice) {
				message = `Uang diterima tidak boleh kurang dari ${formatRp(totalPrice)}`;
			}
			if (message) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["value"],
					message,
				});
			}
		});
}

export type CashInputSchema = z.infer<ReturnType<typeof createCashInputSchema>>;
