import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CashierSummary from "@/components/feature/cashier-home/CashierSummary";
import CashierHeader from "@/components/feature/cashier-home/Header";
import MainMenu from "@/components/feature/cashier-home/MainMenu";
import MenuView from "@/components/feature/cashier/catalog/menu/MenuView";
import { Colors } from "@/constants/Colors";
import { MENU_ITEMS } from "@/constants/data/menu";
import { tw } from "@/lib/utils";
import { Entypo } from "@expo/vector-icons";
import React, { Fragment } from "react";
import { View } from "react-native";

export default function CashierHomeScreen() {
	return (
		<Wrapper hasBottomBar>
			<CashierHeader />

			<View className="mx-4 -mt-16">
				<CashierSummary />
			</View>

			<View className="mt-4 gap-3 px-4">
				<Text size="normal" w="semibold">
					Menu Favorit
				</Text>
				<Card density="compact" appearance="figma">
					<MainMenu />
				</Card>
			</View>

			<View className="mt-5 border-t border-zinc-200 pt-4">
				<View className="px-4">
					<View className="flex-row items-center justify-between">
						<Text w="semibold">Penjualan (20)</Text>
						<Text className="text-primary" w="medium">
							Detail
						</Text>
					</View>
					<View className="mt-5 gap-3">
						{Array.from({ length: 5 }).map((_, index) => (
							<Fragment key={index}>
								<View className="flex-row items-center gap-3">
									<View className="size-8 items-center justify-center rounded-full">
										<Entypo name="wallet" size={tw(4)} color={Colors.primary} />
									</View>
									<View className="flex-1 flex-row items-center justify-between">
										<View className="gap-2">
											<Text w="medium">Inv0101001 - Arianja</Text>
											<View className="flex-row items-center gap-1">
												<Text className="text-xs text-zinc-500">
													21 Jan 2026 13.01 WIB
												</Text>
												<Text className="text-xs text-red-500">4 Item</Text>
											</View>
										</View>
										<Text w="medium">Rp 50.000</Text>
									</View>
								</View>
								{index !== 4 && <View className="h-px bg-zinc-200" />}
							</Fragment>
						))}
					</View>
				</View>
			</View>

			<View className="mt-5 px-4">
				<Text w="semibold">Pesan Cepat</Text>

				<View className="mt-4">
					<MenuView data={MENU_ITEMS} />
				</View>
			</View>
		</Wrapper>
	);
}
