import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import {
	LedgerAccountCard,
	LedgerCategoryTabs,
	LedgerFilterActionSheet,
	LedgerSummaryCard,
} from "@/components/feature/accounting/general-ledger";
import { useAccountingStore } from "@/store/accountingStore";
import type {
	LedgerAccount,
	LedgerCategory,
} from "@/types/ui/accounting/ledger";

export default function GeneralLedgerIndexScreen() {
	const accounts = useAccountingStore((state) => state.ledgerAccounts);
	const summary = useAccountingStore((state) => state.ledgerSummary);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<LedgerCategory>("Semua");
	const [selectedSort, setSelectedSort] = useState("default");
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
	const [showAllAccounts, setShowAllAccounts] = useState(false);

	// Filtered & sorted accounts
	const filteredAccounts = useMemo(() => {
		let list = accounts.filter((acc) => {
			const matchesCategory =
				selectedCategory === "Semua" || acc.classification === selectedCategory;

			const query = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!query ||
				acc.name.toLowerCase().includes(query) ||
				acc.code.toLowerCase().includes(query);

			return matchesCategory && matchesSearch;
		});

		// Sort
		if (selectedSort === "balance_desc") {
			list = [...list].sort((a, b) => b.balance - a.balance);
		} else if (selectedSort === "balance_asc") {
			list = [...list].sort((a, b) => a.balance - b.balance);
		} else if (selectedSort === "name_asc") {
			list = [...list].sort((a, b) => a.name.localeCompare(b.name));
		} else if (selectedSort === "code_asc") {
			list = [...list].sort((a, b) => a.code.localeCompare(b.code));
		}

		return list;
	}, [accounts, selectedCategory, searchQuery, selectedSort]);

	const handleAccountPress = (account: LedgerAccount) => {
		router.push(`/report/accounting/general-ledger/detail?id=${account.id}`);
	};

	return (
		<AnimatedWrapper
			showScrollToTopFab={false}
			contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
		>
			{/* Search Bar with Filter */}
			<SearchBar
				search={searchQuery}
				setSearch={setSearchQuery}
				placeholder="Cari buku besar..."
				withFilter
				onFilterPress={() => setIsFilterSheetOpen(true)}
				filterActive={selectedSort !== "default"}
				variant="light"
			/>

			{/* Balance Summary Card */}
			<LedgerSummaryCard summary={summary} />

			{/* Account Classification Tabs */}
			<LedgerCategoryTabs
				selectedCategory={selectedCategory}
				onSelectCategory={setSelectedCategory}
			/>

			{/* Ringkasan Akun Utama */}
			<View className="gap-2.5">
				<View className="flex-row items-center justify-between px-1">
					<Text w="semibold">
						Ringkasan Akun Utama
					</Text>
					<Pressable
						onPress={() => setShowAllAccounts((prev) => !prev)}
						hitSlop={8}
					>
						<Text size="small" w="semibold" className="text-primary">
							{showAllAccounts ? "Tampilkan Sedikit" : "Lihat Semua"}
						</Text>
					</Pressable>
				</View>

				{/* Accounts List Container */}
				<Card className="py-1">
					{filteredAccounts.map((account, index) => (
						<LedgerAccountCard
							key={account.id}
							account={account}
							onPress={handleAccountPress}
							isLast={index === filteredAccounts.length - 1}
						/>
					))}

					{filteredAccounts.length === 0 && (
						<View className="items-center justify-center py-12">
							<Text size="normal" className="text-muted">
								Tidak ada akun buku besar yang ditemukan
							</Text>
						</View>
					)}
				</Card>
			</View>

			{/* Filter & Sort Action Sheet */}
			<LedgerFilterActionSheet
				isOpen={isFilterSheetOpen}
				onClose={() => setIsFilterSheetOpen(false)}
				selectedSort={selectedSort}
				onSelectSort={setSelectedSort}
			/>
		</AnimatedWrapper>
	);
}
