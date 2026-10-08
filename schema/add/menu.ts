import { z } from "zod";
import { documentPickerResultSchema } from "../common";

export const multiplePriceSchema = z.object({
  order_type_id: z.string().min(1, "Tipe pesanan harus dipilih"),
  sell_price: z.coerce.number().min(0, "Harga jual tidak boleh kurang dari 0"),
  cost_price: z.coerce.number().min(0).optional().nullable(),
  manual_price: z.boolean().optional(),
});

export const menuEntrySchema = z.object({
  variant_name: z.string().min(1, "Nama varian tidak boleh kosong"),
  stock: z.coerce.number().min(0).optional().nullable(),
  min_stock: z.coerce.number().min(0).optional().nullable(),
  sku_barcode: z.string().optional().nullable(),
  expire_date: z.string().optional().nullable(),
  multiple_price: z.boolean().optional(),
  sell_price: z.coerce
    .number()
    .min(0, "Harga jual tidak boleh kurang dari 0")
    .nullable()
    .optional(),
  cost_price: z.coerce.number().min(0).nullable().optional(),
  manual_price: z.boolean().optional(),
  multiple_prices: z.array(multiplePriceSchema).optional(),
});

export const variationGroupSchema = z.object({
  name: z.string().min(1, "Nama variasi tidak boleh kosong"),
  options: z.array(z.string().min(1, "Opsi tidak boleh kosong")).min(1, "Minimal satu opsi"),
});

export const menuSchema = z.object({
  store_id: z.string().optional().nullable(),
  image: z
    .union([documentPickerResultSchema, z.string()])
    .optional()
    .nullable(),
  name: z.string().min(1, "Nama menu tidak boleh kosong"),
  category_id: z.string().min(1, "Kategori harus dipilih"),
  brand_id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unit_id: z.string().min(1, "Satuan harus dipilih"),
  order_type_ids: z
    .array(z.string())
    .min(1, "Minimal satu tipe pesanan harus dipilih"),
  extra_menu_ids: z.array(z.string()).optional(),
  variants: z.boolean().optional(),
  variation_groups: z.array(variationGroupSchema).optional(),
  price_mode: z.enum(["single", "per_order_type", "cashier"]),
  track_stock: z.boolean().optional(),
  stock: z.coerce.number().min(0).optional().nullable(),
  min_stock: z.coerce.number().min(0).optional().nullable(),
  sku_barcode: z.string().optional().nullable(),
  expire_date: z.string().optional().nullable(),
  sell_price: z.coerce.number().min(0).optional().nullable(),
  cost_price: z.coerce.number().min(0).optional().nullable(),
  multiple_prices: z.array(multiplePriceSchema).optional(),
  menu_entries: z
    .array(menuEntrySchema)
    .min(1, "Minimal satu entri menu harus ada"),
  stock_management: z.boolean().optional(),
});

export type MenuSchema = z.infer<typeof menuSchema>;
export type MenuEntrySchema = z.infer<typeof menuEntrySchema>;
export type VariationGroupSchema = z.infer<typeof variationGroupSchema>;
export type MultiplePriceSchema = z.infer<typeof multiplePriceSchema>;
