import { DiscountValueTypeEnum } from "@/types/enums";

export type ExtraCostData = {
  id: string;
  name: string;
  type: DiscountValueTypeEnum;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type GenericExtraCostPayload = {
  name: string;
  type: DiscountValueTypeEnum;
  amount: number;
};
