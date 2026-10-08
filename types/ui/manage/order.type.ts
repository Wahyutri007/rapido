import { SelectItemProps } from "@/components/common/Form"
import { OrderTypeSchema } from "@/schema/manage/order-type";

export type OrderTypeItemProps = Omit<OrderTypeSchema, "extra" | "type"> & {
  id: string;
  extra: SelectItemProps // TODO: change this to a more specific type
  type: SelectItemProps // TODO: change this to a more specific type
};
