import { VariantItemProps } from "@/types/ui/add/variant";

export const VARIANT_ITEMS: VariantItemProps[] = [
  {
    id: "1",
    name: "Topping",
    details: [
      { id: "1", name: "Sosis", price: 1000 },
      { id: "2", name: "Keju", price: 2000 },
      { id: "3", name: "Nugget", price: 3000 },
    ],
  },
  {
    id: "2",
    name: "Ukuran",
    details: [
      { id: "1", name: "Kecil", price: 1000 },
      { id: "2", name: "Sedang", price: 2000 },
      { id: "3", name: "Besar", price: 3000 },
    ],
  },
];
