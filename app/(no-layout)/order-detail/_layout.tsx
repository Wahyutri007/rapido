import Header from "@/components/common/Header";
import { useGlobalSearchParams } from "expo-router";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function OrderDetailLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{
          header: () => <Header back title={`${params?.transactionId}`} />,
        }}
      />
      <JSStack.Screen
        name="refund"
        options={{
          header: () => <Header back title="Akses Refund" />,
        }}
      />
    </JSStack>
  );
}
