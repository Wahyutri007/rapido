import { PromoSchema } from "@/schema/offer/promo";
import { MenuItemProps } from "../add/menu";
import { DiscountSchema } from "@/schema/offer/discount";

export type DiscountItemProps = DiscountSchema & {
  id: string;
};
