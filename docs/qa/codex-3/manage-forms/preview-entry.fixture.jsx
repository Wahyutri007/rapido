import "../global.css";
import React from "react";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { ExpoRoot, Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Header from "../components/common/Header";
import Text from "../components/common/Text";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";

function Layout() {
  return <Stack screenOptions={{ header: () => <Header title="Pratinjau Pengaturan" back /> }} />;
}
const titles = { extra: "Biaya Tambahan", "order-type": "Tipe Pesanan", "payment-method": "Metode Pembayaran", tax: "Pajak" };
const modules = {
  "./_layout.tsx": { default: Layout },
  "./index.tsx": { default: () => <Text>Pilih form</Text> },
  "./forms-preview.tsx": { default: () => <Text>Pilih form</Text> },
  "./manage/extra/modify.tsx": require("../app/(no-layout)/manage/extra/modify"),
  "./manage/order-type/modify.tsx": require("../app/(no-layout)/manage/order-type/modify"),
  "./manage/payment-method/modify.tsx": require("../app/(no-layout)/manage/payment-method/modify"),
  "./manage/tax/modify.tsx": require("../app/(no-layout)/manage/tax/modify"),
  "./manage/member/modify.tsx": require("../app/(no-layout)/manage/member/modify"),
};
Object.entries(titles).forEach(([name, title]) => {
  modules[`./manage/${name}/index.tsx`] = { default: () => <Text>{`Daftar ${title}`}</Text> };
});
const context = key => modules[key];
context.keys = () => Object.keys(modules);
context.resolve = key => key;
context.id = "codex-3-manage-forms";
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function Preview() {
  const [loaded] = useFonts({
    InterRegular: require("../assets/fonts/Inter_24pt-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter_24pt-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter_24pt-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter_24pt-Bold.ttf"),
  });
  window.manageNavigate = (name, id) => router.replace(`/manage/${name}/modify${id === undefined ? "" : `?id=${encodeURIComponent(id)}`}`);
  window.manageRerender = () => router.setParams({ qaRender: String(Date.now()) });
  window.memberChangeId = id => router.setParams({ id });
  window.memberRefetch = () => client.invalidateQueries({ queryKey: ["customers"] });
  if (!loaded) return null;
  return <SafeAreaProvider><GluestackUIProvider mode="light"><QueryClientProvider client={client}><View style={{ flex: 1 }}><ExpoRoot context={context} /></View></QueryClientProvider></GluestackUIProvider></SafeAreaProvider>;
}
registerRootComponent(Preview);
