import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import * as DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	TextInput,
	View,
} from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import SuccessModal from "@/components/common/SuccessModal";
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
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import {
	EXPENSE_ACCOUNTS,
	EXPENSE_FUNDING_SOURCES,
	EXPENSE_STORES,
} from "@/constants/data/accounting/expenses";
import { FONT_NAMES } from "@/constants/Fonts";
import { formatRp, parseNumber } from "@/lib/utils";
import { type ExpenseSchema, expenseSchema } from "@/schema/accounting/expense";
import { useAccountingStore } from "@/store/accountingStore";
import type { Expense } from "@/types/ui/accounting/expense";

const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

function formatDateDisplay(date: Date): string {
	const day = date.getDate();
	const month = MONTH_NAMES[date.getMonth()];
	const year = date.getFullYear();
	return `${day} ${month} ${year}`;
}

export default function ExpenseModifyScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const isEdit = Boolean(params.id);

	const expenses = useAccountingStore((state) => state.expenses);
	const addExpense = useAccountingStore((state) => state.addExpense);
	const updateExpense = useAccountingStore((state) => state.updateExpense);

	const finishModal = useAlertModal();
	const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 19));
	const [showDatePicker, setShowDatePicker] = useState(false);

	const form = useForm<ExpenseSchema>({
		resolver: zodResolver(expenseSchema),
		defaultValues: {
			accountName: "Kas Kecil",
			accountCode: "110001",
			referenceNumber: "KK/A001/2603/001",
			fundingSource: "Kas",
			store: "Sushiro",
			date: "19 Maret 2026",
			amount: 10000,
			description: "Pengeluaran tanggal 9",
		},
	});

	// Auto-fill account code when account name changes
	const watchedAccountName = form.watch("accountName");
	useEffect(() => {
		const matched = EXPENSE_ACCOUNTS.find(
			(acc) => acc.value === watchedAccountName,
		);
		if (matched) {
			form.setValue("accountCode", matched.code);
		}
	}, [watchedAccountName, form]);

	// Prepopulate if editing
	useEffect(() => {
		if (params.id) {
			const found = expenses.find((item) => item.id === params.id);
			if (found) {
				form.reset({
					accountName: found.accountName,
					accountCode: found.accountCode,
					referenceNumber: found.referenceNumber,
					fundingSource: found.fundingSource,
					store: found.store,
					date: found.date,
					amount: found.amount,
					description: found.description,
				});
			} else {
				router.back();
			}
		}
	}, [params.id, expenses, form]);

	const handleDateChange = (
		event: DateTimePicker.DateTimePickerEvent,
		date?: Date,
	) => {
		setShowDatePicker(false);
		if (event.type === "set" && date) {
			setSelectedDate(date);
			const formatted = formatDateDisplay(date);
			form.setValue("date", formatted, { shouldValidate: true });
		}
	};

	const openDatePicker = () => {
		if (Platform.OS === "android") {
			DateTimePicker.DateTimePickerAndroid.open({
				value: selectedDate,
				onChange: handleDateChange,
				mode: "date",
			});
		} else {
			setShowDatePicker(true);
		}
	};

	const onSubmit = (data: ExpenseSchema) => {
		if (isEdit && params.id) {
			updateExpense(params.id, {
				...data,
			});
		} else {
			addExpense({
				...data,
				time: "09.11 WIB",
				createdBy: "Ari Ariani",
				type: "expense",
				categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
			});
		}

		finishModal.open();
	};

	const handleFinishModalClose = () => {
		finishModal.close();
		router.back();
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-gray-50"
		>
			<ScrollView
				contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
				showsVerticalScrollIndicator={false}
			>
				<Card className="rounded-2xl border border-gray-100 bg-white p-4">
					<Form {...form}>
						<View className="gap-4">
							{/* Nama Akun */}
							<FormField
								control={form.control}
								name="accountName"
								render={() => (
									<FormItem>
										<FormLabel>Nama Akun</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih Nama Akun"
												data={EXPENSE_ACCOUNTS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Kode Akun */}
							<FormField
								control={form.control}
								name="accountCode"
								render={() => (
									<FormItem>
										<FormLabel>Kode Akun</FormLabel>
										<FormControl>
											<FormInput
												placeholder="110001"
												className="bg-zinc-50"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* No. Referensi */}
							<FormField
								control={form.control}
								name="referenceNumber"
								render={() => (
									<FormItem>
										<FormLabel>No. Referensi</FormLabel>
										<FormControl>
											<FormInput
												placeholder="KK/A001/2603/001"
												className="bg-zinc-50"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Sumber Dana */}
							<FormField
								control={form.control}
								name="fundingSource"
								render={() => (
									<FormItem>
										<FormLabel>Sumber Dana</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih Sumber Dana"
												data={EXPENSE_FUNDING_SOURCES}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Toko */}
							<FormField
								control={form.control}
								name="store"
								render={() => (
									<FormItem>
										<FormLabel>Toko</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih Toko"
												data={EXPENSE_STORES}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Tanggal */}
							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tanggal</FormLabel>
										<FormControl>
											<Pressable
												onPress={openDatePicker}
												className="h-11 flex-row items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3"
											>
												<Feather
													name="calendar"
													size={16}
													color={Colors.zinc[500]}
												/>
												<Text
													className="text-sm text-foreground"
													style={{ fontFamily: FONT_NAMES.regular }}
												>
													{field.value || "Pilih Tanggal"}
												</Text>
											</Pressable>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* iOS Modal DatePicker */}
							{showDatePicker && Platform.OS === "ios" && (
								<DateTimePicker.default
									value={selectedDate}
									mode="date"
									display="spinner"
									onChange={handleDateChange}
								/>
							)}

							{/* Nominal * */}
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Nominal</FormLabel>
										<FormControl>
											<View className="h-11 flex-row items-center rounded-lg border border-zinc-200 bg-white px-3">
												<TextInput
													className="flex-1 text-sm text-foreground"
													style={{
														fontFamily: FONT_NAMES.regular,
														fontSize: 14,
													}}
													placeholder="Rp10.000"
													keyboardType="numeric"
													value={
														field.value
															? formatRp(field.value).replace(/\s/g, "")
															: ""
													}
													onChangeText={(text) => {
														const parsed = parseNumber(text);
														field.onChange(parsed);
													}}
												/>
											</View>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Deskripsi * */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Deskripsi</FormLabel>
										<FormControl>
											<View className="h-28 rounded-lg border border-zinc-200 bg-white p-3">
												<TextInput
													className="flex-1 text-sm text-foreground"
													style={{
														fontFamily: FONT_NAMES.regular,
														fontSize: 14,
														textAlignVertical: "top",
													}}
													placeholder="Pengeluaran tanggal 9"
													placeholderTextColor={Colors.zinc[400]}
													multiline
													numberOfLines={4}
													value={field.value}
													onChangeText={field.onChange}
												/>
											</View>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
			</ScrollView>

			{/* Sticky Bottom "Simpan" Button */}
			<View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
				<Button
					size="xl"
					className="h-12 rounded-full bg-primary-500"
					onPress={form.handleSubmit(onSubmit)}
				>
					<ButtonText className="text-base font-semibold text-white">
						Simpan
					</ButtonText>
				</Button>
			</View>

			{/* Success Alert Modal */}
			<SuccessModal
				openState={finishModal.openState}
				onClose={handleFinishModalClose}
				title={
					isEdit ? "Pengeluaran Diperbarui!" : "Pengeluaran Ditambahkan!"
				}
				description={
					isEdit
						? "Data pengeluaran berhasil diperbarui."
						: "Data pengeluaran berhasil dibuat dan dicatat ke sistem."
				}
				buttonText="Tutup"
			/>
		</KeyboardAvoidingView>
	);
}
