import Header from "@/components/common/Header";
import { useGlobalSearchParams } from "expo-router";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function ExportLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header back title="Pilih Toko" /> }}
      />
      <JSStack.Screen
        name="modify"
        options={{
          header: () => <Header back title="Ekspor Data" />,
        }}
      />
    </JSStack>
  );
}
