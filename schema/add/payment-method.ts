import { z } from "zod";
import { PaymentMethodType } from "@/types/enums";

export const paymentMethodSchema = z
  .object({
    name: z
      .string({
        required_error: "Nama metode pembayaran tidak boleh kosong",
      })
      .min(1, "Nama metode pembayaran tidak boleh kosong"),
    type: z.nativeEnum(PaymentMethodType, {
      required_error: "Tipe pembayaran harus dipilih",
    }),
    store_ids: z.array(z.string()).optional(),
    barcode_image: z.any().optional(),
    bank_account: z
      .object({
        bank_account_id: z.string().min(1, "Bank harus dipilih"),
        account_number: z.string().min(1, "Nomor rekening tidak boleh kosong"),
        account_holder_name: z
          .string()
          .min(1, "Nama pemilik rekening tidak boleh kosong"),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === PaymentMethodType.BANK_TRANSFER) {
      if (!data.bank_account?.bank_account_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bank harus dipilih",
          path: ["bank_account", "bank_account_id"],
        });
      }
      if (!data.bank_account?.account_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nomor rekening tidak boleh kosong",
          path: ["bank_account", "account_number"],
        });
      }
      if (!data.bank_account?.account_holder_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nama pemilik rekening tidak boleh kosong",
          path: ["bank_account", "account_holder_name"],
        });
      }
    }
  });

export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;
