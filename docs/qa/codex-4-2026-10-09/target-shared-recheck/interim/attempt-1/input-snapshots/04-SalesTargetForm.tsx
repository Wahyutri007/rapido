import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { View } from "react-native";
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
import { MultiSelect } from "@/components/common/MultiSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import {
	TARGET_KINDS,
	TARGET_STORES,
} from "@/constants/data/manage/sales-target";
import {
	blankTargetRow,
	selectTargetRows,
	targetChoices,
	targetTotals,
} from "@/lib/manage/sales-target";
import { formatRp } from "@/lib/utils";
import {
	type SalesTargetValues,
	salesTargetSchema,
} from "@/schema/manage/sales-target";
import { useSalesTargetStore } from "@/store/salesTargetStore";
import type { SalesTarget } from "@/types/ui/manage/sales-target";

export default function SalesTargetForm({ target }: { target?: SalesTarget }) {
	const save = useSalesTargetStore((state) => state.save);
	const [savedId, setSavedId] = React.useState(target?.id);
	const [success, setSuccess] = React.useState(false);
	const form = useForm<SalesTargetValues>({
		resolver: zodResolver(salesTargetSchema),
		defaultValues: target ?? {
			name: "",
			startDate: "",
			endDate: "",
			storeId: "",
			kind: "product",
			rows: [blankTargetRow("product")],
		},
	});
	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "rows",
	});
	const storeId = useWatch({ control: form.control, name: "storeId" });
	const kind = useWatch({ control: form.control, name: "kind" });
	const rows = useWatch({ control: form.control, name: "rows" });
	const previousScope = React.useRef({ storeId, kind });
	React.useEffect(() => {
		if (
			previousScope.current.storeId === storeId &&
			previousScope.current.kind === kind
		)
			return;
		previousScope.current = { storeId, kind };
		replace([blankTargetRow(kind)]);
		form.clearErrors("rows");
	}, [storeId, kind, replace, form]);
	const choices = targetChoices(storeId, kind);
	const total = targetTotals(rows);
	const product = kind === "product";
	const noun = product ? "Produk" : "Kategori";
	const submit = (values: SalesTargetValues) => {
		const result = save(values, savedId);
		if ("error" in result) {
			if (result.error === "duplicate")
				form.setError("name", {
					message: "Nama target sudah digunakan di toko ini.",
				});
			else
				form.setError("root", {
					message:
						result.error === "missing"
							? "Target sudah dihapus. Kembali ke daftar untuk membuat target baru."
							: "Periksa kembali data target.",
				});
			return;
		}
		setSavedId(result.id);
		form.reset(values);
		setSuccess(true);
	};
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Form {...form}>
					<Card density="compact" className="gap-4">
						<FormField
							control={form.control}
							name="name"
							render={() => (
								<FormItem>
									<FormLabel required>Nama Target</FormLabel>
									<FormControl>
										<FormInput
											placeholder="Contoh: Target Sushiro"
											fieldProps={{
												"aria-label": "Nama Target",
												maxLength: 100,
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<View className="gap-2">
							<Text size="normal" w="medium">
								Periode Target
							</Text>
							<View className="flex-row gap-3">
								{(
									[
										{ name: "startDate", label: "Tanggal Mulai" },
										{ name: "endDate", label: "Tanggal Akhir" },
									] as const
								).map((date) => (
									<View className="flex-1" key={date.name}>
										<FormField
											control={form.control}
											name={date.name}
											render={() => (
												<FormItem>
													<FormLabel required>{date.label}</FormLabel>
													<FormControl>
														<FormInput
															placeholder="YYYY-MM-DD"
															fieldProps={{
																"aria-label": date.label,
																maxLength: 10,
																style: { minWidth: 0 },
																autoCapitalize: "none",
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</View>
								))}
							</View>
						</View>
						<FormField
							control={form.control}
							name="storeId"
							render={() => (
								<FormItem>
									<FormLabel required>Toko</FormLabel>
									<FormControl>
										<FormSelect
											data={TARGET_STORES}
											placeholder="Pilih toko"
											label="Pilih Toko"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="kind"
							render={() => (
								<FormItem>
									<FormLabel required>Tipe Target</FormLabel>
									<FormControl>
										<FormSelect data={TARGET_KINDS} label="Tipe Target" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<View
							testID="sales-target-bulk"
							className="gap-2 rounded-lg bg-surface-muted p-3"
						>
							<Text size="normal" w="medium">
								Pilih Beberapa {noun}
							</Text>
							<Text size="small" className="text-muted">
								Pilih toko terlebih dahulu. Nilai pada pilihan yang tetap
								dipilih akan dipertahankan.
							</Text>
							{!!storeId && (
								<MultiSelect
									items={choices}
									selectedValues={[
										...new Set(rows.map((row) => row.itemId).filter(Boolean)),
									]}
									onValueChange={(ids) => {
										replace(
											ids.length
												? selectTargetRows(form.getValues("rows"), ids, kind)
												: [blankTargetRow(kind)],
										);
										form.clearErrors("rows");
									}}
									placeholder={`Pilih beberapa ${noun.toLowerCase()}`}
									label={`Pilih ${noun}`}
									itemUnit={noun.toLowerCase()}
									variant="outline"
								/>
							)}
						</View>
					</Card>
					<Card density="compact" className="gap-4">
						<View className="flex-row items-center gap-3">
							<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
								<Feather name="file-text" size={24} color={Colors.primary} />
							</View>
							<View className="flex-1 gap-1">
								<Text size="normal" w="semibold">
									Target per {noun}
								</Text>
								<Text size="small" className="text-muted">
									Atur {product ? "kuantitas dan nilai" : "nilai"} yang ingin
									dicapai.
								</Text>
							</View>
						</View>
						<View className="h-px bg-border-muted" />
						{fields.map((field, index) => (
							<View
								key={field.id}
								testID={`sales-target-row-${index + 1}`}
								className="gap-3 rounded-lg border border-border-muted p-3"
							>
								<View className="flex-row items-center justify-between gap-2">
									<Text size="normal" w="semibold">
										{noun} {index + 1}
									</Text>
									<Button
										variant="link"
										action="negative"
										isDisabled={fields.length === 1}
										onPress={() => remove(index)}
										accessibilityLabel={`Hapus target ${index + 1}`}
									>
										<ButtonText>Hapus</ButtonText>
									</Button>
								</View>
								<FormField
									control={form.control}
									name={`rows.${index}.itemId`}
									render={() => (
										<FormItem>
											<FormLabel required>
												{product ? "Nama Barang" : "Nama Kategori"}
											</FormLabel>
											<FormControl>
												<FormSelect
													data={choices}
													disabled={!storeId}
													placeholder={`Pilih ${noun.toLowerCase()} ${index + 1}`}
													label={`Pilih ${noun} ${index + 1}`}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<View className="flex-row gap-3">
									{product && (
										<View className="flex-1">
											<FormField
												control={form.control}
												name={`rows.${index}.quantity`}
												render={() => (
													<FormItem>
														<FormLabel required>Kuantitas</FormLabel>
														<FormControl>
															<FormInput
																type="number"
																placeholder="Contoh: 100"
																fieldProps={{
																	"aria-label": `Kuantitas ${index + 1}`,
																	style: { minWidth: 0 },
																}}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</View>
									)}
									<View className="flex-1">
										<FormField
											control={form.control}
											name={`rows.${index}.amount`}
											render={() => (
												<FormItem>
													<FormLabel required>Nilai Target (Rp)</FormLabel>
													<FormControl>
														<FormInput
															type="number"
															placeholder="Contoh: 1000000"
															fieldProps={{
																"aria-label": `Nilai Target ${index + 1}`,
																style: { minWidth: 0 },
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</View>
								</View>
							</View>
						))}
						{form.formState.errors.rows?.root?.message && (
							<Text size="small" className="text-destructive">
								{form.formState.errors.rows.root.message}
							</Text>
						)}
						<Button
							variant="outline"
							isDisabled={
								!storeId || fields.length >= Math.min(50, choices.length)
							}
							onPress={() => append(blankTargetRow(kind))}
						>
							<ButtonText>Tambah {noun}</ButtonText>
						</Button>
						<View className="flex-row flex-wrap items-center justify-between gap-2">
							<Text size="normal" w="medium">
								Total Nilai Target
							</Text>
							<Text size="body" w="semibold" className="text-primary">
								{formatRp(total.amount)}
							</Text>
						</View>
					</Card>
					{form.formState.errors.root?.message && (
						<Text size="normal" className="text-destructive">
							{form.formState.errors.root.message}
						</Text>
					)}
				</Form>
			</Wrapper>
			<BottomActionButton onPress={form.handleSubmit(submit)}>
				Simpan Target
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Target Disimpan"
				description="Target disimpan untuk pratinjau selama aplikasi terbuka."
				buttonText="Mengerti"
			/>
		</>
	);
}
