import { z } from "zod"

export const resetPasswordSchema = z
  .object({
    password: z
      .string({
        required_error: "Password harus diisi",
      })
      .min(1, "Password harus diisi")
      .min(8, "Password minimal 8 karakter"),
    confirmPassword: z
      .string({
        required_error: "Konfirmasi password harus diisi",
      })
      .min(1, "Konfirmasi password harus diisi")
      .min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const sendResetEmailSchema = z.object({
  email: z
    .string({
      required_error: "Email harus diisi",
    })
    .min(1, "Email harus diisi")
    .email("Email tidak valid"),
});
export type SendResetEmailSchema = z.infer<typeof sendResetEmailSchema>;
