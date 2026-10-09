import { z } from "zod";

export const integrationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama integrasi tidak boleh kosong")
		.max(80, "Nama integrasi maksimal 80 karakter"),
	endpoint: z
		.string()
		.trim()
		.min(1, "URL tujuan tidak boleh kosong")
		.max(2048, "URL tujuan maksimal 2048 karakter")
		.refine((value) => {
			try {
				const url = new URL(value);
				return (
					/^https:\/\//i.test(value) &&
					url.protocol === "https:" &&
					!!url.hostname &&
					!url.username &&
					!url.password &&
					!/^https:\/\/[^/?#]*@/i.test(value) &&
					!/[#\s\\]/u.test(value)
				);
			} catch {
				return false;
			}
		}, "Gunakan URL HTTPS tanpa nama pengguna, sandi, atau fragmen"),
	notes: z
		.string()
		.trim()
		.max(1000, "Catatan maksimal 1000 karakter")
		.optional()
		.default(""),
});

export type IntegrationSchema = z.input<typeof integrationSchema>;
export type IntegrationValues = z.output<typeof integrationSchema>;
