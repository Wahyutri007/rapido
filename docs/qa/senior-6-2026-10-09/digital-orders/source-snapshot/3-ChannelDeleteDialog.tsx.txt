import { useLayoutEffect, useRef } from "react";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import { useDigitalOrderChannelStore } from "@/store/digitalOrderChannelStore";
import type { State } from "@/types";
import type { DigitalOrderChannel } from "@/types/ui/manage/digital-order-channel";

export default function ChannelDeleteDialog({
	item,
	openState,
	onDeleted,
}: {
	item: DigitalOrderChannel;
	openState: State<boolean>;
	onDeleted?: () => void;
}) {
	const success = useAlertModal();
	const error = useAlertModal();
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
		const result = useDigitalOrderChannelStore
			.getState()
			.remove(item.id, item.revision);
		openState[1](false);
		if (!result.ok) {
			error.open();
			return;
		}
		deleted.current = true;
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
				title="Draf kanal dihapus"
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
				title="Draf tidak dapat dihapus"
				message="Data kanal berubah atau sudah tidak tersedia. Pilih kembali kanal dari daftar sebelum menghapus."
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
			description="Draf kanal akan dihapus dari daftar sementara."
			onConfirm={() => act(onConfirm)}
		/>
	);
}
