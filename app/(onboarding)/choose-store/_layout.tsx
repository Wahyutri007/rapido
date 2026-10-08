import HomeHeader from "@/components/common/Header";
import RegisterHeader from "@/components/feature/register/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function ChooseStoreLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <HomeHeader title="Pilih Toko" /> }}
      />
      <JSStack.Screen
        name="create"
        options={{
          header: () => <RegisterHeader title="Buat Toko" />,
        }}
      />
      {/* <JSStack.Screen
        name="pin"
        options={{
          header: () => <HomeHeader title="Masukkan Pin" back />,
        }}
      /> */}
    </JSStack>
  );
}
