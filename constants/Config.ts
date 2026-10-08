import { OtpInputProps } from "react-native-otp-entry"
import { FONT_NAMES } from "./Fonts"
import { Colors } from "./Colors"

export const otpInputTheme: OtpInputProps["theme"] = {
  pinCodeTextStyle: {
    fontFamily: FONT_NAMES.medium,
  },
  pinCodeContainerStyle: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    flexGrow: 1,
    aspectRatio: 3 / 4,
  },
  focusedPinCodeContainerStyle: {
    borderColor: Colors.primary,
  },
  containerStyle: {
    gap: 12,
  },
};