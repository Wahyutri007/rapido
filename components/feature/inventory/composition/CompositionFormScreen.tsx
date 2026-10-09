import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	COMPOSITION_PRODUCTS,
	COMPOSITION_SALE_PRICES,
} from "@/constants/data/inventory-compositions";
import { compositionCost } from "@/lib/inventory/composition";
import { route } from "@/lib/utils";
import {
	type CompositionSchema,
	compositionSchema,
} from "@/schema/inventory/composition";
import { useInventoryCompositionStore } from "@/store/inventoryCompositionStore";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import type { InventoryItem } from "@/types/ui/inventory";
import type { InventoryComposition } from "@/types/ui/inventory/composition";
import InventoryQuantityInput from "../InventoryQuantityInput";
import { InventoryIcon, InventorySectionHeading } from "../InventoryUi";
import { CompositionImage, formatCompositionMoney } from "./CompositionUi";

function CompositionForm({
	product,
	composition,
}: {
	product: InventoryItem;
	composition?: InventoryComposition;
}) {
	const materials = useInventoryMaterialStore((state) => state.materials);
	const saveComposition = useInventoryCompositionStore(
		(state) => state.saveComposition,
	);
	const [saved, setSaved] = React.useState(false);
	const savedRef = React.useRef(false);
	const activeRef = React.useRef(true);
	React.useEffect(() => {
		activeRef.current = true;
		return () => {
			activeRef.current = false;
		};
	}, []);
	const form = useForm<CompositionSchema>({
		resolver: zodResolver(compositionSchema),
		defaultValues: {
			lines:
				composition?.lines.map(({ materialId, unit, quantity, unitPrice }) => ({
					materialId,
					unit,
					quantity,
					unitPrice,
				})) ?? [],
		},
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "lines",
	});
	const lines = useWatch({ control: form.control, name: "lines" });
	const available = materials.filter(
		(item) => !lines.some((line) => line.materialId === item.id),
	);
	function save(values: CompositionSchema) {
		if (!activeRef.current || savedRef.current) return;
		const result = saveComposition(
			product.id,
			values,
			useInventoryMaterialStore.getState().materials,
		);
		if ("error" in result)
			form.setError(result.field ?? "root", { message: result.error });
		else {
			savedRef.current = true;
			setSaved(true);
		}
	}
	function finish() {
		if (!activeRef.current || !savedRef.current) return;
		const destination = route("/inventory/compositions/detail", {
			id: product.id,
		});
		if (composition) router.dismissTo(destination);
		else router.replace(destination);
	}
	return (
		<>
			<Form {...form}>
				<Wrapper
					hasActionButton
					contentContainerStyle={{ padding: 16, gap: 16 }}
				>
					<Card density="compact" className="flex-row items-center gap-3">
						<CompositionImage productId={product.id} />
						<View className="flex-1 gap-1">
							<Text w="semibold">{product.name}</Text>
							<Text size="small" className="text-muted">
								{product.category}
							</Text>
							<Text size="normal">
								Harga Jual:{" "}
								{formatCompositionMoney(COMPOSITION_SALE_PRICES[product.id])}
							</Text>
						</View>
					</Card>
					<Card density="compact" className="gap-4">
						<InventorySectionHeading
							title="Bahan Baku Digunakan"
							description="Pilih bahan baku untuk ditambahkan dalam resep"
							icon="layers"
						/>
						<Text size="small" className="text-muted">
							Takaran untuk 1 porsi. Estimasi harga menggunakan biaya per satuan
							bahan.
						</Text>
						<SingleSelect
							label="Bahan Baku"
							placeholder="Tambah Bahan Baku"
							items={available.map((item) => ({
								label: item.name,
								value: item.id,
								description: `${item.sku || "-"} • ${item.unit}`,
							}))}
							onValueChange={(id) => {
								const material = useInventoryMaterialStore
									.getState()
									.materials.find((item) => item.id === id);
								if (
									material &&
									!form
										.getValues("lines")
										.some((line) => line.materialId === id)
								)
									append({
										materialId: material.id,
										unit: material.unit,
										quantity: 0,
										unitPrice: material.averagePrice ?? 0,
									});
							}}
						/>
						{fields.length === 0 && (
							<Text size="normal" className="text-muted">
								Belum ada bahan baku dipilih
							</Text>
						)}
						{fields.map((field, index) => {
							const material = materials.find(
								(item) => item.id === field.materialId,
							);
							return (
								<View
									key={field.id}
									className="gap-3 border-t border-border-muted pt-3"
								>
									<View className="flex-row items-center gap-3">
										<InventoryIcon name="package" />
										<Text size="normal" w="medium" className="flex-1">
											{material?.name ?? "Bahan baku tidak tersedia"}
										</Text>
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Hapus bahan ${material?.name ?? index + 1}`}
											hitSlop={8}
											onPress={() => remove(index)}
										>
											<InventoryIcon name="trash-2" tone="destructive" />
										</Pressable>
									</View>
									<FormField
										control={form.control}
										name={`lines.${index}.materialId`}
										render={() => (
											<FormItem>
												<FormMessage />
											</FormItem>
										)}
									/>
									<View className="flex-row gap-3">
										<View className="flex-1">
											<FormField
												control={form.control}
												name={`lines.${index}.quantity`}
												render={({ field: input }) => (
													<FormItem>
														<FormLabel required>Jumlah</FormLabel>
														<FormControl>
															<InventoryQuantityInput
																value={input.value}
																onChange={input.onChange}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</View>
										<View className="flex-1">
											<FormField
												control={form.control}
												name={`lines.${index}.unit`}
												render={() => (
													<FormItem>
														<FormLabel>Satuan</FormLabel>
														<FormControl>
															<FormInput fieldProps={{ editable: false }} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</View>
									</View>
									{material && material.unit !== field.unit && (
										<Text size="small" className="text-warning">
											Satuan bahan berubah. Hapus lalu pilih kembali bahan ini.
										</Text>
									)}
									<FormField
										control={form.control}
										name={`lines.${index}.unitPrice`}
										render={({ field: input }) => (
											<FormItem>
												<FormLabel required>Estimasi Harga</FormLabel>
												<FormControl>
													<InventoryQuantityInput
														value={input.value}
														onChange={input.onChange}
													/>
												</FormControl>
												<Text size="small" className="text-muted">
													Harga per {lines[index]?.unit ?? field.unit}; estimasi
													biaya:{" "}
													{formatCompositionMoney(
														(lines[index]?.quantity ?? 0) *
															(lines[index]?.unitPrice ?? 0),
													)}
												</Text>
												<FormMessage />
											</FormItem>
										)}
									/>
								</View>
							);
						})}
						{form.formState.errors.lines?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.lines.message}
							</Text>
						)}
						{form.formState.errors.lines?.root?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.lines.root.message}
							</Text>
						)}
						{form.formState.errors.root?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.root.message}
							</Text>
						)}
						<View className="flex-row justify-between gap-3 border-t border-border-muted pt-3">
							<Text size="normal" w="medium">
								Total Modal per Porsi
							</Text>
							<Text size="normal" w="semibold">
								{formatCompositionMoney(compositionCost(lines))}
							</Text>
						</View>
					</Card>
				</Wrapper>
			</Form>
			<BottomActionButton
				isDisabled={saved}
				onPress={() => void form.handleSubmit(save)()}
			>
				Simpan Resep
			</BottomActionButton>
			<SuccessModal
				isOpen={saved}
				title="Resep Berhasil Disimpan"
				buttonText="Lihat Detail"
				onClose={finish}
				onButtonPress={finish}
			/>
		</>
	);
}

export default function CompositionFormScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const product = COMPOSITION_PRODUCTS.find((item) => item.id === id);
	const composition = useInventoryCompositionStore((state) =>
		state.compositions.find((item) => item.productId === id),
	);
	if (!product)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Produk tidak ditemukan" />
			</Wrapper>
		);
	return (
		<CompositionForm
			key={product.id}
			product={product}
			composition={composition}
		/>
	);
}
