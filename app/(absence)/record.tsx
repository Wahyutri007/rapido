import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Image, Pressable, View } from "react-native";
import { useStoresQuery } from "@/api/hooks/stores";
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
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import GpsMapPreview from "@/components/custom/GpsMapPreview";
import { Button, ButtonText } from "@/components/ui/button";
import {
	type AbsenceRecordFormData,
	absenceRecordSchema,
} from "@/schema/absence";
import { useAbsenceStore } from "@/store/useAbsenceStore";
import { useActiveStore } from "@/store/useActiveStore";

export default function AbsenceRecordScreen() {
	const params = useLocalSearchParams<{ type?: "in" | "out" }>();
	const isCheckOut = params.type === "out";

	const { activeStoreId } = useActiveStore();
	const storesQuery = useStoresQuery();
	const { draftSelfie, addRecord } = useAbsenceStore();

	const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
	const [isLocating, setIsLocating] = React.useState(false);

	// Live device GPS coordinates (initial fallback Tanah Abang Jakarta)
	const [locationCoords, setLocationCoords] = React.useState({
		latitude: -6.1895,
		longitude: 106.8152,
	});

	const storeOptions = React.useMemo(() => {
		if (!storesQuery.data) return [];
		return storesQuery.data.map((store) => ({
			label: store.name,
			value: store.id.toString(),
		}));
	}, [storesQuery.data]);

	const form = useForm<AbsenceRecordFormData>({
		resolver: zodResolver(absenceRecordSchema),
		defaultValues: {
			store_id: activeStoreId ? activeStoreId.toString() : "",
			location_name: "Tanah Abang, Jakarta",
			latitude: "-6.1895000",
			longitude: "106.8152000",
			description: "Muka gua gtg,jadikan saya ceo",
			photo_uri: draftSelfie || "",
		},
	});

	// Request actual GPS coordinates and reverse geocode address
	const fetchCurrentLocation = React.useCallback(async () => {
		try {
			setIsLocating(true);
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.log("Izin lokasi GPS tidak diberikan");
				return;
			}

			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			const { latitude, longitude } = location.coords;
			setLocationCoords({ latitude, longitude });
			form.setValue("latitude", latitude.toFixed(7));
			form.setValue("longitude", longitude.toFixed(7));

			// Reverse geocode to get street / district name
			const addresses = await Location.reverseGeocodeAsync({
				latitude,
				longitude,
			});

			if (addresses && addresses.length > 0) {
				const addr = addresses[0];
				const parts = [
					addr.street || addr.name,
					addr.subregion || addr.district || addr.city,
					addr.region,
				].filter(Boolean);

				if (parts.length > 0) {
					form.setValue("location_name", parts.join(", "));
				}
			}
		} catch (error) {
			console.warn("Gagal mendeteksi GPS lokasi:", error);
		} finally {
			setIsLocating(false);
		}
	}, [form]);

	React.useEffect(() => {
		fetchCurrentLocation();
	}, [fetchCurrentLocation]);

	// Synchronize draft selfie into form state
	React.useEffect(() => {
		if (draftSelfie) {
			form.setValue("photo_uri", draftSelfie, {
				shouldValidate: true,
				shouldDirty: true,
			});
		}
	}, [draftSelfie, form]);

	const photoUri = form.watch("photo_uri");

	const onSubmit = (data: AbsenceRecordFormData) => {
		const selectedStore = storeOptions.find(
			(s) => s.value === data.store_id,
		)?.label;

		const now = new Date();
		const hours = now.getHours().toString().padStart(2, "0");
		const minutes = now.getMinutes().toString().padStart(2, "0");
		const currentTime = `${hours}:${minutes}`;

		const monthNames = [
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
		const formattedDate = `${now.getDate().toString().padStart(2, "0")} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

		addRecord({
			date: formattedDate,
			checkIn: isCheckOut ? "17:00" : currentTime,
			checkOut: isCheckOut ? currentTime : "-",
			storeName: selectedStore || "Cabang Utama",
			photoUri: data.photo_uri,
			locationName: data.location_name,
		});

		setIsSuccessModalOpen(true);
	};

	const handleSuccessModalConfirm = () => {
		setIsSuccessModalOpen(false);
		router.replace("/(absence)/home");
	};

	return (
		<>
			<SuccessModal
				isOpen={isSuccessModalOpen}
				title="Absensi Berhasil"
				message={`Absensi ${isCheckOut ? "keluar" : "masuk"} Anda telah berhasil disimpan.`}
				onButtonPress={handleSuccessModalConfirm}
				onClose={() => setIsSuccessModalOpen(false)}
				confirmText="Selesai"
			/>

			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Form {...form}>
						{/* Pilih Toko */}
						<FormField
							control={form.control}
							name="store_id"
							render={() => (
								<FormItem>
									<FormLabel required>Pilih Toko</FormLabel>
									<FormControl>
										<FormSelect
											data={
												storeOptions.length > 0
													? storeOptions
													: [{ label: "Pilih Toko", value: "" }]
											}
											placeholder="Pilih Toko"
											size="xl"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Foto Selfie */}
						<FormField
							control={form.control}
							name="photo_uri"
							render={() => (
								<FormItem>
									<FormLabel required>Foto Selfie</FormLabel>
									<View className="flex-row items-center gap-3">
										<Button
											action="primary"
											size="lg"
											className="h-12 rounded-xl px-4 flex-row items-center gap-2"
											onPress={() => router.push("/(absence)/camera")}
										>
											<Feather name="camera" size={18} color="white" />
											<ButtonText className="text-white font-medium">
												Ambil Foto
											</ButtonText>
										</Button>

										<Pressable
											onPress={() => router.push("/(absence)/camera")}
											className="size-16 items-center justify-center rounded-xl border border-dashed border-primary bg-primary-50/40 overflow-hidden"
										>
											{photoUri ? (
												<Image
													source={{ uri: photoUri }}
													className="size-full"
													resizeMode="cover"
												/>
											) : (
												<Text
													size="small"
													w="medium"
													className="text-xs text-primary text-center px-1"
												>
													Tidak Ada
												</Text>
											)}
										</Pressable>
									</View>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Lokasi & Interactive GPS Map */}
						<FormField
							control={form.control}
							name="location_name"
							render={() => (
								<FormItem>
									<FormLabel required>Lokasi</FormLabel>
									<FormControl>
										<FormInput placeholder="Nama lokasi..." />
									</FormControl>

									{/* Real Map Preview with OpenStreetMap free tile overlay */}
									<GpsMapPreview
										latitude={locationCoords.latitude}
										longitude={locationCoords.longitude}
										isLocating={isLocating}
										onRefresh={fetchCurrentLocation}
									/>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Latitude & Longitude */}
						<View className="flex-row items-center gap-3">
							<View className="flex-1">
								<FormField
									control={form.control}
									name="latitude"
									render={() => (
										<FormItem>
											<FormLabel required>Latitude</FormLabel>
											<FormControl>
												<FormInput placeholder="Latitude" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</View>

							<View className="flex-1">
								<FormField
									control={form.control}
									name="longitude"
									render={() => (
										<FormItem>
											<FormLabel required>Longitude</FormLabel>
											<FormControl>
												<FormInput placeholder="Longitude" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</View>
						</View>

						{/* Deskripsi */}
						<FormField
							control={form.control}
							name="description"
							render={() => (
								<FormItem>
									<FormLabel>Deskripsi</FormLabel>
									<FormControl>
										<FormInput placeholder="Tambahkan catatan keterangan..." />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</Form>
				</Card>
			</Wrapper>

			{/* Sticky Bottom Action */}
			<BottomActionButton
				isDisabled={!photoUri}
				onPress={form.handleSubmit(onSubmit)}
			>
				Simpan
			</BottomActionButton>
		</>
	);
}
