import { z } from "zod";

export const DIGITAL_CHANNEL_KINDS = [
	{ value: "link", label: "Link Pemesanan" },
	{ value: "marketplace", label: "Marketplace" },
] as const;

export const digitalOrderChannelSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama kanal wajib diisi")
		.max(80, "Nama maksimal 80 karakter"),
	kind: z.enum(["link", "marketplace"]),
	url: z
		.string()
		.trim()
		.min(1, "URL pemesanan wajib diisi")
		.max(2048, "URL maksimal 2048 karakter")
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
					!/[\s\\]/u.test(value)
				);
			} catch {
				return false;
			}
		}, "Gunakan URL HTTPS tanpa nama pengguna atau sandi"),
	notes: z
		.string()
		.trim()
		.max(1000, "Catatan maksimal 1000 karakter")
		.optional()
		.default(""),
});

export type DigitalOrderChannelInput = z.input<
	typeof digitalOrderChannelSchema
>;
export type DigitalOrderChannelValues = z.output<
	typeof digitalOrderChannelSchema
>;
