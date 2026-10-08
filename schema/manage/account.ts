import { z } from "zod";

export const ownerInfoSchema = z.object({
	name: z
		.string({
			required_error: "Nama pemilik harus diisi",
		})
		.min(1, "Nama pemilik harus diisi"),
	email: z
		.string({
			required_error: "Email harus diisi",
		})
		.email("Email tidak valid")
		.min(1, "Email harus diisi"),
	phone: z
		.string({
			required_error: "Nomor HP harus diisi",
		})
		.min(1, "Nomor HP harus diisi"),
	address: z
		.string({
			required_error: "Alamat harus diisi",
		})
		.min(1, "Alamat harus diisi"),
	id_card_number: z
		.string({
			required_error: "ID Card harus diisi",
		})
		.min(1, "ID Card harus diisi"),
});

export type OwnerInfoSchema = z.infer<typeof ownerInfoSchema>;

export const businessInfoSchema = z.object({
	name: z
		.string({
			required_error: "Nama merchant harus diisi",
		})
		.min(1, "Nama merchant harus diisi"),
	address: z
		.string({
			required_error: "Alamat merchant harus diisi",
		})
		.min(1, "Alamat merchant harus diisi"),
	province: z
		.string({
			required_error: "Provinsi harus dipilih",
		})
		.min(1, "Provinsi harus dipilih"),
	city: z
		.string({
			required_error: "Kota harus dipilih",
		})
		.min(1, "Kota harus dipilih"),
	district: z
		.string({
			required_error: "Kecamatan harus dipilih",
		})
		.min(1, "Kecamatan harus dipilih"),
	postcode: z
		.string({
			required_error: "Kode pos harus diisi",
		})
		.min(1, "Kode pos harus diisi"),
});

export type BusinessInfoSchema = z.infer<typeof businessInfoSchema>;
