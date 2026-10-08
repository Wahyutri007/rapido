export type DiscountType = "fixed" | "custom";
export type DiscountValueType = "percentage" | "fixed";

export type FixedDiscountData = {
  id: string;
  discount_id: string;
  amount: number;
};

export type DiscountData = {
  id: string;
  user_id: string;
  store_id?: string; // It seems IsStoreContent trait might use store_id or stores() relation
  name: string;
  type: DiscountType;
  value_type: DiscountValueType;
  fixed_discount?: FixedDiscountData;
  amount?: number;
  stores?: { id: string; name: string; address?: string }[];
  created_at: string;
  updated_at: string;
};
