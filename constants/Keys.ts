export default {
  ONBOARDING_COMPLETED: "onboarding_completed",
  AUTH_TOKEN: "auth_token",
  LOGGED_IN: "logged_in",
  SELECTED_STORE: "selected_store",
};

export const OTP_KEYS = {
  TYPE: "type",
  TYPES: {
    REGISTRATION: "register",
  } as const,
} as const;

export type OTPType = typeof OTP_KEYS.TYPES[keyof typeof OTP_KEYS.TYPES];

export const REGISTRATION_KEYS = {
  PARAMS: {
    PERSONAL_INFO: "personalInfo",
    BANK_INFO: "bankInfo",
    PASSWORD_INFO: "passwordInfo",

    VERIFY_RESPONSE: "verifyResponse",
  } as const,
} as const;
