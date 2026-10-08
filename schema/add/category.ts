import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({
      required_error: "Nama kategori tidak boleh kosong",
    })
    .min(1, "Nama kategori tidak boleh kosong"),
});

export type CategorySchema = z.infer<typeof categorySchema>;
