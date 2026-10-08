import { z } from "zod";

export const roleSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama role wajib diisi")
		.max(255, "Nama role maksimal 255 karakter"),
	permissions: z
		.array(z.string().trim().min(1))
		.min(1, "Pilih minimal satu hak akses")
		.transform((values) => [...new Set(values)]),
});

export type RoleSchema = z.infer<typeof roleSchema>;
