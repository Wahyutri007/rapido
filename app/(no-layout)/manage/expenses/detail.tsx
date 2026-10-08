import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import { delayedBack } from "@/components/custom/JSStack";
import ExpenseDetail from "@/components/feature/manage/expenses/ExpenseDetail";
import { route } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";

export default function ExpenseDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const expense = useAccountingStore((state) =>
		state.expenses.find((item) => item.id === id && item.type === "expense"),
	);
	const remove = useAccountingStore((state) => state.deleteExpense);
	const [confirm, setConfirm] = React.useState(false);
	if (!expense)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pengeluaran tidak ditemukan." />
			</Wrapper>
		);
	return (
		<>
			<ExpenseDetail expense={expense} />
			<DetailBottomActions
				editText="Edit"
				deleteText="Hapus"
				onEdit={() => router.push(route("/manage/expenses/modify", { id }))}
				onDelete={() => setConfirm(true)}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				title="Hapus Pengeluaran?"
				itemName={expense.referenceNumber}
				description="Pengeluaran ini akan dihapus dari daftar dan laporan pratinjau."
				onConfirm={() => {
					setConfirm(false);
					remove(id);
					delayedBack();
				}}
			/>
		</>
	);
}
