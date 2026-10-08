import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
	router,
	useGlobalSearchParams,
	useLocalSearchParams,
} from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import {
	TRANSACTIONS_ITEMS,
	type TransactionItemProps,
} from "@/constants/data/transactions";
import useDayJS from "@/hooks/useDayJs";
import { cn } from "@/lib/utils";

function TransactionItem(props: {
	item: TransactionItemProps;
	type?: "report" | "transaction";
}) {
	const { item, type } = props;

	const { formatDate } = useDayJS();

	function handleCheckPress() {
		alert("Check Pressed for " + item.title);
	}

	function handleTransactionPress() {
		router.push("/cart/confirm" as any);
	}

	return (
		<Pressable onPress={handleTransactionPress}>
			{({ pressed }) => (
				<View
					className={cn("flex-row gap-3 rounded-3xl px-2.5 py-3", {
						"bg-gray-100": type === "report",
						"bg-gray-50": type === "transaction",
						"bg-gray-200": pressed,
					})}
				>
					<Pressable
						onPress={handleCheckPress}
						className="my-auto size-[30px] items-center justify-center rounded-full bg-white"
					>
						<FontAwesome6 name="check" size={16} color={Colors.primary} />
					</Pressable>
					<View className="grow">
						<Text className="text-xs text-muted">
							{formatDate(item.date, "d/M/YYYY HH:mm:ss")}
						</Text>
						<View className="mt-2.5 flex-row items-center justify-between">
							<View className="gap-1.5">
								<Text className="text-sm text-gray-800" w="medium">
									{item.title}
								</Text>
								<Text className="text-xs">
									Order No. {item.orderNo}
								</Text>
								<Text className="text-xs">
									{item.itemAmount} Item
								</Text>
							</View>
							<View className="flex-row items-center gap-1.5">
								<Text className="text-sm text-gray-800" w="semibold">
									Rp {item.amount.toLocaleString()}
								</Text>
								<Entypo
									name="chevron-small-right"
									size={20}
									color={Colors.zinc[400]}
								/>
							</View>
						</View>
					</View>
				</View>
			)}
		</Pressable>
	);
}

export default function NewestTransaction({
	title,
	type = "report",
	data,
}: {
	title: string;
	type?: "report" | "transaction";
	data: TransactionItemProps[];
}) {
	const params = useLocalSearchParams();
	const { formatDate } = useDayJS();

	function handleNewestTransactionPress() {
		if (type === "transaction") {
			router.push("/home/transaction-history");
		} else {
			router.push("/home/transaction");
		}
	}

	// Group transactions by day, using a format with this example: "13 April 2025"
	const groupedTransactions =
		type === "transaction"
			? data.reduce(
					(acc, curr) => {
						// Filter only by params.date
						if (params.date) {
							// Check if the date is the same month and year as params.date
							const date = new Date(curr.date);
							const paramsDate = new Date(params.date as string);
							if (
								date.getMonth() !== paramsDate.getMonth() ||
								date.getFullYear() !== paramsDate.getFullYear()
							) {
								return acc;
							}
						}

						const date = new Date(curr.date).toLocaleDateString("id-ID", {
							day: "numeric",
							month: "long",
							year: "numeric",
						});

						const key = `${date}`;
						if (!acc[key]) {
							acc[key] = [];
						}
						acc[key].push(curr);
						return acc;
					},
					{} as Record<string, TransactionItemProps[]>,
				)
			: null;

	const viewTitle = params?.date
		? formatDate(params.date as string, "MMMM YYYY")
		: title;

	return (
		<View
			className={cn("rounded-[20px] p-5", {
				"bg-white": type === "report",
			})}
		>
			<View className="flex-row items-center justify-between">
				<Text className="text-gray-900" w="semibold">
					{viewTitle}
				</Text>
				<Pressable
					onPress={handleNewestTransactionPress}
					className={cn("items-center justify-center", {
						"size-8": type === "report",
					})}
				>
					{type === "transaction" ? (
						<Text className="text-xs text-primary" w="medium">
							Lihat Riwayat
						</Text>
					) : (
						<Entypo
							name="chevron-small-right"
							size={24}
							color={Colors.zinc[400]}
						/>
					)}
				</Pressable>
			</View>
			<View className="mt-5 gap-2">
				{type === "transaction" ? (
					<View>
						{Object.entries(groupedTransactions!).map(
							([date, transactions]) => (
								<View key={date} className="mb-2">
									<View className="rounded-[10px] bg-primary-400 px-5 py-1">
										<Text className="text text-gray-50" w="semibold">
											{date}
										</Text>
									</View>
									{transactions.map((transaction) => (
										<TransactionItem
											key={transaction.id}
											item={transaction}
											type="transaction"
										/>
									))}
								</View>
							),
						)}
					</View>
				) : (
					data.map((transaction) => (
						<TransactionItem
							key={transaction.id}
							item={transaction}
							type="report"
						/>
					))
				)}
			</View>
		</View>
	);
}
