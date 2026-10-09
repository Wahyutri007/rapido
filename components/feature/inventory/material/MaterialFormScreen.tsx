import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
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
	FormSelect,
} from "@/components/common/Form";
import { MultiSelect } from "@/components/common/MultiSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { INVENTORY_STORES } from "@/constants/data/inventory";
import {
	EMPTY_MATERIAL,
	MATERIAL_UNITS,
} from "@/constants/data/inventory-materials";
import { route } from "@/lib/utils";
import {
	type MaterialSchema,
	materialSchema,
} from "@/schema/inventory/material";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import type { InventoryMaterial } from "@/types/ui/inventory/material";
import InventoryQuantityInput from "../InventoryQuantityInput";
import { InventorySectionHeading } from "../InventoryUi";
import MaterialExpiryInput from "./MaterialExpiryInput";

function MaterialForm({ material }: { material?: InventoryMaterial }) {
	const saveMaterial = useInventoryMaterialStore((state) => state.saveMaterial);
	const [savedId, setSavedId] = React.useState<string>();
	const [expiryVersion, setExpiryVersion] = React.useState(0);
	const savedRef = React.useRef<string | undefined>(undefined);
	const activeRef = React.useRef(true);
	React.useEffect(() => {
		activeRef.current = true;
		return () => {
			activeRef.current = false;
		};
	}, []);
	const form = useForm<MaterialSchema>({
		resolver: zodResolver(materialSchema),
		defaultValues: material
			? {
					stores: material.stores,
					name: material.name,
					sku: material.sku,
					unit: material.unit,
					stock: material.stock,
					minimumStock: material.minimumStock,
					averagePrice: material.averagePrice ?? 0,
					expiresAt: material.expiresAt ? new Date(material.expiresAt) : null,
					note: material.note,
				}
			: EMPTY_MATERIAL,
	});
	function save(values: MaterialSchema) {
		if (!activeRef.current || savedRef.current) return;
		const result = saveMaterial(material?.id, values);
		if ("error" in result)
			form.setError(result.field ?? "root", { message: result.error });
		else {
			savedRef.current = result.id;
			setSavedId(result.id);
		}
	}
	function finish() {
		if (!activeRef.current || !savedRef.current) return;
		const destination = route("/inventory/materials/detail", {
			id: savedRef.current,
		});
		if (material) router.dismissTo(destination);
		else router.replace(destination);
	}
	return (
		<>
			<Form {...form}>
				<Wrapper
					hasActionButton
					contentContainerStyle={{ padding: 16, gap: 16 }}
				>
					<Card density="compact" className="gap-4">
						<InventorySectionHeading
							title="Informasi Pesanan"
							description="Lengkapi detail dari pesanan ini"
							icon="info"
						/>
						<FormField
							control={form.control}
							name="stores"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Toko</FormLabel>
									<FormControl>
										<MultiSelect
											label="Pilih Toko"
											placeholder="Pilih toko"
											variant="outline"
											selectedValues={field.value}
											onValueChange={field.onChange}
											items={INVENTORY_STORES.map((name) => ({
												label: name,
												value: name,
											}))}
										/>
									</FormControl>
									<Text size="small" className="text-muted">
										Pilih satu atau lebih toko yang termasuk di kategori ini
									</Text>
									<FormMessage />
								</FormItem>
							)}
						/>
						{[
							{
								name: "name",
								label: "Nama Bahan Baku",
								placeholder: "Masukkan nama bahan baku",
								maxLength: 80,
							},
							{
								name: "sku",
								label: "Kode bahan",
								placeholder: "Masukkan kode bahan",
								maxLength: 64,
							},
						].map((input) => (
							<FormField
								key={input.name}
								control={form.control}
								name={input.name as "name" | "sku"}
								render={() => (
									<FormItem>
										<FormLabel required={input.name === "name"}>
											{input.label}
										</FormLabel>
										<FormControl>
											<FormInput
												placeholder={input.placeholder}
												fieldProps={{ maxLength: input.maxLength }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<FormField
							control={form.control}
							name="unit"
							render={() => (
								<FormItem>
									<FormLabel required>Satuan</FormLabel>
									<FormControl>
										<FormSelect
											label="Satuan"
											placeholder="Pilih satuan"
											data={MATERIAL_UNITS.map((unit) => ({
												label: unit,
												value: unit,
											}))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<View className="flex-row gap-3">
							{[
								{ name: "stock", label: "Stok Awal" },
								{ name: "minimumStock", label: "Stok Minimum" },
							].map((input) => (
								<View key={input.name} className="flex-1">
									<FormField
										control={form.control}
										name={input.name as "stock" | "minimumStock"}
										render={({ field }) => (
											<FormItem>
												<FormLabel>{input.label}</FormLabel>
												<FormControl>
													<InventoryQuantityInput
														value={field.value}
														onChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</View>
							))}
						</View>
						<FormField
							control={form.control}
							name="averagePrice"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Harga Beli Rata-Rata</FormLabel>
									<FormControl>
										<InventoryQuantityInput
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="expiresAt"
							render={({ field }) => (
								<FormItem>
									<View className="flex-row items-center justify-between">
										<FormLabel>Tanggal Expire</FormLabel>
										{field.value && (
											<Pressable
												accessibilityRole="button"
												accessibilityLabel="Hapus tanggal expire"
												onPress={() => {
													form.setValue("expiresAt", null, {
														shouldDirty: true,
														shouldValidate: true,
													});
													setExpiryVersion((version) => version + 1);
												}}
											>
												<Text size="small" className="text-primary">
													Hapus
												</Text>
											</Pressable>
										)}
									</View>
									<FormControl>
										<MaterialExpiryInput
											key={expiryVersion}
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="note"
							render={() => (
								<FormItem>
									<FormLabel>Catatan</FormLabel>
									<FormControl>
										<FormInput
											multiline
											placeholder="Tambahkan catatan bahan baku"
											fieldProps={{ maxLength: 1000 }}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.root.message}
							</Text>
						)}
					</Card>
				</Wrapper>
			</Form>
			<BottomActionButton
				isDisabled={Boolean(savedId)}
				onPress={() => void form.handleSubmit(save)()}
			>
				Simpan
			</BottomActionButton>
			<SuccessModal
				isOpen={Boolean(savedId)}
				title={`Bahan Baku Berhasil ${material ? "Diperbarui" : "Ditambahkan"}`}
				onClose={finish}
				onButtonPress={finish}
				buttonText="Lihat Detail"
			/>
		</>
	);
}

export default function MaterialFormScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const material = useInventoryMaterialStore((state) =>
		state.materials.find((item) => item.id === id),
	);
	if (id !== undefined && !material)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Bahan baku tidak ditemukan" />
			</Wrapper>
		);
	return <MaterialForm key={id ?? "new"} material={material} />;
}
