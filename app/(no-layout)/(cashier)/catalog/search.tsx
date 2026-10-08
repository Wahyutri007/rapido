import AntDesign from "@expo/vector-icons/AntDesign";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import React from "react";
import {
	BackHandler,
	FlatList,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import Text from "@/components/common/Text";
import { MenuItemGrid } from "@/components/feature/cashier/catalog/menu/MenuItem";
import MenuView from "@/components/feature/cashier/catalog/menu/MenuView";
import {
	ArrowCircleRightIcon,
	FilterIcon,
	SearchIcon,
} from "@/components/icons";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Colors } from "@/constants/Colors";
import { MENU_ITEMS } from "@/constants/data/menu";
import useSearchParamState from "@/hooks/useSearchParamState";
import { cn } from "@/lib/utils";

const LAST_SEARCH_KEY = ["Chicken", "Beef Thai", "Hotdog", "Pasta"];

export default function SearchScreen() {
	const params = useGlobalSearchParams();

	const [search, setSearch] = useSearchParamState("search", "");

	return (
		<ScrollView className="grow bg-zinc-50 p-5">
			<View className="flex-row items-center gap-2.5">
				<Input size="xl" variant="outline" className="grow pl-3">
					<InputIcon
						as={() => <SearchIcon size={20} color={Colors.zinc[400]} />}
					/>
					<InputField
						size="2xs"
						placeholder="Cari Produk"
						value={search}
						onChangeText={(text) => setSearch(text)}
					/>
				</Input>
				<Pressable>
					{({ pressed }) => (
						<View
							className={cn(
								"size-12 items-center justify-center rounded-[10px] bg-primary-400/50",
								{
									"opacity-50": pressed,
								},
							)}
						>
							<FilterIcon />
						</View>
					)}
				</Pressable>
			</View>
			<View className="mt-3">
				<Text className="text-sm text-gray-900" w="semibold">
					Pencarian Terakhir
				</Text>
				<View className="mt-4 gap-3">
					{LAST_SEARCH_KEY.map((item) => (
						<Pressable
							key={item}
							onPress={() => setSearch(item)}
							className="flex-row items-center justify-between"
						>
							<Text className="text-xs text-muted">{item}</Text>
							<Pressable onPress={() => alert(`Delete ${item}`)}>
								<AntDesign name="close" size={20} color="black" />
							</Pressable>
						</Pressable>
					))}
				</View>
			</View>
			<View className="mt-8">
				<View className="flex-row items-center gap-2">
					{search ? (
						<Text className="text-sm text-gray-900" w="semibold">
							Pencarian
						</Text>
					) : (
						<>
							<Text className="text-sm text-gray-900" w="semibold">
								Banyak Dipesan
							</Text>
							<ArrowCircleRightIcon size={16} color={Colors.primary} />
						</>
					)}
				</View>
				<View className="mt-3">
					<MenuView data={MENU_ITEMS} defaultView="popular" />
				</View>
			</View>
		</ScrollView>
	);
}
