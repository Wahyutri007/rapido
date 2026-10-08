import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import BarcodePreview from "@/components/custom/BarcodePreview";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet, {
	ItemActionSheetAction,
} from "@/components/custom/ItemActionSheet";
import PrintBarcodeModal from "@/components/feature/barcode/PrintBarcodeModal";
import {
	MOCK_PRODUCTS,
	ProductItem,
} from "@/components/feature/barcode/ProductPickerSheet";
import { Colors } from "@/constants/Colors";
import { tw } from "@/lib/utils";

export default function GenerateBarcodeListScreen() {
	const [search, setSearch] = React.useState("");
	const [products, setProducts] = React.useState<ProductItem[]>(MOCK_PRODUCTS);
	const [selectedItem, setSelectedItem] = React.useState<ProductItem | null>(
		null,
	);
	const [isActionSheetOpen, setIsActionSheetOpen] = React.useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
	const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

	const filteredProducts = React.useMemo(() => {
		if (!search.trim()) return products;
		return products.filter((p) =>
			p.name.toLowerCase().includes(search.toLowerCase()),
		);
	}, [products, search]);

	const handleActionPress = (item: ProductItem) => {
		setSelectedItem(item);
		setIsActionSheetOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (selectedItem) {
			setProducts((prev) => prev.filter((p) => p.id !== selectedItem.id));
			setIsDeleteModalOpen(false);
			setSelectedItem(null);
		}
	};

	const sheetActions: ItemActionSheetAction[] = selectedItem
		? [
				{
					id: "detail",
					title: "Detail Barcode",
					subtitle: "Info lebih lanjut tentang barcode",
					icon: "eye",
					iconBg: "bg-primary-50",
					iconColor: Colors.primary,
					onPress: () => {
						setIsActionSheetOpen(false);
						router.push({
							pathname: "/manage/generate-barcode/detail" as any,
							params: { id: selectedItem.id },
						});
					},
				},
				{
					id: "print",
					title: "Cetak Barcode",
					subtitle: "Cetak barcode",
					icon: "printer",
					iconBg: "bg-primary-50",
					iconColor: Colors.primary,
					onPress: () => {
						setIsActionSheetOpen(false);
						setIsPrintModalOpen(true);
					},
				},
				{
					id: "edit",
					title: "Edit Barcode",
					subtitle: "Ubah nama, urutan, atau pengaturan lainnya",
					icon: "edit-2",
					iconBg: "bg-primary-50",
					iconColor: Colors.primary,
					onPress: () => {
						setIsActionSheetOpen(false);
						router.push({
							pathname: "/manage/generate-barcode/modify" as any,
							params: { id: selectedItem.id },
						});
					},
				},
				{
					id: "delete",
					title: "Hapus Barcode",
					subtitle: "Barcode akan dihapus permanen",
					icon: "trash-2",
					iconBg: "bg-red-50",
					iconColor: Colors.red[500],
					textColor: "text-red-500",
					onPress: () => {
						setIsActionSheetOpen(false);
						setIsDeleteModalOpen(true);
					},
				},
			]
		: [];

	return (
		<>
			<Wrapper hasActionButton className="bg-zinc-50 px-4 pt-4">
				{/* Top Search & Filter Bar */}
				<View className="flex-row items-center gap-2 mb-4">
					<View className="flex-1">
						<SearchBar
							search={search}
							setSearch={setSearch}
							placeholder="Cari Produk..."
							variant="light"
							className="bg-white shadow-main"
						/>
					</View>
					<Pressable
						className="size-11 items-center justify-center rounded-xl bg-primary shadow-main active:opacity-90"
						onPress={() => {}}
						hitSlop={8}
					>
						<Feather name="sliders" size={18} color="#ffffff" />
					</Pressable>
				</View>

				{/* Products with Barcodes List */}
				<View className="gap-3 pb-8">
					{filteredProducts.map((item) => (
						<CatalogItemCard
							key={item.id}
							leading={
								<View className="size-12 overflow-hidden rounded-xl bg-gray-100 items-center justify-center">
									{item.image ? (
										<Image
											source={{ uri: item.image }}
											className="size-full"
											resizeMode="cover"
										/>
									) : (
										<Feather name="box" size={20} color={Colors.zinc[400]} />
									)}
								</View>
							}
							title={item.name}
							onActionPress={() => handleActionPress(item)}
							onPress={() =>
								router.push({
									pathname: "/manage/generate-barcode/detail" as any,
									params: { id: item.id },
								})
							}
						>
							<View className="mt-1 items-start">
								<BarcodePreview
									value={item.barcode || "POS-PRD-000128"}
									format="code128"
									width={120}
									height={22}
									showLabel={false}
								/>
							</View>
						</CatalogItemCard>
					))}

					{filteredProducts.length === 0 && (
						<View className="items-center justify-center py-12">
							<Text size="normal" className="text-muted">
								Tidak ada barcode produk ditemukan
							</Text>
						</View>
					)}
				</View>
			</Wrapper>

			{/* Bottom Action Button */}
			<BottomActionButton
				onPress={() => router.push("/manage/generate-barcode/modify" as any)}
			>
				Buat Barcode
			</BottomActionButton>

			{/* Item Action Sheet */}
			<ItemActionSheet
				isOpen={isActionSheetOpen}
				onClose={() => setIsActionSheetOpen(false)}
				title={selectedItem?.name || ""}
				actions={sheetActions}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Hapus Barcode"
				description={`Apakah Anda yakin ingin menghapus barcode untuk produk "${selectedItem?.name}"?`}
			/>

			{/* Print Barcode Modal */}
			{selectedItem && (
				<PrintBarcodeModal
					isOpen={isPrintModalOpen}
					onClose={() => setIsPrintModalOpen(false)}
					productName={selectedItem.name}
					barcodeValue={selectedItem.barcode || "POS-PRD-000128"}
				/>
			)}
		</>
	);
}
