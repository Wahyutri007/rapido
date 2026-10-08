import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Image, Platform, Pressable, Switch, View } from "react-native";
import { ILLUSTRATIONS } from "@/assets/images/illustrations";
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
} from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { DEFAULT_RECEIPT_SETTINGS } from "@/constants/data/manage/receipt";
import { route } from "@/lib/utils";
import { receiptSettingsSchema } from "@/schema/manage/receipt";
import { useReceiptStore } from "@/store/receiptStore";
import type {
	ReceiptElementId,
	ReceiptSettings,
	ReceiptStore,
} from "@/types/ui/manage/receipt";
import ReceiptPreview from "./ReceiptPreview";

const ELEMENTS: {
	id: ReceiptElementId;
	label: string;
	icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
	{ id: "logo", label: "Logo Toko", icon: "image" },
	{ id: "address", label: "Alamat Toko", icon: "map-pin" },
	{ id: "phone", label: "No HP Toko", icon: "phone" },
	{ id: "transactionNumber", label: "Nomor Transaksi", icon: "hash" },
	{ id: "cashier", label: "Nama Kasir", icon: "user" },
	{ id: "customer", label: "Nama Pelanggan", icon: "users" },
	{ id: "date", label: "Tanggal / Waktu Transaksi", icon: "calendar" },
	{ id: "items", label: "Daftar Item", icon: "list" },
	{ id: "subtotal", label: "Subtotal", icon: "plus-square" },
	{ id: "taxes", label: "Biaya tambahan & Pajak", icon: "percent" },
	{ id: "total", label: "Total", icon: "dollar-sign" },
	{ id: "payment", label: "Metode Pembayaran", icon: "credit-card" },
];

export default function ReceiptSettingsForm({
	store,
}: {
	store: ReceiptStore;
}) {
	const saved =
		useReceiptStore((state) => state.settingsByStore[store.id]) ??
		DEFAULT_RECEIPT_SETTINGS;
	const saveSettings = useReceiptStore((state) => state.saveSettings);
	const setPreview = useReceiptStore((state) => state.setPreview);
	const [showSuccess, setShowSuccess] = React.useState(false);
	const form = useForm<ReceiptSettings>({
		resolver: zodResolver(receiptSettingsSchema),
		defaultValues: saved,
	});
	const settings = form.watch();
	const changedCount =
		ELEMENTS.filter(
			(element) => settings.enabled[element.id] !== saved.enabled[element.id],
		).length + Number(settings.footer.trim() !== saved.footer);
	const isDefault =
		ELEMENTS.every(
			(element) =>
				settings.enabled[element.id] ===
				DEFAULT_RECEIPT_SETTINGS.enabled[element.id],
		) && settings.footer.trim() === DEFAULT_RECEIPT_SETTINGS.footer;

	const save = (values: ReceiptSettings) => {
		saveSettings(store.id, values);
		form.reset(values);
		setShowSuccess(true);
	};

	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="flex-row items-center gap-3">
					<View className="flex-1 gap-2">
						<Text size="normal" w="semibold">
							Atur tampilan struk toko Anda
						</Text>
						<Text size="small" className="text-muted">
							Sesuaikan informasi dan elemen struk agar hasil cetak lebih rapi
							dan profesional.
						</Text>
					</View>
					<Image
						source={ILLUSTRATIONS.receipt}
						className="h-32 w-32"
						resizeMode="contain"
						accessibilityIgnoresInvertColors
					/>
				</Card>
				<Card className="gap-4">
					<View className="gap-3">
						<Text w="semibold">Preview Struk</Text>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Lihat pratinjau lengkap"
							onPress={() => {
								setPreview(store.id, settings);
								router.push(route("/manage/receipt/preview", { id: store.id }));
							}}
						>
							<View className="max-h-64 overflow-hidden">
								<ReceiptPreview store={store} settings={settings} />
							</View>
							<View className="flex-row items-center justify-center gap-2 py-3">
								<Feather name="maximize-2" size={16} color={Colors.primary} />
								<Text size="small" w="medium" className="text-primary">
									Lihat pratinjau lengkap
								</Text>
							</View>
						</Pressable>
					</View>
					<View className="gap-2">
						<Text w="semibold">Tampilan & Susun Elemen Struk</Text>
						<View className="self-start rounded-full bg-primary-50 px-3 py-1">
							<Text size="small" w="medium" className="text-primary">
								{changedCount ? "Diubah" : isDefault ? "Default" : "Tersimpan"}
							</Text>
						</View>
						<Text
							size="small"
							className="text-muted"
							accessibilityLiveRegion="polite"
						>
							{changedCount
								? `Anda memiliki ${changedCount} perubahan yang belum disimpan.`
								: isDefault
									? "Menggunakan pengaturan default"
									: "Menggunakan pengaturan toko ini"}
						</Text>
					</View>
					<Form {...form}>
						<View className="rounded-lg border border-border-muted px-3">
							{ELEMENTS.map((element) => (
								<FormField
									key={element.id}
									control={form.control}
									name={`enabled.${element.id}`}
									render={({ field }) => (
										<FormItem>
											<View className="min-h-14 flex-row items-center gap-3 border-b border-border-muted py-3">
												<Feather
													name={element.icon}
													size={20}
													color={Colors.primary}
												/>
												<Text size="normal" className="flex-1">
													{element.label}
												</Text>
												<FormControl>
													<Switch
														accessibilityLabel={element.label}
														value={field.value}
														onValueChange={field.onChange}
														trackColor={{
															false: Colors.gray[200],
															true: Colors.primary,
														}}
														thumbColor={Colors.light.background}
														{...(Platform.OS === "web"
															? { activeThumbColor: Colors.light.background }
															: {})}
													/>
												</FormControl>
											</View>
										</FormItem>
									)}
								/>
							))}
							<View className="py-4">
								<FormField
									control={form.control}
									name="footer"
									render={() => (
										<FormItem>
											<FormLabel>Catatan Footer</FormLabel>
											<FormControl>
												<FormInput
													multiline
													placeholder="Contoh: Terima kasih atas kunjungan Anda!"
													fieldProps={{ "aria-label": "Catatan Footer" }}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</View>
						</View>
					</Form>
					<Button
						variant="outline"
						action="secondary"
						onPress={() => form.reset(DEFAULT_RECEIPT_SETTINGS)}
					>
						<ButtonText>Kembalikan ke Default</ButtonText>
					</Button>
				</Card>
			</Wrapper>
			<BottomActionButton
				onPress={form.handleSubmit(save)}
				isDisabled={!changedCount}
			>
				Simpan
			</BottomActionButton>
			<SuccessModal
				isOpen={showSuccess}
				onClose={() => setShowSuccess(false)}
				title="Pengaturan Struk Disimpan"
				description="Pengaturan pratinjau toko ini disimpan selama aplikasi terbuka."
				buttonText="Mengerti"
			/>
		</>
	);
}
