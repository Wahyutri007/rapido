import { router } from "expo-router";
import type React from "react";
import { Image, Pressable, View } from "react-native";
import { IMAGES } from "@/assets/images";
import Text from "@/components/common/Text";
import { EFontAwesome6 } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { FONT_NAMES } from "@/constants/Fonts";
import { styles, tw } from "@/lib/utils";

export function AuthContainer(props: React.ComponentProps<typeof View>) {
	return (
		<View className="-mt-6">
			{/* Circle Glow */}
			<View className="items-center">
				<View
					className="bg-white p-3 rounded-full absolute -mt-6"
					style={styles.primaryGlow}
				>
					<View className="bg-primary size-12 items-center justify-center rounded-full"></View>
				</View>
			</View>

			<View className="bg-white p-4 rounded-t-3xl " style={styles.primaryGlow}>
				{/* Inner Circle */}
				<View className="items-center">
					<View className="bg-white p-3 rounded-full absolute -mt-10">
						<View className="bg-primary size-12 items-center justify-center rounded-full">
							<EFontAwesome6 name="store" size={tw(6)} color="white" />
						</View>
					</View>
				</View>

				<View className="mt-8">{props.children}</View>

				<View className="mt-6">
					<View className="bg-primary/5 flex-row justify-center items-center p-4 rounded-lg">
						<Text w="medium" size="normal">
							Belum punya akun?{" "}
						</Text>
						<Pressable
							className="flex-row gap-2 items-center"
							onPress={() => router.push("/(onboarding)/register")}
						>
							<Text className="text-primary" w="medium" size="normal">
								Daftar Ocean
							</Text>
							<EFontAwesome6
								name="chevron-right"
								size={tw(2)}
								color={Colors.primary}
							/>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	);
}

export function AuthBackgroundImage() {
	return (
		<Image
			source={IMAGES.login_portrait}
			className="w-full"
			style={{ height: 240 }}
			resizeMode="cover"
		/>
	);
}

export function KasikooLogo() {
	return (
		<View className="absolute bg-white px-6 py-2 right-0 top-8 z-10 rounded-l-full">
			<Text
				style={{ fontFamily: FONT_NAMES.logo }}
				className="text-primary text-2xl"
			>
				Kasikoo
			</Text>
		</View>
	);
}
