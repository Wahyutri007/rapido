import { z } from "zod";

export const voucherCodeSchema = z.object(
	{
		code: z.string().min(1, "Kode wajib diisi"),
		max_uses: z.coerce
			.number({
				invalid_type_error: "Kuota wajib diisi",
				required_error: "Kuota wajib diisi",
			})
			.min(1, "Kuota minimal 1"),
	},
	{
		invalid_type_error: "Kode dan kuota wajib diisi",
		required_error: "Kode dan kuota wajib diisi",
	},
);

export const voucherSchema = z
	.object({
		name: z.string().min(1, "Nama voucher wajib diisi"),
		period: z.object(
			{
				start: z.date({ required_error: "Tanggal mulai wajib diisi" }),
				end: z.date({ required_error: "Tanggal selesai wajib diisi" }),
			},
			{
				invalid_type_error: "Periode wajib diisi",
				required_error: "Periode wajib diisi",
			},
		),

		type: z.enum(["percentage", "fixed"], {
			invalid_type_error: "Jenis voucher wajib dipilih",
			required_error: "Jenis voucher wajib dipilih",
		}),
		amount: z.coerce
			.number({
				invalid_type_error: "Nilai voucher wajib diisi",
				required_error: "Nilai voucher wajib diisi",
			})
			.min(0.01, "Nilai minimal 0.01"),
		minimum_transaction: z.coerce
			.number({
				invalid_type_error: "Minimal transaksi wajib diisi",
				required_error: "Minimal transaksi wajib diisi",
			})
			.min(0, "Minimal transaksi 0"),
		maximum_discount: z.coerce
			.number({
				invalid_type_error: "Max diskon wajib diisi",
				required_error: "Max diskon wajib diisi",
			})
			.min(0, "Max diskon 0")
			.nullable()
			.optional(),

		codes: z
			.array(voucherCodeSchema)
			.min(1, "Minimal satu kode voucher harus ada"),

		store_ids: z.array(z.string()).min(1, "Minimal satu toko harus dipilih"),
	})
	.refine(
		(data) => {
			if (data.period.end <= data.period.start) return false;
			return true;
		},
		{
			message: "Tanggal selesai harus setelah tanggal mulai",
			path: ["period", "end"],
		},
	)
	.refine(
		(data) => {
			if (data.type === "percentage" && data.amount > 100) return false;
			return true;
		},
		{
			message: "Persentase maksimal 100",
			path: ["amount"],
		},
	);

export type VoucherSchema = z.infer<typeof voucherSchema>;
