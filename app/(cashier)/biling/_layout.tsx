import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function BillingLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen name="index" options={{ headerShown: false }} />
    </JSStack>
  );
}
