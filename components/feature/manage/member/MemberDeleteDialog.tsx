import { useEffect, useRef } from "react";
import { useCustomerDeleteRequest } from "@/api/hooks/customers";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import type { State } from "@/types";
import type { CustomerData } from "@/types/api/customer";

type MemberDeleteDialogProps = {
	member: CustomerData | null;
	openState: State<boolean>;
	onDeleted?: () => void;
};

export default function MemberDeleteDialog(props: MemberDeleteDialogProps) {
	return <MemberDeleteContent key={props.member?.id ?? ""} {...props} />;
}

function MemberDeleteContent({
	member,
	openState,
	onDeleted,
}: MemberDeleteDialogProps) {
	const request = useCustomerDeleteRequest(undefined, member?.id);
	const success = useAlertModal();
	const error = useAlertModal();
	const mounted = useRef(false);
	const pending = useRef(false);
	const deleted = useRef(false);
	const acknowledged = useRef(false);
	const isOpen = openState[0];
	const visible = useRef(isOpen);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	useEffect(() => {
		visible.current = isOpen;
	}, [isOpen]);
	async function remove() {
		if (
			!mounted.current ||
			!visible.current ||
			pending.current ||
			deleted.current ||
			!member?.id ||
			request.isLoading
		)
			return;
		pending.current = true;
		try {
			const [, problem] = await request.call();
			if (!mounted.current) return;
			if (problem) {
				error.open();
				return;
			}
			deleted.current = true;
			openState[1](false);
			success.open();
		} catch {
			if (mounted.current) error.open();
		} finally {
			pending.current = false;
		}
	}
	return (
		<>
			<DeleteConfirmModal
				openState={openState}
				itemName={member?.name ?? "Member"}
				description="Data member akan dihapus dari daftar pelanggan."
				onConfirm={remove}
				isLoading={request.isLoading}
			/>
			<SuccessModal
				openState={success.openState}
				title="Member berhasil dihapus"
				description="Data member sudah dihapus."
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
				title="Member gagal dihapus"
				message="Data belum dihapus. Silakan periksa koneksi dan coba kembali."
				hideCancelButton
				confirmText="Kembali"
			/>
		</>
	);
}
