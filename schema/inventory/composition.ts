import { z } from "zod";

export const compositionSchema = z
	.object({
		lines: z
			.array(
				z.object({
					materialId: z.string().min(1, "Pilih bahan baku"),
					unit: z.string().min(1, "Satuan bahan tidak tersedia"),
					quantity: z
						.number()
						.finite("Jumlah tidak valid")
						.positive("Jumlah harus lebih dari 0"),
					unitPrice: z
						.number()
						.finite("Harga tidak valid")
						.positive("Estimasi harga harus lebih dari 0"),
				}),
			)
			.min(1, "Pilih setidaknya satu bahan baku"),
	})
	.superRefine((data, context) => {
		const seen = new Set<string>();
		data.lines.forEach((line, index) => {
			if (seen.has(line.materialId))
				context.addIssue({
					code: "custom",
					path: ["lines", index, "materialId"],
					message: "Bahan baku tidak boleh berulang",
				});
			seen.add(line.materialId);
		});
		if (
			!Number.isFinite(
				data.lines.reduce(
					(total, line) => total + line.quantity * line.unitPrice,
					0,
				),
			)
		)
			context.addIssue({
				code: "custom",
				path: ["lines"],
				message: "Total biaya bahan terlalu besar",
			});
	});
export type CompositionSchema = z.infer<typeof compositionSchema>;

export const compositionSimulationSchema = z.object({
	portions: z
		.number()
		.finite("Jumlah porsi tidak valid")
		.positive("Jumlah porsi harus lebih dari 0"),
});
