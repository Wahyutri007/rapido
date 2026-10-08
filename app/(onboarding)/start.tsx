import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, View } from "react-native";
import { IMAGES } from "@/assets/images";
import Text from "@/components/common/Text";
import { AuthBackgroundImage, AuthContainer, KasikooLogo } from "@/components/feature/auth/shared";
import { EEntypo, EFontAwesome, EMaterial } from "@/components/icons";
import {
	Button,
	ButtonGroup,
	ButtonIcon,
	ButtonText,
} from "@/components/ui/button";

export default function StartScreen() {
	const router = useRouter();

	return (
		<View className="h-screen">
			<KasikooLogo />

			<StatusBar style="light" />
			<AuthBackgroundImage />

			<AuthContainer>
				{/* Make this more smoother at some point */}
				<View>
					<Text className="text-center" w="bold">
						Kelola Bisnismu{" "}
						<Text className="text-primary" w="bold">
							Lebih Mudah
						</Text>
					</Text>
					<Text className="text-center text-muted mt-2" size="small">
						Pantau penjualan, kelola stok, dan proses transaksi dengan cepat
						dalam satu sistem yang simpel dan efisien.
					</Text>
				</View>

				<ButtonGroup space="md" className="mt-8">
					<Button size="xl" onPress={() => router.push("/register")}>
						<ButtonIcon as={EFontAwesome} name="user-o" size="sm" />
						<ButtonText size="md" className="mx-auto">
							Buat Akun
						</ButtonText>
						<ButtonIcon as={EEntypo} name="chevron-right" size="sm" />
					</Button>
					<Button
						size="xl"
						variant="outline"
						onPress={() => router.push("/login")}
					>
						<ButtonIcon as={EMaterial} name="login" size="sm" />
						<ButtonText size="md" className="mx-auto">
							Masuk
						</ButtonText>
						<ButtonIcon as={EEntypo} name="chevron-right" size="sm" />
					</Button>
				</ButtonGroup>
			</AuthContainer>
		</View>
	);
}
