export type ExtraMenuDetailData = {
  id: string;
  name: string;
  price: number;
};

export type ExtraMenuData = {
  id: string;
  name: string;
  details: ExtraMenuDetailData[];
  menus?: { id: string; name: string }[];
  menu_ids?: string[];
  created_at: string;
  updated_at: string;
};
