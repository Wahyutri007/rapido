import {
  bankInfoSchema,
  BankInfoSchema,
  PasswordInfoSchema,
  passwordInfoSchema,
  personalInfoSchema,
  PersonalInfoSchema,
} from "@/schema/registration";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { useParamJson } from "./useParamJson";
import { REGISTRATION_KEYS } from "@/constants/Keys";
import { useRegistrationStore } from "@/store/registration";

export function useRegistrationForm() {
  const params = useLocalSearchParams();

  const personalInfoForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      tnc: false,
    },
    mode: "onChange",
  });

  const bankInfoForm = useForm({
    resolver: zodResolver(bankInfoSchema),
  });

  const passwordInfoForm = useForm({
    resolver: zodResolver(passwordInfoSchema),
  });

  const [index, setIndex] = React.useState(0);

  const storePersonalInfo = useRegistrationStore((state) => state.personalInfo);
  const storeBankInfo = useRegistrationStore((state) => state.bankInfo);
  const storePasswordInfo = useRegistrationStore((state) => state.passwordInfo);

  const setPersonalInfo = useRegistrationStore((state) => state.setPersonalInfo);
  const setBankInfo = useRegistrationStore((state) => state.setBankInfo);
  const setPasswordInfo = useRegistrationStore((state) => state.setPasswordInfo);

  const urlPersonalInfo = useParamJson<PersonalInfoSchema>(
    REGISTRATION_KEYS.PARAMS.PERSONAL_INFO,
  );
  const urlBankInfo = useParamJson<BankInfoSchema>(
    REGISTRATION_KEYS.PARAMS.BANK_INFO,
  );
  const urlPasswordInfo = useParamJson<PasswordInfoSchema>(
    REGISTRATION_KEYS.PARAMS.PASSWORD_INFO,
  );

  const activePersonalInfo = storePersonalInfo || urlPersonalInfo;
  const activeBankInfo = storeBankInfo || urlBankInfo;
  const activePasswordInfo = storePasswordInfo || urlPasswordInfo;

  React.useEffect(() => {
    if (activePersonalInfo) {
      const parsedInfo = personalInfoSchema.safeParse(activePersonalInfo);

      if (!parsedInfo.success) {
        setIndex(0);
        return;
      }

      personalInfoForm.setValue("name", activePersonalInfo.name);
      personalInfoForm.setValue("email", activePersonalInfo.email);
      personalInfoForm.setValue("phone", activePersonalInfo.phone);
      personalInfoForm.setValue("password", activePersonalInfo.password);

      setIndex(1);
    }

    if (activeBankInfo) {
      const parsedInfo = bankInfoSchema.safeParse(activeBankInfo);

      if (!parsedInfo.success) {
        setIndex(1);
        return;
      }

      bankInfoForm.setValue("bankName", activeBankInfo.bankName);
      bankInfoForm.setValue("accountNumber", activeBankInfo.accountNumber);
      bankInfoForm.setValue("accountName", activeBankInfo.accountName);
    }

    if (activePasswordInfo) {
      const parsedInfo = passwordInfoSchema.safeParse(activePasswordInfo);

      if (!parsedInfo.success) {
        setIndex(2);
        return;
      }
    }
  }, []);

  const setTncAccepted = useRegistrationStore((state) => state.setTncAccepted);
  const tncAccepted = useRegistrationStore((state) => state.tncAccepted);

  // Sync store to form
  React.useEffect(() => {
    if (tncAccepted) {
      personalInfoForm.setValue("tnc", true, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [tncAccepted]);

  // Sync form to store
  const tncValue = personalInfoForm.watch("tnc");
  React.useEffect(() => {
    if (!tncValue && tncAccepted) {
      setTncAccepted(false);
    }
  }, [tncValue]);

  return {
    personalInfoForm,
    bankInfoForm,
    passwordInfoForm,
    indexState: [index, setIndex] as const,
  };
}
