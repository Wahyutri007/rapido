import { OrderTypeItemProps } from "@/types/ui/manage/order.type";
import { EXTRA_OPTIONS } from "../other/extra";
import { ORDER_TYPE_OPTIONS } from "../other/order-types";

export const ORDER_TYPE_ITEMS: OrderTypeItemProps[] = [
  {
    id: "1",
    name: "Dine-In",
    type: ORDER_TYPE_OPTIONS[0],
    extra: EXTRA_OPTIONS[0],
  },
  {
    id: "2",
    name: "Take Away",
    type: ORDER_TYPE_OPTIONS[1],
    extra: EXTRA_OPTIONS[1],
  },
  {
    id: "3",
    name: "Delivery",
    type: ORDER_TYPE_OPTIONS[2],
    extra: EXTRA_OPTIONS[1],
  },
  {
    id: "4",
    name: "Pre-Order",
    type: ORDER_TYPE_OPTIONS[3],
    extra: EXTRA_OPTIONS[2],
  },
];
