import { z } from "zod";

export const extraSchema = z.object({
  name: z
    .string({
      required_error: "Nama biaya tambahan tidak boleh kosong",
    })
    .min(1, "Nama biaya tambahan tidak boleh kosong"),
  type: z
    .string({
      required_error: "Jenis biaya tambahan harus dipilih",
    })
    .min(1, "Jenis biaya tambahan harus dipilih"),
  calculationType: z
    .string({
      required_error: "Tipe perhitungan biaya tambahan harus dipilih",
    })
    .min(1, "Tipe perhitungan biaya tambahan harus dipilih"),
  percentage: z
    .number({
      required_error: "Persentase biaya tambahan tidak boleh kosong",
    })
    .min(1, "Persentase biaya tambahan tidak boleh kosong"),
});

export type ExtraSchema = z.infer<typeof extraSchema>;