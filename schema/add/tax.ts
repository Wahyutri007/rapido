import { z } from "zod";

export const taxSchema = z.object({
  name: z
    .string({
      required_error: "Nama pajak tidak boleh kosong",
    })
    .min(1, "Nama pajak tidak boleh kosong"),
  rate: z.coerce
    .number({
      required_error: "Persentase pajak tidak boleh kosong",
      invalid_type_error: "Persentase pajak harus berupa angka",
    })
    .min(0, "Persentase pajak tidak boleh kurang dari 0"),
});

export type TaxSchema = z.infer<typeof taxSchema>;
