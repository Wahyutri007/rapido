import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import LoadingAction, {
	useLoadingAction,
} from "@/components/common/LoadingAction";
import FinalConfirmationAction from "@/components/feature/onboarding/FinalConfirmationAction";
import RegistrationHeader from "@/components/feature/register/Header";
import BankInformationScreen from "@/components/feature/register/wizard/BankInformationScreen";
import WizardInformationScreen from "@/components/feature/register/wizard/InformationScreen";
import PasswordInformationScreen from "@/components/feature/register/wizard/PasswordInformationScreen";
import PersonalInfoAction from "@/components/feature/register/wizard/PersonalInfoAction";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { wait } from "@/lib/utils";

export default function WizardScreen() {
	const { personalInfoForm, bankInfoForm, passwordInfoForm, indexState } =
		useRegistrationForm();

	const [index, setIndex] = indexState;

	const [personalInfoActionOpen, setPersonalInfoActionOpen] =
		React.useState(false);

	const finalConfirmation = useAlertModal();

	const loadingAction = useLoadingAction({
		loadingMessage: "Melakukan pendaftaran...",
		successMessage: "Data Pendaftaran Berhasil Diisi",
	});

	function handleContinue() {
		if (index === 0) {
			personalInfoForm.handleSubmit(() => setPersonalInfoActionOpen(true))();
		}

		if (index === 1) {
			bankInfoForm.handleSubmit(() => setIndex(2))();
		}

		if (index === 2) {
			passwordInfoForm.handleSubmit(finalConfirmation.open)();
		}
	}

	function handleFinalConfirmation() {
		finalConfirmation.close();
		loadingAction.load(async () => {
			// * Register here
			await wait(1000);
		});
	}

	function handleFinishActionClose() {
		loadingAction.close();
		router.replace("/login");
	}

	const titleMap: Record<number, string> = {
		0: "Informasi Pribadi",
		1: "Informasi Rekening Bank",
		2: "Buat Password",
	};

	return (
		<View className="flex-1 bg-background">
			<RegistrationHeader title={titleMap[index]} registrationIndex={index} />

			{index === 0 && (
				<WizardInformationScreen
					form={personalInfoForm}
					handleContinue={handleContinue}
				/>
			)}

			{index === 1 && (
				<BankInformationScreen
					form={bankInfoForm}
					handleContinue={handleContinue}
				/>
			)}

			{index === 2 && (
				<PasswordInformationScreen
					form={passwordInfoForm}
					handleContinue={handleContinue}
				/>
			)}

			<PersonalInfoAction
				state={[personalInfoActionOpen, setPersonalInfoActionOpen]}
				form={personalInfoForm}
			/>

			<FinalConfirmationAction
				forms={{
					bankInfo: bankInfoForm,
					personalInfo: personalInfoForm,
					passwordInfo: passwordInfoForm,
				}}
				onConfirm={handleFinalConfirmation}
				openState={finalConfirmation.openState}
			/>

			<LoadingAction
				loadingState={loadingAction.loadingState}
				openState={loadingAction.openState}
				onClose={handleFinishActionClose}
				loadingMessage={loadingAction.loadingMessage}
				successMessage={loadingAction.successMessage}
			/>
		</View>
	);
}
