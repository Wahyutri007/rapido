import { TaxData } from "./tax";

export type OrderTypeData = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  taxes?: TaxData[];
};

export type GenericOrderTypePayload = {
  name: string;
  tax_id: string;
};
