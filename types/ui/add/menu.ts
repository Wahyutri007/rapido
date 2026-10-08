import { MenuSchema } from "@/schema/add/menu";

export type MenuItemProps = {
  id: string;
  name: string;
  image: any;
  popular?: boolean;
  sell_price: number;
  category_id: string;
  is_empty: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    price: number;
  };
  created_at: string;
};
