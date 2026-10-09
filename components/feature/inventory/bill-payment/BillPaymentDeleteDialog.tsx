import React from "react";
import AlertModal from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useInventoryBillPaymentStore } from "@/store/inventoryBillPaymentStore";

export default function BillPaymentDeleteDialog({
	id,
	reference,
	onClose,
	onDeleted,
}: {
	id?: string;
	reference: string;
	onClose: () => void;
	onDeleted: () => void;
}) {
	const openState = React.useState(false);
	const [error, setError] = React.useState("");
	return (
		<>
			<DeleteConfirmModal
				isOpen={id !== undefined}
				itemName={reference}
				onClose={onClose}
				onConfirm={() => {
					if (!id) return;
					const result = useInventoryBillPaymentStore
						.getState()
						.deletePayment(id);
					onClose();
					if ("error" in result) {
						setError(result.error);
						openState[1](true);
					} else onDeleted();
				}}
			/>
			<AlertModal
				openState={openState}
				title="Pembayaran belum dapat dihapus"
				message={error}
				hideCancelButton
				confirmText="Mengerti"
				onConfirm={() => openState[1](false)}
			/>
		</>
	);
}
