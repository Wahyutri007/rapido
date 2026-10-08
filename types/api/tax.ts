export type TaxData = {
  id: string;
  name: string;
  rate: number;
  created_at: string;
  updated_at: string;
};

export type GenericTaxPayload = {
  name: string;
  rate: number;
};
