import { z } from "zod";

export const orderTypeSchema = z.object({
  name: z
    .string({
      required_error: "Nama tipe pesanan tidak boleh kosong",
    })
    .min(1, "Nama tipe pesanan tidak boleh kosong"),
  tax_ids: z.array(z.string()).min(1, "Pajak harus dipilih"),
});

export type OrderTypeSchema = z.infer<typeof orderTypeSchema>;
