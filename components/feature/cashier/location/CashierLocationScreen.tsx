import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import {
	cashierPlaceKind,
	cashierPlaces,
	filterCashierPlaces,
} from "@/lib/cashier/location";
import { route, tw } from "@/lib/utils";
import { usePlaceStore } from "@/store/placeStore";
import type { CashierPlaceFilters } from "@/types/ui/cashier/location";
import { LocationPreviewNotice, LocationStatus } from "./LocationCommon";

const EMPTY_FILTERS: CashierPlaceFilters = { search: "" };

export default function CashierLocationScreen() {
	const { outletId } = useLocalSearchParams<{ outletId?: string | string[] }>();
	const outlets = usePlaceStore((state) => state.outlets);
	const outletParameter = typeof outletId === "string" ? outletId : undefined;
	const [selection, setSelection] = useState({
		param: outletParameter,
		id: outletParameter,
	});
	const [filters, setFilters] = useState(EMPTY_FILTERS);
	const [searchRevision, setSearchRevision] = useState(0);
	// Tab navigation may clear URL parameters. Keep the explicit session choice;
	// a new concrete deep-link outlet still replaces it and resets the filters.
	if (selection.param !== outletParameter) {
		setSelection({
			param: outletParameter,
			id: outletParameter ?? selection.id,
		});
		if (outletParameter !== undefined && outletParameter !== selection.id)
			setFilters(EMPTY_FILTERS);
	}
	const outlet = outlets.find((item) => item.id === selection.id);
	const setSearch = useCallback((search: string) => {
		setFilters((current) => ({ ...current, search }));
	}, []);
	const resetFilters = useCallback(() => {
		setFilters(EMPTY_FILTERS);
		setSearchRevision((current) => current + 1);
	}, []);
	const records = outlet ? cashierPlaces(outlet) : [];
	const visible = filterCashierPlaces(records, filters);
	const filtered = !!(filters.search || filters.areaId || filters.status);
	const active = visible.filter((item) => item.active).length;
	return (
		<Wrapper isNotScrollable hasBottomBar py={tw(4)}>
			<View className="flex-1 px-4">
				<FlatList
					data={visible}
					keyExtractor={(item) => `${item.area.id}:${item.place.id}`}
					contentContainerStyle={{ gap: 12, paddingBottom: 96 }}
					showsVerticalScrollIndicator={false}
					ListHeaderComponent={
						<View className="gap-4">
							<LocationPreviewNotice />
							<Card className="gap-4">
								<Text size="normal" w="semibold">
									Outlet Pratinjau
								</Text>
								<SingleSelect
									label="Pilih Outlet Pratinjau"
									placeholder="Pilih outlet pratinjau"
									items={outlets.map((item) => ({
										value: item.id,
										label: item.name,
									}))}
									value={outlet?.id}
									onValueChange={(value) => {
										setSelection({ param: value, id: value });
										router.setParams({ outletId: value });
										resetFilters();
									}}
								/>
							</Card>
							{outlet && (
								<>
									<Card className="gap-3">
										<Text w="semibold">{outlet.name}</Text>
										<Text size="small" className="text-muted">
											{outlet.address}
										</Text>
										<Text size="small" className="text-muted">
											Hasil filter: {active} aktif · {visible.length - active}{" "}
											nonaktif
										</Text>
										{!outlet.active && (
											<Text size="small" className="text-warning">
												Outlet nonaktif. Semua tempat di outlet ini berstatus
												nonaktif.
											</Text>
										)}
									</Card>
									<Card className="gap-4">
										<SearchBar
											key={`${outlet.id}:${searchRevision}`}
											search={filters.search}
											setSearch={setSearch}
											placeholder="Cari nama, area, atau jenis tempat"
										/>
										<SingleSelect
											label="Filter Area"
											value={filters.areaId ?? "all"}
											items={[
												{ value: "all", label: "Semua Area" },
												...outlet.areas.map((area) => ({
													value: area.id,
													label: area.name,
												})),
											]}
											onValueChange={(value) =>
												setFilters((current) => ({
													...current,
													areaId: value === "all" ? undefined : value,
												}))
											}
										/>
										<SingleSelect<CashierPlaceFilters["status"] | "all">
											label="Filter Status Tempat"
											value={filters.status ?? "all"}
											items={[
												{ value: "all", label: "Semua Status" },
												{ value: "active", label: "Aktif" },
												{ value: "inactive", label: "Nonaktif" },
											]}
											onValueChange={(value) =>
												setFilters((current) => ({
													...current,
													status: value === "all" ? undefined : value,
												}))
											}
										/>
										{filtered && (
											<Button
												variant="outline"
												size="lg"
												onPress={resetFilters}
											>
												<ButtonText>Reset Pencarian dan Filter</ButtonText>
											</Button>
										)}
									</Card>
									<Text w="semibold">Daftar Tempat · {visible.length}</Text>
								</>
							)}
						</View>
					}
					ListEmptyComponent={
						<SearchNotFound
							text={
								!outlet
									? selection.id
										? "Outlet pratinjau tidak ditemukan. Pilih outlet yang tersedia."
										: "Pilih outlet untuk melihat tempat."
									: !records.length
										? "Belum ada tempat di outlet ini."
										: "Tidak ada tempat yang cocok dengan pencarian dan filter."
							}
						/>
					}
					renderItem={({ item }) => {
						const kind = cashierPlaceKind(item.place);
						return (
							<CatalogItemCard
								density="compact"
								title={item.place.name}
								subtitle={item.area.name}
								icon={
									<Feather
										name={kind?.icon ?? "map-pin"}
										size={20}
										color={Colors.primary}
									/>
								}
								onPress={() =>
									router.push(
										route("/(no-layout)/(cashier)/location/detail", {
											outletId: item.outlet.id,
											areaId: item.area.id,
											placeId: item.place.id,
										}),
									)
								}
							>
								<View className="gap-2">
									<Text size="small" className="text-muted">
										{kind?.label} · {item.place.capacity} {kind?.unit}
									</Text>
									<LocationStatus active={item.active} />
								</View>
							</CatalogItemCard>
						);
					}}
				/>
			</View>
		</Wrapper>
	);
}
