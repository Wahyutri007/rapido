import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/common/Card";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import StoreDeleteModal from "@/components/feature/manage/store/StoreDeleteModal";
import { StoreIcon } from "@/components/icons";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { STORE_ITEMS } from "@/constants/data/manage/store";
import { useAlertModal } from "@/hooks/useAlertModal";

export default function StoreDetailScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams();
	const storeId = params?.id as string | undefined;

	const store = React.useMemo(() => {
		return STORE_ITEMS.find((item) => item.id === storeId) ?? STORE_ITEMS[0];
	}, [storeId]);

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();

	const handleEdit = () => {
		if (store?.id) {
			router.push(`/manage/store/modify?id=${store.id}`);
		}
	};

	const handleDelete = () => {
		deleteModal.open();
	};

	const handleConfirmDelete = () => {
		successModal.open();
	};

	const handleSuccessClose = () => {
		successModal.close();
		router.back();
	};

	return (
		<>
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
				onClose={handleSuccessClose}
				buttonText="Tutup"
			/>

			<View className="flex-1 bg-zinc-50">
				<Wrapper className="gap-5 p-4" showsVerticalScrollIndicator={false}>
					{/* Hero Card */}
					<Card className="flex-row items-center justify-between">
						<View className="flex-1 flex-row items-center gap-3.5">
							<View className="size-14 items-center justify-center rounded-xl bg-primary-100">
								<StoreIcon size={24} color={Colors.primary} />
							</View>
							<View className="flex-1 gap-1">
								<Text w="bold" size="body" className="text-foreground">
									{store.name}
								</Text>
								<View className="flex-row items-center gap-1.5">
									<Feather name="map-pin" size={13} color={Colors.zinc[400]} />
									<Text
										size="small"
										className="flex-1 text-muted"
										numberOfLines={1}
									>
										{store.address}
									</Text>
								</View>
							</View>
						</View>

						<View className="rounded-full bg-emerald-50 px-2.5 py-0.5">
							<Text w="semibold" size="small" className="text-emerald-600">
								{store.status === "trial" ? "Trial" : "Aktif"}
							</Text>
						</View>
					</Card>

					{/* Informasi Toko */}
					<View className="gap-2">
						<Text size="normal" w="medium" className="px-1 text-muted">
							Informasi Toko
						</Text>
						<Card className="p-4">
							<DetailRow label="Nama Toko" value={store.name} />
							<DetailRow label="Nomor HP Toko" value={store.phone} />
							<DetailRow label="Jenis Usaha" value={store.business_type} />
							<DetailRow label="Provinsi" value={store.province} />
							<DetailRow label="Kota" value={store.city} />
							<DetailRow label="Kecamatan" value={store.district} />
							<DetailRow label="Alamat Toko" value={store.address} />
							<DetailRow label="Kode Pos" value={store.postal_code} isLast />
						</Card>
					</View>

					{/* Informasi Langganan */}
					<View className="gap-2">
						<Text size="normal" w="medium" className="px-1 text-muted">
							Informasi Langganan
						</Text>
						<Card className="p-4">
							<DetailRow
								label="Nama Paket"
								value={store.subscription?.planName || "Kasikoo Pro"}
							/>
							<DetailRow
								label="Tanggal Berakhir"
								value={store.subscription?.expiryDate || "31 Desember 2026"}
							/>
							<DetailRow
								label="Sisa Masa Aktif"
								value={store.subscription?.remainingDays || "350 Hari"}
								isLast
							/>
						</Card>
					</View>

					<View className="h-4" />
				</Wrapper>

				<View
					className="flex-row gap-3 border-t border-zinc-200/50 bg-white px-4 pt-3"
					style={{ paddingBottom: Math.max(insets.bottom, 16) }}
				>
					<Button
						variant="outline"
						size="xl"
						className="h-12 flex-1 rounded-xl border-primary bg-white"
						onPress={handleEdit}
					>
						<ButtonText size="md" className="font-semibold text-primary">
							Edit
						</ButtonText>
					</Button>
					<Button
						size="xl"
						className="h-12 flex-1 rounded-xl border-0 bg-red-50 active:bg-red-100"
						onPress={handleDelete}
					>
						<ButtonText size="md" className="font-semibold text-red-500">
							Hapus
						</ButtonText>
					</Button>
				</View>
			</View>
		</>
	);
}
