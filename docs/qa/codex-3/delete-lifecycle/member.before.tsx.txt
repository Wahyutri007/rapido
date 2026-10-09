import { useCustomerDeleteRequest } from "@/api/hooks/customers";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import type { State } from "@/types";
import type { CustomerData } from "@/types/api/customer";

export default function MemberDeleteDialog({
	member,
	openState,
	onDeleted,
}: {
	member: CustomerData | null;
	openState: State<boolean>;
	onDeleted?: () => void;
}) {
	const request = useCustomerDeleteRequest(undefined, member?.id);
	const success = useAlertModal();
	const error = useAlertModal();
	async function remove() {
		if (!member || request.isLoading) return;
		const [, problem] = await request.call();
		if (problem) {
			error.open();
			return;
		}
		openState[1](false);
		success.open();
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
