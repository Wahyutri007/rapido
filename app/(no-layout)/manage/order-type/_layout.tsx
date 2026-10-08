import Header from "@/components/common/Header";
import { useGlobalSearchParams } from "expo-router";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function OrderTypeLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header back title="Tipe Pesanan" /> }}
      />
      <JSStack.Screen
        name="modify"
        options={{
          header: () => (
            <Header back title={`${params?.id ? "Edit" : "Tambah"} Tipe`} />
          ),
        }}
      />
    </JSStack>
  );
}
