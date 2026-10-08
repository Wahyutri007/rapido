import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { hexToRgba } from "./colors";

export const styles = StyleSheet.create({
	primaryGlow: {
		boxShadow: [
			{
				offsetX: 0,
				offsetY: 0,
				blurRadius: 12,
				spreadDistance: 0,
				color: hexToRgba(Colors.primary, 0.95),
			},
			{
				offsetX: 0,
				offsetY: 0,
				blurRadius: 48,
				spreadDistance: 0,
				color: hexToRgba(Colors.primary, 0.55),
			},
		],
	},
});