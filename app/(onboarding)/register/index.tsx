import { useRouter } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import { IMAGES } from "@/assets/images";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";

export default function RegisterScreen() {
	const router = useRouter();

	function handleContinue() {
		router.push("/(onboarding)/register/wizard");
	}

	return (
		<>
			<Wrapper hasActionButton>
				<View className="grow px-8 pt-6">
					<Text className="text-base" w="semibold">
						Pendaftaran Akun Usaha
					</Text>
					<Text className="mt-4 text-zinc-500">
						Lengkapi data & dokumen yang diperlukan
					</Text>
				</View>
				<View className="mx-8 mt-4 rounded-xl bg-white px-4 py-5 shadow-xl">
					<Text className="text-blue-950" w="semibold">
						Berikut data & dokumen yang perlu kamu siapkan:
					</Text>
					<View className="mt-6 gap-6">
						<View className="flex-row items-center gap-4">
							<Image
								source={IMAGES.icons.mail}
								className="aspect-square w-7"
								style={{ objectFit: "contain" }}
							/>
							<Text>Email & nomor HP pemilik usaha</Text>
						</View>
						<View className="flex-row items-center gap-4">
							<Image
								source={IMAGES.icons.receipt}
								className="aspect-square w-7"
								style={{ objectFit: "contain" }}
							/>
							<Text>Nomor rekening</Text>
						</View>
					</View>
				</View>
			</Wrapper>
			<ButtonGroup className="absolute bottom-8 w-full px-8">
				<Button size="xl" onPress={handleContinue}>
					<ButtonText size="md">Lanjut</ButtonText>
				</Button>
			</ButtonGroup>
		</>
	);
}
