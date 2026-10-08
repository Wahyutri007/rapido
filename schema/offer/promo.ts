import { z } from "zod";

export const promoProduct = z.object({
  product: z
    .string({
      required_error: "Produk tidak boleh kosong",
    })
    .min(1, "Produk tidak boleh kosong"),
  amount: z
    .number({
      required_error: "Jumlah tidak boleh kosong",
    })
    .min(1, "Jumlah minimal 1"),
});

export const promoSchema = z.object({
  name: z
    .string({
      required_error: "Nama promo tidak boleh kosong",
    })
    .min(1, "Nama promo tidak boleh kosong"),
  code: z
    .string({
      required_error: "Kode promo tidak boleh kosong",
    })
    .min(1, "Kode promo tidak boleh kosong"),
  type: z
    .string({
      required_error: "Tipe promo tidak boleh kosong",
    })
    .min(1, "Tipe promo tidak boleh kosong"),
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
  promoProducts: z.array(promoProduct, {
    required_error: "Produk tidak boleh kosong",
  }).min(1, "Produk tidak boleh kosong"),
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
  discountPeriod: z.object({
    start: z.date({
      required_error: "Periode mulai diskon harus diisi",
      invalid_type_error: "Periode mulai diskon tidak valid",
    }),
    end: z.date({
      required_error: "Periode akhir diskon harus diisi",
      invalid_type_error: "Periode akhir diskon tidak valid",
    }),
  }, {
    required_error: "Periode diskon tidak boleh kosong",
    invalid_type_error: "Periode diskon tidak valid",
  }),
  timePeriod: z.object({
    start: z.date({
      required_error: "Waktu mulai promo harus diisi",
      invalid_type_error: "Waktu mulai promo tidak valid",
    }),
    end: z.date({
      required_error: "Waktu akhir promo harus diisi",
      invalid_type_error: "Waktu akhir promo tidak valid",
    }),
  }, {
    required_error: "Waktu promo tidak boleh kosong",
    invalid_type_error: "Waktu promo tidak valid",
  }),
});

export type PromoProduct = z.infer<typeof promoProduct>;
export type PromoSchema = z.infer<typeof promoSchema>;
