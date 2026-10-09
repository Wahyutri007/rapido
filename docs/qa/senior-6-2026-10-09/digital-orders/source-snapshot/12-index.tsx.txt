import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Colors } from "@/constants/Colors";
import { route } from "@/lib/utils";

type MenuItemProps = {
	title: string;
	icon: React.ReactNode;
	onPress: () => void;
	isLast?: boolean;
};

function MenuItem({ title, icon, onPress, isLast = false }: MenuItemProps) {
	return (
		<BouncyPressable
			onPress={onPress}
			activeScale={0.98}
			className={`flex-row items-center justify-between py-2 ${
				!isLast ? "border-b border-border-muted" : ""
			}`}
		>
			<View className="flex-row items-center gap-3">
				<View className="size-8 items-center justify-center rounded-lg bg-primary-100">
					{icon}
				</View>
				<Text w="semibold" size="normal" className="text-foreground">
					{title}
				</Text>
			</View>
			<Feather name="chevron-right" size={16} color={Colors.zinc[400]} />
		</BouncyPressable>
	);
}

export default function PosSettingsScreen() {
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card className="px-2 py-0">
				<MenuItem
					title="Pengaturan Batas Stok"
					icon={<Feather name="package" size={16} color={Colors.primary} />}
					onPress={() => router.push("/manage/pos-settings/stock-limit")}
				/>
				<MenuItem
					title="Pengaturan Pembulatan"
					icon={<FontAwesome6 name="store" size={15} color={Colors.primary} />}
					onPress={() => router.push("/manage/pos-settings/rounding")}
				/>
				<MenuItem
					title="Pemberitahuan Otomatis"
					icon={<Feather name="bell" size={16} color={Colors.primary} />}
					onPress={() => router.push("/manage/pos-settings/notifications")}
				/>

				<MenuItem
					title="Pesanan Digital"
					icon={<MaterialIcons name="storefront" size={16} color={Colors.primary} />}
					onPress={() => router.push(route("/manage/pos-settings/digital-orders"))}
					isLast
				/>
			</Card>
		</Wrapper>
	);
}
