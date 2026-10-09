import { z } from "zod";

export const paymentMethodSchema = z.object({
  name: z
    .string({
      required_error: "Nama metode pembayaran tidak boleh kosong",
    })
    .min(1, "Nama metode pembayaran tidak boleh kosong"),
  type: z
    .string({
      required_error: "Jenis pembayaran tidak boleh kosong",
    })
    .min(1, "Jenis pembayaran tidak boleh kosong"),
  adminType: z
    .string({
      required_error: "Biaya admin tidak boleh kosong",
    })
    .min(1, "Biaya admin tidak boleh kosong"),
  value: z
    .number({
      required_error: "Biaya admin tidak boleh kosong",
    })
    .min(1, "Biaya admin tidak boleh kosong"),
  bank: z
    .string({
      required_error: "Bank tidak harus dipilih",
    })
    .min(1, "Bank tidak harus dipilih"),
  accountNumber: z
    .string({
      required_error: "Nomor rekening tidak boleh kosong",
    })
    .min(1, "Nomor rekening tidak boleh kosong"),
  accountName: z
    .string({
      required_error: "Nama pemilik rekening tidak boleh kosong",
    })
    .min(1, "Nama pemilik rekening tidak boleh kosong"),
});

export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;
