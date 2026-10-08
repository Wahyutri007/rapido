import { OTP_KEYS, OTPType, REGISTRATION_KEYS } from "@/constants/Keys";
import { PersonalInfoSchema } from "@/schema/registration";
import { VerifyDataResponse } from "@/types/api/registration";
import { create } from "zustand";

export const useOtpState = create<{
  [OTP_KEYS.TYPE]: typeof OTP_KEYS.TYPES.REGISTRATION;
  [REGISTRATION_KEYS.PARAMS.PERSONAL_INFO]: PersonalInfoSchema | null;
  [REGISTRATION_KEYS.PARAMS.VERIFY_RESPONSE]: VerifyDataResponse | null;

  setType: (type: OTPType) => void;
  setPersonalInfo: (info: PersonalInfoSchema) => void;
  setVerifyResponse: (response: VerifyDataResponse) => void;
}>((set) => ({
  [OTP_KEYS.TYPE]: OTP_KEYS.TYPES.REGISTRATION,
  [REGISTRATION_KEYS.PARAMS.PERSONAL_INFO]: null,
  [REGISTRATION_KEYS.PARAMS.VERIFY_RESPONSE]: null,

  setType: (type: OTPType) => set({ [OTP_KEYS.TYPE]: type }),
  setPersonalInfo: (info: PersonalInfoSchema) =>
    set({ [REGISTRATION_KEYS.PARAMS.PERSONAL_INFO]: info }),
  setVerifyResponse: (response: VerifyDataResponse) =>
    set({ [REGISTRATION_KEYS.PARAMS.VERIFY_RESPONSE]: response }),
}));
