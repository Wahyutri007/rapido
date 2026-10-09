import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import Header from "@/components/common/Header";
import BottomTab from "@/components/custom/BottomTab";
import { ReportIcon, Table } from "@/components/icons";

export default function CashierLayout() {
	return (
		<Tabs
			tabBar={(props: any) => <BottomTab {...props} appearance="cashier" />}
		>
			<Tabs.Screen
				name="home/index"
				options={{
					headerShown: false,
					tabBarLabel: "Beranda",
					tabBarIcon: ({ color }) => (
						<Feather name="home" size={24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="report"
				options={{
					headerShown: false,
					tabBarLabel: "Laporan",
					tabBarIcon: (props) => <ReportIcon {...props} />,
				}}
			/>
			<Tabs.Screen
				name="catalog"
				options={
					{
						customHref: "/(no-layout)/(cashier)/catalog",
						header: () => <Header back title="Katalog" />,
						tabBarLabel: "Katalog",
						tabBarIcon: ({ color }: { color: string }) => (
							<Feather name="grid" size={24} color={color} />
						),
					} as any
				}
			/>
			<Tabs.Screen
				name="location/index"
				options={{
					headerShown: false,
					tabBarLabel: "Tempat",
					tabBarIcon: (props) => <Table {...props} />,
				}}
			/>
			<Tabs.Screen
				name="biling"
				options={{
					headerShown: false,
					tabBarLabel: "Tagihan",
					tabBarIcon: ({ color }) => (
						<Feather name="file-text" size={24} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
