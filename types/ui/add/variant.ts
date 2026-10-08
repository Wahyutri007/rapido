export type VariantDetailProps = {
  id: string;
  name: string;
  price: number;
}

export type VariantItemProps = {
  id: string;
  name: string;
  details: VariantDetailProps[];
}