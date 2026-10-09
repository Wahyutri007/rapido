import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
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
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	INVENTORY_STORES,
	STOCK_KIND_OPTIONS,
} from "@/constants/data/inventory";
import { getInventoryItem, getInventoryItems } from "@/lib/inventory";
import { route } from "@/lib/utils";
import {
	type StockOperationSchema,
	stockOperationSchema,
} from "@/schema/inventory";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import { useInventoryStore } from "@/store/inventoryStore";
import type { StockOperation } from "@/types/ui/inventory";
import InventoryQuantityInput from "./InventoryQuantityInput";
import { InventoryIcon, InventorySectionHeading } from "./InventoryUi";

export default function StockOperationForm({
	operation,
}: {
	operation: StockOperation;
}) {
	const addRecord = useInventoryStore((state) => state.addStockRecord);
	const materials = useInventoryMaterialStore((state) => state.materials);
	const items = getInventoryItems(materials);
	const [savedId, setSavedId] = React.useState<string>();
	const form = useForm<StockOperationSchema>({
		resolver: zodResolver(stockOperationSchema),
		defaultValues: {
			operation,
			kind: "product",
			fromStore: "",
			toStore: "",
			note: "",
			lines: [],
		},
	});
	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "lines",
	});
	const kind = useWatch({ control: form.control, name: "kind" });
	const lines = useWatch({ control: form.control, name: "lines" });
	const fromStore = useWatch({ control: form.control, name: "fromStore" });
	const isTransfer = operation === "transfer";
	const title = isTransfer ? "Transfer Stok" : "Penyesuaian";
	const availableItems = items.filter(
		(item) =>
			item.kind === kind && !lines.some((line) => line.itemId === item.id),
	);

	function save(data: StockOperationSchema) {
		for (const [index, line] of data.lines.entries()) {
			const item = getInventoryItems().find((item) => item.id === line.itemId);
			if (!item) {
				form.setError("lines", {
					message:
						"Item tidak tersedia. Hapus item tersebut dan pilih kembali.",
				});
				return;
			}
			if (line.quantity > item.stock) {
				form.setError(`lines.${index}.quantity`, {
					message: "Jumlah melebihi stok tersedia",
				});
				return;
			}
		}
		const id = addRecord({
			operation,
			kind: data.kind,
			fromStore: data.fromStore,
			toStore: isTransfer ? data.toStore : undefined,
			note: data.note,
			createdAt: new Date().toISOString(),
			createdBy: "Fauzan",
			lines: data.lines.map((line) => ({
				item: getInventoryItem(line.itemId),
				quantity: line.quantity,
			})),
		});
		setSavedId(id);
	}

	function finish() {
		if (!savedId) return;
		router.replace(
			route(`/inventory/stock-${operation}/detail`, { id: savedId }),
		);
	}

	return (
		<>
			<Form {...form}>
				<Wrapper
					hasActionButton
					contentContainerStyle={{ padding: 16, gap: 16 }}
				>
					<Card className="gap-3">
						<InventorySectionHeading
							title={`Informasi ${title}`}
							description={`Lengkapi detail dari ${isTransfer ? "transfer" : "penyesuaian"} ini`}
							icon="info"
						/>
						<FormField
							control={form.control}
							name="fromStore"
							render={() => (
								<FormItem>
									<FormLabel required>
										{isTransfer ? "Dari Toko" : "Toko"}
									</FormLabel>
									<FormControl>
										<FormSelect
											data={INVENTORY_STORES.map((name) => ({
												label: name,
												value: name,
											}))}
											placeholder="Pilih toko"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{isTransfer && (
							<FormField
								control={form.control}
								name="toStore"
								render={() => (
									<FormItem>
										<FormLabel required>Ke Toko</FormLabel>
										<FormControl>
											<FormSelect
												data={INVENTORY_STORES.filter(
													(name) => name !== fromStore,
												).map((name) => ({ label: name, value: name }))}
												placeholder="Pilih toko tujuan"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</Card>
					<Card className="gap-3">
						<InventorySectionHeading
							title={
								isTransfer ? "Pilih Transfer Stok" : "Pilih Penyesuaian Stok"
							}
							description={
								isTransfer
									? "Tambahkan produk yang akan ditransfer"
									: "Pilih penyesuaian stok yang akan disesuaikan"
							}
							icon="box"
						/>
						<FormField
							control={form.control}
							name="kind"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Jenis Stok</FormLabel>
									<FormControl>
										<SingleSelect
											items={STOCK_KIND_OPTIONS}
											value={field.value}
											onValueChange={(value) => {
												field.onChange(value);
												replace([]);
												form.clearErrors("lines");
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{fields.map((field, index) => {
							const item = items.find((item) => item.id === field.itemId);
							if (!item)
								return (
									<View key={field.id} className="gap-2">
										<Text size="small" className="text-destructive">
											Item tidak tersedia
										</Text>
										<Pressable
											accessibilityRole="button"
											onPress={() => remove(index)}
										>
											<Text size="small" className="text-primary">
												Hapus item yang tidak tersedia
											</Text>
										</Pressable>
									</View>
								);
							return (
								<View
									key={field.id}
									className="overflow-hidden rounded-lg bg-white shadow-main"
								>
									<View className="flex-row items-center justify-between bg-primary-50 p-3">
										<Text size="normal" className="text-primary">
											{item.name}
										</Text>
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Hapus ${item.name}`}
											onPress={() => remove(index)}
											className="size-9 items-center justify-center rounded-lg bg-error-bg"
										>
											<InventoryIcon name="trash-2" tone="destructive" />
										</Pressable>
									</View>
									<View className="gap-3 p-3">
										<View className={isTransfer ? "flex-row gap-3" : "gap-3"}>
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`lines.${index}.stock`}
													render={() => (
														<FormItem>
															<FormLabel>Stok Sekarang</FormLabel>
															<FormControl>
																<FormInput
																	isDisabled
																	fieldProps={{ value: String(item.stock) }}
																/>
															</FormControl>
														</FormItem>
													)}
												/>
											</View>
											<View
												className={
													isTransfer
														? "flex-1 flex-row gap-2"
														: "flex-row gap-2"
												}
											>
												<View className="flex-1">
													<FormField
														control={form.control}
														name={`lines.${index}.quantity`}
														render={({ field: quantityField }) => (
															<FormItem>
																<FormLabel>
																	{isTransfer
																		? "Jumlah Transfer"
																		: "Penyusutan"}
																</FormLabel>
																<FormControl>
																	<InventoryQuantityInput
																		value={quantityField.value}
																		onChange={quantityField.onChange}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</View>
												{isTransfer ? (
													<View className="justify-end pb-1">
														<View className="h-11 justify-center rounded-lg border border-border bg-surface-muted px-3">
															<Text size="normal" className="text-muted">
																{item.unit}
															</Text>
														</View>
													</View>
												) : (
													<View className="flex-1 gap-2">
														<Text size="normal">Stok Akhir</Text>
														<View className="h-11 justify-center rounded-lg border border-border bg-surface-muted px-3">
															<Text size="normal">
																{Math.max(
																	0,
																	item.stock - (lines[index]?.quantity || 0),
																)}
															</Text>
														</View>
													</View>
												)}
											</View>
										</View>
									</View>
								</View>
							);
						})}
						{availableItems.length > 0 && (
							<View className="rounded-lg border border-dashed border-primary bg-primary-50 px-3">
								<SingleSelect
									items={availableItems.map((item) => ({
										label: item.name,
										value: item.id,
									}))}
									placeholder={`${isTransfer ? "Tambah" : "Pilih"} ${kind === "product" ? "Produk" : "Bahan Baku"}`}
									label="Pilih Stok"
									searchable
									variant="ghost"
									leftIcon={<InventoryIcon name="plus" />}
									onValueChange={(id) => {
										const item = getInventoryItem(id);
										append({ itemId: item.id, stock: item.stock, quantity: 0 });
										form.clearErrors("lines");
									}}
								/>
							</View>
						)}
						{form.formState.errors.lines?.root?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.lines.root.message}
							</Text>
						)}
						{form.formState.errors.lines?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.lines.message}
							</Text>
						)}
					</Card>
					<Card>
						<FormField
							control={form.control}
							name="note"
							render={() => (
								<FormItem>
									<FormLabel optional={isTransfer}>Catatan</FormLabel>
									<FormControl>
										<FormInput multiline placeholder="Tambahkan catatan" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</Card>
				</Wrapper>
			</Form>
			<BottomActionButton onPress={form.handleSubmit(save)}>
				Simpan
			</BottomActionButton>
			<SuccessModal
				isOpen={Boolean(savedId)}
				title={`${isTransfer ? "Transfer" : "Penyesuaian"} Stok Berhasil Ditambahkan`}
				description="Data telah ditambahkan ke daftar stok."
				onClose={finish}
				onButtonPress={finish}
				buttonText="Lihat Detail"
			/>
		</>
	);
}
