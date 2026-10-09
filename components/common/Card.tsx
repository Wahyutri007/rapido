import type React from "react";
import { View } from "react-native";
import { figmaStockShadows } from "@/lib/ui/figma-stock";
import { cn } from "@/lib/utils";

export default function Card(
	props: React.ComponentPropsWithoutRef<typeof View> & {
		density?: "default" | "compact" | "flush";
		appearance?: "default" | "figma";
	},
) {
	const {
		children,
		className,
		style,
		density = "default",
		appearance = "default",
		...rest
	} = props;

	return (
		<View
			{...rest}
			className={cn(
				"rounded-xl bg-white",
				appearance === "default" && "shadow-main",
				density === "flush" ? "p-0" : density === "compact" ? "p-3" : "p-4",
				className,
			)}
			style={[appearance === "figma" && figmaStockShadows.card, style]}
		>
			{children}
			{appearance === "figma" && (
				<View
					pointerEvents="none"
					className="absolute inset-0 rounded-xl border border-border-muted"
				/>
			)}
		</View>
	);
}
