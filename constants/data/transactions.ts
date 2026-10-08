export type TransactionItemProps = {
  id: number;
  title: string;
  amount: number;
  date: Date;
  orderNo: number;
  itemAmount: number;
};

// TODO: Combine this with the transaction item
export const TRANSACTIONS_ITEMS: TransactionItemProps[] = [
  {
    id: 1,
    title: "Pembayaran",
    amount: 150000,
    date: new Date(2025, 4, 13, 12, 32, 32),
    orderNo: 1233,
    itemAmount: 1,
  },
  {
    id: 2,
    title: "Pembayaran",
    amount: 150000,
    date: new Date(2025, 4, 13, 12, 32, 32),
    orderNo: 1233,
    itemAmount: 1,
  },
  {
    id: 3,
    title: "Pembayaran",
    amount: 150000,
    date: new Date(2025, 5, 13, 12, 32, 32),
    orderNo: 1233,
    itemAmount: 1,
  },
  {
    id: 4,
    title: "Pembayaran",
    amount: 150000,
    date: new Date(2025, 5, 13, 12, 32, 32),
    orderNo: 1233,
    itemAmount: 1,
  },
  {
    id: 5,
    title: "Pembayaran",
    amount: 150000,
    date: new Date(2025, 5, 13, 12, 32, 32),
    orderNo: 1233,
    itemAmount: 1,
  },
];
