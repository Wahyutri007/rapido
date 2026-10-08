import Text from "@/components/common/Text";
import NewestTransaction from "@/components/feature/home/NewestTransaction";
import { TRANSACTIONS_ITEMS } from "@/constants/data/transactions";
import React from "react";
import { ScrollView, View } from "react-native";

export default function TransactionScreen() {
  return (
    <ScrollView className="grow bg-gray-50 p-5">
      <NewestTransaction
        title="Terbaru"
        type="transaction"
        data={TRANSACTIONS_ITEMS}
      />

      <View className="h-24" />
    </ScrollView>
  );
}
