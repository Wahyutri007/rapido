import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { startRegistrationProcess } from "@/api/queries/registration";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { otpInputTheme } from "@/constants/Config";
import { OTP_KEYS, REGISTRATION_KEYS } from "@/constants/Keys";
import { useParamJson } from "@/hooks/useParamJson";
import usePostRequest from "@/hooks/usePostRequest";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { PersonalInfoSchema } from "@/schema/registration";
import { useOtpState } from "@/store/otp";
import { VerifyDataResponse } from "@/types/api/registration";

export default function OTPScreen() {
	const router = useRouter();

	const otpState = useOtpState();

	const [otp, setOtp] = React.useState("");
	const [isCounting, setIsCounting] = React.useState(false);
	const [otpRetryCooldown, setOtpRetryCooldown] = React.useState(0);

	React.useEffect(() => {
		if (otpState?.type === OTP_KEYS.TYPES.REGISTRATION) {
			if (!otpState.verifyResponse) {
				alert("Terjadi kesalahan. Silakan coba lagi.");
				router.back();
				return;
			}

			console.log("Setting personal info from params", otpState.verifyResponse);
		}
	}, [otpState]);

	const resendRequest = usePostRequest(startRegistrationProcess, {
		onError: () => {
			alert("Gagal mengirim ulang kode. Silakan coba lagi.");
		},
		onSuccess: (data) => {
			alert("Kode verifikasi telah dikirim ulang ke email-mu.");
		},
	});

	async function handleResendCode() {
		if (resendRequest.isLoading) return;

		if (otpState?.type === OTP_KEYS.TYPES.REGISTRATION) {
			if (!otpState.personalInfo) {
				alert("Terjadi kesalahan. Silakan coba lagi.");
				router.back();
				return;
			}

			const [data, error] = await resendRequest.call(otpState.personalInfo);

			if (error) {
				if (error.status === 429) {
					const seconds = error.errors?.seconds;

					alert(
						`Terlalu banyak percobaan mengirim ulang kode. ${seconds ? `Coba lagi dalam ${seconds} detik.` : "Silakan coba lagi nanti."}`,
					);
					return;
				}

				alert("Gagal mengirim ulang kode. Silakan coba lagi.");
				return;
			}

			alert("Kode verifikasi telah dikirim ulang ke email-mu.");
			otpState.setVerifyResponse(data);
		}
	}

	function handleLogin() {
		if (otp.length < 4) {
			alert("Masukkan kode verifikasi");
			return;
		}

		if (otpState?.type === "register") {
			const newParams = new URLSearchParams();

			console.log(otp, otpState.verifyResponse?.otp);

			// newParams.append(
			//   REGISTRATION_KEYS.PARAMS.PERSONAL_INFO,
			//   otpState?.personalInfo as string,
			// );

			// router.push(`/register/wizard?${newParams.toString()}`);
			return;
		}

		router.replace("/choose-store"); // ! This is not going to hit
	}

	return (
		<View className="grow bg-white">
			<View className="px-8">
				<Text w="semibold">Masukkan kode Verifikasi</Text>
				<Text className="mt-4 text-sm text-muted">
					Kode telah dikirimkan ke email-mu!
				</Text>
			</View>
			<View className="mt-8 flex-row gap-3 px-8">
				<OtpInput
					onTextChange={(text) => setOtp(text)}
					theme={otpInputTheme}
					focusColor={Colors.primary}
					numberOfDigits={4}
					autoFocus={false}
				/>
			</View>

			<View className="mt-8 flex-row items-center justify-center gap-1">
				<Text className="text-xs text-muted">Kode belum diterima?</Text>
				<Pressable onPress={handleResendCode}>
					<Text className="text-xs text-primary">Kirim ulang kode</Text>
				</Pressable>
			</View>

			<ButtonGroup className="relative mb-5 mt-auto w-full px-8">
				<Button
					size="xl"
					onPress={handleLogin}
					style={{ opacity: otp.length < 4 ? 0.5 : 1 }}
				>
					<ButtonText size="md">Masuk</ButtonText>
				</Button>
			</ButtonGroup>
		</View>
	);
}
