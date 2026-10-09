import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import {
	JournalCard,
	JournalFilterActionSheet,
} from "@/components/feature/accounting/closing-journal";
import { Button, ButtonText } from "@/components/ui/button";
import { useAccountingStore } from "@/store/accountingStore";
import type { ClosingJournal } from "@/types/ui/accounting/journal";

export default function ClosingJournalIndexScreen() {
	const closingJournals = useAccountingStore((state) => state.closingJournals);
	const deleteClosingJournal = useAccountingStore(
		(state) => state.deleteClosingJournal,
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

	// Action sheet state
	const [selectedJournal, setSelectedJournal] = useState<ClosingJournal | null>(
		null,
	);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

	// Modals
	const deleteModal = useAlertModal();

	// Filtered journals
	const filteredJournals = useMemo(() => {
		return closingJournals.filter((item) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				item.referenceNumber.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				item.date.toLowerCase().includes(query) ||
				Boolean(item.period?.toLowerCase().includes(query)) ||
				item.lines.some(
					(line) =>
						line.accountName.toLowerCase().includes(query) ||
						line.accountCode.toLowerCase().includes(query),
				);

			let matchesFilter = true;
			if (selectedFilter === "balanced") {
				matchesFilter = item.isBalanced;
			}

			return matchesSearch && matchesFilter;
		});
	}, [closingJournals, searchQuery, selectedFilter]);

	const handleOpenActionMenu = (journal: ClosingJournal) => {
		setSelectedJournal(journal);
		setIsActionSheetOpen(true);
	};

	const handleCloseActionMenu = () => {
		setIsActionSheetOpen(false);
	};

	const handleViewDetail = (journal: ClosingJournal) => {
		router.push(`/report/accounting/closing-journal/detail?id=${journal.id}`);
	};

	const handleEditJournal = (journal: ClosingJournal) => {
		router.push(`/report/accounting/closing-journal/modify?id=${journal.id}`);
	};

	const handleDeleteJournal = (journal: ClosingJournal) => {
		setSelectedJournal(journal);
		deleteModal.open();
	};

	const confirmDeleteJournal = () => {
		if (selectedJournal) {
			deleteClosingJournal(selectedJournal.id);
		}
		deleteModal.close();
	};

	return (
		<View className="flex-1 bg-gray-50">
			<AnimatedWrapper
				hasActionButton
				fabBottomOffset={96}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{/* Search Bar with Filter */}
				<SearchBar
					search={searchQuery}
					setSearch={setSearchQuery}
					placeholder="Cari jurnal penutup..."
					withFilter
					onFilterPress={() => setIsFilterSheetOpen(true)}
					filterActive={Boolean(selectedFilter)}
					variant="light"
					
				/>

				{/* Journal Cards */}
				<View className="gap-3.5">
					{filteredJournals.map((journal) => (
						<JournalCard
							key={journal.id}
							journal={journal}
							totalLabel="Total"
							onPress={handleViewDetail}
							onOpenActionMenu={handleOpenActionMenu}
						/>
					))}

					{filteredJournals.length === 0 && (
						<View className="items-center justify-center py-16">
							<Text className="text-sm text-zinc-400">
								Tidak ada jurnal penutup yang ditemukan
							</Text>
						</View>
					)}
				</View>
			</AnimatedWrapper>

			{/* Sticky Bottom "Buat Jurnal Penutup" Button */}
			<View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
				<Button
					size="xl"
					className="h-12 rounded-full bg-primary-500"
					onPress={() =>
						router.push("/report/accounting/closing-journal/modify")
					}
				>
					<ButtonText className="text-base font-semibold text-white">
						Buat Jurnal Penutup
					</ButtonText>
				</Button>
			</View>

			{/* Reusable Item Action Sheet */}
			<ItemActionSheet
				isOpen={isActionSheetOpen}
				onClose={handleCloseActionMenu}
				title={selectedJournal?.referenceNumber}
				detailTitle="Detail Jurnal"
				detailSubtitle="Info lebih lanjut tentang Jurnal"
				onViewDetail={
					selectedJournal ? () => handleViewDetail(selectedJournal) : undefined
				}
				editTitle="Edit Jurnal"
				editSubtitle="Ubah nama, urutan, atau pengaturan lainnya"
				onEdit={
					selectedJournal ? () => handleEditJournal(selectedJournal) : undefined
				}
				deleteTitle="Hapus Jurnal"
				deleteSubtitle="Jurnal akan dihapus permanen"
				onDelete={
					selectedJournal
						? () => handleDeleteJournal(selectedJournal)
						: undefined
				}
			/>

			{/* Filter Action Sheet */}
			<JournalFilterActionSheet
				isOpen={isFilterSheetOpen}
				onClose={() => setIsFilterSheetOpen(false)}
				selectedFilter={selectedFilter}
				onSelectFilter={setSelectedFilter}
				title="Filter Jurnal Penutup"
			/>

			{/* Delete Confirmation Alert Modal */}
			<DeleteConfirmModal
				openState={deleteModal.openState}
				onClose={deleteModal.close}
				onConfirm={confirmDeleteJournal}
				title="Hapus Jurnal Penutup?"
				description="Jurnal penutup ini akan dihapus dan tidak dapat digunakan lagi."
			/>
		</View>
	);
}
