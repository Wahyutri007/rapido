import { z } from "zod";

export const unitSchema = z.object({
  name: z
    .string({
      required_error: "Nama satuan tidak boleh kosong",
    })
    .min(1, "Nama satuan tidak boleh kosong"),
  code: z
    .string({
      required_error: "Kode satuan tidak boleh kosong",
    })
    .min(1, "Kode satuan tidak boleh kosong"),
});

export type UnitSchema = z.infer<typeof unitSchema>;
