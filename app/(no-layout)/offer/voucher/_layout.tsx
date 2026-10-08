import Header from "@/components/common/Header";
import { useGlobalSearchParams } from "expo-router";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function VoucherLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header back title="Voucher" /> }}
      />
      <JSStack.Screen
        name="modify"
        options={{
          header: () => (
            <Header back title={`${params?.id ? "Edit" : "Tambah"} Voucher`} />
          ),
        }}
      />
    </JSStack>
  );
}
