import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import useSearchParamState from "@/hooks/useSearchParamState";
import type { Nullable, State } from "@/types";
import type { OfferItemProps } from "@/types/ui/cart/offer";

function OfferItem({
	item,
	selectedState,
}: {
	item: OfferItemProps;
	selectedState: State<Nullable<string>>;
}) {
	const [selectedOffer, setSelectedOffer] = selectedState;

	const isSelected = selectedOffer === item.id;

	return (
		<View className="flex-row items-center justify-between gap-3 px-5 py-6">
			<View className="flex-row items-center gap-3">
				<Image
					source={item.image}
					style={{ width: 48, height: 48 }}
					resizeMode="cover"
					className="rounded-full"
				/>
				<View>
					<Text className="text-sm text-gray-900" w="bold">
						{item.name}
					</Text>
					<Text className="text-xs">{item.description}</Text>
				</View>
			</View>
			<Pressable
				onPress={() => setSelectedOffer(isSelected ? null : item.id)}
				className="mr-1 size-6 shrink-0 items-center justify-center rounded-full bg-primary-400"
			>
				{isSelected ? (
					<Feather name="check" size={12} color="white" />
				) : (
					<Entypo name="plus" size={16} color="white" />
				)}
			</Pressable>
		</View>
	);
}

export default function OfferList({ data }: { data: OfferItemProps[] }) {
	const selectedOfferState = useSearchParamState<Nullable<string>>(
		"selectedOffer",
		null,
	);

	return (
		<FlatList
			data={data}
			renderItem={(props) => (
				<OfferItem
					{...props}
					selectedState={selectedOfferState as State<Nullable<string>>}
				/>
			)}
		/>
	);
}
