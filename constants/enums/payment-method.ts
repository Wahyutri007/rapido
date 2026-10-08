import { SelectItemProps } from "@/types";
import { PaymentMethodType } from "@/types/enums";

export const paymentMethodItems: SelectItemProps<PaymentMethodType>[] = [
  {
    value: PaymentMethodType.CASH,
    label: "Tunai",
  },
  {
    value: PaymentMethodType.QRIS,
    label: "QRIS",
  },
  {
    value: PaymentMethodType.CREDIT_CARD,
    label: "Kartu Kredit",
  },
  {
    value: PaymentMethodType.DEBIT_CARD,
    label: "Kartu Debit",
  },
  {
    value: PaymentMethodType.BANK_TRANSFER,
    label: "Bank Transfer",
  },
  {
    value: PaymentMethodType.OTHER,
    label: "Lainnya",
  },
];
