import { PaymentMethodSchema } from "@/schema/manage/payment-method";

export type PaymentMethodItemProps = PaymentMethodSchema & {
  id: string;
};
