import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import {
	CASH_FLOW_SUMMARY,
	CASH_FLOW_TAB_DATA,
	type CashFlowTab,
} from "@/constants/data/accounting/cash-flow";
import { cn, route, tw } from "@/lib/utils";

const TABS: { key: CashFlowTab; label: string }[] = [
	{ key: "operasi", label: "Operasi" },
	{ key: "investasi", label: "Investasi" },
	{ key: "pendanaan", label: "Pendanaan" },
];

export default function CashFlowScreen() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<CashFlowTab>("operasi");

	const currentTabData = CASH_FLOW_TAB_DATA[activeTab];

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return currentTabData.items;
		const query = searchQuery.toLowerCase();
		return currentTabData.items.filter(
			(item) =>
				item.title.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query),
		);
	}, [currentTabData.items, searchQuery]);

	return (
		<View className="flex-1 bg-background">
			<AnimatedWrapper
				showScrollToTopFab
				fabBottomOffset={tw(6)}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{/* Search Bar with Filter */}
				<SearchBar
					search={searchQuery}
					setSearch={setSearchQuery}
					placeholder="Cari buku besar..."
					withFilter
					variant="light"
				/>

				{/* Ringkasan Arus Kas Container Card */}
				<Card className="gap-3.5">
					{/* Header */}
					<View className="flex-row items-center gap-2.5">
						<View className="size-8 items-center justify-center rounded-lg bg-success-bg">
							<Feather name="trending-up" size={16} color={Colors.green[500]} />
						</View>
						<Text size="normal" w="bold">
							Ringkasan Arus Kas
						</Text>
					</View>

					{/* Inner Card: 3 Activity Rows */}
					<View className="overflow-hidden rounded-xl border border-border-muted bg-white px-3.5 py-1">
						{/* Arus Kas Operasi */}
						<Pressable
							onPress={() =>
								router.push(route("/report/accounting/cash-flow/operasi"))
							}
							className="flex-row items-center justify-between py-2.5 active:opacity-70"
						>
							<View className="flex-row items-center gap-3">
								<View className="size-8 items-center justify-center rounded-full bg-success-bg">
									<Feather
										name="arrow-up"
										size={16}
										color={Colors.green[500]}
									/>
								</View>
								<Text size="normal" w="medium">
									{CASH_FLOW_SUMMARY.operasi.label}
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text size="normal" w="bold" className="text-success">
									{CASH_FLOW_SUMMARY.operasi.amount}
								</Text>
								<Feather name="chevron-right" size={16} color={Colors.zinc[400]} />
							</View>
						</Pressable>

						<View className="h-px w-full bg-border-muted" />

						{/* Arus Kas Investasi */}
						<Pressable
							onPress={() =>
								router.push(route("/report/accounting/cash-flow/investasi"))
							}
							className="flex-row items-center justify-between py-2.5 active:opacity-70"
						>
							<View className="flex-row items-center gap-3">
								<View className="size-8 items-center justify-center rounded-full bg-error-bg">
									<Feather
										name="arrow-down"
										size={16}
										color={Colors.red[500]}
									/>
								</View>
								<Text size="normal" w="medium">
									{CASH_FLOW_SUMMARY.investasi.label}
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text size="normal" w="bold" className="text-destructive">
									{CASH_FLOW_SUMMARY.investasi.amount}
								</Text>
								<Feather name="chevron-right" size={16} color={Colors.zinc[400]} />
							</View>
						</Pressable>

						<View className="h-px w-full bg-border-muted" />

						{/* Arus Kas Pendanaan */}
						<Pressable
							onPress={() =>
								router.push(route("/report/accounting/cash-flow/pendanaan"))
							}
							className="flex-row items-center justify-between py-2.5 active:opacity-70"
						>
							<View className="flex-row items-center gap-3">
								<View className="size-8 items-center justify-center rounded-full bg-warning-bg">
									<Feather
										name="arrow-right"
										size={16}
										color="#D97706"
									/>
								</View>
								<Text size="normal" w="medium">
									{CASH_FLOW_SUMMARY.pendanaan.label}
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text size="normal" w="bold" className="text-warning">
									{CASH_FLOW_SUMMARY.pendanaan.amount}
								</Text>
								<Feather name="chevron-right" size={16} color={Colors.zinc[400]} />
							</View>
						</Pressable>
					</View>

					{/* 2-Tier Subcard: Kenaikan Kas Bersih & Saldo Kas */}
					<View className="overflow-hidden rounded-xl border border-primary-200/50 bg-primary-100">
						{/* Top Tier: Blue Surface */}
						<View className="flex-row items-center gap-3 px-3.5 py-3">
							<View className="size-9 items-center justify-center rounded-lg bg-primary-200">
								<Feather name="trending-up" size={18} color={Colors.primary} />
							</View>
							<View className="gap-0.5">
								<Text size="small" className="text-muted">
									{CASH_FLOW_SUMMARY.netCashChange.label}
								</Text>
								<Text size="body" w="bold" className="text-primary">
									{CASH_FLOW_SUMMARY.netCashChange.amount}
								</Text>
							</View>
						</View>

						{/* Bottom Tier: White Surface */}
						<View className="flex-row items-center rounded-t-lg bg-white p-3">
							{/* Saldo Kas Awal Column */}
							<View className="flex-1 pr-3">
								<View className="mb-2 size-8 items-center justify-center rounded-lg bg-success-bg">
									<Ionicons
										name="swap-horizontal"
										size={16}
										color={Colors.green[500]}
									/>
								</View>
								<Text size="small" className="mb-0.5 text-muted">
									{CASH_FLOW_SUMMARY.initialCash.label}
								</Text>
								<Text size="normal" w="bold" className="text-success">
									{CASH_FLOW_SUMMARY.initialCash.amount}
								</Text>
							</View>

							{/* Center Divider */}
							<View className="h-12 w-px bg-border-muted self-center" />

							{/* Saldo Kas Akhir Column */}
							<View className="flex-1 pl-3">
								<View className="mb-2 size-8 items-center justify-center rounded-lg bg-error-bg">
									<Ionicons
										name="swap-horizontal"
										size={16}
										color={Colors.red[500]}
									/>
								</View>
								<Text size="small" className="mb-0.5 text-muted">
									{CASH_FLOW_SUMMARY.endingCash.label}
								</Text>
								<Text size="normal" w="bold" className="text-destructive">
									{CASH_FLOW_SUMMARY.endingCash.amount}
								</Text>
							</View>
						</View>
					</View>
				</Card>

				{/* 3-Segment Tab Bar (Full Flush Buttons, Exactly like Buku Besar) */}
				<View className="flex-row items-center overflow-hidden rounded-xl border border-border-muted bg-white shadow-main">
					{TABS.map((tab, index) => {
						const isActive = activeTab === tab.key;
						const isNextActive =
							index + 1 < TABS.length && TABS[index + 1].key === activeTab;

						return (
							<React.Fragment key={tab.key}>
								<Pressable
									onPress={() => setActiveTab(tab.key)}
									className={cn(
										"flex-1 items-center justify-center py-3 transition-all active:opacity-75",
										isActive ? "rounded-lg bg-primary" : "bg-transparent",
									)}
								>
									<Text
										size="normal"
										w={isActive ? "bold" : "medium"}
										className={isActive ? "text-white" : "text-muted"}
									>
										{tab.label}
									</Text>
								</Pressable>

								{!isActive && !isNextActive && index < TABS.length - 1 && (
									<View className="h-5 w-px self-center bg-border-muted" />
								)}
							</React.Fragment>
						);
					})}
				</View>

				{/* Tab Detail Card */}
				<Card className="gap-3">
					<View className="flex-row items-center justify-between pb-1">
						<Text size="normal" w="bold">
							{currentTabData.title}
						</Text>
						<Pressable
							hitSlop={8}
							onPress={() =>
								router.push(route(`/report/accounting/cash-flow/${activeTab}`))
							}
							className="active:opacity-70"
						>
							<Text size="small" w="medium" className="text-primary">
								Lihat Semua
							</Text>
						</Pressable>
					</View>

					{filteredItems.map((item, idx) => (
						<View
							key={item.id}
							className={cn(
								"flex-row items-center justify-between py-3",
								idx < filteredItems.length - 1 && "border-b border-border-muted",
							)}
						>
							<View className="flex-1 flex-row items-center gap-3 pr-2">
								<View className="size-8 items-center justify-center rounded-lg bg-primary-50">
									<Feather
										name="file-text"
										size={16}
										color={Colors.primary}
									/>
								</View>
								<View className="flex-1 gap-1">
									<Text size="small" w="bold">
										{item.title}
									</Text>
									<Text size="small" className="text-muted">
										{item.description}
									</Text>
								</View>
							</View>
							<Text
								size="small"
								w="medium"
								className={cn(
									item.variant === "positive"
										? "text-success"
										: item.variant === "negative"
											? "text-destructive"
											: "text-muted",
								)}
							>
								{item.amount}
							</Text>
						</View>
					))}

					{filteredItems.length === 0 && (
						<View className="items-center justify-center py-6">
							<Text size="small" className="text-muted">
								Tidak ada data yang cocok dengan pencarian
							</Text>
						</View>
					)}
				</Card>

				{/* Total Banner */}
				<Card className="flex-row items-center justify-between border border-primary-200/50 bg-primary-100 py-3">
					<View className="flex-row items-center gap-3">
						<View className="size-8 items-center justify-center rounded-lg bg-primary-200">
							<Feather name="file-text" size={16} color={Colors.primary} />
						</View>
						<Text size="small" w="bold">
							{currentTabData.totalLabel}
						</Text>
					</View>
					<Text size="normal" w="bold" className="text-success">
						{currentTabData.totalAmount}
					</Text>
				</Card>
			</AnimatedWrapper>
		</View>
	);
}
