import { z } from "zod";

export const backupSchema = z.object({
  type: z
    .string({
      required_error: "Tipe cadangan tidak boleh kosong",
    })
    .min(1, "Tipe cadangan tidak boleh kosong"),
  dateRange: z.object({
    start: z.date({
      required_error: "Tanggal mulai cadangan harus diisi",
      invalid_type_error: "Tanggal mulai cadangan tidak valid",
    }),
    end: z.date({
      required_error: "Tanggal akhir cadangan harus diisi",
      invalid_type_error: "Tanggal akhir cadangan tidak valid",
    }),
  }, {
    required_error: "Tanggal mulai dan akhir cadangan harus diisi",
  }),
  location: z
    .string({
      required_error: "Lokasi penyimpanan harus dipilih",
    })
    .min(1, "Lokasi penyimpanan harus dipilih"),
});

export type BackupSchema = z.infer<typeof backupSchema>;
