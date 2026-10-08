import { useRouter } from "expo-router";
import type { UseFormReturn } from "react-hook-form";
import { View } from "react-native";
import { useRegistrationStartRequest } from "@/api/hooks/registration";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { OTP_KEYS, REGISTRATION_KEYS } from "@/constants/Keys";
import type { PersonalInfoSchema } from "@/schema/registration";
import { useOtpState } from "@/store/otp";
import type { State } from "@/types";

export default function PersonalInfoAction({
	state,
	form,
}: {
	state: State<boolean>;
	form: UseFormReturn<PersonalInfoSchema>;
}) {
	const router = useRouter();

	const registrationState = useOtpState();

	const request = useRegistrationStartRequest(form);

	const [open, setOpen] = state;

	async function handleSendOtp() {
		const [data, error] = await request.call(form.getValues());

		setOpen(false);

		if (error) {
			return;
		}

		registrationState.setType(OTP_KEYS.TYPES.REGISTRATION);
		registrationState.setPersonalInfo(form.getValues());
		registrationState.setVerifyResponse(data);

		router.push(`/(onboarding)/otp`);
	}

	return (
		<Actionsheet isOpen={open} onClose={() => setOpen(false)}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="p-8">
				<View className="gap-4">
					<Text className="text-gray-900" w="semibold">
						Pastikan email & nomor HP-mu aktif digunakan sehari-hari
					</Text>
					<Text className="text-sm text-muted">
						Ini akan membantu kamu untuk lebih cepat dan mudah menerima
						informasi status pendaftaran akun Rápido.
					</Text>
				</View>
				<View className="mt-6 w-full gap-4">
					<View className="items-start gap-2">
						<Text className="text-sm" w="medium">
							Email Pemilik
						</Text>
						<View className="p-3">
							<Text className="text-sm">
								{form.getValues().email}
							</Text>
						</View>
					</View>
					<View className="items-start gap-2">
						<Text className="text-sm" w="medium">
							Nomor HP pemilik
						</Text>
						<View className="p-3">
							<Text className="text-sm">
								{form.getValues().phone}
							</Text>
						</View>
					</View>
				</View>
				<View className="mt-8 flex-row gap-4">
					<ButtonGroup className="flex-1">
						<Button size="xl" variant="outline" onPress={() => setOpen(false)}>
							<ButtonText size="md" className="text-primary">
								Perbaiki
							</ButtonText>
						</Button>
					</ButtonGroup>
					<ButtonGroup className="flex-1">
						<Button size="xl" onPress={handleSendOtp}>
							<ButtonText size="md">Kirim</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
