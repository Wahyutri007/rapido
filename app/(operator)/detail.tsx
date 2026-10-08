import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOperatorStore } from "@/store/useOperatorStore";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function OperatorOrderDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const { orders, processItem, completeOrder } = useOperatorStore();

	const order = orders.find((o) => o.id === params.id) || orders[0];

	if (!order) {
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<Text size="normal" className="text-center text-muted">
					Pesanan tidak ditemukan
				</Text>
			</Wrapper>
		);
	}

	// All items are processed if none is left in "menunggu" status
	const allItemsProcessed =
		order.items.length > 0 &&
		order.items.every(
			(item) => item.status === "diproses" || item.status === "selesai",
		);

	const isCompleted = order.status === "selesai";

	const handleProcessItem = (itemId: string) => {
		processItem(order.id, itemId);
	};

	const handleCompleteOrder = () => {
		completeOrder(order.id);
		router.back();
	};

	return (
		<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card className="py-1">
				{order.items.map((item, index) => {
					const isLast = index === order.items.length - 1;
					const isProcessing = item.status === "diproses";
					const isDone = item.status === "selesai";

					return (
						<View
							key={item.id}
							className={cn(
								"flex-row items-center justify-between py-3 px-1",
								!isLast && "border-b border-border-muted",
							)}
						>
							{/* Quantity Column */}
							<View className="w-12">
								<Text size="body" w="bold">
									{item.quantity}X
								</Text>
							</View>

							{/* Name & Note Column */}
							<View className="flex-1 pr-3 gap-1">
								<Text size="normal" w="medium">
									{item.name}
								</Text>
								{item.notes ? (
									<Text size="small" className="text-muted leading-4">
										{item.notes}
									</Text>
								) : null}
							</View>

							{/* Action / Status Badge Column */}
							<View className="items-end justify-center">
								{isDone ? (
									<View className="flex-row items-center gap-1 rounded-full bg-success-50 px-2 py-1">
										<Feather name="check" size={13} color="#16a34a" />
										<Text size="small" w="medium" className="text-success">
											selesai
										</Text>
									</View>
								) : isProcessing ? (
									<View className="flex-row items-center gap-1 rounded-full bg-warning-50 px-2 py-1">
										<Feather name="rotate-cw" size={12} color="#d97706" />
										<Text size="small" w="medium" className="text-warning">
											sedang diproses
										</Text>
									</View>
								) : (
									<Button
										action="primary"
										size="sm"
										onPress={() => handleProcessItem(item.id)}
									>
										<ButtonText>Proses</ButtonText>
									</Button>
								)}
							</View>
						</View>
					);
				})}
			</Card>

			{/* Bottom Sticky Action Button */}
			<BottomActionButton
				isDisabled={!allItemsProcessed || isCompleted}
				onPress={handleCompleteOrder}
			>
				{isCompleted ? "Sudah Selesai" : "Selesai"}
			</BottomActionButton>
		</Wrapper>
	);
}
