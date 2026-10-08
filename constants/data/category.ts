import { CategoryItemProps } from "@/types/ui/add/category";

export const CATEGORY_ITEMS: CategoryItemProps[] = [
  {
    id: "1",
    name: "Makanan",
    code: "MKN",
  },
  {
    id: "2",
    name: "Minuman",
    code: "MNM",
  },
  {
    id: "3",
    name: "Snack",
    code: "SCK",
  },
  {
    id: "4",
    name: "Penutup",
    code: "PNT",
  },
] as const;
