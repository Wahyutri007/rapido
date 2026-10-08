import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import {
	PlaceStats,
	PlaceStatus,
} from "@/components/feature/manage/place/PlaceOverview";
import { StoreIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { placeSummary } from "@/lib/manage/place";
import { route, tw } from "@/lib/utils";
import { usePlaceStore } from "@/store/placeStore";

export default function PlaceListScreen() {
	const outlets = usePlaceStore((state) => state.outlets);
	const [search, setSearch] = React.useState("");
	const filtered = outlets.filter((outlet) =>
		outlet.name
			.toLocaleLowerCase("id-ID")
			.includes(search.trim().toLocaleLowerCase("id-ID")),
	);
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={tw(4)}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari toko/outlet..."
						variant="light"
					/>
					<FlatList
						data={filtered}
						keyExtractor={(outlet) => outlet.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
						ListHeaderComponent={
							<View className="mb-4 gap-4">
								<PlaceStats summary={placeSummary(outlets)} global />
								<Text size="normal" w="semibold">
									Daftar Toko / Outlet
								</Text>
							</View>
						}
						renderItem={({ item }) => (
							<CatalogItemCard
								title={item.name}
								subtitle={`${item.areas.length} Area · ${placeSummary([item]).total} Tempat`}
								icon={<StoreIcon size={24} color={Colors.primary} />}
								right={
									<View className="flex-row items-center gap-2">
										<PlaceStatus active={item.active} />
										<Feather
											name="chevron-right"
											size={16}
											color={Colors.primary}
										/>
									</View>
								}
								onPress={() =>
									router.push(
										route("/manage/place/store", { outletId: item.id }),
									)
								}
							/>
						)}
						ListEmptyComponent={
							<SearchNotFound text="Tidak ada toko/outlet ditemukan" />
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/manage/place/areas"))}
			>
				Tambah Area
			</BottomActionButton>
		</>
	);
}
