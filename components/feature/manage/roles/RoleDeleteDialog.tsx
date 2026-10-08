import { useRoleDeleteRequest } from "@/api/hooks/roles";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import { roleName } from "@/lib/manage/roles";
import type { State } from "@/types";
import type { RoleData } from "@/types/api/role";

export default function RoleDeleteDialog({
	role,
	openState,
	onDeleted,
}: {
	role: RoleData | null;
	openState: State<boolean>;
	onDeleted?: () => void;
}) {
	const request = useRoleDeleteRequest(undefined, role?.id);
	const success = useAlertModal();
	const error = useAlertModal();
	async function remove() {
		if (!role || request.isLoading) return;
		const [, failed] = await request.call();
		if (failed) {
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
				itemName={role ? roleName(role) : "Role"}
				description="Role akan dihapus dan tidak dapat digunakan lagi. Pastikan akun karyawan tetap memiliki akses yang dibutuhkan."
				onConfirm={remove}
				isLoading={request.isLoading}
			/>
			<SuccessModal
				openState={success.openState}
				title="Role berhasil dihapus"
				description="Role sudah dihapus dari daftar hak akses."
				onClose={() => {
					success.close();
					onDeleted?.();
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Role gagal dihapus"
				message="Role belum dihapus. Silakan periksa koneksi dan coba kembali."
				hideCancelButton
				confirmText="Kembali"
			/>
		</>
	);
}
