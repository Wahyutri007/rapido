import { useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { z } from "zod";
import { useRegistrationResendRequest } from "@/api/hooks/otp";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { otpInputTheme } from "@/constants/Config";
import { OTP_KEYS } from "@/constants/Keys";
import type { PersonalInfoSchema } from "@/schema/registration";
import { useOtpState } from "@/store/otp";
import type { VerifyDataResponse } from "@/types/api/registration";

export default function OTPScreen() {
	const router = useRouter();
	const otpState = useOtpState();
	const redirected = React.useRef(false);
	const [session, setSession] = React.useState(() => ({
		personalInfo: otpState.personalInfo,
		verifyResponse: otpState.verifyResponse,
		revision: 0,
	}));

	if (
		session.personalInfo !== otpState.personalInfo ||
		session.verifyResponse !== otpState.verifyResponse
	) {
		setSession({
			personalInfo: otpState.personalInfo,
			verifyResponse: otpState.verifyResponse,
			revision: session.revision + 1,
		});
	}

	const validSession =
		otpState.type === OTP_KEYS.TYPES.REGISTRATION &&
		!!otpState.personalInfo &&
		!!otpState.verifyResponse;

	React.useEffect(() => {
		if (validSession || redirected.current) return;
		redirected.current = true;
		alert("Terjadi kesalahan. Silakan coba lagi.");
		router.back();
	}, [validSession, router]);

	if (!otpState.personalInfo || !otpState.verifyResponse || !validSession) {
		return null;
	}

	return (
		<RegistrationOTPScreen
			key={session.revision}
			personalInfo={otpState.personalInfo}
			verifyResponse={otpState.verifyResponse}
		/>
	);
}

function RegistrationOTPScreen({
	personalInfo,
	verifyResponse,
}: {
	personalInfo: PersonalInfoSchema;
	verifyResponse: VerifyDataResponse;
}) {
	const resendRequest = useRegistrationResendRequest();
	const mounted = React.useRef(true);
	const sending = React.useRef(false);
	const retryUntil = React.useRef(0);

	const [otp, setOtp] = React.useState("");
	const [cooldown, setCooldown] = React.useState({ until: 0, remaining: 0 });
	const isCoolingDown = cooldown.remaining > 0;

	React.useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	React.useEffect(() => {
		if (!isCoolingDown) return;
		const interval = setInterval(() => {
			if (!mounted.current) return;
			setCooldown({
				until: cooldown.until,
				remaining: Math.max(0, Math.ceil((cooldown.until - Date.now()) / 1000)),
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [cooldown.until, isCoolingDown]);

	function isCurrentSession() {
		const current = useOtpState.getState();
		return (
			mounted.current &&
			current.type === OTP_KEYS.TYPES.REGISTRATION &&
			current.personalInfo === personalInfo &&
			current.verifyResponse === verifyResponse
		);
	}

	async function handleResendCode() {
		if (
			!isCurrentSession() ||
			sending.current ||
			Date.now() < retryUntil.current
		) {
			return;
		}

		sending.current = true;
		try {
			const [data, error] = await resendRequest.call({ ...personalInfo });
			if (!isCurrentSession()) return;

			if (error?.status === 429) {
				const parsed = z
					.object({ seconds: z.number().finite().positive() })
					.safeParse(error.errors);
				const until = parsed.success
					? Date.now() + parsed.data.seconds * 1000
					: 0;
				const remaining =
					parsed.success && Number.isFinite(until)
						? Math.ceil(parsed.data.seconds)
						: 0;
				if (remaining > 0) {
					retryUntil.current = until;
					setCooldown({ until, remaining });
				}
				alert(
					`Terlalu banyak percobaan mengirim ulang kode. ${remaining > 0 ? `Coba lagi dalam ${remaining} detik.` : "Silakan coba lagi nanti."}`,
				);
				return;
			}

			if (error || !data) {
				alert("Gagal mengirim ulang kode. Silakan coba lagi.");
				return;
			}

			useOtpState.getState().setVerifyResponse(data);
			alert("Kode verifikasi telah dikirim ulang ke email-mu.");
		} catch {
			if (isCurrentSession()) {
				alert("Gagal mengirim ulang kode. Silakan coba lagi.");
			}
		} finally {
			sending.current = false;
		}
	}

	function handleLogin() {
		if (!isCurrentSession()) return;
		if (otp.length < 4) {
			alert("Masukkan kode verifikasi");
			return;
		}

		// Server-side verification needs its own confirmed API contract.
		alert("Verifikasi kode belum tersedia. Silakan coba lagi nanti.");
	}

	return (
		<Wrapper>
			<View className="px-8">
				<Text w="semibold">Masukkan kode Verifikasi</Text>
				<Text size="normal" className="mt-4 text-muted">
					Kode telah dikirimkan ke email-mu!
				</Text>
			</View>
			<View className="mt-8 flex-row gap-3 px-8">
				<OtpInput
					onTextChange={setOtp}
					theme={otpInputTheme}
					focusColor={Colors.primary}
					numberOfDigits={4}
					autoFocus={false}
				/>
			</View>

			<View className="mt-8 flex-row items-center justify-center gap-1">
				<Text size="small" className="text-muted">
					Kode belum diterima?
				</Text>
				<Pressable
					onPress={handleResendCode}
					disabled={resendRequest.isLoading || isCoolingDown}
					accessibilityRole="button"
					accessibilityState={{
						disabled: resendRequest.isLoading || isCoolingDown,
						busy: resendRequest.isLoading,
					}}
				>
					<Text size="small" className="text-primary">
						{resendRequest.isLoading
							? "Mengirim..."
							: isCoolingDown
								? `Kirim ulang (${cooldown.remaining} dtk)`
								: "Kirim ulang kode"}
					</Text>
				</Pressable>
			</View>

			<ButtonGroup className="relative mb-5 mt-auto w-full px-8">
				<Button
					size="xl"
					onPress={handleLogin}
					isDisabled={otp.length < 4 || resendRequest.isLoading}
				>
					<ButtonText>Masuk</ButtonText>
				</Button>
			</ButtonGroup>
		</Wrapper>
	);
}
