import { router, useLocalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { route } from "@/lib/utils";

function DetailHeader() {
	const { outletId } = useLocalSearchParams<{ outletId?: string | string[] }>();
	return (
		<Header
			title="Detail Tempat"
			back={() => {
				if (router.canGoBack()) router.back();
				else
					router.replace(
						route(
							"/(cashier)/location",
							typeof outletId === "string" ? { outletId } : {},
						),
					);
			}}
		/>
	);
}

export default function LocationLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <DetailHeader /> }}
			/>
		</JSStack>
	);
}
