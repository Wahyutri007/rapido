import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string({
      required_error: "Nama brand tidak boleh kosong",
    })
    .min(1, "Nama brand tidak boleh kosong"),
  menu_ids: z.array(z.string()).optional(),
});

export type BrandSchema = z.infer<typeof brandSchema>;
