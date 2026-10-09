import { router } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export const unstable_settings = { initialRouteName: "index" };

function goBack(
	fallback: "/(back-office)/manage" | "/(no-layout)/manage/absence",
) {
	if (router.canGoBack()) router.back();
	else router.replace(fallback);
}

export default function FeatureLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<Header
							back={() => goBack("/(back-office)/manage")}
							title="Absensi"
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<Header
							back={() => goBack("/(no-layout)/manage/absence")}
							title="Detail Absensi"
						/>
					),
				}}
			/>
		</JSStack>
	);
}
