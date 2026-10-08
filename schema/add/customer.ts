import { z } from "zod";

function validBirthDate(value: string) {
	if (!value) return true;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return (
		!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
	);
}

export const customerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama lengkap wajib diisi")
		.max(255, "Nama maksimal 255 karakter"),
	phone: z
		.string()
		.trim()
		.min(1, "Nomor telepon wajib diisi")
		.max(50, "Nomor telepon maksimal 50 karakter"),
	email: z
		.string()
		.trim()
		.max(255, "Email maksimal 255 karakter")
		.refine(
			(value) => !value || z.string().email().safeParse(value).success,
			"Alamat email tidak valid",
		),
	id_number: z.string().trim().max(100, "Nomor KTP maksimal 100 karakter"),
	// The current customers table stores address as VARCHAR(255).
	address: z.string().trim().max(255, "Alamat maksimal 255 karakter"),
	date_of_birth: z
		.string()
		.trim()
		.refine(validBirthDate, "Gunakan tanggal valid dengan format YYYY-MM-DD"),
	gender: z.enum(["", "male", "female"], {
		errorMap: () => ({ message: "Pilih jenis kelamin yang tersedia" }),
	}),
	notes: z.string().trim(),
});

export type CustomerSchema = z.infer<typeof customerSchema>;
