import "@/global.css";
import "@/components/icons";
import React from "react";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { LocalRouteParamsContext } from "expo-router/build/Route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import Header from "@/components/common/Header";
import Rounding from "@/app/(no-layout)/manage/pos-settings/rounding";
import Stock from "@/app/(no-layout)/manage/pos-settings/stock-limit";
import Printer from "@/app/(no-layout)/manage/printer/modify";
import apiClient from "@/api/axios";
import { FONT_NAMES } from "@/constants/Fonts";

// This entry is local test infrastructure. Playwright fulfills every API request.
apiClient.defaults.baseURL = `${window.location.origin}/api`;
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
const screens = { rounding: Rounding, stock: Stock, printer: Printer };
const titles = { rounding: "Pembulatan", stock: "Batas Stok", printer: "Printer" };
function Preview() {
	const [loaded] = useFonts({
		[FONT_NAMES.regular]: require("../assets/fonts/Inter_24pt-Regular.ttf"),
		[FONT_NAMES.medium]: require("../assets/fonts/Inter_24pt-Medium.ttf"),
		[FONT_NAMES.semibold]: require("../assets/fonts/Inter_24pt-SemiBold.ttf"),
		[FONT_NAMES.bold]: require("../assets/fonts/Inter_24pt-Bold.ttf"),
	});
	const [entry, setEntry] = React.useState({ screen: "rounding", params: {}, root: 0 });
	React.useEffect(() => {
		const push = router.push, back = router.back;
		globalThis.__sd6 = {
			queryClient, backCount: 0,
			navigate: (screen, params = {}, remount = false) => setEntry(previous => ({ screen, params, root: previous.root + Number(remount) })),
			refetch: () => queryClient.refetchQueries({ type: "active" }),
		};
		router.push = href => { globalThis.__sd6.lastRoute = String(href); };
		router.back = () => { globalThis.__sd6.backCount++; };
		return () => { router.push = push; router.back = back; delete globalThis.__sd6; };
	}, []);
	if (!loaded) return null;
	const Screen = screens[entry.screen];
	return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><QueryClientProvider client={queryClient}>
		<GluestackUIProvider mode="light"><View className="flex-1">
			<Header title={titles[entry.screen]} back={() => router.back()} />
			<LocalRouteParamsContext.Provider value={entry.params}>
				<Screen key={`${entry.screen}:${entry.root}`} />
			</LocalRouteParamsContext.Provider>
		</View></GluestackUIProvider>
	</QueryClientProvider></SafeAreaProvider></GestureHandlerRootView>;
}
registerRootComponent(Preview);
