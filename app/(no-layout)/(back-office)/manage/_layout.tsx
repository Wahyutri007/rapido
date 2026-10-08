import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function ManageLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen name="roles" options={{ headerShown: false }} />
      <JSStack.Screen name="account" options={{ headerShown: false }} />
      <JSStack.Screen name="generate-barcode" options={{ headerShown: false }} />
    </JSStack>
  );
}
