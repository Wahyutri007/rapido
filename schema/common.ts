import { z } from "zod";

export const documentPickerResultSchema = z.object({
  lastModified: z.number().optional(),
  mimeType: z.string({
    required_error: "Tipe file tidak valid",
    invalid_type_error: "Tipe file tidak valid",
  }),
  uri: z.string({
    required_error: "File tidak valid",
    invalid_type_error: "File tidak valid",
  }),
  name: z.string({
    required_error: "Nama file tidak valid",
    invalid_type_error: "Nama file tidak valid",
  }),
  size: z.number({
    required_error: "Ukuran file tidak valid",
    invalid_type_error: "Ukuran file tidak valid",
  }),
});
