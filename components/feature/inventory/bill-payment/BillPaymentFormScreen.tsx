import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
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
	FormSelect,
} from "@/components/common/Form";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { BILL_PAYMENT_METHODS } from "@/constants/data/inventory-bill-payments";
import {
	billMoney,
	billPaymentTotals,
	purchaseMatchesSupplier,
	purchaseOutstanding,
} from "@/lib/inventory/bill-payment";
import { expiryDateText } from "@/lib/inventory/material-date";
import { route } from "@/lib/utils";
import { billPaymentSchema } from "@/schema/inventory/bill-payment";
import { useInventoryBillPaymentStore } from "@/store/inventoryBillPaymentStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { useInventorySupplierStore } from "@/store/inventorySupplierStore";
import type { PurchaseRecord } from "@/types/ui/inventory";
import type {
	BillPayment,
	BillPaymentFields,
} from "@/types/ui/inventory/bill-payment";
import InventoryQuantityInput from "../InventoryQuantityInput";
import { InventoryIcon, InventorySectionHeading } from "../InventoryUi";
import BillPaymentDateInput from "./BillPaymentDateInput";
import BillPaymentSummary, {
	formatBillPaymentMoney,
} from "./BillPaymentSummary";

function BillPaymentForm({
	record,
	initialPurchase,
}: {
	record?: BillPayment;
	initialPurchase?: PurchaseRecord;
}) {
	const purchases = useInventoryStore((state) => state.purchases);
	const suppliers = useInventorySupplierStore((state) => state.suppliers);
	const payments = useInventoryBillPaymentStore((state) => state.payments);
	const [savedId, setSavedId] = React.useState<string>();
	const savedRef = React.useRef(false);
	const activeRef = React.useRef(true);
	React.useEffect(() => {
		activeRef.current = true;
		return () => {
			activeRef.current = false;
		};
	}, []);
	const initialSupplier = initialPurchase
		? suppliers.find((supplier) =>
				purchaseMatchesSupplier(initialPurchase, supplier),
			)
		: undefined;
	const form = useForm<BillPaymentFields>({
		resolver: zodResolver(billPaymentSchema),
		defaultValues: record
			? {
					supplierId: record.supplierId,
					paymentMethod: record.paymentMethod,
					externalReference: record.externalReference,
					date: record.date,
					note: record.note,
					lines: record.lines.map(({ purchaseId, amount, discount }) => ({
						purchaseId,
						amount,
						discount,
					})),
				}
			: {
					supplierId: initialSupplier?.id ?? "",
					paymentMethod: "",
					externalReference: "",
					date: expiryDateText(new Date()),
					note: "",
					lines:
						initialPurchase && initialSupplier
							? [
									{
										purchaseId: initialPurchase.id,
										amount: purchaseOutstanding(initialPurchase, payments),
										discount: 0,
									},
								]
							: [],
				},
	});
	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "lines",
	});
	const supplierId = useWatch({ control: form.control, name: "supplierId" });
	const lines = useWatch({ control: form.control, name: "lines" });
	const supplier = suppliers.find((supplier) => supplier.id === supplierId);
	const available = purchases.filter(
		(purchase) =>
			supplier &&
			purchaseMatchesSupplier(purchase, supplier) &&
			purchaseOutstanding(purchase, payments, record?.id) > 0 &&
			!lines.some((line) => line.purchaseId === purchase.id),
	);
	const totals = billPaymentTotals(lines);
	const remaining = billMoney(
		lines.reduce((sum, line) => {
			const purchase = purchases.find(
				(purchase) => purchase.id === line.purchaseId,
			);
			return (
				sum +
				(purchase ? purchaseOutstanding(purchase, payments, record?.id) : 0) -
				line.amount -
				line.discount
			);
		}, 0),
	);
	function save(values: BillPaymentFields) {
		if (!activeRef.current || savedRef.current) return;
		const result = useInventoryBillPaymentStore
			.getState()
			.savePayment(
				record?.id,
				values,
				useInventoryStore.getState().purchases,
				useInventorySupplierStore.getState().suppliers,
			);
		if ("error" in result)
			form.setError(result.field ?? "root", { message: result.error });
		else {
			savedRef.current = true;
			setSavedId(result.id);
		}
	}
	function finish() {
		if (!savedId) return;
		const target = route("/inventory/bill-payments/detail", { id: savedId });
		if (record) router.dismissTo(target);
		else router.replace(target);
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
							title="Informasi Tagihan"
							description="Lengkapi detail dari pembayaran ini"
							icon="info"
						/>
						<FormField
							control={form.control}
							name="supplierId"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Pemasok</FormLabel>
									<FormControl>
										<SingleSelect
											label="Pilih pemasok"
											placeholder="Pilih pemasok"
											value={field.value}
											items={suppliers
												.filter((supplier) => supplier.active)
												.map((supplier) => ({
													label: supplier.name,
													value: supplier.id,
												}))}
											onValueChange={(value) => {
												if (value !== field.value) {
													field.onChange(value);
													replace([]);
													form.clearErrors("lines");
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="paymentMethod"
							render={() => (
								<FormItem>
									<FormLabel required>Metode Pembayaran</FormLabel>
									<FormControl>
										<FormSelect
											placeholder="Pilih metode pembayaran"
											data={BILL_PAYMENT_METHODS.map((value) => ({
												label: value,
												value,
											}))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="externalReference"
							render={() => (
								<FormItem>
									<FormLabel>No Referensi</FormLabel>
									<FormControl>
										<FormInput placeholder="Nomor referensi pembayaran" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Tanggal Pembayaran</FormLabel>
									<FormControl>
										<BillPaymentDateInput
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
									<Text size="small" className="text-muted">
										Format YYYY-MM-DD
									</Text>
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
										<FormInput placeholder="Catatan pembayaran" multiline />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</Card>
					<Card className="gap-3">
						<InventorySectionHeading
							title="Daftar Tagihan"
							description="Pilih tagihan dari pemasok ini"
							icon="file-text"
						/>
						{fields.map((item, index) => {
							const purchase = purchases.find(
								(purchase) => purchase.id === item.purchaseId,
							);
							const balance = purchase
								? purchaseOutstanding(purchase, payments, record?.id)
								: 0;
							return (
								<View
									key={item.id}
									className="gap-3 rounded-lg border border-border-muted p-3"
								>
									<View className="flex-row items-center justify-between gap-3">
										<Text
											size="normal"
											w="semibold"
											className="flex-1 text-primary"
										>
											{purchase?.reference ?? "Tagihan tidak tersedia"}
										</Text>
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Hapus tagihan ${purchase?.reference ?? item.purchaseId}`}
											className="size-9 items-center justify-center rounded-lg bg-error-bg"
											onPress={() => remove(index)}
										>
											<InventoryIcon name="trash-2" tone="destructive" />
										</Pressable>
									</View>
									<Text size="small" className="text-muted">
										Tanggal Tagihan:{" "}
										{purchase
											? dayjs(purchase.createdAt).format("DD MMM YYYY")
											: "-"}
									</Text>
									<View className="flex-row justify-between gap-3">
										<Text size="small" className="text-muted">
											Total Tagihan
										</Text>
										<Text size="small" w="medium">
											{purchase ? formatBillPaymentMoney(purchase.amount) : "-"}
										</Text>
									</View>
									<View className="flex-row justify-between gap-3">
										<Text size="small" className="text-muted">
											Sisa Sebelum Pembayaran
										</Text>
										<Text size="small" w="medium">
											{formatBillPaymentMoney(balance)}
										</Text>
									</View>
									{(!purchase || balance <= 0) && (
										<Text size="small" className="text-destructive">
											Tagihan tidak tersedia, lunas, atau dibatalkan. Hapus dan
											pilih kembali.
										</Text>
									)}
									{[
										{ name: "discount" as const, label: "Diskon" },
										{ name: "amount" as const, label: "Total Pembayaran" },
									].map((input) => (
										<FormField
											key={input.name}
											control={form.control}
											name={`lines.${index}.${input.name}`}
											render={({ field }) => (
												<FormItem>
													<FormLabel required={input.name === "amount"}>
														{input.label}
													</FormLabel>
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
									))}
								</View>
							);
						})}
						<SingleSelect
							label="Pilih tagihan"
							placeholder="Pilih tagihan untuk ditambahkan"
							disabled={!supplier}
							items={available.map((purchase) => ({
								label: purchase.reference,
								value: purchase.id,
								description: formatBillPaymentMoney(
									purchaseOutstanding(purchase, payments, record?.id),
								),
							}))}
							onValueChange={(purchaseId) => {
								const purchase = useInventoryStore
									.getState()
									.purchases.find((purchase) => purchase.id === purchaseId);
								const latestSupplier = useInventorySupplierStore
									.getState()
									.suppliers.find(
										(supplier) =>
											supplier.id === form.getValues("supplierId") &&
											supplier.active,
									);
								if (
									purchase &&
									latestSupplier &&
									purchaseMatchesSupplier(purchase, latestSupplier) &&
									purchaseOutstanding(
										purchase,
										useInventoryBillPaymentStore.getState().payments,
										record?.id,
									) > 0 &&
									!form
										.getValues("lines")
										.some((line) => line.purchaseId === purchaseId)
								)
									append({ purchaseId, amount: 0, discount: 0 });
							}}
						/>
						{supplier && available.length === 0 && fields.length === 0 && (
							<Text size="small" className="text-muted">
								Tidak ada tagihan belum lunas untuk pemasok ini
							</Text>
						)}
						{form.formState.errors.lines && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.lines.message ??
									form.formState.errors.lines.root?.message}
							</Text>
						)}
					</Card>
					<BillPaymentSummary
						amount={totals.amount}
						discount={totals.discount}
						remaining={remaining}
					/>
					{form.formState.errors.root && (
						<Text size="small" className="text-destructive">
							{form.formState.errors.root.message}
						</Text>
					)}
				</Wrapper>
			</Form>
			<BottomActionButton
				isDisabled={Boolean(savedId) || form.formState.isSubmitting}
				onPress={() => void form.handleSubmit(save)()}
			>
				Simpan Pembayaran
			</BottomActionButton>
			<SuccessModal
				isOpen={Boolean(savedId)}
				title="Pembayaran berhasil disimpan"
				message="Pembayaran tagihan tersimpan pada sesi ini."
				buttonText="Lihat Detail"
				onButtonPress={finish}
				onClose={finish}
			/>
		</>
	);
}

export default function BillPaymentFormScreen() {
	const { id, purchaseId } = useLocalSearchParams<{
		id?: string;
		purchaseId?: string;
	}>();
	const record = useInventoryBillPaymentStore((state) =>
		state.payments.find((payment) => payment.id === id),
	);
	const initialPurchase = useInventoryStore((state) =>
		state.purchases.find((purchase) => purchase.id === purchaseId),
	);
	if (
		(id !== undefined && !record) ||
		(id === undefined && purchaseId !== undefined && !initialPurchase)
	)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pembayaran atau tagihan tidak ditemukan" />
			</Wrapper>
		);
	return (
		<BillPaymentForm
			key={`${id ?? "new"}:${purchaseId ?? "none"}`}
			record={record}
			initialPurchase={initialPurchase}
		/>
	);
}
