import { z } from "zod";

const required = (label: string, max = 120) =>
	z
		.string()
		.trim()
		.min(1, `${label} wajib diisi`)
		.max(max, `Maksimal ${max} karakter`);

export const supplierSchema = z.object({
	name: required("Nama pemasok", 80),
	address: required("Alamat", 500),
	phone: required("No. telepon", 24).refine(
		(value) => /^\+?\d{8,15}$/.test(value.replace(/[\s()-]/g, "")),
		"Masukkan nomor telepon yang valid",
	),
	email: required("Alamat email", 254).email(
		"Masukkan alamat email yang valid",
	),
	province: required("Provinsi"),
	city: required("Kota"),
	district: required("Kecamatan"),
	postalCode: z
		.string()
		.trim()
		.refine(
			(value) => !value || /^\d{5}$/.test(value),
			"Kode pos harus terdiri dari 5 digit",
		),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;
