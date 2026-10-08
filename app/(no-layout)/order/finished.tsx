import Text from "@/components/common/Text";
import TransactionList from "@/components/feature/transactions/TransactionList";
import { TRANSACTION_ITEMS } from "@/constants/data/transaction/transaction";
import { TransactionItemProps } from "@/types/ui/transaction/transaction";
import React from "react";
import { ScrollView, View } from "react-native";

export default function FinishedOrderScreen() {
  const [transactions, setTransactions] = React.useState<
    TransactionItemProps[] | null
  >(null);

  React.useEffect(() => {
    // Fetch transactions from API or local storage

    async function fetchTransactions() {
      const data = TRANSACTION_ITEMS;

      setTransactions(
        data.filter((item) => item.statuses.isFinished && item.statuses.isPaid),
      );
    }

    fetchTransactions();
  }, []);

  return (
    <View className="mt-10 grow bg-gray-50">
      <TransactionList data={transactions} />
    </View>
  );
}
