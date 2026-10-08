import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import Wrapper from "@/components/common/Wrapper";
import {
	ExpenseActionSheet,
	ExpenseCard,
	ExpenseFilterActionSheet,
} from "@/components/feature/accounting/expenses";
import { route } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";
import type { Expense, GroupedExpenses } from "@/types/ui/accounting/expense";

const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

function formatIndonesianDate(dateStr: string): string {
	// If already formatted like "19 Maret 2026"
	if (dateStr.includes("Maret") || dateStr.includes("Januari") || dateStr.includes("Februari")) {
		return dateStr;
	}

	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return dateStr;

	const day = date.getDate();
	const month = MONTH_NAMES[date.getMonth()];
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
}

export default function AccountingExpensesIndexScreen() {
	const expenses = useAccountingStore((state) => state.expenses);
	const deleteExpense = useAccountingStore((state) => state.deleteExpense);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFundingSource, setSelectedFundingSource] = useState<
		string | null
	>(null);

	// Action sheet state
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

	// Modals
	const deleteModal = useAlertModal();
	const infoModal = useAlertModal();
	const [infoDate, setInfoDate] = useState("");

	// Filtered & grouped expenses
	const groupedExpenses: GroupedExpenses[] = useMemo(() => {
		const filtered = expenses.filter((item) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				item.accountName.toLowerCase().includes(query) ||
				item.accountCode.toLowerCase().includes(query) ||
				item.referenceNumber.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				item.createdBy.toLowerCase().includes(query) ||
				item.fundingSource.toLowerCase().includes(query);

			const matchesFunding = selectedFundingSource
				? item.fundingSource === selectedFundingSource
				: true;

			return matchesSearch && matchesFunding;
		});

		// Group by date
		const groupsMap = new Map<string, Expense[]>();
		for (const item of filtered) {
			const dateKey = item.date;
			const currentList = groupsMap.get(dateKey) || [];
			currentList.push(item);
			groupsMap.set(dateKey, currentList);
		}

		return Array.from(groupsMap.entries()).map(([date, items]) => ({
			date,
			displayDate: formatIndonesianDate(date),
			items,
		}));
	}, [expenses, searchQuery, selectedFundingSource]);

	const handleOpenActionMenu = (expense: Expense) => {
		setSelectedExpense(expense);
		setIsActionSheetOpen(true);
	};

	const handleCloseActionMenu = () => {
		setIsActionSheetOpen(false);
	};

	const handleViewDetail = (expense: Expense) => {
		router.push(`/report/accounting/expenses/detail?id=${expense.id}`);
	};

	const handleEditExpense = (expense: Expense) => {
		router.push(`/report/accounting/expenses/modify?id=${expense.id}`);
	};

	const handleDeleteExpense = (expense: Expense) => {
		setSelectedExpense(expense);
		deleteModal.open();
	};

	const confirmDeleteExpense = () => {
		if (selectedExpense) {
			deleteExpense(selectedExpense.id);
		}
		deleteModal.close();
	};

	const handlePressInfo = (date: string) => {
		setInfoDate(date);
		infoModal.open();
	};

	return (
		<>
			<Wrapper
				hasActionButton
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{/* Search Bar with Filter */}
				<SearchBar
					search={searchQuery}
					setSearch={setSearchQuery}
					placeholder="Cari akun..."
					withFilter
					onFilterPress={() => setIsFilterSheetOpen(true)}
					filterActive={Boolean(selectedFundingSource)}
					variant="light"
				/>

				{/* Grouped Date Cards */}
				<View className="gap-4">
					{groupedExpenses.map((group) => (
						<ExpenseCard
							key={group.date}
							group={group}
							onSelectExpense={handleOpenActionMenu}
							onPressInfo={handlePressInfo}
						/>
					))}

					{groupedExpenses.length === 0 && (
						<SearchNotFound text="Tidak ada pengeluaran yang ditemukan" />
					)}
				</View>
			</Wrapper>

			{/* Sticky Bottom "Tambah Pengeluaran" Button */}
			<BottomActionButton
				onPress={() => router.push(route("/report/accounting/expenses/modify"))}
			>
				Tambah Pengeluaran
			</BottomActionButton>

			{/* Action Sheet */}
			<ExpenseActionSheet
				expense={selectedExpense}
				isOpen={isActionSheetOpen}
				onClose={handleCloseActionMenu}
				onViewDetail={handleViewDetail}
				onEditExpense={handleEditExpense}
				onDeleteExpense={handleDeleteExpense}
			/>

			{/* Filter Action Sheet */}
			<ExpenseFilterActionSheet
				isOpen={isFilterSheetOpen}
				onClose={() => setIsFilterSheetOpen(false)}
				selectedFundingSource={selectedFundingSource}
				onSelectFundingSource={setSelectedFundingSource}
			/>

			{/* Delete Confirmation Alert Modal */}
			<DeleteConfirmModal
				openState={deleteModal.openState}
				onClose={deleteModal.close}
				onConfirm={confirmDeleteExpense}
				title="Hapus Laporan Pengeluaran?"
				description="Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
			/>

			{/* Date Info Modal */}
			<AlertModal
				openState={infoModal.openState}
				onClose={infoModal.close}
				title={`Informasi ${infoDate}`}
				message={`Semua transaksi pengeluaran dan kas keluar tercatat pada tanggal ${infoDate}.`}
				confirmText="Tutup"
				hideCancelButton
			/>
		</>
	);
}
