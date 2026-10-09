import { ICONS } from "@/assets/images/icons";
import Text from "@/components/common/Text";
import { route } from "@/lib/utils";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";

const MAIN_MENU = [
  {
    name: "Transaksi",
    icon: ICONS.transaction,
    href: route("/transaction"),
  },
  {
    name: "Tagihan",
    icon: ICONS.expense,
    href: route("/expense"),
  },
  {
    name: "Stok",
    icon: ICONS.stock,
    href: route("/stock"),
  },
  {
    name: "Riwayat Shift",
    icon: ICONS.shift,
    href: route("/shift"),
  },
  {
    name: "Printer",
    icon: ICONS.printer,
    href: route("/printer"),
  },
  {
    name: "Scanner",
    icon: ICONS.scanner,
    href: route("/scanner"),
  },
  {
    name: "Cash Drawer",
    icon: ICONS.cash_drawer,
    href: route("/cash-drawer"),
  },
  {
    name: "Pengaturan",
    icon: ICONS.settings,
    href: route("/settings"),
  },
];

type MenuItemProps = (typeof MAIN_MENU)[0];

function MenuItem(props: MenuItemProps) {
  const { href, icon, name } = props;

  return (
    <Pressable onPress={() => router.push(href as any)} className="w-1/4 py-1">
      <View className="flex-1 items-center justify-center">
        <Image source={icon} className="h-16 w-16" />
      </View>
      <Text className="text-center text-xs text-zinc-700">{name}</Text>
    </Pressable>
  );
}

export default function MainMenu() {
  return (
    <View className="shrink-0">
      <View className="flex-row flex-wrap">
        {MAIN_MENU.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </View>
    </View>
  );
}
