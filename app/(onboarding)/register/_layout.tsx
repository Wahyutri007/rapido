import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";
import Header from "@/components/common/Header";

import { StackHeaderProps } from "@react-navigation/stack";

export default function RegistrationLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{
          header: (props: StackHeaderProps) => (
            <Header title="Daftar Akun" back />
          ),
        }}
      />
      <JSStack.Screen name="wizard" options={{ headerShown: false }} />
    </JSStack>
  );
}
