import { router } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { route } from "@/lib/utils";

function DetailHeader({ outletId }: { outletId?: string | string[] }) {
	return (
		<Header
			appearance="cashier"
			title="Detail Tempat"
			back={() => {
				router.dismissTo(
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
				options={{
					header: ({ route: screenRoute }) => (
						<DetailHeader
							outletId={
								(
									screenRoute.params as
										| { outletId?: string | string[] }
										| undefined
								)?.outletId
							}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
