import { IMAGES } from "@/assets/images";
import { OfferItemProps } from "@/types/ui/cart/offer";

export const OFFER_ITEMS: OfferItemProps[] = [
  {
    id: "1",
    name: "Promo Buy 1 Get 1",
    description: "Diskon 30%, minimal pembelian Rp50.000",
    image: IMAGES.examples.promo_1,
  },
  {
    id: "2",
    name: "Diskon 20% hingga Rp35.000",
    description: "Diskon 20%, minimal belanja Rp50.000",
    image: IMAGES.examples.promo_2,
  },
];
