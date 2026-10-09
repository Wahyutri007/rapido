import { useRouter } from "expo-router";
import React from "react";
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
import { OTP_KEYS } from "@/constants/Keys";
import type { PersonalInfoSchema } from "@/schema/registration";
import { useOtpState } from "@/store/otp";
import type { State } from "@/types";

type PersonalInfoActionProps = {
	state: State<boolean>;
	form: UseFormReturn<PersonalInfoSchema>;
};

export default function PersonalInfoAction(props: PersonalInfoActionProps) {
	return props.state[0] ? <OpenPersonalInfoAction {...props} /> : null;
}

function OpenPersonalInfoAction({ state, form }: PersonalInfoActionProps) {
	const router = useRouter();

	const registrationState = useOtpState();

	const request = useRegistrationStartRequest(form);

	const [open, setOpen] = state;
	const active = React.useRef(true);

	React.useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);

	function handleClose() {
		active.current = false;
		setOpen(false);
	}

	async function handleSendOtp() {
		if (!active.current || request.isLoading) return;
		const personalInfo = { ...form.getValues() };
		const [data, error] = await request.call(personalInfo);
		if (!active.current) return;
		if (error) {
			handleClose();
			return;
		}
		if (!data) return;

		handleClose();
		registrationState.setType(OTP_KEYS.TYPES.REGISTRATION);
		registrationState.setPersonalInfo(personalInfo);
		registrationState.setVerifyResponse(data);

		router.push(`/(onboarding)/otp`);
	}

	return (
		<Actionsheet isOpen={open} onClose={handleClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="p-8">
				<View className="gap-4">
					<Text className="text-foreground" w="semibold">
						Pastikan email & nomor HP-mu aktif digunakan sehari-hari
					</Text>
					<Text size="normal" className="text-muted">
						Ini akan membantu kamu untuk lebih cepat dan mudah menerima
						informasi status pendaftaran akun Rápido.
					</Text>
				</View>
				<View className="mt-6 w-full gap-4">
					<View className="items-start gap-2">
						<Text size="normal" w="medium">
							Email Pemilik
						</Text>
						<View className="p-3">
							<Text size="normal">{form.getValues().email}</Text>
						</View>
					</View>
					<View className="items-start gap-2">
						<Text size="normal" w="medium">
							Nomor HP pemilik
						</Text>
						<View className="p-3">
							<Text size="normal">{form.getValues().phone}</Text>
						</View>
					</View>
				</View>
				<View className="mt-8 flex-row gap-4">
					<ButtonGroup className="flex-1">
						<Button size="xl" variant="outline" onPress={handleClose}>
							<ButtonText size="md">Perbaiki</ButtonText>
						</Button>
					</ButtonGroup>
					<ButtonGroup className="flex-1">
						<Button
							size="xl"
							onPress={handleSendOtp}
							isDisabled={request.isLoading}
						>
							<ButtonText size="md">Kirim</ButtonText>
						</Button>
					</ButtonGroup>
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
