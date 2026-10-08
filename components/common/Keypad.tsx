import React from "react";
import { View } from "react-native";
import BackspaceIcon from "../icons/backspace";
import BouncyPressable from "./BouncyPressable";
import Text from "./Text";

function InputText(props: React.PropsWithChildren) {
	const { children } = props;

	return (
		<Text className="text-xl text-foreground" w="semibold">
			{children}
		</Text>
	);
}

function InputButton(
	props: React.PropsWithChildren<{
		text?: string;
		onPress?: () => void;
		hapticType?: "light" | "medium" | "heavy" | "selection" | "warning";
	}>,
) {
	const { children, text, onPress, hapticType = "light" } = props;

	return (
		<BouncyPressable
			className="h-[62px] flex-1 items-center justify-center overflow-hidden rounded-2xl"
			activeScale={0.94}
			hapticType={hapticType}
			ripple={true}
			onPress={onPress}
		>
			<View className="items-center justify-center">
				{text ? <InputText>{text}</InputText> : children}
			</View>
		</BouncyPressable>
	);
}

export type KeypadState = string | null;

export default function Keypad(props: {
	state: [KeypadState, React.Dispatch<React.SetStateAction<KeypadState>>];
	maxLength?: number;
	nullable?: boolean;
}) {
	const { state, maxLength, nullable } = props;

	const [, setValue] = state;

	const [keypadValue, setKeypadValue] = React.useState<string>("");

	const setNumber = (text: string) => {
		if (text === "C") {
			if (nullable) {
				setKeypadValue("");
				return;
			}

			setKeypadValue("0");
		} else if (text === "BACK") {
			setKeypadValue((prev) => {
				if (prev.length > 1) {
					return prev.slice(0, -1);
				}
				if (nullable) return "";
				return "0";
			});
		} else {
			if (maxLength && keypadValue.length >= maxLength) {
				return;
			}
			setKeypadValue((prev) => prev + text);
		}
	};

	React.useEffect(() => {
		if (keypadValue.length > 0) {
			setValue(keypadValue);
		} else {
			setValue(null);
		}
	}, [keypadValue, setValue]);

	return (
		<View className="rounded-t-[24px] bg-white px-3 py-4 shadow-sm">
			<View className="flex-row">
				<InputButton onPress={() => setNumber("1")} text="1" />
				<InputButton onPress={() => setNumber("2")} text="2" />
				<InputButton onPress={() => setNumber("3")} text="3" />
			</View>
			<View className="flex-row">
				<InputButton onPress={() => setNumber("4")} text="4" />
				<InputButton onPress={() => setNumber("5")} text="5" />
				<InputButton onPress={() => setNumber("6")} text="6" />
			</View>
			<View className="flex-row">
				<InputButton onPress={() => setNumber("7")} text="7" />
				<InputButton onPress={() => setNumber("8")} text="8" />
				<InputButton onPress={() => setNumber("9")} text="9" />
			</View>
			<View className="flex-row">
				<InputButton
					onPress={() => setNumber("C")}
					text="C"
					hapticType="medium"
				/>
				<InputButton onPress={() => setNumber("0")} text="0" />
				<InputButton
					onPress={() => setNumber("BACK")}
					hapticType="medium"
				>
					<BackspaceIcon size={24} />
				</InputButton>
			</View>
		</View>
	);
}
