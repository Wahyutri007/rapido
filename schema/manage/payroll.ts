import { z } from "zod";
import { PAYROLL_SERVICES } from "@/constants/data/manage/payroll";
import { validAccountingDate } from "@/lib/accounting/date";

export const PAYROLL_MAX_AMOUNT = 1_000_000_000_000;
export const payrollMoneySchema = z
	.number({ invalid_type_error: "Gunakan nominal Rupiah yang valid." })
	.finite("Gunakan nominal Rupiah yang valid.")
	.int("Gunakan Rupiah bulat.")
	.min(0, "Nominal tidak boleh negatif.")
	.max(PAYROLL_MAX_AMOUNT, "Nominal maksimal Rp1 triliun.");
const date = z
	.string()
	.trim()
	.refine(validAccountingDate, "Gunakan tanggal valid YYYY-MM-DD (1900–2100).");
export const payrollSettingsSchema = z
	.object({
		method: z.enum(["monthly", "daily", "hourly", "service"]),
		startDate: date,
		baseSalary: payrollMoneySchema,
		allowance: payrollMoneySchema,
		meal: payrollMoneySchema,
		transport: payrollMoneySchema,
		rate: payrollMoneySchema,
		commissions: z
			.array(z.object({ serviceId: z.string(), rate: payrollMoneySchema }))
			.max(PAYROLL_SERVICES.length),
		note: z.string().trim().max(1000, "Maksimal 1.000 karakter."),
	})
	.superRefine((values, context) => {
		const error = (path: (string | number)[], message: string) =>
			context.addIssue({ code: "custom", path, message });
		if (values.method === "monthly" && values.baseSalary < 1)
			error(["baseSalary"], "Gaji pokok harus lebih dari 0.");
		if (
			(values.method === "daily" || values.method === "hourly") &&
			values.rate < 1
		)
			error(["rate"], "Tarif harus lebih dari 0.");
		const ids = values.commissions.map((item) => item.serviceId);
		if (
			new Set(ids).size !== ids.length ||
			ids.some((id) => !PAYROLL_SERVICES.some((service) => service.id === id))
		)
			error(["commissions"], "Layanan tidak valid atau berulang.");
		if (
			values.method === "service" &&
			!values.commissions.some((item) => item.rate > 0)
		)
			error(["commissions"], "Isi minimal satu tarif layanan.");
	});
export const payrollPaymentSchema = z
	.object({
		kind: z.enum(["full", "partial"]),
		amount: payrollMoneySchema.min(1, "Nominal harus lebih dari 0."),
		bonus: payrollMoneySchema,
		deduction: payrollMoneySchema,
		advance: payrollMoneySchema,
		method: z.enum(["cash", "transfer"]),
		source: z.string().trim().min(1, "Pilih rekening asal atau kas.").max(80),
		destination: z.string().trim().max(80, "Maksimal 80 karakter."),
		date,
		reference: z.string().trim().min(1, "Nomor referensi wajib diisi.").max(80),
		note: z.string().trim().max(1000, "Maksimal 1.000 karakter."),
	})
	.superRefine((values, context) => {
		if (values.method === "transfer" && !values.destination)
			context.addIssue({
				code: "custom",
				path: ["destination"],
				message: "Rekening tujuan wajib diisi untuk transfer.",
			});
	});
export type PayrollPaymentValues = z.infer<typeof payrollPaymentSchema>;
