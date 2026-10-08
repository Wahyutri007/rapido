import { z } from "zod";

const name = z
	.string()
	.trim()
	.min(1, "Nama wajib diisi.")
	.max(80, "Nama maksimal 80 karakter.");

function validateNames(rows: { name: string }[], context: z.RefinementCtx) {
	const seen = new Set<string>();
	rows.forEach((row, index) => {
		const key = row.name.toLocaleLowerCase("id-ID");
		if (seen.has(key))
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: [index, "name"],
				message: "Nama tidak boleh sama dalam area atau toko yang sama.",
			});
		seen.add(key);
	});
}

export const placeAreasSchema = z.object({
	outletId: z.string().min(1, "Pilih toko/outlet."),
	rows: z
		.array(z.object({ areaId: z.string(), name }))
		.min(1, "Tambahkan minimal satu area.")
		.max(30, "Maksimal 30 area sekaligus.")
		.superRefine(validateNames),
});

export const placesSchema = z.object({
	areaId: z.string().min(1, "Pilih area."),
	rows: z
		.array(
			z.object({
				placeId: z.string(),
				name,
				kind: z.enum(["dine-in", "counter", "waiting", "retail", "facility"]),
				capacity: z
					.number({ invalid_type_error: "Kapasitas harus berupa angka." })
					.int("Kapasitas harus bilangan bulat.")
					.min(1, "Kapasitas minimal 1.")
					.max(10000, "Kapasitas maksimal 10.000."),
				active: z.boolean(),
			}),
		)
		.min(1, "Tambahkan minimal satu tempat.")
		.max(100, "Maksimal 100 tempat sekaligus.")
		.superRefine(validateNames),
});

export type PlaceAreasValues = z.infer<typeof placeAreasSchema>;
export type PlacesValues = z.infer<typeof placesSchema>;
