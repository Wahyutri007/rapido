import { useLayoutEffect, useRef } from "react";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import { useManageIntegrationStore } from "@/store/manageIntegrationStore";
import type { State } from "@/types";
import type { IntegrationDraft } from "@/types/ui/manage/integration";

export default function IntegrationDeleteDialog({
	item,
	openState,
	onDeleted,
}: {
	item: IntegrationDraft;
	openState: State<boolean>;
	onDeleted?: () => void;
}) {
	const success = useAlertModal();
	const error = useAlertModal();
	const remove = useManageIntegrationStore((state) => state.remove);
	const mounted = useRef(false);
	const deleted = useRef(false);
	const acknowledged = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	function confirm() {
		if (!mounted.current || deleted.current) return;
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
			{openState[0] && (
				<Confirmation
					name={item.name}
					onClose={() => openState[1](false)}
					onConfirm={confirm}
				/>
			)}
			<SuccessModal
				openState={success.openState}
				title="Draf integrasi dihapus"
				description="Draf sudah dihapus dari daftar sementara."
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
				title="Draf integrasi tidak tersedia"
				message="Draf sudah tidak ada dalam daftar. Pilih draf yang tersedia."
				hideCancelButton
				confirmText="Tutup"
			/>
		</>
	);
}

function Confirmation({
	name,
	onClose,
	onConfirm,
}: {
	name: string;
	onClose: () => void;
	onConfirm: () => void;
}) {
	const mounted = useRef(false);
	const claimed = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	function act(callback: () => void) {
		if (!mounted.current || claimed.current) return;
		claimed.current = true;
		callback();
	}
	return (
		<DeleteConfirmModal
			openState={[true, () => act(onClose)]}
			itemName={name}
			description="Draf akan dihapus dari daftar sementara."
			onConfirm={() => act(onConfirm)}
		/>
	);
}
