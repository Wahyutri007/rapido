import Feather from "@expo/vector-icons/Feather";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React from "react";
import {
	ActivityIndicator,
	Image,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";
import { useAbsenceStore } from "@/store/useAbsenceStore";

export default function AbsenceCameraScreen() {
	const [expoPermission, requestExpoPermission] = useCameraPermissions();
	const [isCameraReady, setIsCameraReady] = React.useState(false);
	const [capturedPhoto, setCapturedPhoto] = React.useState<string | null>(null);
	const [isCapturing, setIsCapturing] = React.useState(false);

	const expoCameraRef = React.useRef<CameraView>(null);
	const isCapturingRef = React.useRef(false);
	const { setDraftSelfie } = useAbsenceStore();

	const hasPermission = expoPermission?.granted;

	// Manual photo capture handler
	const takeAttendancePhoto = React.useCallback(async () => {
		if (isCapturingRef.current || !expoCameraRef.current) return;
		isCapturingRef.current = true;
		setIsCapturing(true);

		try {
			const photo = await expoCameraRef.current.takePictureAsync({
				quality: 0.85,
				skipProcessing: true,
				shutterSound: true,
			});

			if (photo?.uri) {
				haptic.success();
				setCapturedPhoto(photo.uri);
			}
		} catch (error) {
			console.warn("Gagal memotret:", error);
			haptic.warning();
		} finally {
			setIsCapturing(false);
			isCapturingRef.current = false;
		}
	}, []);

	const handleRetake = () => {
		isCapturingRef.current = false;
		setCapturedPhoto(null);
		setIsCapturing(false);
	};

	const handleSave = () => {
		if (capturedPhoto) {
			setDraftSelfie(capturedPhoto);
			router.back();
			return;
		}

		if (isCameraReady && !isCapturingRef.current) {
			takeAttendancePhoto();
		}
	};

	// Camera permission enforcement: camera usage is strictly mandatory
	if (!hasPermission) {
		return (
			<Wrapper isNotScrollable className="flex-1 bg-white">
				<View className="flex-1 items-center justify-center p-6 gap-4">
					<View className="size-16 items-center justify-center rounded-full bg-primary-50">
						<Feather name="camera" size={32} color="#2563eb" />
					</View>
					<Text size="normal" w="bold" className="text-center text-foreground">
						Kamera Wajib Digunakan
					</Text>
					<Text size="small" className="text-center text-muted px-4">
						Fitur absensi mewajibkan penggunaan kamera perangkat secara langsung untuk mengambil foto kehadiran. Akses kamera tidak dapat dilewati.
					</Text>
					<View className="flex-row items-center gap-3 mt-2">
						<Button
							size="lg"
							variant="outline"
							className="rounded-full px-5 border-border-muted"
							onPress={() => router.back()}
						>
							<ButtonText className="text-foreground font-medium">
								Kembali
							</ButtonText>
						</Button>
						<Button
							size="lg"
							action="primary"
							className="rounded-full px-6"
							onPress={requestExpoPermission}
						>
							<ButtonText className="text-white font-semibold">
								Izinkan Kamera
							</ButtonText>
						</Button>
					</View>
				</View>
			</Wrapper>
		);
	}

	return (
		<Wrapper isNotScrollable className="flex-1 bg-white">
			<View className="flex-1 px-4 py-3 justify-between">
				{/* Top Instruction Prompt */}
				<View className="items-center py-2">
					<Text size="normal" w="semibold" className="text-foreground">
						{capturedPhoto ? "Hasil Foto Kehadiran" : "Foto Kehadiran"}
					</Text>
				</View>

				{/* Camera Live Viewport Frame */}
				<View className="flex-1 my-2 overflow-hidden rounded-2xl bg-black relative">
					{/* Live Camera View (Always mounted and visible until photo is taken) */}
					{!capturedPhoto ? (
						<CameraView
							ref={expoCameraRef}
							facing="front"
							style={StyleSheet.absoluteFillObject}
							onCameraReady={() => setIsCameraReady(true)}
						/>
					) : (
						<Image
							source={{ uri: capturedPhoto }}
							style={StyleSheet.absoluteFillObject}
							resizeMode="cover"
						/>
					)}

					{/* Biometric Oval Guide Overlay (Visible during live feed) */}
					{!capturedPhoto && (
						<View
							style={StyleSheet.absoluteFillObject}
							className="items-center justify-center pointer-events-none"
						>
							{/* Biometric Oval Guide Reticle */}
							<View className="w-60 h-80 rounded-full border-2 border-dashed border-white/80 items-center justify-center bg-transparent" />

							{/* Status Guidance Badge */}
							<View className="absolute bottom-6 flex-row items-center gap-2 rounded-full bg-black/75 px-4 py-2 border border-white/20">
								{isCapturing ? (
									<>
										<ActivityIndicator size="small" color="#ffffff" />
										<Text size="small" className="text-white font-medium">
											Memotret kehadiran...
										</Text>
									</>
								) : (
									<>
										<View className="size-2.5 rounded-full bg-primary-400" />
										<Text size="small" className="text-white font-medium">
											Posisikan wajah Anda pada oval dan tatap kamera
										</Text>
									</>
								)}
							</View>
						</View>
					)}

					{/* Prominent Live Shutter Button (Active when preview feed is running) */}
					{!capturedPhoto && isCameraReady && !isCapturing && (
						<View className="absolute bottom-16 w-full items-center">
							<Pressable
								onPress={takeAttendancePhoto}
								className="size-20 rounded-full border-4 border-white items-center justify-center bg-white/25 active:scale-95 transition-all shadow-lg"
							>
								<View className="size-14 rounded-full bg-white items-center justify-center">
									<Feather name="camera" size={24} color="#18181b" />
								</View>
							</Pressable>
						</View>
					)}

					{/* Success Badge when Photo is Captured */}
					{capturedPhoto && (
						<View className="absolute top-4 w-full items-center px-4">
							<View className="flex-row items-center gap-2 rounded-full bg-success-500 px-4 py-2 shadow-sm">
								<Feather name="check-circle" size={16} color="white" />
								<Text size="small" className="text-white font-semibold">
									Foto Berhasil Diambil
								</Text>
							</View>
						</View>
					)}
				</View>

				{/* Bottom Action Button */}
				<View className="py-2 gap-2">
					{capturedPhoto && (
						<Button
							size="lg"
							variant="outline"
							className="h-11 w-full rounded-full border-border-muted"
							onPress={handleRetake}
						>
							<ButtonText className="text-foreground font-semibold">
								Foto Ulang
							</ButtonText>
						</Button>
					)}
					<Button
						size="xl"
						action="primary"
						className="h-12 w-full rounded-full"
						onPress={handleSave}
						isDisabled={!capturedPhoto && !isCameraReady}
					>
						<ButtonText className="text-base font-semibold text-white">
							{capturedPhoto ? "Simpan Foto" : "Ambil Foto"}
						</ButtonText>
					</Button>
				</View>
			</View>
		</Wrapper>
	);
}
