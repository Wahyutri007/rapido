import { z } from "zod";

export const taxSchema = z.object({
  name: z
    .string({
      required_error: "Nama pajak tidak boleh kosong",
    })
    .min(1, "Nama pajak tidak boleh kosong"),
  type: z
    .string({
      required_error: "Jenis pajak tidak boleh kosong",
    })
    .min(1, "Jenis pajak tidak boleh kosong"),
  code: z
    .string({
      required_error: "Kode pajak tidak boleh kosong",
    })
    .min(1, "Kode pajak tidak boleh kosong"),
  percentage: z
    .number({
      required_error: "Persentase pajak tidak boleh kosong",
    })
    .min(1, "Persentase pajak tidak boleh kosong"),
  calculationType: z
    .string({
      required_error: "Tipe perhitungan pajak harus dipilih",
    })
    .min(1, "Tipe perhitungan pajak harus dipilih"),
  roundingType: z
    .string({
      required_error: "Tipe pembulatan pajak harus dipilih",
    })
    .min(1, "Tipe pembulatan pajak harus dipilih"),
});

export type TaxSchema = z.infer<typeof taxSchema>;