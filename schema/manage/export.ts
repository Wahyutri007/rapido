import { z } from "zod";

export const exportSelectSchema = z.object({
  store: z
    .string({
      required_error: "Toko harus dipilih",
    })
    .min(1, {
      message: "Toko harus dipilih",
    }),
});

export const exportSchema = exportSelectSchema.extend({
  type: z
    .string({
      required_error: "Tipe cadangan tidak boleh kosong",
    })
    .min(1, "Tipe cadangan tidak boleh kosong"),
  dateRange: z.object(
    {
      start: z.date({
        required_error: "Tanggal mulai cadangan harus diisi",
        invalid_type_error: "Tanggal mulai cadangan tidak valid",
      }),
      end: z.date({
        required_error: "Tanggal akhir cadangan harus diisi",
        invalid_type_error: "Tanggal akhir cadangan tidak valid",
      }),
    },
    {
      required_error: "Tanggal mulai dan akhir cadangan harus diisi",
    },
  ),
});

export type ExportSelectSchema = z.infer<typeof exportSelectSchema>;
export type ExportSchema = z.infer<typeof exportSchema>;
