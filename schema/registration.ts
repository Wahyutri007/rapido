import { z } from "zod";

export const personalInfoSchema = z.object({
	name: z
		.string({
			required_error: "Nama harus diisi",
		})
		.min(1, "Nama harus diisi")
		.max(255, "Nama maksimal 255 karakter"),
	email: z
		.string({
			required_error: "Email harus diisi",
		})
		.email("Email tidak valid")
		.min(1, "Email harus diisi")
		.max(255, "Email maksimal 255 karakter"),
	phone: z
		.string({
			required_error: "Nomor telepon harus diisi",
		})
		.min(1, "Nomor telepon harus diisi"),
	password: z
		.string({
			required_error: "Password harus diisi",
		})
		.min(10, "Password minimal 10 karakter"),
	tnc: z
		.boolean()
		.refine((value) => value, "Syarat & ketentuan harus disetujui"),
});
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;

export const businessInfoSchema = z.object({
	businessName: z
		.string({
			required_error: "Nama usaha harus diisi",
		})
		.min(1, "Nama usaha harus diisi"),
	businessType: z
		.string({
			required_error: "Tipe usaha harus diisi",
		})
		.min(1, "Tipe usaha harus diisi"),
	businessCity: z
		.string({
			required_error: "Kota usaha harus dipilih",
		})
		.min(1, "Kota usaha harus dipilih"),
	businessAddress: z
		.string({
			required_error: "Alamat usaha harus diisi",
		})
		.min(1, "Alamat usaha harus diisi"),
	businessPhone: z
		.string({
			required_error: "Nomor telepon usaha harus diisi",
		})
		.min(1, "Nomor telepon usaha harus diisi"),
	businessEmail: z
		.string({
			required_error: "Email usaha harus diisi",
		})
		.email("Email tidak valid"),
});

export type BusinessInfoSchema = z.infer<typeof businessInfoSchema>;

export const bankInfoSchema = z.object({
	bankName: z
		.string({
			required_error: "Nama bank harus diisi",
		})
		.min(1, "Nama bank harus diisi"),
	accountNumber: z
		.string({
			required_error: "Nomor rekening harus diisi",
		})
		.min(1, "Nomor rekening harus diisi"),
	accountName: z
		.string({
			required_error: "Nama pemilik rekening harus diisi",
		})
		.min(1, "Nama pemilik rekening harus diisi"),
});

export type BankInfoSchema = z.infer<typeof bankInfoSchema>;

export const passwordInfoSchema = z
	.object({
		password: z
			.string({
				required_error: "Password harus diisi",
			})
			.min(8, "Password minimal 8 karakter"),
		confirmPassword: z
			.string({
				required_error: "Konfirmasi password harus diisi",
			})
			.min(1, "Konfirmasi password harus diisi"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password dan konfirmasi password tidak cocok",
		path: ["confirmPassword"],
	});

export type PasswordInfoSchema = z.infer<typeof passwordInfoSchema>;
