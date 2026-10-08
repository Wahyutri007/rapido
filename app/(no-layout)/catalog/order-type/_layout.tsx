import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useGlobalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function OrderTypeLayout() {
  const params = useGlobalSearchParams();

  return (
    <JSStack screenOptions={{ ...ScaleBackTransition }}>
      <JSStack.Screen
        name="index"
        options={{ header: () => <Header back title="Tipe Pesanan" /> }}
      />
      <JSStack.Screen
        name="modify"
        options={{
          header: () => (
            <Header
              back
              title={`${params?.id ? "Edit" : "Tambah"} Tipe Pesanan`}
            />
          ),
        }}
      />
      <JSStack.Screen
        name="detail"
        options={{
          header: () => (
            <Header
              back
              title="Detail Tipe Pesanan"
              right={
                <View className="rounded-lg bg-green-50 px-2.5 py-1">
                  <Text className="text-xs font-semibold text-green-600">
                    Aktif
                  </Text>
                </View>
              }
            />
          ),
        }}
      />
    </JSStack>
  );
}
