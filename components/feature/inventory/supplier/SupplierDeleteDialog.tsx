import React from "react";
import AlertModal from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useInventorySupplierStore } from "@/store/inventorySupplierStore";
import type { InventorySupplier } from "@/types/ui/inventory/supplier";

export default function SupplierDeleteDialog({
	supplier,
	onClose,
	onDeleted,
}: {
	supplier?: InventorySupplier;
	onClose: () => void;
	onDeleted?: () => void;
}) {
	const deleteSupplier = useInventorySupplierStore(
		(state) => state.deleteSupplier,
	);
	const errorState = React.useState(false);
	const [message, setMessage] = React.useState("");
	function confirm() {
		if (!supplier) return;
		const result = deleteSupplier(supplier.id);
		onClose();
		if ("error" in result) {
			setMessage(result.error);
			errorState[1](true);
		} else onDeleted?.();
	}
	return (
		<>
			<DeleteConfirmModal
				isOpen={Boolean(supplier)}
				itemName={supplier?.name}
				onClose={onClose}
				onConfirm={confirm}
			/>
			<AlertModal
				openState={errorState}
				title="Pemasok belum dapat dihapus"
				message={message}
				hideCancelButton
				confirmText="Mengerti"
				onConfirm={() => errorState[1](false)}
			/>
		</>
	);
}
