export type MenuEntryData = {
  id: string;
  variant_name: string;
  multiple_price: boolean;
  sell_price: number | null;
  manual_price: boolean;
  cost_price: number | null;
  multiple_prices: {
    order_type_id: string;
    sell_price: number;
    manual_price: boolean;
  }[];
};

export type MenuData = {
  id: string;
  user_id: string;
  name: string;
  category_id: string;
  brand_id?: string;
  description?: string;
  unit_id: string;
  image?: string;
  variants: boolean;
  order_type_ids: string[];
  extra_menu_ids: string[];
  entries: MenuEntryData[];
  stock_management?: boolean;
  created_at: string;
  updated_at: string;
};
