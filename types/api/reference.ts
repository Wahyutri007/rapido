export type ReferenceData = {
  id: string;
  value: string;
  [key: string]: any;
};

export type BankAccountReference = ReferenceData & {
  name: string;
  abbreviation: string;
};
