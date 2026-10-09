import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { REGISTRATION_KEYS } from "@/constants/Keys";
import {
	type BankInfoSchema,
	bankInfoSchema,
	type PasswordInfoSchema,
	type PersonalInfoSchema,
	passwordInfoSchema,
	personalInfoSchema,
} from "@/schema/registration";
import { useRegistrationStore } from "@/store/registration";
import { useParamJson } from "./useParamJson";

const personalFieldsSchema = personalInfoSchema.omit({ tnc: true });

export function useRegistrationForm() {
	const tncAccepted = useRegistrationStore((state) => state.tncAccepted);
	const urlPersonalInfo = useParamJson<PersonalInfoSchema>(
		REGISTRATION_KEYS.PARAMS.PERSONAL_INFO,
	);
	const urlBankInfo = useParamJson<BankInfoSchema>(
		REGISTRATION_KEYS.PARAMS.BANK_INFO,
	);
	const urlPasswordInfo = useParamJson<PasswordInfoSchema>(
		REGISTRATION_KEYS.PARAMS.PASSWORD_INFO,
	);

	// Restore once; later seed changes must not replace an edited form.
	const [initial] = React.useState(() => {
		const store = useRegistrationStore.getState();
		const personal = personalFieldsSchema.safeParse(
			store.personalInfo ?? urlPersonalInfo,
		);
		const bank = bankInfoSchema.safeParse(store.bankInfo ?? urlBankInfo);
		const password = passwordInfoSchema.safeParse(
			store.passwordInfo ?? urlPasswordInfo,
		);
		return {
			personal: {
				...(personal.success
					? personal.data
					: { name: "", email: "", phone: "", password: "" }),
				// Consent comes from the shared state, never from route parameters.
				tnc: store.tncAccepted,
			},
			bank: bank.success
				? bank.data
				: { bankName: "", accountName: "", accountNumber: "" },
			password: password.success
				? password.data
				: { password: "", confirmPassword: "" },
			index: !personal.success || !store.tncAccepted ? 0 : bank.success ? 2 : 1,
		};
	});

	const personalInfoForm = useForm<PersonalInfoSchema>({
		resolver: zodResolver(personalInfoSchema),
		defaultValues: initial.personal,
		mode: "onChange",
	});
	const bankInfoForm = useForm<BankInfoSchema>({
		resolver: zodResolver(bankInfoSchema),
		defaultValues: initial.bank,
	});
	const passwordInfoForm = useForm<PasswordInfoSchema>({
		resolver: zodResolver(passwordInfoSchema),
		defaultValues: initial.password,
	});
	const [index, setIndex] = React.useState(initial.index);
	const { getValues, setValue, subscribe } = personalInfoForm;

	React.useEffect(() => {
		if (getValues("tnc") === tncAccepted) return;
		setValue("tnc", tncAccepted, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
	}, [getValues, setValue, tncAccepted]);

	React.useEffect(() => {
		let active = true;
		const unsubscribe = subscribe({
			name: "tnc",
			exact: true,
			formState: { values: true },
			callback: ({ values }) => {
				if (!active) return;
				const store = useRegistrationStore.getState();
				if (
					typeof values.tnc === "boolean" &&
					values.tnc !== store.tncAccepted
				) {
					store.setTncAccepted(values.tnc);
				}
			},
		});
		return () => {
			active = false;
			unsubscribe();
		};
	}, [subscribe]);

	return {
		personalInfoForm,
		bankInfoForm,
		passwordInfoForm,
		indexState: [index, setIndex] as const,
	};
}
