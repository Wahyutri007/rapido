import { z } from "zod";

export const variantSchema = z.object({
  name: z
    .string({
      required_error: "Nama varian tidak boleh kosong",
    })
    .min(1, "Nama varian tidak boleh kosong"),
  details: z
    .array(
      z.object({
        name: z
          .string({
            required_error: "Detail varian tidak boleh kosong",
          })
          .min(1, "Detail varian tidak boleh kosong"),
        price: z
          .number({
            required_error: "Harga varian tidak boleh kosong",
          })
          .min(1, "Harga varian tidak boleh kosong"),
      }),
    )
    .min(1, "Detail varian tidak boleh kosong"),
});

export type VariantSchema = z.infer<typeof variantSchema>;