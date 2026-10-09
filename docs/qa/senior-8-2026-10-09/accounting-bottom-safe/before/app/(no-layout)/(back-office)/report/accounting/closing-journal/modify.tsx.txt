import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import * as DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, Pressable, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import SuccessModal from "@/components/common/SuccessModal";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Colors } from "@/constants/Colors";
import { CLOSING_JOURNAL_ACCOUNT_OPTIONS } from "@/constants/data/accounting/closing-journal";
import { FONT_NAMES } from "@/constants/Fonts";
import { cn, formatRp, parseNumber } from "@/lib/utils";
import {
	type ClosingJournalSchema,
	closingJournalSchema,
} from "@/schema/accounting/closing-journal";
import { useAccountingStore } from "@/store/accountingStore";
import type { JournalLine } from "@/types/ui/accounting/journal";

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

const PERIOD_OPTIONS = [
	"Januari 2026",
	"Februari 2026",
	"Maret 2026",
	"April 2026",
	"Mei 2026",
	"Juni 2026",
	"Juli 2026",
	"Agustus 2026",
	"September 2026",
	"Oktober 2026",
	"November 2026",
	"Desember 2026",
];

function formatDateDisplay(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = MONTH_NAMES[date.getMonth()];
	const year = date.getFullYear();
	return `${day} ${month} ${year}`;
}

const DEFAULT_LINES: JournalLine[] = [
	{
		id: "line-1",
		accountId: "4-1000",
		accountCode: "4-1000",
		accountName: "Pendapatan Usaha",
		debit: 125450000,
		credit: 0,
	},
	{
		id: "line-2",
		accountId: "5-1000",
		accountCode: "5-1000",
		accountName: "Beban Operasional",
		debit: 0,
		credit: 84200000,
	},
	{
		id: "line-3",
		accountId: "3-9000",
		accountCode: "3-9000",
		accountName: "Ikhtisar Laba Rugi",
		debit: 84200000,
		credit: 125450000,
	},
	{
		id: "line-4",
		accountId: "3-1000",
		accountCode: "3-1000",
		accountName: "Modal",
		debit: 41250000,
		credit: 0,
	},
];

