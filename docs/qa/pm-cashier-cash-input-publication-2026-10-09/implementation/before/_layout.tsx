import Header from "@/components/common/Header";
import { useGlobalSearchParams } from "expo-router";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function CartLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header back title="Detail Pesanan" /> }}
      />
      <JSStack.Screen
        name="offer"
        options={{ header: () => <Header back title="Penawaran" /> }}
      />
      <JSStack.Screen
        name="confirm"
        options={{
          header: () => <Header back title="Konfirmasi" />,
        }}
      />
      <JSStack.Screen
        name="input-money"
        options={{
          header: () => <Header back title="Uang Diterima" />,
        }}
      />
      <JSStack.Screen
        name="input-money-confirm"
        options={{
          header: () => <Header back title="Transaksi Tunai" />,
        }}
      />
    </JSStack>
  );
}
