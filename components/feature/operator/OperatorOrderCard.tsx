import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import type { OperatorOrder } from "@/store/useOperatorStore";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

type OperatorOrderCardProps = {
	order: OperatorOrder;
	onTakeJob?: (orderId: string) => void;
};

export default function OperatorOrderCard({
	order,
	onTakeJob,
}: OperatorOrderCardProps) {
	const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
	const processedItems = order.items.reduce((sum, item) => {
		if (item.status === "diproses" || item.status === "selesai") {
			return sum + item.quantity;
		}
		return sum;
	}, 0);

	const progressPercentage =
		totalItems > 0 ? Math.min(100, Math.round((processedItems / totalItems) * 100)) : 0;

	const handlePress = () => {
		router.push({
			pathname: "/(operator)/detail",
			params: { id: order.id },
		});
	};

	// 1. COMPLETED TAB CARD VIEW (Image 3)
	if (order.status === "selesai") {
		return (
			<Card className="gap-3">
				<Pressable onPress={handlePress} className="gap-3 active:opacity-85">
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-1 rounded-full bg-success-50 px-2 py-1">
							<Feather name="check" size={14} color="#16a34a" />
							<Text size="small" w="medium" className="text-success">
								{order.completedDuration || "Selesai"}
							</Text>
						</View>
						<View className="items-end gap-1">
							<Text size="small" className="text-muted">
								Penanggung Jawab:
							</Text>
							<Text size="small" w="semibold">
								{order.responsibleStaff || "Ulil Amri"}
							</Text>
						</View>
					</View>

					<Text size="normal" w="medium">
						{totalItems} Item - {order.customerName}
					</Text>
				</Pressable>
			</Card>
		);
	}

	// 2. IN-PROGRESS TAB CARD VIEW (Image 2 style)
	if (order.status === "diproses") {
		return (
			<Card className="gap-3">
				<Pressable onPress={handlePress} className="gap-3 active:opacity-85">
					{/* Top Header Row with Time Badge and Status */}
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-1 rounded-full bg-error-50 px-2 py-1">
							<Feather name="clock" size={14} color="#dc2626" />
							<Text size="small" w="medium" className="text-destructive">
								{order.timeAgo}
							</Text>
						</View>

						<View className="flex-row items-center gap-1">
							<View className="flex-row items-center gap-1 rounded-full bg-warning-50 px-2 py-1">
								<Feather name="rotate-cw" size={12} color="#d97706" />
								<Text size="small" w="medium" className="text-warning">
									Proses
								</Text>
							</View>
							<Feather name="chevron-right" size={16} color="#71717a" />
						</View>
					</View>

					{/* Metadata details */}
					<View className="gap-1">
						<View className="flex-row items-center">
							<Text size="small" className="w-24 text-muted">
								Pelanggan
							</Text>
							<Text size="small" w="semibold" className="flex-1">
								: {order.customerName}
							</Text>
						</View>
						<View className="flex-row items-center">
							<Text size="small" className="w-24 text-muted">
								Pesanan
							</Text>
							<Text size="small" w="semibold" className="flex-1">
								: {totalItems} Item
							</Text>
						</View>
						<View className="flex-row items-center">
							<Text size="small" className="w-24 text-muted">
								Diproses
							</Text>
							<Text size="small" w="semibold" className="flex-1">
								: {processedItems} Item
							</Text>
						</View>
					</View>

					{/* Progress Bar */}
					<View className="mt-1 flex-row items-center gap-3">
						<Text size="small" className="text-muted">
							Proses
						</Text>
						<View className="h-2 flex-1 overflow-hidden rounded-full bg-border-muted">
							<View
								className="h-full rounded-full bg-warning"
								style={{ width: `${progressPercentage}%` }}
							/>
						</View>
						<Text size="small" w="semibold" className="text-muted">
							{processedItems}/{totalItems}
						</Text>
					</View>
				</Pressable>
			</Card>
		);
	}

	// 3. NEW TAB CARD VIEW (Image 1 style)
	return (
		<Card className="gap-3">
			<Pressable onPress={handlePress} className="gap-3 active:opacity-85">
				{/* Top Row: Order ID, Time Ago, Status Badge */}
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						<Text size="normal" w="bold" className="text-primary">
							{order.orderNumber}
						</Text>
						<View className="flex-row items-center gap-1 rounded-full bg-primary-50 px-2 py-1">
							<Feather name="clock" size={12} color={Colors.primary} />
							<Text size="small" className="text-primary">
								{order.timeAgo}
							</Text>
						</View>
					</View>

					<View className="flex-row items-center gap-1 rounded-full bg-primary-50 px-2 py-1">
						<View className="size-1.5 rounded-full bg-primary" />
						<Text size="small" w="medium" className="text-primary">
							Baru
						</Text>
					</View>
				</View>

				{/* Customer Row */}
				<View className="flex-row items-center gap-2">
					<Ionicons name="person-outline" size={16} color="#71717a" />
					<Text size="normal" w="semibold">
						{order.customerName}
					</Text>
				</View>

				{/* Meta Row: Item Count, Queue, Action Button */}
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-4">
						<View className="flex-row items-center gap-1">
							<MaterialIcons name="receipt-long" size={16} color="#71717a" />
							<Text size="small" className="text-muted">
								{totalItems} Produk
							</Text>
						</View>
						<View className="flex-row items-center gap-1">
							<MaterialIcons name="people-outline" size={16} color="#71717a" />
							<Text size="small" className="text-muted">
								{order.queueNumber}
							</Text>
						</View>
					</View>

					<Button
						action="primary"
						size="sm"
						onPress={(e) => {
							e.stopPropagation();
							if (onTakeJob) {
								onTakeJob(order.id);
							}
						}}
					>
						<ButtonText>Ambil Job</ButtonText>
					</Button>
				</View>

				{/* Progress Bar */}
				<View className="mt-1 flex-row items-center gap-3">
					<Text size="small" className="text-muted">
						Proses
					</Text>
					<View className="h-2 flex-1 overflow-hidden rounded-full bg-border-muted">
						<View
							className="h-full rounded-full bg-primary"
							style={{ width: `${progressPercentage}%` }}
						/>
					</View>
					<Text size="small" w="semibold" className="text-muted">
						{processedItems}/{totalItems}
					</Text>
				</View>
			</Pressable>
		</Card>
	);
}
