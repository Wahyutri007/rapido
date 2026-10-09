import Header from "@/components/common/Header";
import BottomTab from "@/components/custom/BottomTab";
import { EFeather, EMaterial, Inventory, Report } from "@/components/icons";
import { Tabs } from "expo-router";
import React from "react";

export default function HomeLayout() {
  return (
    <Tabs tabBar={(props: any) => <BottomTab {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Beranda",
          tabBarIcon: (props) => <EFeather name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Laporan",
          headerShown: false,
          tabBarLabel: "Laporan",
          tabBarIcon: (props) => <Report {...props} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          headerShown: false,
          tabBarLabel: "Katalog",
          tabBarIcon: (props) => <EMaterial name="list-alt" {...props} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          headerShown: false,
          tabBarLabel: "Inventory",
          tabBarIcon: (props) => <Inventory {...props} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          header: () => <Header title="Kelola" back />,
          tabBarLabel: "Kelola",
          tabBarIcon: (props) => <EMaterial name="storefront" {...props} />,
        }}
      />
    </Tabs>
  );
}
