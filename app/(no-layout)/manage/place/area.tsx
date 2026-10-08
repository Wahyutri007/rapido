import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import PlaceLayout from "@/components/feature/manage/place/PlaceLayout";
import {
	PlaceHero,
	PlaceStats,
	PlaceStatus,
	PlaceTabs,
} from "@/components/feature/manage/place/PlaceOverview";
import { Colors } from "@/constants/Colors";
import { PLACE_KINDS } from "@/constants/data/manage/place";
import { placeOrder, placeSummary } from "@/lib/manage/place";
import { route } from "@/lib/utils";
import { usePlaceStore } from "@/store/placeStore";
import type { ManagedPlace } from "@/types/ui/manage/place";

export default function PlaceAreaScreen() {
	const { outletId, areaId } = useLocalSearchParams<{
		outletId: string;
		areaId: string;
	}>();
	const outlet = usePlaceStore((state) =>
		state.outlets.find((item) => item.id === outletId),
	);
	const area = outlet?.areas.find((item) => item.id === areaId);
	const deletePlace = usePlaceStore((state) => state.deletePlace);
	const saveLayout = usePlaceStore((state) => state.saveLayout);
	const [tab, setTab] = React.useState("places");
	const [draftOrder, setDraftOrder] = React.useState(() =>
		placeOrder(area?.places ?? []),
	);
	const order = React.useMemo(() => {
		const saved = placeOrder(area?.places ?? []);
		return [
			...draftOrder.filter((id) => saved.includes(id)),
			...saved.filter((id) => !draftOrder.includes(id)),
		];
	}, [area?.places, draftOrder]);
	const [dragging, setDragging] = React.useState(false);
	const [selected, setSelected] = React.useState<ManagedPlace | null>(null);
	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [confirm, setConfirm] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	if (!outlet || !area)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Area tidak ditemukan di toko ini." />
			</Wrapper>
		);
	const changed = order.join(";") !== placeOrder(area.places).join(";");
	const modify = (placeId?: string) =>
		router.push(
			route("/manage/place/modify", {
				outletId,
				areaId,
				...(placeId ? { placeId } : {}),
			}),
		);
	return (
		<>
			<Wrapper
				hasActionButton
				scrollEnabled={!dragging}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<PlaceHero
					title={area.name}
					subtitle={outlet.name}
					active={outlet.active}
				/>
				<PlaceTabs
					active={tab}
					onChange={setTab}
					tabs={[
						{ id: "places", title: "Tempat" },
						{ id: "layout", title: "Layout Daerah" },
					]}
				/>
				{tab === "layout" ? (
					<PlaceLayout
						places={area.places}
						order={order}
						onChange={setDraftOrder}
						onDragging={setDragging}
						outletActive={outlet.active}
					/>
				) : (
					<>
						<PlaceStats
							summary={placeSummary([{ ...outlet, areas: [area] }])}
						/>
						<View className="gap-3">
							<Text size="normal" w="semibold">
								Daftar Tempat
							</Text>
							{area.places.length ? (
								area.places.map((place) => {
									const kind = PLACE_KINDS.find(
										(item) => item.value === place.kind,
									);
									return (
										<CatalogItemCard
											key={place.id}
											title={
												<Text
													size="normal"
													w="semibold"
													className="flex-1 shrink"
												>
													{place.name}
												</Text>
											}
											subtitle={`${kind?.label} · ${place.capacity} ${kind?.unit}`}
											icon={
												<Feather
													name={kind?.icon ?? "grid"}
													size={24}
													color={Colors.primary}
												/>
											}
											onPress={() => modify(place.id)}
											right={
												<Pressable
													accessibilityRole="button"
													accessibilityLabel={`Pilihan tempat ${place.name}`}
													hitSlop={8}
													onPress={() => {
														setSelected(place);
														setSheetOpen(true);
													}}
													className="size-8 items-center justify-center rounded-lg"
												>
													<Feather
														name="more-horizontal"
														size={20}
														color={Colors.primary}
													/>
												</Pressable>
											}
										>
											<View className="self-start">
												<PlaceStatus active={place.active && outlet.active} />
											</View>
										</CatalogItemCard>
									);
								})
							) : (
								<SearchNotFound text="Belum ada tempat di area ini." />
							)}
						</View>
					</>
				)}
			</Wrapper>
			{tab === "layout" ? (
				<BottomActionButton
					isDisabled={!changed}
					onPress={() => {
						saveLayout(outletId, areaId, order);
						setSuccess(true);
					}}
				>
					Simpan Layout
				</BottomActionButton>
			) : (
				<BottomActionButton onPress={() => modify()}>
					Tambah Tempat
				</BottomActionButton>
			)}
			<ItemActionSheet
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
				title={selected?.name}
				entityName="Tempat"
				onEdit={() => {
					if (selected) modify(selected.id);
				}}
				onDelete={() => setConfirm(true)}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				itemName={selected?.name}
				description="Tempat akan dihapus dari daftar dan denah pratinjau area ini."
				onConfirm={() => {
					if (selected) deletePlace(outletId, areaId, selected.id);
					setConfirm(false);
					setSelected(null);
				}}
			/>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Layout Disimpan"
				description="Posisi tempat disimpan untuk pratinjau selama aplikasi terbuka."
				buttonText="Mengerti"
			/>
		</>
	);
}
