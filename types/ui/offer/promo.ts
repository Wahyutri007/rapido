import { PromoSchema } from "@/schema/offer/promo"
import { MenuItemProps } from "../add/menu"

export type PromoItemProps = Omit<PromoSchema, "promoProducts"> & {
  id: string,
  promoProducts: MenuItemProps[]
}