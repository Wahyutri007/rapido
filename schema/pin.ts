import { z } from "zod";

export const pinSchema = z.object({
  value: z
    .string({
      required_error: "PIN tidak boleh kosong",
    })
    .length(4, {
      message: "PIN harus terdiri dari 4 angka",
    })
    .refine(
      (value) => {
        const hasConsecutiveNumbers =
          /(0123|1234|2345|3456|4567|5678|6789)/.test(value);
        const hasRepeatedNumbers = /(.)\1{3}/.test(value);
        return !hasConsecutiveNumbers && !hasRepeatedNumbers;
      },
      {
        message: "PIN tidak boleh menggunakan angka berulang atau berurutan",
      },
    ),
});

export type PinSchema = z.infer<typeof pinSchema>;