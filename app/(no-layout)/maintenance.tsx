import React from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApiHealthData } from "@/api/hooks/misc";
import { useAuth } from "@/context/AuthContext";
import { useNavigateAuthenticated } from "@/hooks/useNavigateAuthenticated";
import { IMAGES } from "@/assets/images";
import Text from "@/components/common/Text";
import { EFeather } from "@/components/icons";
import {
	Button,
	ButtonGroup,
	ButtonIcon,
	ButtonText,
} from "@/components/ui/button";

export default function Maintenance() {
	const router = useRouter();
	const auth = useAuth();
	const navigateAuthenticated = useNavigateAuthenticated();
	const apiHealthQuery = useApiHealthData();
	const [isChecking, setIsChecking] = React.useState(false);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

	async function handleRefresh() {
		setIsChecking(true);
		setErrorMessage(null);

		try {
			const res = await apiHealthQuery.refetch();

			if (res.data?.status === "online") {
				const isAuthenticated = await auth.reloadAuth();
				if (isAuthenticated) {
					navigateAuthenticated();
				} else {
					router.replace("/");
				}
			} else {
				setErrorMessage(
					"Sistem masih dalam perbaikan, silakan coba beberapa saat lagi.",
				);
			}
		} catch {
			setErrorMessage(
				"Gagal terhubung ke server, silakan periksa koneksi Anda dan coba lagi.",
			);
		} finally {
			setIsChecking(false);
		}
	}

	return (
		<SafeAreaView className="flex-1 items-center justify-center bg-white">
			<View className="w-full px-12">
				<Image
					source={IMAGES.illustrations.maintenance}
					className="mx-auto aspect-square w-[100%]"
					style={{
						height: "auto",
						resizeMode: "contain",
					}}
				/>
				<Text className="mt-6 text-center">
					Maaf, aplikasi sedang dalam perbaikan, silakan kembali lagi nanti
				</Text>

				<ButtonGroup className="mt-8">
					<Button
						size="xl"
						className="w-full"
						onPress={handleRefresh}
						loading={isChecking}
					>
						<ButtonIcon as={EFeather} name="refresh-cw" size="sm" />
						<ButtonText size="md">Coba Lagi</ButtonText>
					</Button>
				</ButtonGroup>

				{errorMessage ? (
					<Text className="mt-3 text-center text-destructive" size="small">
						{errorMessage}
					</Text>
				) : null}
			</View>
		</SafeAreaView>
	);
}

