import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { FilterIcon, SearchIcon } from "@/components/icons";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Colors } from "@/constants/Colors";
import useSearchParamState from "@/hooks/useSearchParamState";
import { cn } from "@/lib/utils";

export default function MenuSearch() {
	const [search, setSearch] = useSearchParamState("search", "");

	return (
		<View className={cn("flex-row items-center gap-2")}>
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
		</View>
	);
}
