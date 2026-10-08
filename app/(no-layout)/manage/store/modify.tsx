import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import ImageUploader from "@/components/common/ImageUploader";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import StoreActionConfirmation from "@/components/feature/manage/store/StoreActionConfirmation";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import {
	BUSINESS_TYPE_OPTIONS,
	CITY_OPTIONS,
	DISTRICT_OPTIONS,
	PROVINCE_OPTIONS,
	STORE_ITEMS,
	SUBSCRIPTION_PLANS,
} from "@/constants/data/manage/store";
import { useAlertModal } from "@/hooks/useAlertModal";
import { cn, wait } from "@/lib/utils";
import { storeSchema } from "@/schema/manage/store";

export default function StoreModifyScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams();
	const isEdit = Boolean(params?.id);

	const [selectedPlan, setSelectedPlan] = React.useState("pro");

	const form = useForm({
		resolver: zodResolver(storeSchema),
		defaultValues: {
			name: "",
			phone: "",
			business_type: "",
			province: "",
			city: "",
			district: "",
			address: "",
			postal_code: "",
			plan: "pro",
		},
	});

	const confirmationModal = useAlertModal();
	const finishModal = useAlertModal();

	React.useEffect(() => {
		if (params?.id) {
			const store = STORE_ITEMS.find((item) => item.id === params.id);
			if (store) {
				form.reset({
					name: store.name,
					phone: store.phone,
					business_type: store.business_type,
					province: store.province,
					city: store.city,
					district: store.district,
					address: store.address,
					postal_code: store.postal_code,
					plan: store.plan || "pro",
				});
				setSelectedPlan(store.plan || "pro");
			} else {
				router.back();
			}
		}
	}, [params?.id, form]);

	function handleFormSubmit() {
		confirmationModal.open();
	}

	async function handleConfirmation() {
		confirmationModal.close();
		await wait(500);
		finishModal.open();
	}

	function handleFinishModalClose() {
		finishModal.close();
		router.back();
	}

	function handleSelectPlan(planId: string) {
		setSelectedPlan(planId);
		form.setValue("plan", planId);
	}

	return (
		<>
			<SuccessModal
				title={`Toko Berhasil ${isEdit ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan bisa mengatur cabang toko-mu dalam satu aplikasi!"
				openState={finishModal.openState}
				onClose={handleFinishModalClose}
				buttonText="Tutup"
			/>

			<StoreActionConfirmation
				onConfirm={handleConfirmation}
				openState={confirmationModal.openState}
				form={form}
			/>

			<View className="flex-1 bg-zinc-50">
				<Wrapper className="p-4" showsVerticalScrollIndicator={false}>
					<Card className="gap-5">
						<View className="gap-2">
							<Text size="normal" w="medium" className="text-foreground">
								Logo Toko
							</Text>
							<ImageUploader
								value={form.watch("logo")}
								onChange={(asset) => form.setValue("logo", asset)}
							/>
						</View>

						<Form {...form}>
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Toko</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan nama Toko" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={() => (
									<FormItem>
										<FormLabel required>Nomor Telepon Toko</FormLabel>
										<FormControl>
											<FormInput placeholder="81178862222" type="text" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="business_type"
								render={() => (
									<FormItem>
										<FormLabel required>Jenis Usaha</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih jenis usaha"
												data={BUSINESS_TYPE_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="province"
								render={() => (
									<FormItem>
										<FormLabel required>Provinsi</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih provinsi"
												data={PROVINCE_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="city"
								render={() => (
									<FormItem>
										<FormLabel required>Kota</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih kota"
												data={CITY_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="district"
								render={() => (
									<FormItem>
										<FormLabel required>Kecamatan</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih kecamatan"
												data={DISTRICT_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={() => (
									<FormItem>
										<FormLabel required>Alamat Toko</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Jl. Merdeka No. 123, Pekanbaru"
												leftIcon={{
													as: () => (
														<Feather
															name="map-pin"
															size={16}
															color={Colors.zinc[400]}
														/>
													),
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="postal_code"
								render={() => (
									<FormItem>
										<FormLabel required>Kode Pos</FormLabel>
										<FormControl>
											<FormInput placeholder="28282" type="number" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</Form>
					</Card>

					{/* Subscription Section */}
					<View className="mt-6 gap-3">
						<Text size="normal" w="bold" className="text-foreground">
							Pilih Paket Kasikoo Kamu
						</Text>

						{SUBSCRIPTION_PLANS.map((plan) => {
							const isSelected = selectedPlan === plan.id;
							return (
								<Pressable
									key={plan.id}
									onPress={() => handleSelectPlan(plan.id)}
									className={cn(
										"rounded-xl border p-4 transition-all",
										isSelected
											? "border-primary bg-primary-50/20"
											: "border-zinc-200 bg-white",
									)}
								>
									{/* Header: Name, Badge, Radio/Check */}
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center gap-2">
											<Text
												w="bold"
												size="body"
												className={
													isSelected ? "text-primary" : "text-foreground"
												}
											>
												{plan.name}
											</Text>
											<View className="rounded-full bg-blue-50 px-2 py-0.5">
												<Text
													w="semibold"
													size="small"
													className="text-primary"
												>
													{plan.badge}
												</Text>
											</View>
										</View>

										<View
											className={cn(
												"size-5 items-center justify-center rounded",
												isSelected
													? "bg-primary"
													: "border border-zinc-300 bg-white",
											)}
										>
											{isSelected && (
												<Feather name="check" size={14} color="#FFFFFF" />
											)}
										</View>
									</View>

									{/* Price */}
									<View className="mt-2.5 flex-row items-baseline gap-1">
										<Text w="bold" size="body" className="text-foreground">
											{plan.price}
										</Text>
										<Text size="small" className="text-muted">
											{plan.period}
										</Text>
									</View>

									{/* Trial Tag */}
									<View className="mt-2 self-start rounded-full bg-emerald-50 px-2 py-0.5">
										<Text w="medium" size="small" className="text-emerald-600">
											{plan.trial}
										</Text>
									</View>

									{/* Features */}
									<View className="mt-3.5 gap-2 border-t border-zinc-100 pt-3">
										{plan.features.map((feature) => (
											<View
												key={`${plan.id}-${feature}`}
												className="flex-row items-center gap-2"
											>
												<View className="size-4 items-center justify-center rounded bg-primary">
													<Feather name="check" size={10} color="#FFFFFF" />
												</View>
												<Text size="small" className="text-foreground">
													{feature}
												</Text>
											</View>
										))}
									</View>

									{/* Footer Note */}
									<Text size="small" className="mt-3 text-muted">
										{plan.note}
									</Text>
								</Pressable>
							);
						})}
					</View>

					<View className="h-4" />
				</Wrapper>

				<View
					className="border-t border-zinc-200/50 bg-white px-4 pt-3"
					style={{ paddingBottom: Math.max(insets.bottom, 16) }}
				>
					<Button
						size="xl"
						className="h-12 w-full rounded-xl bg-primary"
						onPress={form.handleSubmit(handleFormSubmit)}
					>
						<ButtonText size="md" className="font-semibold text-white">
							Simpan
						</ButtonText>
					</Button>
				</View>
			</View>
		</>
	);
}
