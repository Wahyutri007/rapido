import { PaymentMethodType } from "@/types/enums";
import { StoreData } from "./store";

export type PaymentMethodBankDetail = {
  bank_account_id: string;
  account_number: string;
  account_holder_name: string;
};

export type PaymentMethodData = {
  id: string;
  name: string;
  type: PaymentMethodType;
  bank_details: PaymentMethodBankDetail | null;
  barcode_image?: string | null;
  stores?: StoreData[];
  created_at: string;
  updated_at: string;
};

export type CreatePaymentMethodPayload = {
  name: string;
  type: PaymentMethodType;
  stores_ids?: string[];
  barcode_image?: string | null;
  bank_account?: {
    bank_account_id: string;
    account_number: string;
    account_holder_name: string;
  };
};
