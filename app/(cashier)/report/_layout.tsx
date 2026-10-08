import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { MaterialTopTabs } from "@/components/custom/MaterialTopTabs";
import TopTabBar from "@/components/feature/order/TopTabBar";
import React from "react";

export default function ReportLayout() {
  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{
          header: () => (
            <Header title="Laporan" back className="border-b border-zinc-200" />
          ),
        }}
      />
    </JSStack>
  );
}
