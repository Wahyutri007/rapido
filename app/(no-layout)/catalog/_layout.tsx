import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function AddLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen name="payment-method" options={{ headerShown: false }} />

      <JSStack.Screen name="category" options={{ headerShown: false }} />
      <JSStack.Screen name="brand" options={{ headerShown: false }} />
      <JSStack.Screen name="unit" options={{ headerShown: false }} />
      <JSStack.Screen name="menu" options={{ headerShown: false }} />
      <JSStack.Screen name="extra-menu" options={{ headerShown: false }} />
      <JSStack.Screen name="extra-cost" options={{ headerShown: false }} />

      <JSStack.Screen name="bundling" options={{ headerShown: false }} />
      <JSStack.Screen name="tax" options={{ headerShown: false }} />
      <JSStack.Screen name="order-type" options={{ headerShown: false }} />

      <JSStack.Screen name="voucher" options={{ headerShown: false }} />
      <JSStack.Screen name="promo" options={{ headerShown: false }} />
      <JSStack.Screen name="discount" options={{ headerShown: false }} />

      {/* <JSStack.Screen name="variant" options={{ headerShown: false }} /> */}
    </JSStack>
  );
}
