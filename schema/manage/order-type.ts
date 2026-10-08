import { z } from "zod";

export const orderTypeSchema = z.object({
  name: z
    .string({
      required_error: "Nama tipe pesanan tidak boleh kosong",
    })
    .min(1, "Nama tipe pesanan tidak boleh kosong"),
  type: z
    .string({
      required_error: "Nama tipe pesanan tidak boleh kosong",
    })
    .min(1, "Nama tipe pesanan tidak boleh kosong"),
  extra: z
    .string({
      required_error: "Biaya tambahan harus dipilih",
    })
    .min(1, "Biaya tambahan harus dipilih"),
});

export type OrderTypeSchema = z.infer<typeof orderTypeSchema>;
