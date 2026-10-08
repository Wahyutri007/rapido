import Entypo from "@expo/vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonIcon } from "@/components/ui/button";
import { useContainerSizing } from "@/context/ContainerSizingContext";
import { formatRp, toGrid } from "@/lib/utils";
import type { MenuItemProps } from "@/types/ui/add/menu";

function useCommon(data: MenuItemProps) {
	function handlePress() {
		console.log("Routing to data.id", data.id);

		router.push({
			pathname: "/(no-layout)/(cashier)/catalog/detail",
			params: { id: data.id },
		});
	}

	return {
		handlePress,
	};
}

export function MenuItemGrid({
	data,
	index,
}: {
	data: MenuItemProps;
	index: number;
}) {
	const { containers } = useContainerSizing();
	const { handlePress } = useCommon(data);

	const GAP = 16;
	const contentWidth = toGrid(containers.menu, 2, GAP);

	return (
		<Pressable
			onPress={handlePress}
			style={{
				width: contentWidth,
				marginLeft: index % 2 === 1 ? "auto" : 0,
				marginBottom: GAP,
			}}
		>
			<View
				style={{
					width: contentWidth,
					height: contentWidth * (9 / 8),
				}}
				className="overflow-hidden rounded-lg"
			>
				<Image source={data.image} className="size-full" />
				<LinearGradient
					colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.66)"]}
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						top: 0,
						bottom: 0,
					}}
				/>

				{data.discount && (
					<View className="absolute left-2 top-2 rounded-full bg-primary-400 px-2 py-1">
						<Text className="text-xs text-gray-50" w="semibold">
							{data.discount.type === "percentage"
								? `-${data.discount.value}%`
								: `-${formatRp(data.discount.value)}`}
						</Text>
					</View>
				)}

				<View className="absolute bottom-0 left-0 w-full p-2">
					<Text className="text-base text-white" w="semibold">
						{data.name}
					</Text>
					<View className="flex-row items-center">
						<Text className="mt-2 text-white" w="semibold">
							{formatRp(data.discount?.price ?? data.sell_price)}
						</Text>
						{data.discount?.price && (
							<Text
								className="ml-2 mt-2 text-xs text-zinc-300 line-through"
								w="semibold"
							>
								{formatRp(data.sell_price)}
							</Text>
						)}
					</View>
				</View>
			</View>
		</Pressable>
	);
}

export function MenuItemList({
	data,
	index,
}: {
	data: MenuItemProps;
	index: number;
}) {
	const { containers } = useContainerSizing();
	const { handlePress } = useCommon(data);

	return (
		<Pressable onPress={handlePress} className="h-12">
			<View className="flex flex-row items-center overflow-hidden">
				<Image source={data.image} className="aspect-square size-12 rounded" />

				{/* {data.discount && (
          <View className="absolute left-2 top-2 rounded-full bg-primary-400 px-2 py-1">
            <Text className="text-xs text-gray-50" w="semibold">
              {data.discount.type === "percentage"
                ? `${data.discount.value}%`
                : formatRp(data.discount.value)}
            </Text>
          </View>
        )} */}

				<View className="ml-3">
					<Text className="text-base" w="semibold">
						{data.name}
					</Text>
					<View className="mt-1 flex-row items-center">
						<Text className="text-zinc-500" w="medium">
							{data.discount?.value
								? formatRp(data.discount.price)
								: formatRp(data.sell_price ?? 0)}
						</Text>
						{data.discount && (
							<Text
								className="ml-2 text-xs text-zinc-500 line-through"
								w="medium"
							>
								{formatRp(data.sell_price)}
							</Text>
						)}
					</View>
				</View>
			</View>
		</Pressable>
	);
}
