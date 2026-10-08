import { z } from "zod";
import type { SingleDocumentPickerResult } from "@/types";

export const workerImageSchema = z
	.custom<SingleDocumentPickerResult>(
		(value) =>
			!!value && typeof value === "object" && "uri" in value && "name" in value,
		"Gambar tidak valid",
	)
	.refine(
		(asset) =>
			["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
				asset.mimeType ?? "",
			),
		"Gunakan gambar PNG, JPG, atau WebP",
	)
	.refine(
		(asset) => typeof asset.size === "number" && asset.size > 0,
		"Ukuran gambar tidak tersedia atau berkas kosong",
	)
	.refine(
		(asset) => (asset.size ?? Infinity) <= 2 * 1024 * 1024,
		"Ukuran gambar maksimal 2 MB",
	);

function validDate(value: string) {
	if (!value) return true;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return (
		!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
	);
}

export function workerSchema(editing = false) {
	return z
		.object({
			name: z
				.string()
				.trim()
				.min(1, "Nama lengkap wajib diisi")
				.max(255, "Nama maksimal 255 karakter"),
			email: z
				.string()
				.trim()
				.min(1, "Email wajib diisi")
				.email("Alamat email tidak valid")
				.max(255),
			phone: z
				.string()
				.trim()
				.min(1, "Nomor telepon wajib diisi")
				.max(50, "Nomor telepon maksimal 50 karakter"),
			role_id: z.string().min(1, "Pilih role karyawan"),
			store_id: z.string().min(1, "Pilih toko karyawan"),
			address: z.string().trim().max(500, "Alamat maksimal 500 karakter"),
			date_of_birth: z
				.string()
				.trim()
				.refine(validDate, "Gunakan tanggal valid dengan format YYYY-MM-DD"),
			password: z.string(),
			password_confirmation: z.string(),
			face_scan: z.union([workerImageSchema, z.string(), z.null()]),
			id_scan: z.union([workerImageSchema, z.string(), z.null()]),
		})
		.superRefine((value, ctx) => {
			if (!editing) {
				if (value.password.length < 8)
					ctx.addIssue({
						code: "custom",
						path: ["password"],
						message: "Password minimal 8 karakter",
					});
				if (
					!value.password_confirmation ||
					value.password !== value.password_confirmation
				)
					ctx.addIssue({
						code: "custom",
						path: ["password_confirmation"],
						message: "Konfirmasi password harus sama",
					});
			}
		});
}

export type WorkerSchema = z.infer<ReturnType<typeof workerSchema>>;
