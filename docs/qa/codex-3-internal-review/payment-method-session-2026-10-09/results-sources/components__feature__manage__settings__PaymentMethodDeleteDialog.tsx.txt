import { useLayoutEffect, useRef } from "react";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import { useManagePaymentMethodStore } from "@/store/managePaymentMethodStore";
import type { State } from "@/types";
import type { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";

export default function PaymentMethodDeleteDialog({
	item,
	openState,
	onDeleted,
}: {
	item: PaymentMethodItemProps;
	openState: State<boolean>;
	onDeleted?: () => void;
}) {
	const success = useAlertModal();
	const error = useAlertModal();
	const remove = useManagePaymentMethodStore((state) => state.remove);
	const mounted = useRef(false);
	const visible = useRef(false);
	const deleted = useRef(false);
	const acknowledged = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useLayoutEffect(() => {
		visible.current = openState[0];
	}, [openState]);
	function confirm() {
		if (!mounted.current || !visible.current || deleted.current) return;
		if (!remove(item.id)) {
			openState[1](false);
			error.open();
			return;
		}
		deleted.current = true;
		openState[1](false);
		success.open();
	}
	return (
		<>
			<DeleteConfirmModal
				openState={openState}
				itemName={item.name}
				description="Metode pembayaran akan dihapus dari daftar sementara ini."
				onConfirm={confirm}
			/>
			<SuccessModal
				openState={success.openState}
				title="Metode pembayaran dihapus"
				description="Metode pembayaran sudah dihapus dari daftar sementara."
				onClose={() => {
					if (!mounted.current || !deleted.current || acknowledged.current)
						return;
					acknowledged.current = true;
					success.close();
					onDeleted?.();
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Metode pembayaran tidak tersedia"
				message="Data sudah tidak ada dalam daftar. Pilih metode pembayaran yang tersedia."
				hideCancelButton
				confirmText="Tutup"
			/>
		</>
	);
}
