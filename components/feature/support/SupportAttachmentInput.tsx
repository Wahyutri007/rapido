import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Text from "@/components/common/Text";
import { EFeather } from "@/components/icons";
import {
	type SupportAttachment,
	supportAttachmentSchema,
} from "@/schema/support";

type SupportAttachmentInputProps = {
	value: SupportAttachment | null;
	onChange: (value: SupportAttachment | null) => void;
};

export default function SupportAttachmentInput({
	value,
	onChange,
}: SupportAttachmentInputProps) {
	const [isPicking, setIsPicking] = useState(false);
	const [error, setError] = useState("");
	const errorModal = useAlertModal();
	const mounted = useRef(true);
	const pending = useRef(false);
	const requestVersion = useRef(0);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			requestVersion.current += 1;
		};
	}, []);

	async function pickAttachment() {
		if (!mounted.current || pending.current) return;
		pending.current = true;
		const request = ++requestVersion.current;
		setIsPicking(true);
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ["image/jpeg", "image/png", "application/pdf"],
				multiple: false,
				copyToCacheDirectory: true,
			});
			if (!mounted.current || request !== requestVersion.current) return;
			if (result.canceled) return;
			const asset = result.assets[0];
			if (!asset || asset.size === undefined) {
				setError(
					"Ukuran lampiran tidak dapat diperiksa. Silakan pilih berkas lain.",
				);
				errorModal.open();
				return;
			}
			const parsed = supportAttachmentSchema.safeParse({
				uri: asset.uri,
				name: asset.name,
				mimeType: asset.mimeType,
				size: asset.size,
			});
			if (!parsed.success) {
				setError(parsed.error.issues[0].message);
				errorModal.open();
				return;
			}
			onChange(parsed.data);
		} catch {
			if (!mounted.current || request !== requestVersion.current) return;
			setError("Lampiran tidak dapat dibuka. Silakan coba lagi.");
			errorModal.open();
		} finally {
			pending.current = false;
			if (mounted.current) setIsPicking(false);
		}
	}

	function removeAttachment() {
		if (!mounted.current) return;
		requestVersion.current += 1;
		onChange(null);
	}

	return (
		<>
			<View className="gap-2 rounded-lg border border-border bg-surface p-3">
				<View className="flex-row items-center gap-2">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={value ? "Ganti lampiran" : "Tambah lampiran"}
						accessibilityState={{ disabled: isPicking, busy: isPicking }}
						disabled={isPicking}
						onPress={pickAttachment}
						className="flex-1 flex-row items-center gap-2"
					>
						<EFeather name="paperclip" size={12} className="text-subtle" />
						<Text
							size="small"
							className="flex-1 text-primary"
							numberOfLines={1}
						>
							{isPicking
								? "Membuka lampiran..."
								: (value?.name ?? "Tambah Lampiran")}
						</Text>
					</Pressable>
					{value && (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Hapus lampiran"
							onPress={removeAttachment}
							hitSlop={8}
						>
							<EFeather name="x" size={16} className="text-muted" />
						</Pressable>
					)}
				</View>
				<Text size="small" className="text-muted">
					Format yang didukung: JPG, PNG, PDF (Maks. 5 MB)
				</Text>
			</View>
			<AlertModal
				openState={errorModal.openState}
				title="Lampiran belum ditambahkan"
				message={error}
				confirmText="Tutup"
				hideCancelButton
			/>
		</>
	);
}
