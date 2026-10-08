import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Image, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import BarcodePreview, {
	type BarcodeFormat,
} from "@/components/custom/BarcodePreview";
import Incrementer from "@/components/custom/Incrementer";
import ProductPickerSheet, {
	MOCK_PRODUCTS,
	type ProductItem,
} from "@/components/feature/barcode/ProductPickerSheet";
import { Input, InputField } from "@/components/ui/input";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";
import {
	type BarcodeFormInput,
	type BarcodeFormValues,
	barcodeSchema,
} from "@/schema/manage/barcode";
import type { SelectItemProps } from "@/types";

const FORMAT_OPTIONS: { id: BarcodeFormat; label: string }[] = [
	{ id: "code128", label: "Code 128" },
	{ id: "ean13", label: "EAN-13" },
	{ id: "qrcode", label: "QR Code" },
];

const SIZE_OPTIONS: SelectItemProps<string>[] = [
	{ label: "Kecil (3×2 cm)", value: "small" },
	{ label: "Sedang (5×3 cm)", value: "medium" },
	{ label: "Besar (7×4 cm)", value: "large" },
];

export default function ModifyBarcodeScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const editProduct = React.useMemo(() => {
		if (!params.id) return null;
		return MOCK_PRODUCTS.find((p) => p.id === params.id) || null;
	}, [params.id]);

	const initialProduct = editProduct || MOCK_PRODUCTS[0];
	const [selectedProduct, setSelectedProduct] =
		React.useState<ProductItem | null>(initialProduct);
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);

	const form = useForm<BarcodeFormInput, unknown, BarcodeFormValues>({
		resolver: zodResolver(barcodeSchema),
		defaultValues: {
			product_id: initialProduct?.id || "",
			barcode_code: initialProduct?.barcode || "POS-PRD-000128",
			format: "code128",
			label_count: 12,
			label_size: "medium",
		},
	});

	const watchedBarcode = form.watch("barcode_code");
	const watchedFormat = form.watch("format");

	const handleProductSelect = (product: ProductItem) => {
		setSelectedProduct(product);
		form.setValue("product_id", product.id);
		const currentCode = form.getValues("barcode_code");
		if (!currentCode || currentCode.startsWith("POS-PRD-")) {
			form.setValue(
				"barcode_code",
				product.barcode ||
					`POS-PRD-${Math.floor(100000 + Math.random() * 900000)}`,
			);
		}
	};

	const onSubmit = (values: BarcodeFormValues) => {
		setIsSuccessModalOpen(true);
	};

	const handleSuccessClose = () => {
		setIsSuccessModalOpen(false);
		router.back();
	};

	return (
		<>
			<Wrapper hasActionButton className="px-4 pt-3 pb-8">
				<Form {...form}>
					<View className="gap-4">
						{/* Top Info Banner */}
						<Card className="flex-row items-center justify-between">
							<View className="flex-1 pr-3">
								<Text size="normal" w="bold" className="text-foreground">
									Buat barcode internal untuk produk tanpa SKU resmi
								</Text>
								<Text size="small" className="text-muted mt-1 leading-4">
									Barcode ini dapat digunakan untuk scanning, pelabelan, dan
									pencatatan inventory internal.
								</Text>
							</View>
							<View className="size-11 items-center justify-center rounded-xl bg-primary-50">
								<Feather name="file-text" size={20} color={Colors.primary} />
							</View>
						</Card>

						{/* Section 1: Pilih Produk */}
						<Card className="gap-3">
							<View>
								<Text size="body" w="bold" className="text-foreground">
									1. Pilih Produk
								</Text>
								<Text size="small" className="text-muted">
									Pilih produk yang ingin dibuatkan barcode
								</Text>
							</View>

							{selectedProduct ? (
								<Pressable
									onPress={() => setIsPickerOpen(true)}
									className="flex-row items-center justify-between rounded-xl border border-gray-200 p-3 bg-white active:bg-gray-50"
								>
									<View className="flex-row items-center gap-3 flex-1">
										<View className="size-12 overflow-hidden rounded-xl bg-gray-100 items-center justify-center">
											{selectedProduct.image ? (
												<Image
													source={{ uri: selectedProduct.image }}
													className="size-full"
													resizeMode="cover"
												/>
											) : (
												<Ionicons
													name="fast-food-outline"
													size={20}
													color={Colors.zinc[400]}
												/>
											)}
										</View>
										<View className="flex-1">
											<Text
												w="semibold"
												size="normal"
												className="text-foreground"
											>
												{selectedProduct.name}
											</Text>
											<Text size="small" className="text-muted">
												{selectedProduct.category} · Stok:{" "}
												{selectedProduct.stock}
											</Text>
										</View>
									</View>
									<Feather
										name="chevron-right"
										size={20}
										color={Colors.zinc[400]}
									/>
								</Pressable>
							) : (
								<Pressable
									onPress={() => setIsPickerOpen(true)}
									className="flex-row items-center justify-between rounded-xl border border-gray-200 p-3.5 bg-white active:bg-gray-50"
								>
									<Text size="normal" className="text-muted">
										Pilih produk
									</Text>
									<Feather
										name="chevron-down"
										size={18}
										color={Colors.zinc[400]}
									/>
								</Pressable>
							)}
						</Card>

						{/* Section 2: Pengaturan Barcode */}
						<Card className="gap-4">
							<View>
								<Text size="body" w="bold" className="text-foreground">
									2. Pengaturan Barcode
								</Text>
								<Text size="small" className="text-muted">
									Atur kode barcode dan preferensi pencetakan label
								</Text>
							</View>

							{/* Kode Barcode Input */}
							<FormField
								control={form.control}
								name="barcode_code"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Kode Barcode</FormLabel>
										<FormControl>
											<Input size="xl" variant="outline">
												<InputField
													value={field.value}
													onChangeText={field.onChange}
													placeholder="POS-PRD-000128"
												/>
											</Input>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Format Tabs */}
							<FormField
								control={form.control}
								name="format"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Format</FormLabel>
										<FormControl>
											<View className="flex-row gap-2">
												{FORMAT_OPTIONS.map((opt) => {
													const isActive = field.value === opt.id;
													return (
														<Pressable
															key={opt.id}
															onPress={() => field.onChange(opt.id)}
															className={cn(
																"flex-1 items-center justify-center py-2.5 rounded-xl border",
																isActive
																	? "border-primary bg-primary-50/30"
																	: "border-gray-200 bg-white",
															)}
														>
															<Text
																size="normal"
																w={isActive ? "semibold" : "medium"}
																className={
																	isActive ? "text-primary" : "text-muted"
																}
															>
																{opt.label}
															</Text>
														</Pressable>
													);
												})}
											</View>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Row: Jumlah Label & Ukuran Label */}
							<View className="flex-row gap-3">
								{/* Jumlah Label */}
								<View className="flex-1">
									<FormField
										control={form.control}
										name="label_count"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Jumlah Label</FormLabel>
												<FormControl>
													<Incrementer
														size="xl"
														variant="outline"
														value={field.value}
														min={1}
														max={999}
														onChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</View>

								{/* Ukuran Label */}
								<View className="flex-1">
									<FormField
										control={form.control}
										name="label_size"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Ukuran Label</FormLabel>
												<FormControl>
													<SingleSelect
														size="xl"
														variant="outline"
														items={SIZE_OPTIONS}
														value={field.value}
														onValueChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</View>
							</View>
						</Card>

						{/* Section 3: Review Barcode */}
						<Card className="gap-3">
							<View>
								<Text size="body" w="bold" className="text-foreground">
									3. Review Barcode
								</Text>
								<Text size="small" className="text-muted">
									Pratinjau tampilan barcode sebelum disimpan atau dicetak
								</Text>
							</View>

							<View className="items-center justify-center rounded-xl bg-zinc-50 border border-gray-100 py-6 px-4">
								<BarcodePreview
									value={watchedBarcode || "POS-PRD-000128"}
									format={watchedFormat}
									width={watchedFormat === "qrcode" ? 140 : 260}
									height={watchedFormat === "qrcode" ? 140 : 70}
									showLabel={true}
								/>
							</View>
						</Card>
					</View>
				</Form>
			</Wrapper>

			{/* Bottom Action Button */}
			<BottomActionButton onPress={form.handleSubmit(onSubmit)}>
				Simpan
			</BottomActionButton>

			{/* Product Picker Actionsheet */}
			<ProductPickerSheet
				isOpen={isPickerOpen}
				onClose={() => setIsPickerOpen(false)}
				selectedProductId={selectedProduct?.id}
				onSelect={handleProductSelect}
			/>

			{/* Success Modal */}
			<SuccessModal
				isOpen={isSuccessModalOpen}
				onClose={handleSuccessClose}
				title="Barcode Berhasil Disimpan"
				description={`Barcode untuk ${selectedProduct?.name || "produk"} berhasil diperbarui.`}
			/>
		</>
	);
}
