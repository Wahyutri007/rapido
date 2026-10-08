import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function NoLayoutHomeLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen name="input-kas" options={{ headerShown: false }} />
    </JSStack>
  );
}
