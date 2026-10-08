import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function ReportLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header title="Laporan" back /> }}
      />
    </JSStack>
  );
}
