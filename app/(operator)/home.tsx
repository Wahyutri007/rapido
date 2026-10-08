import { useCurrentStoreQuery } from "@/api/hooks/stores";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ChangeStoreButton from "@/components/custom/ChangeStoreButton";
import CurvedHeader from "@/components/custom/CurvedHeader";
import OperatorOrderCard from "@/components/feature/operator/OperatorOrderCard";
import OperatorTabs from "@/components/feature/operator/OperatorTabs";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useOperatorStore } from "@/store/useOperatorStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, View } from "react-native";

export default function OperatorHomeScreen() {
	const { user } = useAuth();
	const storeQuery = useCurrentStoreQuery();

	const {
		orders,
		activeTab,
		searchQuery,
		setActiveTab,
		setSearchQuery,
		takeJob,
	} = useOperatorStore();

	const storeName = storeQuery.data?.name || "Ayam Geprek Panam";
	const operatorName = user?.user.name || "Ulil Amri";

	const filteredOrders = React.useMemo(() => {
		return orders.filter((order) => {
			const matchesTab = order.status === activeTab;
			if (!matchesTab) return false;

			if (!searchQuery.trim()) return true;

			const q = searchQuery.toLowerCase();
			return (
				order.orderNumber.toLowerCase().includes(q) ||
				order.customerName.toLowerCase().includes(q) ||
				order.queueNumber.toLowerCase().includes(q) ||
				order.items.some((item) => item.name.toLowerCase().includes(q))
			);
		});
	}, [orders, activeTab, searchQuery]);

	const handleTakeJob = (orderId: string) => {
		takeJob(orderId, operatorName);
	};

	return (
		<Wrapper isNotScrollable>
			<StatusBar style="light" />

			{/* Promoted Curved Header with Overlapping Store Card */}
			<CurvedHeader heightOffset={40}>
				<Card className="mt-3 flex-row items-center justify-between">
					<View className="flex-1 flex-row items-center gap-3">
						<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
							<MaterialIcons
								name="storefront"
								size={20}
								color={Colors.primary}
							/>
						</View>
						<View className="flex-1 gap-1">
							<Text size="normal" w="bold" numberOfLines={1}>
								{storeQuery.isLoading ? "Memuat..." : storeName}
							</Text>
							<View className="flex-row items-center gap-1">
								<View className="size-2 rounded-full bg-success" />
								<Text size="small" className="text-muted">
									Toko Aktif
								</Text>
							</View>
						</View>
					</View>

					<ChangeStoreButton size="sm" showChevron />
				</Card>
			</CurvedHeader>

			{/* Search & Tabs Controls */}
			<View className="px-4 pt-4 gap-3">
				<SearchBar
					search={searchQuery}
					setSearch={setSearchQuery}
					placeholder="Cari..."
				/>

				<OperatorTabs activeTab={activeTab} onTabChange={setActiveTab} />
			</View>

			{/* Order Cards List */}
			<View className="flex-1 px-4 pt-3">
				<FlatList
					className="flex-1"
					data={filteredOrders}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<OperatorOrderCard order={item} onTakeJob={handleTakeJob} />
					)}
					contentContainerStyle={{
						paddingBottom: 100,
						gap: 12,
					}}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={() => (
						<View>
							<SearchNotFound text={`Tidak ada pesanan ${activeTab}`} />
						</View>
					)}
				/>
			</View>
		</Wrapper>
	);
}
