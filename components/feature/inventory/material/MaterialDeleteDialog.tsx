import React from "react";
import AlertModal from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import type { InventoryMaterial } from "@/types/ui/inventory/material";

export default function MaterialDeleteDialog({
	material,
	onClose,
	onDeleted,
}: {
	material?: InventoryMaterial;
	onClose: () => void;
	onDeleted?: () => void;
}) {
	const deleteMaterial = useInventoryMaterialStore(
		(state) => state.deleteMaterial,
	);
	const openState = React.useState(false);
	const [message, setMessage] = React.useState("");
	function confirm() {
		if (!material) return;
		const result = deleteMaterial(material.id);
		onClose();
		if ("error" in result) {
			setMessage(result.error);
			openState[1](true);
		} else onDeleted?.();
	}
	return (
		<>
			<DeleteConfirmModal
				isOpen={Boolean(material)}
				itemName={material?.name}
				onClose={onClose}
				onConfirm={confirm}
			/>
			<AlertModal
				openState={openState}
				title="Bahan baku belum dapat dihapus"
				message={message}
				hideCancelButton
				confirmText="Mengerti"
				onConfirm={() => openState[1](false)}
			/>
		</>
	);
}
