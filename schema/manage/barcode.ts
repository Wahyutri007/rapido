import { z } from "zod";

export const barcodeSchema = z.object({
	product_id: z.string().min(1, "Produk harus dipilih"),
	barcode_code: z.string().min(3, "Kode barcode minimal 3 karakter"),
	format: z.enum(["code128", "ean13", "qrcode"]).default("code128"),
	label_count: z.number().min(1, "Jumlah label minimal 1").default(12),
	label_size: z.enum(["small", "medium", "large"]).default("medium"),
});

export type BarcodeFormValues = z.infer<typeof barcodeSchema>;
export type BarcodeFormInput = z.input<typeof barcodeSchema>;
