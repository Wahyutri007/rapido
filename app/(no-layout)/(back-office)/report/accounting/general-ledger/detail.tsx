import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import {
	LedgerDetailHeaderCard,
	LedgerDetailSummaryCard,
	LedgerEntryCard,
	LedgerPeriodActionSheet,
	LedgerTypeActionSheet,
} from "@/components/feature/accounting/general-ledger";
import { Colors } from "@/constants/Colors";
import { useAccountingStore } from "@/store/accountingStore";
import type { LedgerEntry } from "@/types/ui/accounting/ledger";

export default function GeneralLedgerDetailScreen() {
	const params = useLocalSearchParams<{ id?: string }>();

	const accounts = useAccountingStore((state) => state.ledgerAccounts);
	const getAccountLedgerEntries = useAccountingStore(
		(state) => state.getAccountLedgerEntries,
	);

	// Find the current account, fallback to first account (Kas)
	const account = useMemo(() => {
		if (params?.id) {
			const found = accounts.find((a) => a.id === params.id);
			if (found) return found;
		}
		return accounts[0];
	}, [accounts, params?.id]);

	const rawEntries: LedgerEntry[] = useMemo(() => {
		if (!account) return [];
		return getAccountLedgerEntries(account.id);
	}, [account, getAccountLedgerEntries]);

	// Filter states
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPeriod, setSelectedPeriod] = useState("all");
	const [selectedType, setSelectedType] = useState("all");

	// Action sheets
	const [isPeriodSheetOpen, setIsPeriodSheetOpen] = useState(false);
	const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false);

	// Filtered journal entries
	const filteredEntries = useMemo(() => {
		return rawEntries.filter((entry) => {
			const query = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!query ||
				entry.title.toLowerCase().includes(query) ||
				entry.referenceNumber.toLowerCase().includes(query) ||
				entry.description.toLowerCase().includes(query);

			const matchesType = selectedType === "all" || entry.type === selectedType;

			return matchesSearch && matchesType;
		});
	}, [rawEntries, searchQuery, selectedType]);

	// Calculate totals for the summary card
	const { totalDebit, totalCredit } = useMemo(() => {
		let debit = 0;
		let credit = 0;
		filteredEntries.forEach((entry) => {
			if (entry.type === "debit") {
				debit += entry.amount;
			} else {
				credit += entry.amount;
			}
		});
		return {
			totalDebit: debit || account.totalDebit,
			totalCredit: credit || account.totalCredit,
		};
	}, [filteredEntries, account]);

	if (!account) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-4">
				<Text size="normal" className="text-muted">
					Akun tidak ditemukan
				</Text>
			</View>
		);
	}

	return (
		<AnimatedWrapper
			showScrollToTopFab
			contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
		>
			{/* Account Header Card */}
			<LedgerDetailHeaderCard account={account} />

			{/* Filter Row: Periode & Jenis Transaksi Buttons */}
			<View className="flex-row items-center gap-2.5">
				{/* Periode Dropdown Button */}
				<Pressable
					onPress={() => setIsPeriodSheetOpen(true)}
					className="flex-1 active:opacity-75"
				>
					<Card className="flex-row items-center justify-between rounded-xl border-0 px-3.5 py-2.5">
						<View className="flex-row items-center gap-2">
							<Feather name="calendar" size={16} color={Colors.primary} />
							<Text size="small" w="medium">
								{selectedPeriod === "all"
									? "Periode"
									: selectedPeriod === "month"
										? "Bulan Ini"
										: selectedPeriod === "quarter"
											? "Kuartal Ini"
											: "Tahun Ini"}
							</Text>
						</View>
						<Feather name="chevron-down" size={16} color={Colors.zinc[400]} />
					</Card>
				</Pressable>

				{/* Jenis Transaksi Dropdown Button */}
				<Pressable
					onPress={() => setIsTypeSheetOpen(true)}
					className="flex-1 active:opacity-75"
				>
					<Card className="flex-row items-center justify-between rounded-xl border-0 px-3.5 py-2.5">
						<View className="flex-row items-center gap-2">
							<Feather name="repeat" size={16} color={Colors.primary} />
							<Text size="small" w="medium">
								{selectedType === "all"
									? "Jenis Transaksi"
									: selectedType === "debit"
										? "Debit"
										: "Kredit"}
							</Text>
						</View>
						<Feather name="chevron-down" size={16} color={Colors.zinc[400]} />
					</Card>
				</Pressable>
			</View>

			{/* Search Bar for Reference / Description */}
			<Card className="flex-row items-center rounded-2xl border-0 px-3.5 py-2.5">
				<Feather name="search" size={18} color={Colors.zinc[400]} />
				<TextInput
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholder="Cari Referensi / Deskripsi"
					placeholderTextColor={Colors.zinc[400]}
					className="ml-2.5 flex-1 p-0 text-sm text-foreground"
				/>
				{Boolean(searchQuery) && (
					<Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
						<Feather name="x" size={16} color={Colors.zinc[400]} />
					</Pressable>
				)}
			</Card>

			{/* Section: Rincian Jurnal */}
			<View className="gap-2.5">
				<Text size="body" w="bold">
					Rincian Jurnal
				</Text>

				<Card className="rounded-2xl border-0 p-0 px-4">
					{filteredEntries.map((entry, index) => (
						<LedgerEntryCard
							key={entry.id}
							entry={entry}
							isLast={index === filteredEntries.length - 1}
						/>
					))}

					{filteredEntries.length === 0 && (
						<View className="items-center justify-center py-10">
							<Text size="normal" className="text-muted">
								Tidak ada rincian jurnal ditemukan
							</Text>
						</View>
					)}
				</Card>
			</View>

			{/* Section: Ringkasan */}
			<LedgerDetailSummaryCard
				totalDebit={totalDebit}
				totalCredit={totalCredit}
				endingBalance={account.balance}
			/>

			{/* Period Filter Action Sheet */}
			<LedgerPeriodActionSheet
				isOpen={isPeriodSheetOpen}
				onClose={() => setIsPeriodSheetOpen(false)}
				selectedPeriod={selectedPeriod}
				onSelectPeriod={setSelectedPeriod}
			/>

			{/* Transaction Type Action Sheet */}
			<LedgerTypeActionSheet
				isOpen={isTypeSheetOpen}
				onClose={() => setIsTypeSheetOpen(false)}
				selectedType={selectedType}
				onSelectType={setSelectedType}
			/>
		</AnimatedWrapper>
	);
}
