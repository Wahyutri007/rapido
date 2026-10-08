import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import dayjs from "dayjs";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import {
	TRANSACTIONS_ITEMS,
	TransactionItemProps,
} from "@/constants/data/transactions";
import useDayJS from "@/hooks/useDayJs";
import { cn } from "@/lib/utils";

export default function TransactionHistoryScreen() {
	const { formatDate } = useDayJS();

	const [dates, setDates] = React.useState<Date[] | null>(null);

	React.useEffect(() => {
		// Fetch transaction history from API or local storage
		async function fetchData() {
			const data = TRANSACTIONS_ITEMS;

			// Group by month and year and remove duplicate dates
			const groupedData = data.reduce(
				(acc, item) => {
					// Use intl
					const date = formatDate(item.date, "MMMM YYYY");

					const key = `${date}`;

					if (!acc[key]) {
						acc[key] = new Date(item.date);
					}

					return acc;
				},
				{} as Record<string, Date>,
			);

			// Remove duplicates
			const dates = Object.values(groupedData);

			setDates(dates);
		}

		fetchData();
	}, []);

	return (
		<ScrollView className="grow bg-gray-50 p-5">
			<Text className="text-primary" w="medium">
				Pilih Waktu
			</Text>

			<View className="mt-3 gap-3">
				{dates?.map((item, index) => (
					<Pressable
						key={index}
						onPress={() =>
							router.replace({
								pathname: "/home/transaction",
								params: {
									date: dayjs(item).format("YYYY-MM-DD"),
								},
							})
						}
					>
						{({ pressed }) => (
							<View
								className={cn(
									"flex-row items-center justify-between rounded-[20px] bg-white p-5",
									{
										"bg-gray-100": pressed,
									},
								)}
							>
								<View className="flex-row items-center gap-3">
									<Feather name="calendar" size={20} color={Colors.neutral} />
									<Text className="text-sm text-muted" w="regular">
										{formatDate(item, "MMMM YYYY")}
									</Text>
								</View>

								<View className="size-8 items-center justify-center">
									<Entypo
										name="chevron-small-right"
										size={20}
										color={Colors.zinc[400]}
									/>
								</View>
							</View>
						)}
					</Pressable>
				))}
			</View>

			<View className="h-24" />
		</ScrollView>
	);
}
