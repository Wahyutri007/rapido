import { TaxItemProps } from "@/types/ui/manage/tax";

export const TAXES_ITEMS: TaxItemProps[] = [
  {
    id: "1",
    name: "PPN",
    type: "ppn",
    code: "VAT.01",
    percentage: 10,
    calculationType: "product_included",
    roundingType: "none",
  },
];
