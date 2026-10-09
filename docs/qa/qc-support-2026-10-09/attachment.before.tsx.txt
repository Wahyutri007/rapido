import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
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

	async function pickAttachment() {
		if (isPicking) return;
		setIsPicking(true);
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ["image/jpeg", "image/png", "application/pdf"],
				multiple: false,
				copyToCacheDirectory: true,
			});
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
			setError("Lampiran tidak dapat dibuka. Silakan coba lagi.");
			errorModal.open();
		} finally {
			setIsPicking(false);
		}
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
							onPress={() => onChange(null)}
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