export default function ClosingJournalModifyScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const isEdit = Boolean(params.id);

	const closingJournals = useAccountingStore((state) => state.closingJournals);
	const addClosingJournal = useAccountingStore(
		(state) => state.addClosingJournal,
	);
	const updateClosingJournal = useAccountingStore(
		(state) => state.updateClosingJournal,
	);

	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMessage, setErrorMessage] = useState("");

	const [selectedDateObj, setSelectedDateObj] = useState(new Date(2026, 8, 30));
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [isPeriodPickerOpen, setIsPeriodPickerOpen] = useState(false);
	const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
	const [pickingLineIndex, setPickingLineIndex] = useState<number | null>(null);

	const form = useForm<ClosingJournalSchema>({
		resolver: zodResolver(closingJournalSchema),
		defaultValues: {
			period: "September 2026",
			date: "30 September 2026",
			referenceNumber: "JP-0626-004",
			description: "Penutupan akun pendapatan dan beban",
			lines: DEFAULT_LINES,
		},
	});

	const lines = form.watch("lines") || [];

	// Pre-fill if edit mode
	useEffect(() => {
		if (params.id) {
			const existing = closingJournals.find((j) => j.id === params.id);
			if (existing) {
				form.reset({
					period: existing.period || "Juni 2026",
					date: existing.date,
					referenceNumber: existing.referenceNumber,
					description: existing.description,
					lines: existing.lines.map((l) => ({ ...l })),
				});
			} else {
				router.back();
			}
		}
	}, [params.id, closingJournals, form]);

	// Calculations
	const totalDebit = useMemo(
		() => lines.reduce((acc, curr) => acc + (curr.debit || 0), 0),
		[lines],
	);

	const totalCredit = useMemo(
		() => lines.reduce((acc, curr) => acc + (curr.credit || 0), 0),
		[lines],
	);

	const difference = Math.abs(totalDebit - totalCredit);
	const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

	// Date Picker Handler
	const handleDateChange = (
		event: DateTimePicker.DateTimePickerEvent,
		newDate?: Date,
	) => {
		setShowDatePicker(false);
		if (event.type === "set" && newDate) {
			setSelectedDateObj(newDate);
			const formatted = formatDateDisplay(newDate);
			form.setValue("date", formatted, {
				shouldValidate: true,
				shouldDirty: true,
			});
		}
	};

	const openDatePicker = () => {
		if (Platform.OS === "android") {
			DateTimePicker.DateTimePickerAndroid.open({
				value: selectedDateObj,
				onChange: handleDateChange,
				mode: "date",
			});
		} else {
			setShowDatePicker(true);
		}
	};

	// Line Actions
	const handleAddLine = () => {
		const newLines: JournalLine[] = [
			...lines,
			{
				id: `line-${Date.now()}`,
				accountId: "",
				accountCode: "",
				accountName: "",
				debit: 0,
				credit: 0,
			},
		];
		form.setValue("lines", newLines, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const handleRemoveLine = (index: number) => {
		if (lines.length <= 2) return;
		const updated = lines.filter((_, i) => i !== index);
		form.setValue("lines", updated, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const handleOpenAccountPicker = (index: number) => {
		setPickingLineIndex(index);
		setIsAccountPickerOpen(true);
	};

	const handleSelectAccount = (
		acc: (typeof CLOSING_JOURNAL_ACCOUNT_OPTIONS)[0],
	) => {
		if (pickingLineIndex !== null) {
			const updated = lines.map((line, i) =>
				i === pickingLineIndex
					? {
							...line,
							accountId: acc.value,
							accountCode: acc.code,
							accountName: acc.name,
						}
					: line,
			);
			form.setValue("lines", updated, {
				shouldValidate: true,
				shouldDirty: true,
			});
		}
		setIsAccountPickerOpen(false);
		setPickingLineIndex(null);
	};

	const handleLineValueChange = (
		index: number,
		field: "debit" | "credit",
		val: number,
	) => {
		const updated = lines.map((line, i) => {
			if (i !== index) return line;
			return { ...line, [field]: val };
		});
		form.setValue("lines", updated, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	// Form Submission
	const onSubmit = (data: ClosingJournalSchema) => {
		const primaryTotal = data.lines[0]?.debit || totalDebit / 2;

		if (isEdit && params.id) {
			updateClosingJournal(params.id, {
				period: data.period,
				date: data.date,
				referenceNumber: data.referenceNumber,
				description: data.description,
				lines: data.lines,
				totalAmount: primaryTotal,
				isBalanced: true,
			});
		} else {
			addClosingJournal({
				period: data.period,
				date: data.date,
				referenceNumber: data.referenceNumber,
				description: data.description,
				lines: data.lines,
				totalAmount: primaryTotal,
				isBalanced: true,
			});
		}

		finishModal.open();
	};

	const onError = () => {
		const formErrors = form.formState.errors;
		if (formErrors.lines?.message) {
			setErrorMessage(String(formErrors.lines.message));
			errorModal.open();
		} else {
			setErrorMessage("Mohon lengkapi seluruh field formulir dengan benar.");
			errorModal.open();
		}
	};

	const handleFinishModalClose = () => {
		finishModal.close();
		router.back();
	};

	return (
		<View className="flex-1 bg-gray-50">
			<AnimatedWrapper
				avoidKeyboard={Platform.OS === "ios"}
				hasActionButton
				showScrollToTopFab
				fabBottomOffset={96}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<Form {...form}>
					{/* Section 1: Informasi Jurnal */}
					<Card>
						<View className="gap-4">
							{/* Header with blue info icon container */}
							<View className="flex-row items-center gap-3">
								<View className="size-10 items-center justify-center rounded-xl bg-blue-50">
									<Feather name="info" size={18} color={Colors.primary} />
								</View>
								<View>
									<Text w="semibold" className="text-sm text-foreground">
										Informasi Jurnal
									</Text>
									<Text className="text-xs text-muted">
										Lengkapi detail jurnal penutup anda
									</Text>
								</View>
							</View>

							{/* Periode */}
							<FormField
								control={form.control}
								name="period"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Periode</FormLabel>
										<FormControl>
											<Pressable
												onPress={() => setIsPeriodPickerOpen(true)}
												className="h-11 flex-row items-center justify-between rounded-lg border border-zinc-200 bg-white px-3"
											>
												<Text
													className={cn(
														"text-sm",
														field.value ? "text-foreground" : "text-muted",
													)}
													style={{ fontFamily: FONT_NAMES.regular }}
												>
													{field.value || "Pilih Periode"}
												</Text>
												<Feather
													name="calendar"
													size={16}
													color={Colors.zinc[500]}
												/>
											</Pressable>
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
										<FormLabel required>Tanggal</FormLabel>
										<FormControl>
											<Pressable
												onPress={openDatePicker}
												className="h-11 flex-row items-center justify-between rounded-lg border border-zinc-200 bg-white px-3"
											>
												<Text
													className="text-sm text-foreground"
													style={{ fontFamily: FONT_NAMES.regular }}
												>
													{field.value}
												</Text>
												<Feather
													name="calendar"
													size={16}
													color={Colors.zinc[500]}
												/>
											</Pressable>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* iOS Date Picker */}
							{showDatePicker && Platform.OS === "ios" && (
								<DateTimePicker.default
									value={selectedDateObj}
									mode="date"
									display="spinner"
									onChange={handleDateChange}
								/>
							)}

							{/* No. Referensi */}
							<FormField
								control={form.control}
								name="referenceNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>No. Referensi</FormLabel>
										<FormControl>
											<Input className="h-11 rounded-lg px-3 bg-white border-zinc-200">
												<InputField
													className="text-sm text-foreground px-0"
													style={{
														fontFamily: FONT_NAMES.regular,
														fontSize: 14,
													}}
													placeholder="JP-0626-004"
													placeholderTextColor={Colors.zinc[400]}
													value={field.value}
													onChangeText={field.onChange}
													onBlur={field.onBlur}
												/>
											</Input>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Deskripsi */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Deskripsi</FormLabel>
										<FormControl>
											<Textarea className="h-24 rounded-lg border border-zinc-200 bg-white p-3">
												<TextareaInput
													className="text-sm text-foreground p-0"
													style={{
														fontFamily: FONT_NAMES.regular,
														fontSize: 14,
														textAlignVertical: "top",
													}}
													placeholder="Penutupan akun pendapatan dan beban"
													placeholderTextColor={Colors.zinc[400]}
													multiline
													numberOfLines={3}
													value={field.value}
													onChangeText={field.onChange}
													onBlur={field.onBlur}
												/>
											</Textarea>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Card>

					{/* Section 2: Baris Jurnal */}
					<Card>
						<View className="gap-4">
							{/* Header with blue document icon container */}
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center gap-3">
									<View className="size-10 items-center justify-center rounded-xl bg-blue-50">
										<Feather
											name="file-text"
											size={18}
											color={Colors.primary}
										/>
									</View>
									<View>
										<Text w="semibold" className="text-sm text-foreground">
											Baris Jurnal
										</Text>
										<Text className="text-xs text-muted">
											Lengkapi baris jurnal penutup anda
										</Text>
									</View>
								</View>

								<Pressable
									onPress={handleAddLine}
									className="flex-row items-center gap-1 rounded-lg border border-primary-500 px-2.5 py-1.5 active:bg-primary-50"
								>
									<Feather name="plus" size={14} color={Colors.primary} />
									<Text className="text-xs font-semibold text-primary-500">
										Tambah
									</Text>
								</Pressable>
							</View>

							{/* Lines List */}
							<View className="gap-3">
								{lines.map((line, index) => (
									<View
										key={line.id}
										className="gap-2.5 rounded-xl border border-zinc-200 bg-white p-3"
									>
										{/* Top of Line Item: Account details on left, Trash on right */}
										<View className="flex-row items-start justify-between">
											<Pressable
												onPress={() => handleOpenAccountPicker(index)}
												className="flex-1 pr-2 active:opacity-75"
											>
												<View className="flex-row items-center gap-1.5">
													<Text
														w="semibold"
														className="text-sm text-foreground"
													>
														{line.accountName || "Pilih Akun"}
													</Text>
													<Feather
														name="chevron-down"
														size={14}
														color={Colors.zinc[400]}
													/>
												</View>
												<Text className="text-xs text-muted">
													{line.accountCode
														? `(${line.accountCode})`
														: "Tekan untuk memilih akun"}
												</Text>
											</Pressable>

											{/* Trash button */}
											{lines.length > 2 && (
												<Pressable
													onPress={() => handleRemoveLine(index)}
													className="size-8 items-center justify-center rounded-lg bg-red-50 active:opacity-75"
													hitSlop={6}
												>
													<Feather
														name="trash-2"
														size={15}
														color={Colors.red[500]}
													/>
												</Pressable>
											)}
										</View>

										{/* Debit and Kredit side-by-side inputs using Gluestack Input */}
										<View className="flex-row items-center gap-3">
											{/* Debit Input */}
											<View className="flex-1 gap-1">
												<Text className="text-xs font-medium text-muted">
													Debit
												</Text>
												<Input className="h-11 rounded-lg px-3 bg-white border-zinc-200">
													<InputField
														className="text-sm text-foreground px-0"
														style={{
															fontFamily: FONT_NAMES.regular,
															fontSize: 14,
														}}
														keyboardType="numeric"
														placeholder="Rp0"
														placeholderTextColor={Colors.zinc[400]}
														value={
															line.debit > 0
																? formatRp(line.debit).replace(/\s/g, "")
																: "Rp0"
														}
														onChangeText={(text) => {
															const parsed = parseNumber(text);
															handleLineValueChange(index, "debit", parsed);
														}}
													/>
												</Input>
											</View>

											{/* Kredit Input */}
											<View className="flex-1 gap-1">
												<Text className="text-xs font-medium text-muted">
													Kredit
												</Text>
												<Input className="h-11 rounded-lg px-3 bg-white border-zinc-200">
													<InputField
														className="text-sm text-foreground px-0"
														style={{
															fontFamily: FONT_NAMES.regular,
															fontSize: 14,
														}}
														keyboardType="numeric"
														placeholder="Rp0"
														placeholderTextColor={Colors.zinc[400]}
														value={
															line.credit > 0
																? formatRp(line.credit).replace(/\s/g, "")
																: "Rp0"
														}
														onChangeText={(text) => {
															const parsed = parseNumber(text);
															handleLineValueChange(index, "credit", parsed);
														}}
													/>
												</Input>
											</View>
										</View>
									</View>
								))}
							</View>

							{form.formState.errors.lines?.message && (
								<Text className="text-xs text-destructive">
									{String(form.formState.errors.lines.message)}
								</Text>
							)}
						</View>
					</Card>
				</Form>

				{/* Section 3: Ringkasan */}
				<Card>
					<View className="gap-3">
						<Text w="semibold" className="text-sm text-foreground">
							Ringkasan
						</Text>

						<View className="flex-row items-center justify-between py-1">
							<View className="flex-1 items-center">
								<Text className="text-xs text-muted">Total Debit</Text>
								<Text w="bold" className="text-sm text-foreground">
									{formatRp(totalDebit).replace(/\s/g, "")}
								</Text>
							</View>

							<View className="h-7 w-px bg-gray-200" />

							<View className="flex-1 items-center">
								<Text className="text-xs text-muted">Total Kredit</Text>
								<Text w="bold" className="text-sm text-foreground">
									{formatRp(totalCredit).replace(/\s/g, "")}
								</Text>
							</View>
						</View>

						<View className="items-center gap-1.5 pt-1">
							<Text className="text-xs text-muted">Selisih</Text>
							<Text
								w="bold"
								className={cn(
									"text-sm",
									difference === 0 ? "text-success" : "text-destructive",
								)}
							>
								{formatRp(difference).replace(/\s/g, "")}
							</Text>

							{isBalanced ? (
								<View className="flex-row items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
									<Feather name="check-circle" size={13} color="#059669" />
									<Text className="text-xs font-semibold text-success">
										Seimbang
									</Text>
								</View>
							) : (
								<View className="flex-row items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1">
									<Feather name="alert-circle" size={13} color="#DC2626" />
									<Text className="text-xs font-semibold text-destructive">
										Tidak Seimbang
									</Text>
								</View>
							)}
						</View>
					</View>
				</Card>
			</AnimatedWrapper>

			{/* Sticky Bottom Save Button */}
			<View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
				<Button
					size="xl"
					className="h-12 rounded-full bg-primary-500"
					onPress={form.handleSubmit(onSubmit, onError)}
				>
					<ButtonText className="text-base font-semibold text-white">
						Simpan
					</ButtonText>
				</Button>
			</View>

			{/* Periode Picker Actionsheet */}
			<Actionsheet
				isOpen={isPeriodPickerOpen}
				onClose={() => setIsPeriodPickerOpen(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="max-h-[80%] bg-white pb-8 pt-2">
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>

					<View className="w-full border-b border-gray-100 px-4 py-3">
						<Text w="semibold" className="text-base text-foreground">
							Pilih Periode
						</Text>
					</View>

					<View className="w-full px-2 pt-2">
						{PERIOD_OPTIONS.map((p) => {
							const isSelected = form.watch("period") === p;
							return (
								<Pressable
									key={p}
									onPress={() => {
										form.setValue("period", p, {
											shouldValidate: true,
											shouldDirty: true,
										});
										setIsPeriodPickerOpen(false);
									}}
									className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100 active:bg-gray-50"
								>
									<Text
										w={isSelected ? "semibold" : "regular"}
										className={cn(
											"text-sm",
											isSelected ? "text-primary-500" : "text-foreground",
										)}
									>
										{p}
									</Text>

									{isSelected && (
										<Feather name="check" size={18} color={Colors.primary} />
									)}
								</Pressable>
							);
						})}
					</View>
				</ActionsheetContent>
			</Actionsheet>

			{/* Account Picker Actionsheet */}
			<Actionsheet
				isOpen={isAccountPickerOpen}
				onClose={() => setIsAccountPickerOpen(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="max-h-[80%] bg-white pb-8 pt-2">
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>

					<View className="w-full border-b border-gray-100 px-4 py-3">
						<Text w="semibold" className="text-base text-foreground">
							Pilih Akun
						</Text>
					</View>

					<View className="w-full px-2 pt-2">
						{CLOSING_JOURNAL_ACCOUNT_OPTIONS.map((acc) => (
							<Pressable
								key={acc.value}
								onPress={() => handleSelectAccount(acc)}
								className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100 active:bg-gray-50"
							>
								<View>
									<Text w="medium" className="text-sm text-foreground">
										{acc.label}
									</Text>
								</View>
							</Pressable>
						))}
					</View>
				</ActionsheetContent>
			</Actionsheet>

			{/* Finish Success Modal */}
			<SuccessModal
				openState={finishModal.openState}
				onClose={handleFinishModalClose}
				title={
					isEdit ? "Jurnal Penutup Diperbarui!" : "Jurnal Penutup Tersimpan!"
				}
				description={
					isEdit
						? "Perubahan pada jurnal penutup telah berhasil disimpan."
						: "Jurnal penutup barumu sudah aktif dan berhasil disimpan."
				}
				buttonText="Tutup"
			/>

			{/* Error Modal */}
			<AlertModal
				openState={errorModal.openState}
				onClose={errorModal.close}
				onConfirm={errorModal.close}
				title="Perhatian"
				message={errorMessage}
				confirmText="Mengerti"
				hideCancelButton
				confirmAction="negative"
			/>
		</View>
	);
}
