import { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";

export const PAYMENT_METHOD_ITEMS: PaymentMethodItemProps[] = [
  {
    id: "1",
    name: "Transfer Bank",
    type: "bank_transfer",
    adminType: "percentage",
    value: 1,
    bank: "BCA",
    accountNumber: "1234567890",
    accountName: "John Doe",
  },
];
