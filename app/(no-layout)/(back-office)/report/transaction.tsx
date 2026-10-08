import Feather from "@expo/vector-icons/Feather";
import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Text from "@/components/common/Text";
import {
	FilterChipsRow,
	ReportActionButton,
	TransactionGroupCard,
	TransactionItemActionSheet,
	type TransactionGroup,
	type TransactionItem,
} from "@/components/feature/reports";
import { DEFAULT_TRANSACTION_GROUPS } from "@/components/feature/reports/transaction/mockData";
import { FilterIcon } from "@/components/icons";
import { Input, InputField } from "@/components/ui/input";
import { Colors } from "@/constants/Colors";
import { tw } from "@/lib/utils";

export default function TransactionHistoryReportScreen() {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("Semua Status");
	const [cashier, setCashier] = useState("Semua Kasir");
	const [payment, setPayment] = useState("Semua Pembayaran");

	// Actionsheet states
	const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(null);
	const [showItemSheet, setShowItemSheet] = useState(false);
	const [showReportActions, setShowReportActions] = useState(false);

	// Filter transactions reactively
	const filteredGroups = useMemo(() => {
		const searchLower = search.trim().toLowerCase();

		return DEFAULT_TRANSACTION_GROUPS.map((group) => {
			const matchingItems = group.items.filter((item) => {
				// Search filter
				if (searchLower) {
					const matchId = item.id.toLowerCase().includes(searchLower);
					const matchCustomer = item.customer.toLowerCase().includes(searchLower);
					const matchCashier = item.cashier.toLowerCase().includes(searchLower);
					if (!matchId && !matchCustomer && !matchCashier) return false;
				}

				// Status filter
				if (status !== "Semua Status" && item.statusLabel !== status) {
					return false;
				}

				// Cashier filter
				if (cashier !== "Semua Kasir" && item.cashier !== cashier) {
					return false;
				}

				// Payment/channel filter
				if (
					payment !== "Semua Pembayaran" &&
					item.channel !== payment &&
					item.paymentMethod !== payment
				) {
					return false;
				}

				return true;
			});

			const totalAmount = matchingItems.reduce(
				(sum, item) => sum + item.amount,
				0,
			);

			return {
				...group,
				totalTransactions: matchingItems.length,
				totalAmount,
				items: matchingItems,
			};
		}).filter((group) => group.items.length > 0);
	}, [search, status, cashier, payment]);

	const handleItemActionPress = (item: TransactionItem) => {
		setSelectedItem(item);
		setShowItemSheet(true);
	};

	const resetFilters = () => {
		setSearch("");
		setStatus("Semua Status");
		setCashier("Semua Kasir");
		setPayment("Semua Pembayaran");
	};

	return (
		<View className="flex-1">
			<AnimatedWrapper
				hasBottomBar
				fabBottomOffset={tw(24)}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{/* Search & Filter Header */}
				<View className="flex-row items-center gap-2.5">
					<Input
						size="md"
						variant="outline"
						className="h-11 flex-1 rounded-xl border-border-muted bg-white px-3 shadow-sm"
					>
						<Feather name="search" size={18} color={Colors.zinc[400]} />
						<InputField
							placeholder="Cari id transaksi..."
							value={search}
							onChangeText={setSearch}
							className="text-sm"
						/>
						{search ? (
							<Pressable onPress={() => setSearch("")} hitSlop={8}>
								<Feather name="x" size={16} color={Colors.zinc[400]} />
							</Pressable>
						) : null}
					</Input>

					<Pressable
						onPress={() => setShowReportActions(true)}
						className="size-11 items-center justify-center rounded-xl bg-primary-500 shadow-sm active:bg-primary-600"
					>
						<FilterIcon size={tw(5)} color={Colors.zinc[50]} />
					</Pressable>
				</View>

				{/* Filter Chips */}
				<FilterChipsRow
					status={status}
					onStatusChange={setStatus}
					cashier={cashier}
					onCashierChange={setCashier}
					payment={payment}
					onPaymentChange={setPayment}
				/>

				{/* Grouped Transaction Cards */}
				{filteredGroups.length > 0 ? (
					filteredGroups.map((group) => (
						<TransactionGroupCard
							key={group.dateKey}
							group={group}
							onItemActionPress={handleItemActionPress}
						/>
					))
				) : (
					<View className="items-center justify-center rounded-2xl border border-dashed border-border-muted bg-white py-12">
						<Feather name="inbox" size={36} color={Colors.zinc[300]} />
						<Text size="normal" w="semibold" className="mt-3 text-zinc-700">
							Tidak ada transaksi ditemukan
						</Text>
						<Text size="small" className="mt-1 text-center text-zinc-400">
							Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
						</Text>
						<Pressable
							onPress={resetFilters}
							className="mt-4 rounded-xl bg-primary-50 px-4 py-2"
						>
							<Text size="small" w="medium" className="text-primary-600">
								Reset Filter
							</Text>
						</Pressable>
					</View>
				)}
			</AnimatedWrapper>

			{/* Item Context Actionsheet */}
			<TransactionItemActionSheet
				item={selectedItem}
				isOpen={showItemSheet}
				onClose={() => setShowItemSheet(false)}
			/>

			{/* Bottom Action Button & Sheet */}
			<ReportActionButton
				isOpen={showReportActions}
				onOpenChange={setShowReportActions}
				sheetTitle="Aksi Riwayat Transaksi"
				actions={[
					{ key: "download", label: "Unduh Riwayat (PDF)" },
					{ key: "export", label: "Ekspor ke CSV / Excel" },
					{ key: "share", label: "Bagikan Riwayat" },
					{ key: "print", label: "Cetak Riwayat" },
				]}
			/>
		</View>
	);
}
