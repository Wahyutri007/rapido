import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import StoreDeleteModal from "@/components/feature/manage/store/StoreDeleteModal";
import { StoreIcon } from "@/components/icons";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { STORE_ITEMS } from "@/constants/data/manage/store";
import { useAlertModal } from "@/hooks/useAlertModal";
import type { StoreItemProps } from "@/types/ui/manage/store";

export default function StoreScreen() {
	const insets = useSafeAreaInsets();
	const [search, setSearch] = React.useState("");
	const [stores, setStores] = React.useState<StoreItemProps[]>(STORE_ITEMS);
	const [selectedStore, setSelectedStore] =
		React.useState<StoreItemProps | null>(null);
	const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();

	const filteredStores = React.useMemo(() => {
		if (!search.trim()) return stores;
		const query = search.toLowerCase();
		return stores.filter(
			(store) =>
				store.name.toLowerCase().includes(query) ||
				store.address?.toLowerCase().includes(query) ||
				store.city?.toLowerCase().includes(query),
		);
	}, [search, stores]);

	const handleOpenActionSheet = (store: StoreItemProps) => {
		setSelectedStore(store);
		setIsActionSheetOpen(true);
	};

	const handleViewDetail = (storeId?: string) => {
		const id = storeId ?? selectedStore?.id;
		if (id) {
			router.push(`/manage/store/detail?id=${id}`);
		}
	};

	const handleEdit = () => {
		if (selectedStore?.id) {
			router.push(`/manage/store/modify?id=${selectedStore.id}`);
		}
	};

	const handleDeletePrompt = () => {
		deleteModal.open();
	};

	const handleConfirmDelete = () => {
		if (selectedStore?.id) {
			setStores((prev) => prev.filter((item) => item.id !== selectedStore.id));
			successModal.open();
		}
	};

	return (
		<>
			<ItemActionSheet
				isOpen={isActionSheetOpen}
				onClose={() => setIsActionSheetOpen(false)}
				title={selectedStore?.name}
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDeletePrompt}
			/>

			<StoreDeleteModal
				openState={deleteModal.openState}
				onConfirm={handleConfirmDelete}
				title="Apakah yakin ingin menghapus"
				description="Produk akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Toko Berhasil Dihapus!"
				description="Toko berhasil dihapus dari daftar toko."
				openState={successModal.openState}
				onClose={successModal.close}
				buttonText="Tutup"
			/>

			<View className="flex-1 bg-zinc-50">
				<Wrapper isNotScrollable className="flex-1 px-4 pt-3">
					<View className="mb-3">
						<SearchBar
							search={search}
							setSearch={setSearch}
							placeholder="Cari toko..."
							withFilter
						/>
					</View>

					<FlatList
						data={filteredStores}
						keyExtractor={(item) => item.id}
						contentContainerClassName="gap-3 pb-4"
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => (
							<BouncyPressable
								onPress={() => handleViewDetail(item.id)}
								activeScale={0.98}
							>
								<Card className="flex-row items-center justify-between">
									<View className="flex-1 flex-row items-center gap-3">
										<View className="size-11 items-center justify-center rounded-xl bg-primary-100">
											<StoreIcon size={20} color={Colors.primary} />
										</View>

										<View className="flex-1 gap-0.5">
											<View className="flex-row items-center gap-2">
												<Text
													w="semibold"
													size="normal"
													className="text-foreground"
												>
													{item.name}
												</Text>
												{item.status === "active" && (
													<View className="rounded-full bg-emerald-50 px-2 py-0.5">
														<Text
															w="semibold"
															size="small"
															className="text-emerald-600"
														>
															Aktif
														</Text>
													</View>
												)}
												{item.status === "trial" && (
													<View className="rounded-full bg-amber-50 px-2 py-0.5">
														<Text
															w="semibold"
															size="small"
															className="text-amber-600"
														>
															Trial
														</Text>
													</View>
												)}
											</View>

											{item.expiryDate && (
												<Text size="small" className="text-muted">
													Kadaluarsa: {item.expiryDate}
												</Text>
											)}
										</View>
									</View>

									<Pressable
										hitSlop={8}
										onPress={(e) => {
											e.stopPropagation();
											handleOpenActionSheet(item);
										}}
										className="p-1"
									>
										<Feather
											name="more-horizontal"
											size={20}
											color={Colors.zinc[400]}
										/>
									</Pressable>
								</Card>
							</BouncyPressable>
						)}
					/>
				</Wrapper>

				<View
					className="bg-zinc-50 px-4 pt-2"
					style={{ paddingBottom: Math.max(insets.bottom, 16) }}
				>
					<Button
						size="xl"
						className="h-12 w-full rounded-xl bg-primary"
						onPress={() => router.push("/manage/store/modify")}
					>
						<ButtonText size="md" className="font-semibold text-white">
							Tambah Toko Baru
						</ButtonText>
					</Button>
				</View>
			</View>
		</>
	);
}
