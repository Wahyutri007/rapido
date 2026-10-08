import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function OfferLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen name="promo" options={{ headerShown: false }} />
      <JSStack.Screen name="discount" options={{ headerShown: false }} />
      <JSStack.Screen name="voucher" options={{ headerShown: false }} />
    </JSStack>
  );
}
