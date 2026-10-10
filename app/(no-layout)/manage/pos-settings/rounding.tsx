import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { Pressable, Switch, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	useRoundingSettingMutation,
	useRoundingSettingQuery,
} from "@/api/hooks/settings";
import AlertModal from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal, { useAlertModal } from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";

type RoundingMethod = "up" | "down" | "nearest";
type ApplyToOption = "all" | "cash_only";

const METHOD_OPTIONS: {
	id: RoundingMethod;
	title: string;
	description: string;
}[] = [
	{
		id: "up",
		title: "Pembulatan ke Atas",
		description: "Selalu membulatkan ke angka terdekat di atasnya.",
	},
	{
		id: "down",
		title: "Pembulatan ke Bawah",
		description: "Selalu membulatkan ke angka terdekat di bawahnya.",
	},
	{
		id: "nearest",
		title: "Pembulatan Terdekat",
		description: "Membulatkan ke angka terdekat.",
	},
];

const MULTIPLE_OPTIONS = [
	{ label: "Ratusan (Rp100)", value: "2" },
	{ label: "Ribuan (Rp1.000)", value: "3" },
	{ label: "Puluhan (Rp10)", value: "1" },
];

function RoundingError({
	children,
}: {
	children: React.ReactElement<React.ComponentProps<typeof AlertModal>>;
}) {
	const { height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	if (height - insets.top - insets.bottom >= 400) return children;

	const props = children.props;
	const close = () => {
		if (props.onClose) props.onClose();
		else props.openState[1](false);
	};

	return (
		<Actionsheet isOpen={props.openState[0]} onClose={close}>
			<ActionsheetBackdrop />
			<ActionsheetContent
				className="p-4"
				style={{ maxHeight: Math.max(0, height - insets.top - 16) }}
			>
				<ActionsheetScrollView
					className="min-h-0"
					keyboardShouldPersistTaps="handled"
				>
					<View className="gap-4">
						<Text size="body" w="semibold" className="text-center">
							{props.title}
						</Text>
						<Text size="body" className="text-center text-muted">
							{props.message}
						</Text>
						<Button
							size="xl"
							action={props.confirmAction}
							isDisabled={props.isLoading}
							onPress={props.onConfirm ?? close}
						>
							<ButtonText size="sm">{props.confirmText}</ButtonText>
						</Button>
					</View>
				</ActionsheetScrollView>
			</ActionsheetContent>
		</Actionsheet>
	);
}

export default function RoundingSettingScreen() {
	const { height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const compact = height - insets.top - insets.bottom < 400;
	const { data: roundingData } = useRoundingSettingQuery();
	const roundingMutation = useRoundingSettingMutation();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	// Server values remain live until a field is edited in this screen session.
	const [draft, setDraft] = React.useState<{
		enabled?: boolean;
		method?: RoundingMethod;
		decimalPlaces?: string;
	}>({});
	const [applyTo, setApplyTo] = React.useState<ApplyToOption>("all");
	const enabled = draft.enabled ?? roundingData?.enabled ?? true;
	const method = draft.method ?? roundingData?.method ?? "nearest";
	// The API stores the exponent; the displayed multiple is 10 ** decimal_places.
	const decimalPlaces =
		draft.decimalPlaces ?? String(roundingData?.decimal_places ?? 2);
	const exponent = Number(decimalPlaces);
	const isValidExponent =
		Number.isInteger(exponent) && exponent >= 0 && exponent <= 10;
	const multipleOptions =
		isValidExponent &&
		!MULTIPLE_OPTIONS.some((item) => item.value === decimalPlaces)
			? [
					{
						label: `Kelipatan (${formatRp(10 ** exponent)})`,
						value: decimalPlaces,
					},
					...MULTIPLE_OPTIONS,
				]
			: MULTIPLE_OPTIONS;

	const handleSave = async () => {
		if (!isValidExponent) {
			errorModal.open();
			return;
		}
		const [, error] = await roundingMutation.call({
			enabled,
			method,
			decimal_places: exponent,
		});
		if (error) {
			errorModal.open();
			return;
		}
		successModal.open();
	};

	const saveButton = (
		<BottomActionButton
			onPress={handleSave}
			isLoading={roundingMutation.isLoading}
		>
			Simpan
		</BottomActionButton>
	);

	return (
		<>
			<Wrapper
				hasActionButton={!compact}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{/* Switch Card */}
				<Card>
					<View className="flex-row items-center justify-between">
						<View className="flex-1 mr-3">
							<Text w="semibold" size="normal" className="text-foreground">
								Aktifkan Pembulatan
							</Text>
							<Text size="small" className="mt-1 text-muted leading-relaxed">
								Total pembayaran akan dibulatkan sesuai aturan bisnis.
							</Text>
						</View>
						<Switch
							value={enabled}
							onValueChange={(value) =>
								setDraft((previous) => ({ ...previous, enabled: value }))
							}
							trackColor={{ false: "#e4e4e7", true: Colors.primary }}
							thumbColor="#ffffff"
						/>
					</View>

					<Pressable
						onPress={() => router.push("/manage/pos-settings/rounding-detail")}
						className="mt-3 self-start"
					>
						<Text size="small" w="semibold" className="text-primary underline">
							Baca Selengkapnya
						</Text>
					</Pressable>
				</Card>

				{/* Conditional Settings when Enabled */}
				{enabled && (
					<>
						{/* Terapkan Ke */}
						<View className="gap-2">
							<View className="flex-row items-center gap-2">
								<Text size="normal" w="medium" className="text-muted">
									Terapkan Ke
								</Text>
								<Feather name="info" size={14} color={Colors.zinc[400]} />
							</View>

							<View className="flex-row overflow-hidden rounded-xl border border-border-muted bg-white shadow-main">
								<Pressable
									onPress={() => setApplyTo("all")}
									className={cn(
										"flex-1 items-center justify-center py-3",
										applyTo === "all"
											? "rounded-lg bg-primary"
											: "bg-transparent",
									)}
								>
									<Text
										size="normal"
										w={applyTo === "all" ? "semibold" : "medium"}
										className={applyTo === "all" ? "text-white" : "text-muted"}
									>
										Semua Transaksi
									</Text>
								</Pressable>

								<Pressable
									onPress={() => setApplyTo("cash_only")}
									className={cn(
										"flex-1 items-center justify-center py-3",
										applyTo === "cash_only"
											? "rounded-lg bg-primary"
											: "bg-transparent",
									)}
								>
									<Text
										size="normal"
										w={applyTo === "cash_only" ? "semibold" : "medium"}
										className={
											applyTo === "cash_only" ? "text-white" : "text-muted"
										}
									>
										Tunai Saja
									</Text>
								</Pressable>
							</View>
						</View>

						{/* Metode Pembulatan */}
						<View className="gap-2">
							<Text size="normal" w="medium" className="text-muted">
								Metode Pembulatan
							</Text>

							<Card className="gap-2">
								{METHOD_OPTIONS.map((opt) => {
									const isSelected = method === opt.id;
									return (
										<BouncyPressable
											key={opt.id}
											onPress={() =>
												setDraft((previous) => ({
													...previous,
													method: opt.id,
												}))
											}
											activeScale={0.98}
											className={cn(
												"flex-row items-start gap-3 rounded-lg border p-4",
												isSelected
													? "border-primary bg-primary/5"
													: "border-border bg-white",
											)}
										>
											<View
												className={cn(
													"mt-1 size-5 items-center justify-center rounded-full border",
													isSelected
														? "border-primary bg-primary"
														: "border-border bg-white",
												)}
											>
												{isSelected && (
													<View className="size-2 rounded-full bg-white" />
												)}
											</View>

											<View className="flex-1">
												<Text
													size="normal"
													w={isSelected ? "bold" : "semibold"}
													className={
														isSelected ? "text-primary" : "text-foreground"
													}
												>
													{opt.title}
												</Text>
												<Text
													size="small"
													className="mt-1 text-muted leading-relaxed"
												>
													{opt.description}
												</Text>
											</View>
										</BouncyPressable>
									);
								})}
							</Card>
						</View>

						{/* Kelipatan Pembulatan */}
						<View className="gap-2">
							<Text size="normal" w="medium" className="text-muted">
								Kelipatan Pembulatan
							</Text>

							<Card>
								<SingleSelect
									viewportSafe
									items={multipleOptions}
									value={decimalPlaces}
									onValueChange={(value) =>
										setDraft((previous) => ({
											...previous,
											decimalPlaces: value,
										}))
									}
									placeholder="Pilih Kelipatan Pembulatan"
									label="Kelipatan Pembulatan"
									variant="rounded"
								/>
							</Card>
						</View>
					</>
				)}
				{compact && React.cloneElement(saveButton, { className: "relative" })}
			</Wrapper>

			{/* Bottom Action Button */}
			{!compact && saveButton}

			<RoundingError>
				<AlertModal
					openState={errorModal.openState}
					title="Gagal Menyimpan Pembulatan"
					message="Pengaturan belum tersimpan. Periksa koneksi dan coba lagi."
					hideCancelButton
					confirmText="Mengerti"
					onConfirm={errorModal.close}
				/>
			</RoundingError>
			{/* Success Modal */}
			<SuccessModal
				openState={successModal.openState}
				onClose={successModal.close}
				title="Pengaturan Pembulatan Disimpan"
				description="Aturan pembulatan transaksi berhasil diperbarui."
				buttonText="Mengerti"
			/>
		</>
	);
}
