import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
	Animated,
	Pressable,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import Text from "@/components/common/Text";
import { BottomTabPadding } from "@/components/custom/BottomTab";
import { CategoryFilter } from "@/components/feature/cashier/catalog/menu/Filter";
import MenuView from "@/components/feature/cashier/catalog/menu/MenuView";
import MenuSearch from "@/components/feature/cashier/catalog/menu/Search";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { MENU_ITEMS } from "@/constants/data/menu";
import { formatRp, tw } from "@/lib/utils";
import type { MenuItemProps } from "@/types/ui/add/menu";

export default function MenuScreen() {
	const [layout, setLayout] = React.useState<"grid" | "list">("grid");
	const [refreshing, setRefreshing] = React.useState(false);

	function onRefresh() {
		setRefreshing(true);
		// Simulate a network request
		setTimeout(() => {
			fetchData();
			setRefreshing(false);
		}, 2000);
	}

	function handleAddToCart() {
		router.push("/cart");
	}

	const [menus, setMenus] = React.useState<MenuItemProps[] | null>(null);

	const fetchData = React.useCallback(async () => {
		setMenus(MENU_ITEMS);
	}, []);

	React.useEffect(() => {
		// Simulate fetching data from an API
		fetchData();
	}, []);

	return (
		<View className="bg-white flex-1">
			<View className="pb-4 bg-zinc-50">
				<View className="px-4">
					<MenuSearch />
				</View>
				<View className="mt-6">
					<CategoryFilter />
				</View>
			</View>
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						progressViewOffset={24}
					/>
				}
			>
				<View className="px-4 flex-1 bg-zinc-50">
					<View className="flex-row items-center justify-between">
						<Pressable hitSlop={tw(4)} onPress={() => alert("Clicked ")}>
							<Text className="text-xs text-primary" w="medium">
								+ Custom
							</Text>
						</Pressable>

						<View className="flex-row items-center gap-3">
							<Pressable
								className="size-5 items-center justify-center"
								hitSlop={tw(2)}
								onPress={() => setLayout("grid")}
							>
								<Feather
									name="grid"
									size={tw(4)}
									color={layout === "grid" ? Colors.primary : Colors.gray[500]}
								/>
							</Pressable>
							<Pressable
								className="size-5 items-center justify-center"
								hitSlop={tw(2)}
								onPress={() => setLayout("list")}
							>
								<Feather
									name="menu"
									size={tw(4)}
									color={layout === "list" ? Colors.primary : Colors.gray[500]}
								/>
							</Pressable>
						</View>
					</View>
					<View className="mt-3">
						<MenuView data={menus} layout={layout} />
					</View>
				</View>
			</ScrollView>

			<View className="flex-row px-4 py-6 rounded-t-2xl bg-white  justify-between items-center z-10">
				<View className="flex-row items-center gap-4">
					<View className="size-8 rounded-full bg-primary-50 items-center justify-center ">
						<Text className="text-base text-primary" w="semibold">
							4
						</Text>
					</View>
					<View className="gap-1">
						<Text className="text-zinc-700" w="medium">
							Total Harga
						</Text>
						<Text className="text-base" w="semibold">
							{formatRp(50000)}
						</Text>
					</View>
				</View>
				<View>
					<ButtonGroup>
						<Button onPress={() => router.push("/(no-layout)/(cashier)/cart")}>
							<ButtonText>Checkout</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</View>
		</View>
	);
}
