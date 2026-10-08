import { z } from "zod";

export const storeSchema = z.object({
	name: z
		.string({
			required_error: "Nama toko tidak boleh kosong",
		})
		.min(1, {
			message: "Nama toko tidak boleh kosong",
		}),
	phone: z
		.string({
			required_error: "Nomor telepon tidak boleh kosong",
		})
		.min(1, {
			message: "Nomor telepon tidak boleh kosong",
		}),
	business_type: z
		.string({
			required_error: "Jenis usaha harus dipilih",
		})
		.min(1, {
			message: "Jenis usaha harus dipilih",
		}),
	province: z
		.string({
			required_error: "Provinsi harus dipilih",
		})
		.min(1, {
			message: "Provinsi harus dipilih",
		}),
	city: z
		.string({
			required_error: "Kota harus dipilih",
		})
		.min(1, {
			message: "Kota harus dipilih",
		}),
	district: z
		.string({
			required_error: "Kecamatan harus dipilih",
		})
		.min(1, {
			message: "Kecamatan harus dipilih",
		}),
	address: z
		.string({
			required_error: "Alamat toko tidak boleh kosong",
		})
		.min(1, {
			message: "Alamat toko tidak boleh kosong",
		}),
	postal_code: z
		.string({
			required_error: "Kode pos tidak boleh kosong",
		})
		.min(1, {
			message: "Kode pos tidak boleh kosong",
		}),
	plan: z.string().optional(),
	logo: z.any().optional(),
});

export type StoreSchema = z.infer<typeof storeSchema>;
