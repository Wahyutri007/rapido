import { PromoItemProps } from "@/types/ui/offer/promo";
import { CATEGORY_ITEMS } from "./category";
import { MENU_ITEMS } from "./menu";
import { MenuItemProps } from "@/types/ui/add/menu";

export const PROMO_ITEMS: PromoItemProps[] = [
  {
    id: "1",
    name: "Diskon 15% Hari Kemerdekaan",
    code: "DISKON15",
    type: "percentage",
    appliedProduct: "product",
    appliedCategory: CATEGORY_ITEMS[0].id,
    promoProducts: [
      MENU_ITEMS.find(
        (item) => item.category_id === CATEGORY_ITEMS[0].id,
      ) as MenuItemProps,
    ],
    discountPeriod: {
      start: new Date("2023-08-17T00:00:00Z"),
      end: new Date("2023-08-31T23:59:59Z"),
    },
    minimumTransaction: 50000,
    maxDiscount: 35000,
    timePeriod: {
      start: new Date("2023-08-17T00:00:00Z"),
      end: new Date("2023-08-31T23:59:59Z"),
    },
  },
];
