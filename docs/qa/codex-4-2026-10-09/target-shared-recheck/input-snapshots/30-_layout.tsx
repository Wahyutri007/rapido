import { Tabs, usePathname } from "expo-router";
import Header from "@/components/common/Header";
import BottomTab from "@/components/custom/BottomTab";
import { EFeather, EMaterial, Inventory, Report } from "@/components/icons";

export default function HomeLayout() {
	const pathname = usePathname();
	return (
		<Tabs
			tabBar={(props) => (
				<BottomTab
					{...props}
					appearance={
						pathname === "/inventory/closing-stock" ? "figma" : "default"
					}
				/>
			)}
		>
			<Tabs.Screen
				name="home"
				options={{
					headerShown: false,
					tabBarLabel: "Beranda",
					tabBarIcon: (props) => <EFeather name="home" {...props} />,
				}}
			/>
			<Tabs.Screen
				name="report"
				options={{
					title: "Laporan",
					headerShown: false,
					tabBarLabel: "Laporan",
					tabBarIcon: (props) => <Report {...props} />,
				}}
			/>
			<Tabs.Screen
				name="catalog"
				options={{
					headerShown: false,
					tabBarLabel: "Katalog",
					tabBarIcon: (props) => <EMaterial name="list-alt" {...props} />,
				}}
			/>
			<Tabs.Screen
				name="inventory"
				options={{
					headerShown: false,
					tabBarLabel: "Inventory",
					tabBarIcon: (props) => <Inventory {...props} />,
				}}
			/>
			<Tabs.Screen
				name="manage"
				options={{
					header: () => <Header title="Kelola" back />,
					tabBarLabel: "Kelola",
					tabBarIcon: (props) => <EMaterial name="storefront" {...props} />,
				}}
			/>
		</Tabs>
	);
}
