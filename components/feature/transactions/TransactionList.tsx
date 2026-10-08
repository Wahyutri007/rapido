import { router } from "expo-router";
import type React from "react";
import { FlatList, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import useDayJS from "@/hooks/useDayJs";
import { cn, formatRp } from "@/lib/utils";
import type { TransactionItemProps } from "@/types/ui/transaction/transaction";

function TransactionButton({
	onPress,
	children,
}: React.PropsWithChildren<{ onPress: () => void }>) {
	return (
		<Pressable onPress={onPress}>
			{({ pressed }) => (
				<View
					className={cn("rounded-lg border border-gray-200 p-2.5", {
						"bg-gray-200": pressed,
					})}
				>
					<Text className="text-xs text-muted">{children}</Text>
				</View>
			)}
		</Pressable>
	);
}

function TransactionItem(props: TransactionItemProps) {
	const {
		id,
		statuses,
		customer,
		date,
		orders,
		paymentMethod,
		table,
		total,
		transactionId,
	} = props;

	const { isFinished, isPaid } = statuses;

	const { formatDate } = useDayJS();

	function handleAddOrder() {
		alert("Add Order");
	}

	function handleFinishOrder() {
		alert("Finish Order");
	}

	function handlePayOrder() {
		alert("Pay Order");
	}

	function handleItemPress() {
		if (!isFinished || !isPaid) return;

		router.push({
			pathname: "/order-detail",
			params: {
				transactionId,
			},
		});
	}

	return (
		<Pressable onPress={handleItemPress}>
			{({ pressed }) => (
				<View
					className={cn("border-b border-gray-200 bg-white p-5", {
						"bg-gray-100": isFinished && isPaid && pressed,
					})}
				>
					<View className="flex-row gap-2">
						<View
							className={cn("rounded px-[5px] py-[3px]", {
								"bg-primary-400": isPaid,
								"bg-success-200": isFinished && isPaid,
								"bg-warning-200": !isPaid,
							})}
						>
							<Text className="text-xs text-white" w="semibold">
								{!isFinished ? "Pesanan Diproses" : "Pesanan Selesai"}
							</Text>
						</View>
						{!isPaid && (
							<View className={cn("rounded bg-warning-200 px-[5px] py-[3px]")}>
								<Text className="text-xs text-white" w="semibold">
									Belum Dibayar
								</Text>
							</View>
						)}
					</View>
					<View className="mt-2 flex-row justify-between">
						<Text className="text-sm text-gray-900" w="bold">
							Meja #{table} / {customer}
						</Text>
						<Text
							className={cn("text-xs text-muted", {
								"text-success-300": isFinished && isPaid,
							})}
						>
							{isFinished && isPaid && "Selesai Pada"}{" "}
							{formatDate(date, "DD/MM/YYYY")}
						</Text>
					</View>
					<View className="mt-2 flex-row items-center gap-1">
						<Text className="text-xs">{formatRp(total)}</Text>
						<View className="size-1 rounded-full bg-gray-200" />
						<Text className="text-xs">{paymentMethod.name}</Text>
						<View className="size-1 rounded-full bg-gray-200" />
						<Text className="text-xs">
							{orders.length} Pesanan
						</Text>
					</View>
					<View className="mt-2 gap-1">
						{orders.map((order, index) => (
							<Text key={index} className="text-xs text-muted">
								{order.menu.name} x{order.amount}
							</Text>
						))}
					</View>
					<View className="mt-3 flex-row justify-end gap-1.5">
						{(!isFinished || !isPaid) && (
							<TransactionButton onPress={handleAddOrder}>
								Tambah Pesanan
							</TransactionButton>
						)}

						{!isFinished && (
							<TransactionButton onPress={handleFinishOrder}>
								Pesanan Selesai
							</TransactionButton>
						)}

						{!isPaid && (
							<TransactionButton onPress={handlePayOrder}>
								Bayar Sekarang
							</TransactionButton>
						)}
					</View>
				</View>
			)}
		</Pressable>
	);
}

export default function TransactionList({
	data,
}: {
	data: TransactionItemProps[] | null;
}) {
	return (
		<FlatList
			data={data}
			renderItem={({ item }) => <TransactionItem {...item} />}
			horizontal={false}
		/>
	);
}
