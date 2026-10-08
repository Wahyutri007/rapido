import { z } from "zod";

export const discountSchema = z
  .object({
    name: z.string().min(1, "Nama diskon tidak boleh kosong"),
    type: z.enum(["fixed", "custom"]),
    value_type: z.enum(["percentage", "fixed"]),
    fixed_discount: z
      .object({
        amount: z.coerce.number().min(0, "Nilai tidak boleh kurang dari 0"),
      })
      .optional(),
    store_ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "fixed") {
        if (!data.fixed_discount) return false;
        if (
          data.value_type === "percentage" &&
          data.fixed_discount.amount > 100
        )
          return false;
      }
      return true;
    },
    {
      message: "Nilai persentase tidak boleh lebih dari 100",
      path: ["fixed_discount.amount"],
    },
  );

export type DiscountSchema = z.infer<typeof discountSchema>;
