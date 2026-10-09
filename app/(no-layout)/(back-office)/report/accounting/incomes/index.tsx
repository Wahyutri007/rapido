import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionBar, {
	BottomActionInset,
} from "@/components/common/BottomActionBar";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import {
	IncomeActionSheet,
	IncomeCard,
	IncomeFilterActionSheet,
} from "@/components/feature/accounting/incomes";
import { Button, ButtonText } from "@/components/ui/button";
import { useAccountingStore } from "@/store/accountingStore";
import type { GroupedIncomes, Income } from "@/types/ui/accounting/income";

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
	if (
		dateStr.includes("Maret") ||
		dateStr.includes("Januari") ||
		dateStr.includes("Februari")
	) {
		return dateStr;
	}

	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return dateStr;

	const day = date.getDate();
	const month = MONTH_NAMES[date.getMonth()];
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
}

export default function AccountingIncomesIndexScreen() {
	const incomes = useAccountingStore((state) => state.incomes);
	const deleteIncome = useAccountingStore((state) => state.deleteIncome);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFundingSource, setSelectedFundingSource] = useState<
		string | null
	>(null);

	// Action sheet state
	const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

	// Modals
	const deleteModal = useAlertModal();
	const infoModal = useAlertModal();
	const [infoDate, setInfoDate] = useState("");

	// Filtered & grouped incomes
	const groupedIncomes: GroupedIncomes[] = useMemo(() => {
		const filtered = incomes.filter((item) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				(item.accountName?.toLowerCase().includes(query) ?? false) ||
				(item.accountCode?.toLowerCase().includes(query) ?? false) ||
				item.referenceNumber.toLowerCase().includes(query) ||
				(item.description?.toLowerCase().includes(query) ?? false) ||
				item.createdBy.toLowerCase().includes(query) ||
				(item.fundingSource?.toLowerCase().includes(query) ?? false);

			const matchesFunding = selectedFundingSource
				? item.fundingSource === selectedFundingSource
				: true;

			return matchesSearch && matchesFunding;
		});

		// Group by date
		const groupsMap = new Map<string, Income[]>();
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
	}, [incomes, searchQuery, selectedFundingSource]);

	const handleOpenActionMenu = (income: Income) => {
		setSelectedIncome(income);
		setIsActionSheetOpen(true);
	};

	const handleCloseActionMenu = () => {
		setIsActionSheetOpen(false);
	};

	const handleSelectInvoice = (income: Income) => {
		router.push(`/report/accounting/incomes/receipt?id=${income.id}`);
	};

	const handleViewDetail = (income: Income) => {
		router.push(`/report/accounting/incomes/detail?id=${income.id}`);
	};

	const handleEditIncome = (income: Income) => {
		router.push(`/report/accounting/incomes/modify?id=${income.id}`);
	};

	const handleDeleteIncome = (income: Income) => {
		setSelectedIncome(income);
		deleteModal.open();
	};

	const confirmDeleteIncome = () => {
		if (selectedIncome) {
			deleteIncome(selectedIncome.id);
		}
		deleteModal.close();
	};

	const handlePressInfo = (date: string) => {
		setInfoDate(date);
		infoModal.open();
	};

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView
				contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
				showsVerticalScrollIndicator={false}
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
					{groupedIncomes.map((group) => (
						<IncomeCard
							key={group.date}
							group={group}
							onSelectIncome={handleOpenActionMenu}
							onSelectInvoice={handleSelectInvoice}
							onPressInfo={handlePressInfo}
						/>
					))}

					{groupedIncomes.length === 0 && (
						<View className="items-center justify-center py-16">
							<Text className="text-sm text-zinc-400">
								Tidak ada penerimaan yang ditemukan
							</Text>
						</View>
					)}
				</View>
				<BottomActionInset />
			</ScrollView>

			{/* Sticky Bottom "Tambah Penerimaan" Button */}
			<BottomActionBar>
				<Button
					size="xl"
					className="h-12 rounded-full bg-primary-500"
					onPress={() => router.push("/report/accounting/incomes/modify")}
				>
					<ButtonText className="text-base font-semibold text-white">
						Tambah Penerimaan
					</ButtonText>
				</Button>
			</BottomActionBar>

			{/* Action Sheet for KM items */}
			<IncomeActionSheet
				income={selectedIncome}
				isOpen={isActionSheetOpen}
				onClose={handleCloseActionMenu}
				onViewDetail={handleViewDetail}
				onEditIncome={handleEditIncome}
				onDeleteIncome={handleDeleteIncome}
			/>

			{/* Filter Action Sheet */}
			<IncomeFilterActionSheet
				isOpen={isFilterSheetOpen}
				onClose={() => setIsFilterSheetOpen(false)}
				selectedFundingSource={selectedFundingSource}
				onSelectFundingSource={setSelectedFundingSource}
			/>

			{/* Delete Confirmation Alert Modal */}
			<DeleteConfirmModal
				openState={deleteModal.openState}
				onClose={deleteModal.close}
				onConfirm={confirmDeleteIncome}
				title="Hapus Laporan Penerimaan?"
				description="Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
			/>

			{/* Date Info Modal */}
			<AlertModal
				openState={infoModal.openState}
				onClose={infoModal.close}
				title={`Informasi ${infoDate}`}
				message={`Semua transaksi penerimaan dan kas masuk tercatat pada tanggal ${infoDate}.`}
				confirmText="Tutup"
				hideCancelButton
			/>
		</View>
	);
}
