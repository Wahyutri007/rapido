import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import { delayedBack } from "@/components/custom/JSStack";
import IncomeDetail from "@/components/feature/manage/income/IncomeDetail";
import { removeManagedIncome } from "@/lib/manage/incomes";
import { route } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";

export default function IncomeDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const income = useAccountingStore((state) =>
		state.incomes.find((item) => item.id === id),
	);
	const [confirm, setConfirm] = React.useState(false);
	if (!income)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Penerimaan tidak ditemukan." />
			</Wrapper>
		);
	return (
		<>
			<IncomeDetail income={income} />
			{income.type === "manual" && (
				<>
					<DetailBottomActions
						editText="Edit"
						deleteText="Hapus"
						onEdit={() => router.push(route("/manage/income/modify", { id }))}
						onDelete={() => setConfirm(true)}
					/>
					<DeleteConfirmModal
						isOpen={confirm}
						onClose={() => setConfirm(false)}
						title="Hapus Penerimaan?"
						itemName={income.referenceNumber}
						description="Penerimaan manual ini akan dihapus dari daftar dan laporan pratinjau."
						onConfirm={() => {
							setConfirm(false);
							if (removeManagedIncome(id)) delayedBack();
						}}
					/>
				</>
			)}
		</>
	);
}
