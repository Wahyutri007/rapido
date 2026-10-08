import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Pressable, Switch, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormDateTimePicker,
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
import { Colors } from "@/constants/Colors";
import {
	INVENTORY_ITEMS,
	INVENTORY_STORES,
	INVENTORY_SUPPLIERS,
	STOCK_KIND_OPTIONS,
} from "@/constants/data/inventory";
import { getInventoryItem } from "@/lib/inventory";
import { formatRp, route } from "@/lib/utils";
import { type PurchaseSchema, purchaseSchema } from "@/schema/inventory";
import { useInventoryStore } from "@/store/inventoryStore";
import InventoryQuantityInput from "./InventoryQuantityInput";
import { InventoryIcon, InventorySectionHeading } from "./InventoryUi";

export default function PurchaseFormScreen() {
	const params = useLocalSearchParams<{ itemName?: string; kind?: string }>();
	const initialItem = INVENTORY_ITEMS.find(
		(item) => item.name === params.itemName,
	);
	const addPurchase = useInventoryStore((state) => state.addPurchase);
	const [savedId, setSavedId] = React.useState<string>();
	const form = useForm<PurchaseSchema>({
		resolver: zodResolver(purchaseSchema),
		defaultValues: {
			store: "",
			supplier: "",
			purchaseMethod: "",
			paymentMethod: "",
			date: new Date(),
			paid: true,
			kind:
				initialItem?.kind ??
				(params.kind === "material" ? "material" : "product"),
			note: "",
			lines: initialItem
				? [{ itemId: initialItem.id, quantity: 0, price: 0 }]
				: [],
		},
	});
	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "lines",
	});
	const kind = useWatch({ control: form.control, name: "kind" });
	const lines = useWatch({ control: form.control, name: "lines" });
	const availableItems = INVENTORY_ITEMS.filter(
		(item) =>
			item.kind === kind && !lines.some((line) => line.itemId === item.id),
	);
	function save(data: PurchaseSchema) {
		const id = addPurchase({
			store: data.store,
			supplier: data.supplier,
			purchaseMethod: data.purchaseMethod,
			paymentMethod: data.paymentMethod,
			createdAt: data.date.toISOString(),
			paid: data.paid,
			receivedBy: "Fauzan",
			status: data.paid ? "completed" : "waiting",
			note: data.note,
			amount: data.lines.reduce(
				(total, line) => total + line.quantity * line.price,
				0,
			),
			lines: data.lines.map((line) => ({
				item: getInventoryItem(line.itemId),
				quantity: line.quantity,
				price: line.price,
			})),
		});
		setSavedId(id);
	}
	function finish() {
		if (savedId)
			router.replace(
				route("/inventory/purchase-order/detail", { id: savedId }),
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
							title="Informasi Pesanan"
							description="Lengkapi detail dari pesanan ini"
							icon="info"
							right={
								<FormField
									control={form.control}
									name="paid"
									render={({ field }) => (
										<View className="items-center gap-1">
											<Text size="small" className="text-muted">
												Lunas
											</Text>
											<Switch
												accessibilityLabel="Pesanan lunas"
												value={field.value}
												onValueChange={field.onChange}
												trackColor={{ true: Colors.primary }}
											/>
										</View>
									)}
								/>
							}
						/>
						{[
							{
								name: "store" as const,
								label: "Toko",
								placeholder: "Pilih toko",
								options: INVENTORY_STORES,
							},
							{
								name: "supplier" as const,
								label: "Pemasok",
								placeholder: "Pilih pemasok",
								options: INVENTORY_SUPPLIERS,
							},
							{
								name: "purchaseMethod" as const,
								label: "Metode Pembelian",
								placeholder: "Pilih metode pembelian",
								options: ["Pembelian langsung", "Pesanan pembelian"],
							},
							{
								name: "paymentMethod" as const,
								label: "Metode Pembayaran",
								placeholder: "Pilih metode pembayaran",
								options: ["Tunai", "Transfer Bank", "Kartu Debit"],
							},
						].map((field) => (
							<FormField
								key={field.name}
								control={form.control}
								name={field.name}
								render={() => (
									<FormItem>
										<FormLabel required>{field.label}</FormLabel>
										<FormControl>
											<FormSelect
												placeholder={field.placeholder}
												data={field.options.map((value) => ({
													label: value,
													value,
												}))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
						<FormField
							control={form.control}
							name="date"
							render={() => (
								<FormItem>
									<FormLabel required>Tanggal Pembelian</FormLabel>
									<FormControl>
										<FormDateTimePicker />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</Card>
					<Card className="gap-3">
						<InventorySectionHeading
							title="Daftar Produk"
							description="Pilih produk yang termasuk dalam pemasok ini"
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
							const item = getInventoryItem(field.itemId);
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
										<View className="flex-row gap-3">
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`lines.${index}.quantity`}
													render={({ field: quantityField }) => (
														<FormItem>
															<FormLabel required>
																Jumlah ({item.unit})
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
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`lines.${index}.price`}
													render={() => (
														<FormItem>
															<FormLabel required>Harga Beli</FormLabel>
															<FormControl>
																<FormInput type="number" placeholder="Rp" />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</View>
										</View>
										<Text size="small" className="text-muted">
											Subtotal:{" "}
											{formatRp(
												(lines[index]?.quantity || 0) *
													(lines[index]?.price || 0),
											)}
										</Text>
									</View>
								</View>
							);
						})}
						{availableItems.length > 0 && (
							<View className="rounded-lg border border-dashed border-primary bg-primary-50 px-3">
								<SingleSelect
									variant="ghost"
									searchable
									placeholder={`Tambah ${kind === "product" ? "Produk" : "Bahan Baku"}`}
									label="Pilih Item Pembelian"
									leftIcon={<InventoryIcon name="plus" />}
									items={availableItems.map((item) => ({
										label: item.name,
										value: item.id,
									}))}
									onValueChange={(id) => {
										append({ itemId: id, quantity: 0, price: 0 });
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
									<FormLabel>Catatan</FormLabel>
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
				Simpan Pesanan Stok
			</BottomActionButton>
			<SuccessModal
				isOpen={Boolean(savedId)}
				title="Pesanan Pembelian Berhasil Ditambahkan"
				onClose={finish}
				onButtonPress={finish}
				buttonText="Lihat Detail"
			/>
		</>
	);
}
