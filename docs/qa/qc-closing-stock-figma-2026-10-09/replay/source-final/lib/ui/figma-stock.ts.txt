import { vars } from "nativewind";
import type { ViewStyle } from "react-native";

// Local semantic values from frame 1:12401; global application tokens stay intact.
export const figmaStockTheme = vars({
	"--color-primary": "46 120 249",
	"--color-text-foreground": "44 44 44",
	"--color-text-muted": "143 143 143",
	"--color-border": "238 238 238",
	"--color-border-muted": "238 238 238",
	"--color-background": "247 248 250",
	"--color-error-500": "220 38 38",
});

export const figmaStockShadows = {
	card: { boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.06)" },
	control: { boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.06)" },
	tab: { boxShadow: "0px -1px 6px 0px rgba(0, 0, 0, 0.05)" },
} satisfies Record<string, ViewStyle>;
