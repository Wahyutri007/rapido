import { z } from "zod";
import { DiscountValueTypeEnum } from "@/types/enums";

export const extraCostSchema = z.object({
  name: z
    .string({
      required_error: "Nama biaya tambahan tidak boleh kosong",
    })
    .min(1, "Nama biaya tambahan tidak boleh kosong"),
  type: z.nativeEnum(DiscountValueTypeEnum, {
    required_error: "Tipe biaya harus dipilih",
  }),
  amount: z.coerce
    .number({
      required_error: "Jumlah biaya tidak boleh kosong",
      invalid_type_error: "Jumlah biaya harus berupa angka",
    })
    .min(0, "Jumlah biaya tidak boleh kurang dari 0"),
});

export type ExtraCostSchema = z.infer<typeof extraCostSchema>;
