import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import BottomActionBar from "@/components/common/BottomActionBar";
import Card from "@/components/common/Card";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Text from "@/components/common/Text";
import DetailRow from "@/components/custom/DetailRow";
import { cn, formatRp } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";

export default function ClosingJournalDetailScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const closingJournals = useAccountingStore((state) => state.closingJournals);
	const deleteClosingJournal = useAccountingStore(
		(state) => state.deleteClosingJournal,
	);

	const deleteModal = useAlertModal();

	const journal = useMemo(() => {
		return (
			closingJournals.find((item) => item.id === params.id) ||
			closingJournals[0]
		);
	}, [closingJournals, params.id]);

	if (!journal) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-4">
				<Text className="text-muted">Jurnal penutup tidak ditemukan</Text>
			</View>
		);
	}

	const totalDebit = journal.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
	const totalCredit = journal.lines.reduce(
		(sum, l) => sum + (l.credit || 0),
		0,
	);
	const difference = Math.abs(totalDebit - totalCredit);
	const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

	const handleEdit = () => {
		router.push(`/report/accounting/closing-journal/modify?id=${journal.id}`);
	};

	const handleDelete = () => {
		deleteModal.open();
	};

	const confirmDelete = () => {
		deleteClosingJournal(journal.id);
		deleteModal.close();
		router.back();
	};

	return (
		<View className="flex-1 bg-background">
			<AnimatedWrapper
				hasActionButton
				fabBottomOffset={96}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{/* Section 1: Informasi Jurnal Penutup */}
				<View className="gap-2">
					<Text w="medium" className="px-1 text-muted">
						Informasi Jurnal Penutup
					</Text>

					<Card className="py-1">
						<DetailRow
							icon="file-text"
							label="No Referensi"
							value={journal.referenceNumber}
						/>
						<DetailRow
							icon="calendar"
							label="Periode"
							value={journal.period || "Juni 2026"}
						/>
						<DetailRow icon="calendar" label="Tanggal" value={journal.date} />
						<DetailRow
							icon="file-text"
							label="Deskripsi"
							value={journal.description}
							isLast
						/>
					</Card>
				</View>

				{/* Section 2: Rincian Jurnal */}
				<View className="gap-2">
					<Text w="medium" className="px-1 text-muted">
						Rincian Jurnal
					</Text>

					<Card>
						{journal.lines.map((line, index) => (
							<React.Fragment key={line.id}>
								{index > 0 && <View className="my-3 h-px bg-gray-100" />}

								<View className="flex-row items-center justify-between">
									{/* Account Info on Left */}
									<View className="flex-[1.2] pr-2">
										<Text w="bold" className="text-sm text-foreground">
											{line.accountName}
										</Text>
										<Text className="text-xs text-muted">
											{line.accountCode}
										</Text>
									</View>

									{/* Debit Column */}
									<View className="flex-1 items-center">
										<Text className="text-xs text-muted">Debit</Text>
										<Text w="semibold" className="text-xs text-foreground">
											{formatRp(line.debit).replace(/\s/g, "")}
										</Text>
									</View>

									{/* Kredit Column */}
									<View className="flex-1 items-end">
										<Text className="text-xs text-muted">Kredit</Text>
										<Text w="semibold" className="text-xs text-foreground">
											{formatRp(line.credit).replace(/\s/g, "")}
										</Text>
									</View>
								</View>
							</React.Fragment>
						))}
					</Card>
				</View>

				{/* Section 3: Ringkasan */}
				<View className="gap-2">
					<Text w="medium" className="px-1 text-muted">
						Ringkasan
					</Text>

					<Card>
						<View className="gap-3">
							{/* Total Debit & Total Kredit side by side */}
							<View className="flex-row items-center justify-between py-1">
								<View className="flex-1 items-center">
									<Text className="text-xs text-muted">Total Debit</Text>
									<Text w="bold" className="text-sm text-foreground">
										{formatRp(totalDebit).replace(/\s/g, "")}
									</Text>
								</View>

								<View className="h-7 w-px bg-gray-200" />

								<View className="flex-1 items-center">
									<Text className="text-xs text-muted">Total Kredit</Text>
									<Text w="bold" className="text-sm text-foreground">
										{formatRp(totalCredit).replace(/\s/g, "")}
									</Text>
								</View>
							</View>

							{/* Selisih & Status Badge */}
							<View className="items-center gap-1.5 pt-1">
								<Text className="text-xs text-muted">Selisih</Text>
								<Text
									w="bold"
									className={cn(
										"text-sm",
										difference === 0 ? "text-success" : "text-destructive",
									)}
								>
									{formatRp(difference).replace(/\s/g, "")}
								</Text>

								{isBalanced ? (
									<View className="flex-row items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
										<Feather name="check-circle" size={13} color="#059669" />
										<Text className="text-xs font-semibold text-success">
											Seimbang
										</Text>
									</View>
								) : (
									<View className="flex-row items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1">
										<Feather name="alert-circle" size={13} color="#DC2626" />
										<Text className="text-xs font-semibold text-destructive">
											Tidak Seimbang
										</Text>
									</View>
								)}
							</View>
						</View>
					</Card>
				</View>
			</AnimatedWrapper>

			{/* Sticky Bottom Edit & Hapus Buttons */}
			<BottomActionBar className="flex-row items-center gap-3">
				<Pressable
					onPress={handleEdit}
					className="h-12 flex-1 items-center justify-center rounded-full border border-primary-500 bg-white active:bg-primary-50"
				>
					<Text w="semibold" className="text-base text-primary-500">
						Edit
					</Text>
				</Pressable>

				<Pressable
					onPress={handleDelete}
					className="h-12 flex-1 items-center justify-center rounded-full bg-red-50 active:bg-red-100"
				>
					<Text w="semibold" className="text-base text-destructive">
						Hapus
					</Text>
				</Pressable>
			</BottomActionBar>

			{/* Delete Confirmation Alert Modal */}
			<DeleteConfirmModal
				openState={deleteModal.openState}
				onClose={deleteModal.close}
				onConfirm={confirmDelete}
				title="Hapus Jurnal Penutup?"
				description="Jurnal penutup ini akan dihapus dan tidak dapat digunakan lagi."
			/>
		</View>
	);
}
