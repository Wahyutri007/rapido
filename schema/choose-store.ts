import { z } from "zod";

export const chooseStoreSchema = z.object({
  store: z
    .string({
      required_error: "Toko harus dipilih",
    })
    .min(1, {
      message: "Toko harus dipilih",
    }),
});

export type ChooseStoreSchema = z.infer<typeof chooseStoreSchema>;
