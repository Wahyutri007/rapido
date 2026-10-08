import {
  BankInfoSchema,
  PasswordInfoSchema,
  PersonalInfoSchema,
} from "@/schema/registration";
import { create } from "zustand";

type RegistrationState = {
  tncAccepted: boolean;
  personalInfo: PersonalInfoSchema | null;
  bankInfo: BankInfoSchema | null;
  passwordInfo: PasswordInfoSchema | null;

  setTncAccepted: (accepted: boolean) => void;
  setPersonalInfo: (info: PersonalInfoSchema | null) => void;
  setBankInfo: (info: BankInfoSchema | null) => void;
  setPasswordInfo: (info: PasswordInfoSchema | null) => void;
  resetRegistration: () => void;
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  tncAccepted: false,
  personalInfo: null,
  bankInfo: null,
  passwordInfo: null,

  setTncAccepted: (accepted: boolean) => set({ tncAccepted: accepted }),
  setPersonalInfo: (info) => set({ personalInfo: info }),
  setBankInfo: (info) => set({ bankInfo: info }),
  setPasswordInfo: (info) => set({ passwordInfo: info }),
  resetRegistration: () =>
    set({
      tncAccepted: false,
      personalInfo: null,
      bankInfo: null,
      passwordInfo: null,
    }),
}));
