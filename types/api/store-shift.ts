export type StoreShiftData = {
  id: string;
  store_id: string;
  opened_by_id: string;
  closed_by_id: string | null;
  opening_cash: number | null;
  closing_cash: number | null;
  closed_at: string | null;
  status: string;
  total_sales: number | null;
  created_at: string;
  updated_at: string;
  opened_by: ResponsibleUser;
  closed_by: ResponsibleUser | null;
};

export type ResponsibleUser = {
  id: string;
  team_id: string | null;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};
