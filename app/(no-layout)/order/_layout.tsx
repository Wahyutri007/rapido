import Header from "@/components/common/Header";
import { MaterialTopTabs } from "@/components/custom/MaterialTopTabs";
import TopTabBar from "@/components/feature/order/TopTabBar";
import React from "react";
import type { MaterialTopTabBarProps } from "expo-router/js-top-tabs";

export default function OrderLayout() {
  return (
    <>
      <Header className="border-0 shadow-none" back title="Pesanan" />
      <MaterialTopTabs tabBar={(props: MaterialTopTabBarProps) => <TopTabBar {...props} />}>
        <MaterialTopTabs.Screen
          name="index"
          options={{
            tabBarLabel: "Sudah Dibayar",
          }}
        />
        <MaterialTopTabs.Screen
          name="finished"
          options={{
            tabBarLabel: "Pesanan Selesai",
          }}
        />
        <MaterialTopTabs.Screen
          name="unpaid"
          options={{
            tabBarLabel: "Belum Dibayar",
          }}
        />
      </MaterialTopTabs>
    </>
  );
}
