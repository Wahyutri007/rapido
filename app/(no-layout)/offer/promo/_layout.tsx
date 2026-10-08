import Header from "@/components/common/Header";
import { useGlobalSearchParams } from "expo-router";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function PromoLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header back title="Promo" /> }}
      />
      <JSStack.Screen
        name="modify"
        options={{
          header: () => (
            <Header back title={`${params?.id ? "Edit" : "Tambah"} Promo`} />
          ),
        }}
      />
    </JSStack>
  );
}
