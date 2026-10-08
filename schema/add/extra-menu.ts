import { z } from "zod";

export const extraMenuDetailSchema = z.object({
  name: z
    .string({
      required_error: "Nama opsi harus diisi",
    })
    .min(1, "Nama opsi harus diisi")
    .max(255, "Nama opsi maksimal 255 karakter"),
  price: z.coerce
    .number({
      required_error: "Harga opsi harus diisi",
      invalid_type_error: "Harga opsi harus berupa angka",
    })
    .min(0, "Harga opsi tidak boleh kurang dari 0"),
});

export const extraMenuSchema = z.object({
  name: z
    .string({
      required_error: "Nama grup tambahan tidak boleh kosong",
    })
    .min(1, "Nama grup tambahan tidak boleh kosong")
    .max(255, "Nama grup tambahan maksimal 255 karakter"),
  details: z.array(extraMenuDetailSchema).min(1, "Minimal satu pilihan ekstra harus diisi"),
  menu_ids: z.array(z.string()).optional(),
});

export type ExtraMenuSchema = z.infer<typeof extraMenuSchema>;
export type ExtraMenuDetailSchema = z.infer<typeof extraMenuDetailSchema>;
