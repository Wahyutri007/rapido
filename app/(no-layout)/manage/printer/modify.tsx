import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { Form } from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import {
	DETECTED_PRINTERS,
	PRINTER_ITEMS,
} from "@/constants/data/other/printer";
import { wait } from "@/lib/utils";

export default function PrinterModifyScreen() {
	const { id: printerId } = useLocalSearchParams<{ id?: string }>();

	return <PrinterForm key={printerId ?? "new"} printerId={printerId} />;
}

function PrinterForm({ printerId }: { printerId?: string }) {
	const printerItem = PRINTER_ITEMS.find((item) => item.id === printerId);

	const form = useForm();

	const finishModal = useAlertModal();

	async function handleSubmit() {
		if (printerId && !printerItem) return;
		// * Call api HERE
		await wait(1000);

		finishModal.open();
	}

	function handleModalClose() {
		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (printerId && !printerItem) {
			alert("Printer tidak ditemukan");
			router.back();
		}
	}, [printerId, printerItem]);

	if (printerId && !printerItem) return null;

	return (
		<>
			<SuccessModal
				title={`Printer Berhasil ${printerItem ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menambahkan printer pada halaman daftar printer."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card>
					<Form {...form}>
						<View className="gap-5">
							<Text size="normal" w="semibold" className="text-foreground">
								Printer Terdeteksi
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
						</View>
					</Form>
				</Card>
			</Wrapper>
			<BottomActionButton onPress={form.handleSubmit(handleSubmit)}>
				Simpan
			</BottomActionButton>
		</>
	);
}
