import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { ICONS } from "@/assets/images/icons";
import Text from "@/components/common/Text";
import { ManageMenuIcon } from "@/components/feature/manage/ManageMenuIcon";
import { route } from "@/lib/utils";

const MAIN_MENU = [
	{
		name: "Transaksi",
		icon: ICONS.transaction,
		href: route("/transaction"),
	},
	{
		name: "Member",
		icon: null,
		href: route("/(no-layout)/manage/member"),
	},
	{
		name: "Stok",
		icon: ICONS.stock,
		href: route("/stock"),
	},
	{
		name: "Riwayat Shift",
		icon: ICONS.shift,
		href: route("/shift"),
	},
	{
		name: "Printer",
		icon: ICONS.printer,
		href: route("/(no-layout)/manage/printer"),
	},
	{
		name: "Scanner",
		icon: ICONS.scanner,
		href: route("/scanner"),
	},
	{
		name: "Laci Kasir",
		icon: ICONS.cash_drawer,
		href: route("/cash-drawer"),
	},
	{
		name: "Pengaturan",
		icon: ICONS.settings,
		href: route("/(no-layout)/manage/pos-settings"),
	},
];

type MenuItemProps = (typeof MAIN_MENU)[0];

function MenuItem(props: MenuItemProps) {
	const { href, icon, name } = props;

	return (
		<Pressable
			onPress={() => router.push(href)}
			accessibilityRole="button"
			accessibilityLabel={name}
			className="items-center gap-2"
			style={{ flex: 1, minWidth: 0, minHeight: 64 }}
		>
			{icon ? (
				<Image
					source={icon}
					resizeMode="contain"
					style={{ width: 40, height: 40 }}
				/>
			) : (
				<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
					<ManageMenuIcon name="member" />
				</View>
			)}
			{/* Labels can use 4px of the 16px gutter on each side. */}
			<Text
				size="small"
				className="text-center"
				style={{ alignSelf: "stretch", marginHorizontal: -4 }}
			>
				{name}
			</Text>
		</Pressable>
	);
}

export default function MainMenu() {
	return (
		<View className="shrink-0">
			<View testID="cashier-favorites-grid" className="gap-4">
				{[MAIN_MENU.slice(0, 4), MAIN_MENU.slice(4)].map((row) => (
					<View key={row[0].name} className="flex-row gap-4">
						{row.map((item) => (
							<MenuItem key={item.name} {...item} />
						))}
					</View>
				))}
			</View>
		</View>
	);
}
