import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import { Form, FormField, FormMessage } from "@/components/common/Form";
import Keypad, { type KeypadState } from "@/components/common/Keypad";
import PinNumber from "@/components/common/PinNumber";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { PinSchema, pinSchema } from "@/schema/pin";

export default function InputPinScreen() {
	const [pin, setPin] = React.useState<KeypadState>(null);
	const [secure, setSecure] = React.useState(true);

	const alertDialog = useAlertModal();

	const form = useForm({
		resolver: zodResolver(pinSchema),
	});

	React.useEffect(() => {
		if (pin) {
			form.setValue("value", pin.toString());
		}
	}, [pin]);

	function handleContinue() {
		router.replace("/home");
	}

	return (
		<>
			<AlertModal
				title="Selamat datang di Sushiro"
				message="Login berhasil, anda akan diarahkan ke halaman utama"
				openState={alertDialog.openState}
				onClose={handleContinue}
				hideCancelButton
				hideConfirmButton
			/>

			<View className="grow bg-zinc-50">
				<View className="p-8">
					<Text className="text-gra-900" w="semibold">
						Masukkan PIN Toko-mu
					</Text>
				</View>
				<View className="mt-8 px-8">
					<Form {...form}>
						<PinNumber length={4} value={pin} secure={secure} />
						<FormField
							control={form.control}
							name="value"
							render={() => <FormMessage className="mt-4" />}
						/>
						<Pressable
							className="mx-auto mt-8 w-fit"
							onPress={() => setSecure(!secure)}
						>
							<Text className="text-xs text-primary" w="medium">
								{secure ? "Lihat" : "Sembunyikan"} PIN
							</Text>
						</Pressable>
					</Form>
				</View>
				<View className="mt-auto">
					<Keypad state={[pin, setPin]} maxLength={4} nullable />
					<ButtonGroup className="px-8 pb-8">
						<Button size="xl" onPress={form.handleSubmit(alertDialog.open)}>
							<ButtonText size="md">Masuk</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</View>
		</>
	);
}
