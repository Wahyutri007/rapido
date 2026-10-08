import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import { BackspaceIcon, CheckCircleIcon, InfoIcon } from "@/components/icons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import useSecureStore from "@/hooks/useSecureStore";
import { cn, parseNumber, parseRp, wait } from "@/lib/utils";
import type { State } from "@/types";

function InputText(props: React.PropsWithChildren) {
	const { children } = props;

	return (
		<Text className="text-lg text-gray-900" w="semibold">
			{children}
		</Text>
	);
}

function InputButton(
	props: React.PropsWithChildren<{
		text?: string;
		onPress?: () => void;
	}>,
) {
	const { children, text, onPress } = props;

	return (
		<Pressable className="h-[60px] grow" onPress={onPress}>
			{({ pressed }) => (
				<View
					className={cn(
						"size-full items-center justify-center",
						pressed ? "bg-gray-200" : "bg-white",
					)}
				>
					<View className="size-6 items-center justify-center">
						{text ? <InputText>{text}</InputText> : children}
					</View>
				</View>
			)}
		</Pressable>
	);
}

function InputGrid(props: { state: State<string> }) {
	const { state } = props;

	const [value, setValue] = state;

	const setKasAwal = (text: string) => {
		if (text === "C") {
			setValue("0");
		} else if (text === "BACK") {
			setValue((prev) => {
				if (prev.length > 1) {
					return prev.slice(0, -1);
				} else {
					return "0";
				}
			});
		} else if (value === "0") {
			setValue(text);
		} else {
			setValue((prev) => prev + text);
		}
	};

	const formattedValue = parseRp(value);
	const parsedValue = parseNumber(value);
	const amountStatus =
		parsedValue === 0 ? "empty" : parsedValue < 20000 ? "minimal" : "valid";

	return (
		<View className="rounded-t-[20px] bg-white py-5">
			<View className="px-8">
				<View
					className={cn("mx-auto rounded-[10px] border px-[50px] py-2.5", {
						"border-gray-300": amountStatus === "empty",
						"border-error-200": amountStatus === "minimal",
						"border-success-200": amountStatus === "valid",
					})}
				>
					<Text className="text-center text-xs text-muted" w="medium">
						Uang Kas Awal: {formattedValue}
					</Text>
				</View>
				<View className="mx-auto mt-2.5 flex-row items-center gap-1">
					{amountStatus === "valid" ? (
						<CheckCircleIcon size={12} color={Colors.success.main} />
					) : amountStatus === "minimal" ? (
						<InfoIcon size={12} color={Colors.warning.main} />
					) : (
						<InfoIcon size={12} color={Colors.zinc[400]} />
					)}
					<Text
						className={cn("text-xs", {
							"text-muted": amountStatus === "empty",
							"text-error-200": amountStatus === "minimal",
							"text-success-200": amountStatus === "valid",
						})}
						w="medium"
					>
						{amountStatus === "valid"
							? "Uang kas sudah bisa disimpan!"
							: amountStatus === "minimal"
								? "Kas awal tidak cukup. Minimal Rp 20.000"
								: "Minimal Uang Kas: Rp 20.000"}
					</Text>
				</View>
			</View>

			<View className="flex-row">
				<InputButton onPress={() => setKasAwal("1")} text="1" />
				<InputButton onPress={() => setKasAwal("2")} text="2" />
				<InputButton onPress={() => setKasAwal("3")} text="3" />
			</View>
			<View className="flex-row">
				<InputButton onPress={() => setKasAwal("4")} text="4" />
				<InputButton onPress={() => setKasAwal("5")} text="5" />
				<InputButton onPress={() => setKasAwal("6")} text="6" />
			</View>
			<View className="flex-row">
				<InputButton onPress={() => setKasAwal("7")} text="7" />
				<InputButton onPress={() => setKasAwal("8")} text="8" />
				<InputButton onPress={() => setKasAwal("9")} text="9" />
			</View>
			<View className="flex-row">
				<InputButton onPress={() => setKasAwal("C")} text="C" />
				<InputButton onPress={() => setKasAwal("0")} text="0" />
				<InputButton onPress={() => setKasAwal("BACK")}>
					<BackspaceIcon size={24} />
				</InputButton>
			</View>
		</View>
	);
}

export default function InputKas() {
	const kasAwalState = React.useState("0");

	const [storeOpen, setStoreOpen] = useSecureStore("storeOpen", false);
	const [kasAwal, setKasAwal] = useSecureStore("kasAwal", "0");

	const [value] = kasAwalState;

	const confirmationAlert = useAlertModal();
	const confirmedAlert = useAlertModal();

	function handleContinue() {
		if (parseNumber(value) < 20000) {
			return;
		}

		confirmationAlert.open();
	}

	async function handleConfirm() {
		// * Simulate API call
		await wait(1000);

		confirmationAlert.close();
		confirmedAlert.open();
	}

	function handleConfirmedClose() {
		confirmedAlert.close();
		setStoreOpen(true);
		setKasAwal(value);
		router.replace("/home");
	}

	return (
		<>
			<AlertModal
				openState={confirmedAlert.openState}
				title="🚀 Toko Siap Beroperasi!"
				message={`Kas awal sebesar ${parseRp(value)} telah tercatat.Toko sekarang resmi dibuka dan siap untuk transaksi!`}
				onConfirm={handleConfirm}
				hideCancelButton
				hideConfirmButton
				onClose={handleConfirmedClose}
			/>
			<AlertModal
				openState={confirmationAlert.openState}
				message="Ini jumlah uang kas awal yang kamu masukkan. Pastikan sudah benar sebelum mulai berjualan, ya!"
				title="Sudah yakin dengan nominal uang kas awalnya?"
				onConfirm={handleConfirm}
				cancelText="Belum, ulang"
				confirmText="Yakin"
			/>

			<View className="grow bg-zinc-50">
				<Header title="Uang Kas Awal" back />
				<View className="grow flex-row items-center justify-center gap-1 px-16">
					<Text className="shrink-0 text-[32px] text-muted" w="medium">
						Rp
					</Text>
					<Text className="text-[32px] text-gray-900" w="medium">
						{parseRp(value, false)}
					</Text>
				</View>
				<View className="mt-auto">
					<InputGrid state={kasAwalState} />
					<ButtonGroup className="bg-white px-8 pb-8 pt-2">
						<Button
							size="xl"
							style={{
								opacity: parseNumber(value) < 20000 ? 0.5 : 1,
								pointerEvents: parseNumber(value) < 20000 ? "none" : "auto",
							}}
							onPress={handleContinue}
						>
							<ButtonText size="md">Lanjut</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</View>
		</>
	);
}
