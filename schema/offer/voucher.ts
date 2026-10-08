import { z } from "zod";

export const voucherSchema = z.object({
  name: z
    .string({
      required_error: "Nama voucher tidak boleh kosong",
    })
    .min(1, "Nama voucher tidak boleh kosong"),
  code: z
    .string({
      required_error: "Kode voucher tidak boleh kosong",
    })
    .min(1, "Kode voucher tidak boleh kosong"),
  type: z
    .string({
      required_error: "Tipe voucher tidak boleh kosong",
    })
    .min(1, "Tipe voucher tidak boleh kosong"),
  amount: z
    .number({
      required_error: "Jumlah diskon tidak boleh kosong",
    })
    .min(1, "Jumlah diskon tidak boleh kosong"),
  appliedProduct: z
    .string({
      required_error: "Produk yang berlaku harus dipilih",
    })
    .min(1, "Produk yang berlaku harus dipilih"),
  appliedCategory: z
    .string({
      required_error: "Kategori yang berlaku harus dipilih",
    })
    .min(1, "Kategori yang berlaku harus dipilih"),
  minimumTransaction: z
    .number({
      required_error: "Transaksi minimum tidak boleh kosong",
    })
    .min(1, "Transaksi minimum tidak boleh kosong"),
  maxDiscount: z
    .number({
      required_error: "Maksimal diskon tidak boleh kosong",
    })
    .min(1, "Maksimal diskon tidak boleh kosong"),
  discountPeriod: z.object(
    {
      start: z.date({
        required_error: "Periode mulai diskon harus diisi",
        invalid_type_error: "Periode mulai diskon tidak valid",
      }),
      end: z.date({
        required_error: "Periode akhir diskon harus diisi",
        invalid_type_error: "Periode akhir diskon tidak valid",
      }),
    },
    {
      required_error: "Periode diskon tidak boleh kosong",
      invalid_type_error: "Periode diskon tidak valid",
    },
  ),
  timePeriod: z.object(
    {
      start: z.date({
        required_error: "Waktu mulai voucher harus diisi",
        invalid_type_error: "Waktu mulai voucher tidak valid",
      }),
      end: z.date({
        required_error: "Waktu akhir voucher harus diisi",
        invalid_type_error: "Waktu akhir voucher tidak valid",
      }),
    },
    {
      required_error: "Waktu voucher tidak boleh kosong",
      invalid_type_error: "Waktu voucher tidak valid",
    },
  ),
  target: z
    .string({
      required_error: "Target penerima voucher harus dipilih",
    })
    .min(1, "Target penerima voucher harus dipilih"),
});

export type VoucherSchema = z.infer<typeof voucherSchema>;
