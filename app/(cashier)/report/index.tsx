import Text from "@/components/common/Text";
import TabPager, { TabItem } from "@/components/custom/TabPager";
import CustomerView from "@/components/feature/cashier/report/customer";
import TransactionView from "@/components/feature/cashier/report/transaction";
import React from "react";
import { View } from "react-native";

const tabs: TabItem[] = [
  {
    key: "transactions",
    label: "Transaksi",
    component: <TransactionView />,
  },
  {
    key: "customer",
    label: "Pelanggan",
    component: <CustomerView />,
  },
];

export default function ReportScreen() {
  return (
    <View className="flex-1 bg-white">
      <TabPager tabs={tabs} />
    </View>
  );
}
