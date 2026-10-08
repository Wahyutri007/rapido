import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import Card from "@/components/common/Card";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import BarcodePreview from "@/components/custom/BarcodePreview";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import { MOCK_PRODUCTS } from "@/components/feature/barcode/ProductPickerSheet";
import { Colors } from "@/constants/Colors";

export default function BarcodeDetailScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const product = React.useMemo(() => {
		return MOCK_PRODUCTS.find((p) => p.id === params.id) || MOCK_PRODUCTS[0];
	}, [params.id]);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

	const handleDeleteConfirm = () => {
		setIsDeleteModalOpen(false);
		router.back();
	};

	const barcodeInfoRows = [
		[
			{ label: "Kode Barcode", value: product.barcode || "XYZ12345" },
			{ label: "Format", value: "QR Code" },
		],
		[
			{ label: "Jumlah Label", value: "150" },
			{ label: "Ukuran Label", value: "5×3 cm" },
		],
		[
			{ label: "Dibuat", value: "Fauzan" },
			{ label: "Terakhir Dicetak", value: "24 Mei 2026" },
		],
	];

	const otherInfos = [
		"Dicetak 3 kali",
		"Digunakan untuk inventori internal",
		"Tanpa SKU resmi",
	];

	return (
		<>
			<Wrapper hasActionButton className="px-4 pt-3 pb-8">
				<View className="gap-4">
					{/* Product Summary Card */}
					<Card className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-3 flex-1">
							<View className="size-12 overflow-hidden rounded-xl bg-gray-100 items-center justify-center">
								{product.image ? (
									<Image
										source={{ uri: product.image }}
										className="size-full"
										resizeMode="cover"
									/>
								) : (
									<Ionicons
										name="fast-food-outline"
										size={22}
										color={Colors.zinc[400]}
									/>
								)}
							</View>
							<View className="flex-1">
								<Text w="bold" size="body" className="text-foreground">
									{product.name}
								</Text>
								<Text size="small" className="text-muted mt-0.5">
									{product.category} · Stok: {product.stock}
								</Text>
							</View>
						</View>
						<View className="rounded-full bg-emerald-50 px-2.5 py-1">
							<Text size="small" w="semibold" className="text-emerald-600">
								Aktif
							</Text>
						</View>
					</Card>

					{/* Section: Informasi Barcode */}
					<View className="gap-2">
						<Text size="normal" w="bold" className="text-muted">
							Informasi Barcode
						</Text>

						<View className="gap-2.5">
							{barcodeInfoRows.map((row, rowIdx) => (
								<View key={rowIdx} className="flex-row gap-2.5">
									{row.map((info, colIdx) => (
										<Card
											key={colIdx}
											className="flex-1 flex-row items-center gap-2.5 p-3"
										>
											<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
												<Feather name="tag" size={15} color={Colors.primary} />
											</View>
											<View className="flex-1">
												<Text size="small" className="text-muted text-[11px]">
													{info.label}
												</Text>
												<Text
													size="normal"
													w="semibold"
													className="text-foreground"
													numberOfLines={1}
												>
													{info.value}
												</Text>
											</View>
										</Card>
									))}
								</View>
							))}
						</View>
					</View>

					{/* Section: Preview Barcode */}
					<View className="gap-2">
						<Text size="normal" w="bold" className="text-muted">
							Preview Barcode
						</Text>
						<Card className="items-center justify-center py-6">
							<BarcodePreview
								value={product.barcode || "POS-PRD-000128"}
								format="code128"
								width={260}
								height={70}
								showLabel={true}
							/>
						</Card>
					</View>

					{/* Section: Informasi Lainnya */}
					<View className="gap-2">
						<Text size="normal" w="bold" className="text-muted">
							Informasi Lainnya
						</Text>
						<Card className="gap-3 p-3.5">
							{otherInfos.map((text, idx) => (
								<View key={idx} className="flex-row items-center gap-3">
									<View className="size-8 items-center justify-center rounded-xl bg-primary-50">
										<Feather name="tag" size={14} color={Colors.primary} />
									</View>
									<Text size="normal" className="text-foreground" w="medium">
										{text}
									</Text>
								</View>
							))}
						</Card>
					</View>
				</View>
			</Wrapper>

			{/* Bottom Actions: Edit and Delete */}
			<DetailBottomActions
				onEdit={() =>
					router.push({
						pathname: "/manage/generate-barcode/modify" as any,
						params: { id: product.id },
					})
				}
				onDelete={() => setIsDeleteModalOpen(true)}
				editText="Edit"
				deleteText="Hapus"
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Hapus Barcode"
				description={`Apakah Anda yakin ingin menghapus barcode untuk produk "${product.name}"?`}
			/>
		</>
	);
}
