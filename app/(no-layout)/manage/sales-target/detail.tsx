import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import { delayedBack } from "@/components/custom/JSStack";
import SalesTargetDetail from "@/components/feature/manage/sales-target/SalesTargetDetail";
import { route } from "@/lib/utils";
import { useSalesTargetStore } from "@/store/salesTargetStore";

export default function SalesTargetDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const target = useSalesTargetStore((state) =>
		state.targets.find((item) => item.id === id),
	);
	const remove = useSalesTargetStore((state) => state.remove);
	const [confirm, setConfirm] = React.useState(false);
	if (!target)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Target penjualan tidak ditemukan." />
			</Wrapper>
		);
	return (
		<>
			<SalesTargetDetail target={target} />
			<DetailBottomActions
				editText="Edit Target"
				deleteText="Hapus Target"
				onEdit={() => router.push(route("/manage/sales-target/modify", { id }))}
				onDelete={() => setConfirm(true)}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				itemName={target.name}
				description="Target ini akan dihapus dari daftar pratinjau."
				onConfirm={() => {
					setConfirm(false);
					remove(id);
					delayedBack();
				}}
			/>
		</>
	);
}
