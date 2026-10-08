import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function HomeLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Laporan",
        }}
      />
      <JSStack.Screen
        name="transaction"
        options={{
          header: () => <Header back title="Transaksi" />,
        }}
      />
      <JSStack.Screen
        name="transaction-history"
        options={{
          header: () => <Header back title="Riwayat Transaksi" />,
        }}
      />
    </JSStack>
  );
}
