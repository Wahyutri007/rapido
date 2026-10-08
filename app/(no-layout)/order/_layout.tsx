import Header from "@/components/common/Header";
import { MaterialTopTabs } from "@/components/custom/MaterialTopTabs";
import TopTabBar from "@/components/feature/order/TopTabBar";
import React from "react";

export default function OrderLayout() {
  return (
    <>
      <Header className="border-0 shadow-none" back title="Pesanan" />
      <MaterialTopTabs tabBar={(props) => <TopTabBar {...props} />}>
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
