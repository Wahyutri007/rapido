import React from "react";
import AlertModal from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useInventoryCompositionStore } from "@/store/inventoryCompositionStore";

export default function CompositionDeleteDialog({
	productId,
	productName,
	onClose,
	onDeleted,
}: {
	productId?: string;
	productName: string;
	onClose: () => void;
	onDeleted: () => void;
}) {
	const deleteComposition = useInventoryCompositionStore(
		(state) => state.deleteComposition,
	);
	const openState = React.useState(false);
	const [error, setError] = React.useState("");
	function confirm() {
		if (!productId) return;
		const result = deleteComposition(productId);
		onClose();
		if ("error" in result) {
			setError(result.error);
			openState[1](true);
		} else onDeleted();
	}
	return (
		<>
			<DeleteConfirmModal
				isOpen={productId !== undefined}
				itemName={`resep ${productName}`}
				onClose={onClose}
				onConfirm={confirm}
			/>
			<AlertModal
				openState={openState}
				title="Resep belum dapat dihapus"
				message={error}
				hideCancelButton
				confirmText="Mengerti"
				onConfirm={() => openState[1](false)}
			/>
		</>
	);
}
