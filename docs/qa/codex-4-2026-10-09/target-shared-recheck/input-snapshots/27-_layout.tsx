import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { LayoutTransitionSplash } from "@/components/custom/LayoutTransitionSplash";
import { SplashScreenView } from "@/components/custom/SplashScreenView";
import "@/components/icons";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import "expo-dev-client";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// Keep native splash screen visible while fonts and initial bundle load
SplashScreen.preventAutoHideAsync().catch(() => {});
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SecureStore from "@/lib/storage";
import React from "react";
import { View } from "react-native";
import { EEntypo as Entypo } from "@/components/icons";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetItem,
	ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { FONT_NAMES } from "@/constants/Fonts";
import Keys from "@/constants/Keys";
import AuthProvider from "@/context/AuthContext";
import ContainerSizingProvider from "@/context/ContainerSizingContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import useCustomRouter from "@/hooks/useCustomRouter";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	},
});

function DevFab({
	onTriggerSplash,
}: {
	onTriggerSplash: (mode: "boot" | "transition") => void;
}) {
	type DevActionKey =
		| "trigger-boot-splash"
		| "trigger-transition-splash"
		| "reset-store"
		| "logout"
		| "log-storage";

	const { router } = useCustomRouter();

	const [showActionsheet, setShowActionsheet] = React.useState(false);

	function onPress() {
		setShowActionsheet(true);
	}

	function handleClose() {
		setShowActionsheet(false);
	}

	async function handleItemPress(key: DevActionKey) {
		setShowActionsheet(false);

		switch (key) {
			case "trigger-boot-splash":
				onTriggerSplash("boot");
				break;
			case "trigger-transition-splash":
				onTriggerSplash("transition");
				break;
			case "reset-store":
				Object.values(Keys).forEach(async (k) => {
					await SecureStore.deleteItemAsync(k);
				});

				alert("Storage reset. App restart is recommended.");
				break;
			case "logout":
				// Handle logout action
				break;
			case "log-storage":
				Object.values(Keys).forEach(async (k) => {
					const value = await SecureStore.getItemAsync(k);
					console.log(`Key: ${k}, Value: ${value}`);
				});

				break;
			default:
				handleClose();
		}
	}

	return (
		<>
			<Actionsheet isOpen={showActionsheet} onClose={handleClose}>
				<ActionsheetBackdrop />
				<ActionsheetContent>
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>
					<ActionsheetItem
						onPress={() => handleItemPress("trigger-boot-splash")}
					>
						<ActionsheetItemText>Trigger Boot Splash (Animated)</ActionsheetItemText>
					</ActionsheetItem>
					<ActionsheetItem
						onPress={() => handleItemPress("trigger-transition-splash")}
					>
						<ActionsheetItemText>Trigger Mode Transition Splash</ActionsheetItemText>
					</ActionsheetItem>
					<ActionsheetItem onPress={() => handleItemPress("reset-store")}>
						<ActionsheetItemText>Reset Store</ActionsheetItemText>
					</ActionsheetItem>
					<ActionsheetItem onPress={() => handleItemPress("logout")}>
						<ActionsheetItemText>Logout</ActionsheetItemText>
					</ActionsheetItem>
					<ActionsheetItem onPress={() => handleItemPress("log-storage")}>
						<ActionsheetItemText>Log Storage</ActionsheetItemText>
					</ActionsheetItem>
				</ActionsheetContent>
			</Actionsheet>
			<Fab
				placement="bottom right"
				size="md"
				className="bg-primary-500 opacity-60 active:opacity-100 mb-16 mr-2"
				onPress={onPress}
			>
				<FabIcon as={() => <Entypo name="code" size={16} color="white" />} />
				<FabLabel style={{ fontFamily: FONT_NAMES.medium }}>Dev</FabLabel>
			</Fab>
		</>
	);
}

function AppContent() {
	useProtectedRoute();

	const [devSplash, setDevSplash] = React.useState<{
		visible: boolean;
		mode: "boot" | "transition";
		isReady: boolean;
		targetModeLabel?: string;
	}>({
		visible: false,
		mode: "boot",
		isReady: false,
	});

	const triggerTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const handleTriggerSplash = React.useCallback(
		(mode: "boot" | "transition") => {
			if (triggerTimeoutRef.current) {
				clearTimeout(triggerTimeoutRef.current);
			}

			setDevSplash({
				visible: true,
				mode,
				isReady: false,
				targetModeLabel: mode === "transition" ? "Kasir" : undefined,
			});

			// Hold for 2.4s to observe the entrance and shimmer, then trigger outro
			triggerTimeoutRef.current = setTimeout(() => {
				setDevSplash((prev) => ({ ...prev, isReady: true }));
			}, 2400);
		},
		[],
	);

	const handleDevSplashDismiss = React.useCallback(() => {
		// User tapped splash during preview -> trigger immediate exit
		if (triggerTimeoutRef.current) {
			clearTimeout(triggerTimeoutRef.current);
		}
		setDevSplash((prev) => ({ ...prev, isReady: true }));
	}, []);

	const handleDevSplashComplete = React.useCallback(() => {
		setDevSplash({
			visible: false,
			mode: "boot",
			isReady: false,
		});
	}, []);

	return (
		<GluestackUIProvider mode="light">
			<LayoutTransitionSplash />
			<JSStack
				screenOptions={{
					headerShown: false,
					...ScaleBackTransition,
				}}
			>
				<JSStack.Screen name="index" />
				<JSStack.Screen name="(back-office)" />
				<JSStack.Screen name="(cashier)" />
				<JSStack.Screen name="(absence)" />
				<JSStack.Screen name="(onboarding)" />
				<JSStack.Screen name="+not-found" />
			</JSStack>
			<StatusBar style="auto" />
			<View />

			{__DEV__ && <DevFab onTriggerSplash={handleTriggerSplash} />}

			{devSplash.visible && (
				<SplashScreenView
					mode={devSplash.mode}
					targetModeLabel={devSplash.targetModeLabel}
					isReady={devSplash.isReady}
					onPress={handleDevSplashDismiss}
					onAnimationComplete={handleDevSplashComplete}
				/>
			)}
		</GluestackUIProvider>
	);
}

export default function RootLayout() {
	const [loaded] = useFonts({
		[FONT_NAMES.regular]: require("../assets/fonts/Inter_24pt-Regular.ttf"),
		[FONT_NAMES.bold]: require("../assets/fonts/Inter_24pt-Bold.ttf"),
		[FONT_NAMES.medium]: require("../assets/fonts/Inter_24pt-Medium.ttf"),
		[FONT_NAMES.semibold]: require("../assets/fonts/Inter_24pt-SemiBold.ttf"),
		[FONT_NAMES.logo]: require('../assets/fonts/YsabeauInfant-ExtraBoldItalic.ttf')
	});

	React.useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [loaded]);

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ContainerSizingProvider>
					<AppContent />
				</ContainerSizingProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
