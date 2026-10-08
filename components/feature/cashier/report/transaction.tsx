import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import { BottomTabPadding } from "@/components/custom/BottomTab";
import { CardListGap, CardListSeparator } from "@/components/custom/CardList";
import { EAntDesign as AntDesign } from "@/components/icons";
import {
	Button,
	ButtonGroup,
	ButtonIcon,
	ButtonText,
} from "@/components/ui/button";
import { cn, tw } from "@/lib/utils";

type TransactionReportData = {
	code: string;
	source: string;
	created_by: string;
	created_at: string;
	amount: number;
};

type TransactionReportList = {
	date: string;
	data: TransactionReportData[];
};

const TRANSACTIONS: TransactionReportList[] = [
	{
		date: "19 Maret 2026",
		data: [
			{
				code: "INV-001",
				source: "Dine In",
				created_at: "12:00",
				created_by: "Ari",
				amount: 10000,
			},
			{
				code: "INV-001",
				source: "Dine In",
				created_at: "12:00",
				created_by: "Ari",
				amount: 10000,
			},
			{
				code: "INV-001",
				source: "Dine In",
				created_at: "12:00",
				created_by: "Ari",
				amount: 10000,
			},
			{
				code: "INV-001",
				source: "Dine In",
				created_at: "12:00",
				created_by: "Ari",
				amount: 10000,
			},
		],
	},
	{
		date: "18 Maret 2026",
		data: [
			{
				code: "INV-001",
				source: "Dine In",
				created_at: "12:00",
				created_by: "Ari",
				amount: -10000,
			},
		],
	},
];

function TransactionItem(props: TransactionReportData) {
	const { code, source, created_at, created_by, amount } = props;

	return (
		<View>
			<View className="self-start rounded-full bg-primary-100 px-3 py-1 text-primary-50">
				<Text className="text-xs text-primary">{code}</Text>
			</View>
			<View className="mt-2 flex-row gap-2">
				<View style={{ flex: 2 }}>
					<View className="flex-row items-center gap-2">
						<Text w="medium">
							{source}
						</Text>
						<Text className="text-xs text-zinc-500">•</Text>
						<Text className="text-xs text-zinc-500">{created_by}</Text>
					</View>
					<View className="mt-1">
						<Text className="text-xs text-zinc-500">{created_at} WIB</Text>
					</View>
				</View>
				<View style={{ flex: 1 }} className="items-end">
					<Text
						className={cn("", {
							"text-green-700": amount > 0,
							"text-red-700": amount < 0,
						})}
					>
						{amount.toLocaleString("id-ID", {
							style: "currency",
							currency: "IDR",
						})}
					</Text>

					{/* <Text className="mt-1 text-xs text-zinc-500">{created_at} WIB</Text> */}
				</View>
			</View>
		</View>
	);
}

function TransactionList({ data, date }: TransactionReportList) {
	return (
		<View className="gap-2">
			<Text className="text-zinc-500">{date}</Text>
			<View className="rounded-lg border border-zinc-200 p-3">
				<FlatList
					data={data}
					scrollEnabled={false}
					renderItem={({ item }) => <TransactionItem {...item} />}
					ItemSeparatorComponent={() => <CardListSeparator className="my-3" />}
				/>
			</View>
		</View>
	);
}

export default function TransactionView() {
	const [search, setSearch] = useState("");

	return (
		<View className="flex-1 gap-4 p-4">
			<View className="flex-row gap-2">
				<SearchBar
					size="sm"
					className="h-10 flex-1 rounded-xl"
					search={search}
					setSearch={setSearch}
				/>
				<ButtonGroup>
					<Button
						size="iconMd"
						className="rounded-lg"
						onPress={() => router.push("/report/expense-input")}
					>
						<ButtonIcon as={AntDesign} name="plus" />
					</Button>
				</ButtonGroup>
			</View>
			<FlatList
				data={TRANSACTIONS}
				renderItem={({ item }) => <TransactionList {...item} />}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="gap-4"
				ListFooterComponent={<BottomTabPadding />}
			/>
		</View>
	);
}
