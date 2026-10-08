import { z } from "zod";

export const MAX_SUPPORT_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const supportedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

export const supportAttachmentSchema = z
	.object({
		uri: z.string().min(1, "Lampiran tidak dapat dibaca"),
		name: z
			.string()
			.regex(/\.(jpe?g|png|pdf)$/i, "Gunakan berkas JPG, PNG, atau PDF"),
		mimeType: z.string().optional(),
		size: z
			.number()
			.min(1, "Lampiran tidak boleh kosong")
			.max(MAX_SUPPORT_ATTACHMENT_BYTES, "Ukuran lampiran maksimal 5 MB"),
	})
	.refine(
		(asset) =>
			!asset.mimeType ||
			asset.mimeType === "application/octet-stream" ||
			supportedMimeTypes.includes(asset.mimeType),
		"Gunakan berkas JPG, PNG, atau PDF",
	);

export const supportFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Judul wajib diisi")
		.max(150, "Judul maksimal 150 karakter"),
	description: z
		.string()
		.trim()
		.min(1, "Deskripsi wajib diisi")
		.max(5000, "Deskripsi maksimal 5.000 karakter"),
	feedbackType: z.enum(["suggestion", "criticism", "problem", "appreciation"]),
	relatedPage: z
		.string()
		.trim()
		.max(500, "Fitur atau halaman maksimal 500 karakter"),
	attachment: supportAttachmentSchema.nullable(),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;
export type SupportAttachment = z.infer<typeof supportAttachmentSchema>;
