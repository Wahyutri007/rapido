import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	DETECTED_PRINTERS,
	PRINTER_ITEMS,
} from "@/constants/data/other/printer";

export default function PrinterModifyScreen() {
	const { id: printerId } = useLocalSearchParams<{ id?: string | string[] }>();

	return (
		<PrinterPreview
			key={JSON.stringify(printerId) ?? "new"}
			printerId={printerId}
		/>
	);
}

function PrinterPreview({ printerId }: { printerId?: string | string[] }) {
	const printerItem = PRINTER_ITEMS.find((item) => item.id === printerId);

	const unavailableModal = useAlertModal();

	if (printerId !== undefined && !printerItem) {
		return (
			<>
				<Wrapper
					hasActionButton
					contentContainerStyle={{ padding: 16, gap: 16 }}
				>
					<Card className="gap-1">
						<Text size="normal" w="semibold">
							Printer tidak ditemukan
						</Text>
						<Text size="small" className="text-muted">
							Tautan printer tidak valid. Kembali ke daftar untuk memilih
							printer.
						</Text>
					</Card>
				</Wrapper>
				<BottomActionButton onPress={() => router.replace("/manage/printer")}>
					Kembali ke daftar printer
				</BottomActionButton>
			</>
		);
	}

	return (
		<>
			<AlertModal
				title="Belum dapat menyimpan printer"
				message="Printer belum terhubung ke perangkat. Data contoh ini tidak disimpan dan tidak ada pengaturan printer yang diubah."
				openState={unavailableModal.openState}
				hideCancelButton
				confirmText="Tutup"
			/>

			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-1">
					<Text size="normal" w="semibold">
						Pratinjau printer
					</Text>
					<Text size="small" className="text-muted">
						{printerItem
							? `Pengaturan contoh ${printerItem.name}. `
							: "Tambah printer belum tersedia. "}
						Daftar di bawah adalah contoh, bukan hasil deteksi perangkat.
					</Text>
				</Card>
				<Card className="gap-4">
					<Text size="normal" w="semibold">
						Contoh printer
					</Text>
					{DETECTED_PRINTERS.map((printer) => (
						<View
							key={printer.id}
							className="flex-row items-center justify-between gap-2"
						>
							<Text className="flex-1">{printer.name}</Text>
							<Text>{printer.method}</Text>
						</View>
					))}
				</Card>
			</Wrapper>
			<BottomActionButton onPress={unavailableModal.open}>
				Simpan
			</BottomActionButton>
		</>
	);
}
