import type React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

export default function Card(
	props: React.ComponentPropsWithoutRef<typeof View> & {
		density?: "default" | "compact";
	},
) {
	const { children, className, style, density = "default", ...rest } = props;

	return (
		<View
			{...rest}
			className={cn(
				"rounded-xl shadow-main bg-white",
				density === "compact" ? "p-3" : "p-4",
				className,
			)}
			style={style}
		>
			{children}
		</View>
	);
}
