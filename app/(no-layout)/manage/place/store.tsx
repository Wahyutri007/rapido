import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import {
	PlaceHero,
	PlaceStats,
	PlaceTabs,
} from "@/components/feature/manage/place/PlaceOverview";
import { Colors } from "@/constants/Colors";
import { placeSummary } from "@/lib/manage/place";
import { cn, route } from "@/lib/utils";
import { usePlaceStore } from "@/store/placeStore";
import type { PlaceArea } from "@/types/ui/manage/place";

export default function PlaceStoreScreen() {
	const { outletId } = useLocalSearchParams<{ outletId: string }>();
	const outlet = usePlaceStore((state) =>
		state.outlets.find((item) => item.id === outletId),
	);
	const deleteArea = usePlaceStore((state) => state.deleteArea);
	const [tab, setTab] = React.useState("area");
	const [selected, setSelected] = React.useState<PlaceArea | null>(null);
	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [confirm, setConfirm] = React.useState(false);
	if (!outlet)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Toko/outlet tidak ditemukan." />
			</Wrapper>
		);
	const summary = placeSummary([outlet]);
	const openArea = (id: string) =>
		router.push(route("/manage/place/area", { outletId, areaId: id }));
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<PlaceHero
					title={outlet.name}
					subtitle={outlet.address}
					active={outlet.active}
					description={`${outlet.areas.length} Area · ${summary.total} Tempat`}
				/>
				<PlaceTabs
					active={tab}
					onChange={setTab}
					tabs={[
						{ id: "stats", title: "Statistik" },
						{ id: "area", title: "Area" },
					]}
				/>
				{tab === "stats" ? (
					<View className="gap-4">
						<PlaceStats summary={summary} />
						<Card className="gap-3">
							<Text size="normal" w="semibold">
								Ringkasan Area
							</Text>
							{outlet.areas.map((area) => (
								<View
									key={area.id}
									className="flex-row items-center justify-between gap-3"
								>
									<Text size="normal" className="flex-1">
										{area.name}
									</Text>
									<Text size="small" className="text-muted">
										{area.places.length} Tempat
									</Text>
								</View>
							))}
						</Card>
					</View>
				) : (
					<View className="gap-3">
						<Text size="normal" w="semibold">
							Daftar Area
						</Text>
						{outlet.areas.length ? (
							<Card density="compact">
								{outlet.areas.map((area, index) => (
									<View
										key={area.id}
										className={cn(
											"flex-row items-center",
											index !== outlet.areas.length - 1 &&
												"border-b border-border-muted",
										)}
									>
										<BouncyPressable
											accessibilityRole="button"
											accessibilityLabel={`Buka area ${area.name}`}
											onPress={() => openArea(area.id)}
											className="min-h-16 flex-1 flex-row items-center gap-3 py-3"
										>
											<View className="size-9 items-center justify-center rounded-lg bg-primary-50">
												<Feather name="grid" size={20} color={Colors.primary} />
											</View>
											<View className="flex-1 gap-1">
												<Text size="normal" w="medium">
													{area.name}
												</Text>
												<Text size="small" className="text-muted">
													{area.places.length} Tempat
												</Text>
											</View>
											<Feather
												name="chevron-right"
												size={16}
												color={Colors.primary}
											/>
										</BouncyPressable>
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Pilihan area ${area.name}`}
											onPress={() => {
												setSelected(area);
												setSheetOpen(true);
											}}
											className="size-10 items-center justify-center"
										>
											<Feather
												name="more-horizontal"
												size={20}
												color={Colors.primary}
											/>
										</Pressable>
									</View>
								))}
							</Card>
						) : (
							<SearchNotFound text="Belum ada area di toko ini." />
						)}
					</View>
				)}
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/manage/place/areas", { outletId }))}
			>
				Tambah Area
			</BottomActionButton>
			<ItemActionSheet
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
				title={selected?.name}
				entityName="Area"
				onViewDetail={() => {
					if (selected) openArea(selected.id);
				}}
				onEdit={() => {
					if (selected)
						router.push(
							route("/manage/place/areas", { outletId, areaId: selected.id }),
						);
				}}
				onDelete={() => setConfirm(true)}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				itemName={selected?.name}
				description={`Area beserta ${selected?.places.length ?? 0} tempat di dalamnya akan dihapus dari pratinjau toko ini.`}
				onConfirm={() => {
					if (selected) deleteArea(outletId, selected.id);
					setConfirm(false);
					setSelected(null);
				}}
			/>
		</>
	);
}
