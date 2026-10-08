import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import { Form, FormField, FormMessage } from "@/components/common/Form";
import Keypad, { type KeypadState } from "@/components/common/Keypad";
import LoadingAction, {
	useLoadingAction,
} from "@/components/common/LoadingAction";
import PinNumber from "@/components/common/PinNumber";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { wait } from "@/lib/utils";
import { pinSchema } from "@/schema/pin";

export default function RefundInputPinScreen() {
	const [pin, setPin] = React.useState<KeypadState>(null);
	const [secure, setSecure] = React.useState(true);

	const alertDialog = useAlertModal();
	const loadingAction = useLoadingAction({
		loadingMessage: "Memproses...",
		successMessage: "Berhasil memproses",
	});

	const form = useForm({
		resolver: zodResolver(pinSchema),
	});

	React.useEffect(() => {
		if (pin) {
			form.setValue("value", pin.toString());
		}
	}, [pin]);

	function handleContinue() {
		loadingAction.load(async () => {
			// * Simulate processing
			await wait(1000);
		});
	}

	function handleLoadingClose() {
		router.replace("/order-detail");
	}

	return (
		<>
			<LoadingAction
				actionData={loadingAction.actionData}
				onClose={handleLoadingClose}
			/>

			<View className="grow bg-zinc-50">
				<View className="p-8">
					<Text className="text-gray-900" w="semibold">
						Masukkan PIN
					</Text>
					<Text className="mt-4 text-xs text-muted">
						Untuk melanjutkan proses refund, masukkan PIN untuk melakukan
						konfirmasi aksi ini.
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
						<Button size="xl" onPress={form.handleSubmit(handleContinue)}>
							<ButtonText size="md">Masuk</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</View>
		</>
	);
}
