import type React from "react";
import { Text as NativeText } from "react-native";
import { FONT_NAMES } from "@/constants/Fonts";
import { cn } from "@/lib/utils";

const FONT_WEIGHTS = {
	regular: FONT_NAMES.regular,
	bold: FONT_NAMES.bold,
	medium: FONT_NAMES.medium,
	semibold: FONT_NAMES.semibold,
};

export default function Text(
	props: React.ComponentProps<typeof NativeText> & {
		w?: keyof typeof FONT_WEIGHTS;
		size?: "body" | "small" | "normal"; // More to come?
	},
) {
	const {
		children,
		w = "regular",
		style,
		className,
		size = "body",
		...rest
	} = props;

	return (
		<NativeText
			style={[{ fontFamily: FONT_WEIGHTS[w] }, style]}
			{...rest}
			className={cn(
				"text-foreground",
				{
					"text-base": size === "body",
					"text-xs": size === "small",
					"text-sm": size === "normal",
				},
				className,
			)}
		>
			{children}
		</NativeText>
	);
}
