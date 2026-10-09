import { router } from "expo-router";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { route } from "@/lib/utils";

export default function ScannerLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<Header
							appearance="cashier"
							title="Pengaturan Scanner"
							right={
								<Text size="small" className="text-muted">
									Pratinjau
								</Text>
							}
							back={() => {
								if (router.canGoBack()) router.back();
								else router.replace("/(cashier)/home");
							}}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<Header
							appearance="cashier"
							title="Detail Scanner"
							right={
								<Text size="small" className="text-muted">
									Pratinjau
								</Text>
							}
							back={() => {
								if (router.canGoBack()) router.back();
								else router.replace(route("/(no-layout)/(cashier)/scanner"));
							}}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
