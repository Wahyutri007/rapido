import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Modal, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import BarcodePreview, {
	type BarcodeFormat,
} from "@/components/custom/BarcodePreview";
import Incrementer from "@/components/custom/Incrementer";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";

type PrintBarcodeModalProps = {
	isOpen: boolean;
	onClose: () => void;
	productName: string;
	barcodeValue: string;
	format?: BarcodeFormat;
	defaultCopies?: number;
	onConfirmPrint?: (copies: number) => void;
};

export default function PrintBarcodeModal(props: PrintBarcodeModalProps) {
	return (
		<Modal
			visible={props.isOpen}
			transparent
			animationType="fade"
			onRequestClose={props.onClose}
		>
			{props.isOpen && (
				<PrintBarcodeContent
					key={JSON.stringify([
						props.barcodeValue,
						props.format ?? "code128",
						props.defaultCopies ?? 1,
					])}
					{...props}
				/>
			)}
		</Modal>
	);
}

function PrintBarcodeContent({
	onClose,
	productName,
	barcodeValue,
	format = "code128",
	defaultCopies = 1,
	onConfirmPrint,
}: PrintBarcodeModalProps) {
	const [copies, setCopies] = React.useState(defaultCopies);
	const [isPrinting, setIsPrinting] = React.useState(false);
	const [printedSuccess, setPrintedSuccess] = React.useState(false);
	const printTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	React.useEffect(
		() => () => {
			if (printTimer.current !== null) clearTimeout(printTimer.current);
			if (closeTimer.current !== null) clearTimeout(closeTimer.current);
		},
		[],
	);

	const handlePrint = () => {
		if (printTimer.current !== null || printedSuccess) return;
		setIsPrinting(true);
		printTimer.current = setTimeout(() => {
			setIsPrinting(false);
			setPrintedSuccess(true);
			onConfirmPrint?.(copies);
			closeTimer.current = setTimeout(() => {
				onClose();
			}, 1200);
		}, 1000);
	};

	return (
		<View className="flex-1 items-center justify-center bg-black/50 px-6">
			<View className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
				{/* Header */}
				<View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
					<View className="flex-row items-center gap-2">
						<View className="size-8 items-center justify-center rounded-lg bg-primary-50">
							<Feather name="printer" size={16} color={Colors.primary} />
						</View>
						<Text size="body" w="bold" className="text-foreground">
							Cetak Barcode
						</Text>
					</View>
					<Pressable onPress={onClose} hitSlop={10}>
						<Feather name="x" size={20} color={Colors.zinc[400]} />
					</Pressable>
				</View>

				{/* Content */}
				<View className="py-4 items-center gap-3">
					<Text
						w="semibold"
						size="normal"
						className="text-center text-foreground"
					>
						{productName}
					</Text>

					{/* Barcode Preview */}
					<View className="w-full rounded-xl border border-gray-100 bg-zinc-50 p-4 items-center">
						<BarcodePreview
							value={barcodeValue}
							format={format}
							width={180}
							height={50}
						/>
					</View>

					{/* Printer Status */}
					<View className="w-full flex-row items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5">
						<View className="flex-row items-center gap-2">
							<View className="size-2 rounded-full bg-emerald-500" />
							<Text size="small" className="text-foreground" w="medium">
								Printer Label Thermal
							</Text>
						</View>
						<Text size="small" className="text-emerald-600" w="semibold">
							Tersedia
						</Text>
					</View>

					{/* Quantity Stepper */}
					<View className="w-full flex-row items-center justify-between pt-1">
						<Text size="normal" className="text-foreground" w="medium">
							Jumlah Lembar:
						</Text>
						<Incrementer
							size="xl"
							variant="outline"
							className="w-32"
							value={copies}
							disabled={isPrinting || printedSuccess}
							min={1}
							max={999}
							onChange={setCopies}
						/>
					</View>
				</View>

				{/* Actions */}
				<View className="flex-row gap-2 pt-2 border-t border-gray-100">
					<Button
						variant="outline"
						className="flex-1 rounded-xl border-gray-200"
						onPress={onClose}
						isDisabled={isPrinting}
					>
						<ButtonText className="text-muted">Batal</ButtonText>
					</Button>
					<Button
						className="flex-1 rounded-xl bg-primary"
						onPress={handlePrint}
						isLoading={isPrinting}
						isDisabled={isPrinting || printedSuccess}
					>
						<ButtonText>{printedSuccess ? "Tercetak!" : "Cetak"}</ButtonText>
					</Button>
				</View>
			</View>
		</View>
	);
}
