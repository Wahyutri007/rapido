import { useWorkerDeleteRequest } from "@/api/hooks/workers";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import type { State } from "@/types";
import type { WorkerData } from "@/types/api/worker";

export default function WorkerDeleteDialog({
	worker,
	openState,
	onDeleted,
}: {
	worker: WorkerData | null;
	openState: State<boolean>;
	onDeleted?: () => void;
}) {
	const request = useWorkerDeleteRequest(undefined, worker?.id);
	const success = useAlertModal();
	const error = useAlertModal();
	async function remove() {
		if (!worker || request.isLoading) return;
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
				itemName={worker?.name ?? "Karyawan"}
				description="Akun karyawan akan dihapus dan tidak dapat digunakan untuk login kembali."
				onConfirm={remove}
				isLoading={request.isLoading}
			/>
			<SuccessModal
				openState={success.openState}
				title="Karyawan berhasil dihapus"
				description="Akun karyawan sudah dihapus."
				onClose={() => {
					success.close();
					onDeleted?.();
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Karyawan gagal dihapus"
				message="Data belum dihapus. Silakan periksa koneksi dan coba kembali."
				hideCancelButton
				confirmText="Kembali"
			/>
		</>
	);
}
