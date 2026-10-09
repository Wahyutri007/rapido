import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import { cashKeypadTheme } from "@/lib/cashier/cash-input-theme";
import BackspaceGlyph from "../icons/backspace";
import BouncyPressable from "./BouncyPressable";
import Text from "./Text";

const CashAppearance = React.createContext(false);

function InputText(props: React.PropsWithChildren) {
	const { children } = props;
	const cash = React.useContext(CashAppearance);

	return (
		<Text
			className={cash ? "text-foreground" : "text-xl text-foreground"}
			w="semibold"
			style={cash ? { fontSize: 18, lineHeight: 27 } : undefined}
		>
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
	const cash = React.useContext(CashAppearance);
	const rounded = cash && (text === "1" || text === "3");

	return (
		<BouncyPressable
			className={
				cash
					? "flex-1 items-center justify-center overflow-hidden bg-surface"
					: "h-[62px] flex-1 items-center justify-center overflow-hidden rounded-2xl"
			}
			style={
				cash
					? {
							height: 59,
							borderTopLeftRadius: rounded ? 30 : 0,
							borderTopRightRadius: rounded ? 30 : 0,
						}
					: undefined
			}
			accessibilityRole={cash ? "button" : undefined}
			accessibilityLabel={
				cash
					? text === "C"
						? "Hapus semua"
						: (text ?? "Hapus satu digit")
					: undefined
			}
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
	controlled?: boolean;
	appearance?: "default" | "cashier";
}) {
	const {
		state,
		maxLength,
		nullable,
		controlled = false,
		appearance = "default",
	} = props;
	const cash = appearance === "cashier";
	const rowStyle = cash ? { height: 68, paddingVertical: 10 } : undefined;

	const [value, setValue] = state;

	const [internalValue, setKeypadValue] = React.useState<string>("");
	const keypadValue = controlled ? (value ?? "") : internalValue;

	const updateKeypad = (next: React.SetStateAction<string>) => {
		if (controlled) {
			setValue((previous) => {
				const updated =
					typeof next === "function" ? next(previous ?? "") : next;
				return updated.length > 0 ? updated : null;
			});
		} else {
			setKeypadValue(next);
		}
	};

	const setNumber = (text: string) => {
		if (text === "C") {
			if (nullable) {
				updateKeypad("");
				return;
			}

			updateKeypad("0");
		} else if (text === "BACK") {
			updateKeypad((prev) => {
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
			updateKeypad((prev) =>
				controlled && maxLength && prev.length >= maxLength
					? prev
					: prev + text,
			);
		}
	};

	React.useEffect(() => {
		if (controlled) return;
		if (internalValue.length > 0) {
			setValue(internalValue);
		} else {
			setValue(null);
		}
	}, [internalValue, setValue, controlled]);

	return (
		<CashAppearance.Provider value={cash}>
			<View
				className={
					cash ? "bg-white" : "rounded-t-[24px] bg-white px-3 py-4 shadow-sm"
				}
				style={cash ? cashKeypadTheme : undefined}
			>
				<View
					className={cash ? "flex-row items-center" : "flex-row"}
					style={rowStyle}
				>
					<InputButton onPress={() => setNumber("1")} text="1" />
					<InputButton onPress={() => setNumber("2")} text="2" />
					<InputButton onPress={() => setNumber("3")} text="3" />
				</View>
				<View
					className={cash ? "flex-row items-center" : "flex-row"}
					style={rowStyle}
				>
					<InputButton onPress={() => setNumber("4")} text="4" />
					<InputButton onPress={() => setNumber("5")} text="5" />
					<InputButton onPress={() => setNumber("6")} text="6" />
				</View>
				<View
					className={cash ? "flex-row items-center" : "flex-row"}
					style={cash ? { ...rowStyle, height: 69 } : undefined}
				>
					<InputButton onPress={() => setNumber("7")} text="7" />
					<InputButton onPress={() => setNumber("8")} text="8" />
					<InputButton onPress={() => setNumber("9")} text="9" />
				</View>
				<View
					className={cash ? "flex-row items-center" : "flex-row"}
					style={rowStyle}
				>
					<InputButton
						onPress={() => setNumber("C")}
						text="C"
						hapticType="medium"
					/>
					<InputButton onPress={() => setNumber("0")} text="0" />
					<InputButton onPress={() => setNumber("BACK")} hapticType="medium">
						{cash ? (
							<Image
								source={require("@/assets/images/figma/cashier/cash-input/backspace.svg")}
								style={{ width: 32, height: 32 }}
								accessibilityElementsHidden
								importantForAccessibility="no-hide-descendants"
							/>
						) : (
							<BackspaceGlyph size={24} />
						)}
					</InputButton>
				</View>
			</View>
		</CashAppearance.Provider>
	);
}
