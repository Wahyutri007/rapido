import { vars } from "nativewind";
import { figmaStockTheme } from "@/lib/ui/figma-stock";

// Cashier Stock references 29:27153/27290/27343/27391. These values are scoped
// to the Stock screen/sheet; shared Figma primitives retain their own defaults.
export const cashierStockTheme = [
	figmaStockTheme,
	vars({
		"--color-primary-500": "46 120 249",
		"--color-primary-600": "46 120 249",
		"--color-primary-700": "46 120 249",
		"--color-text-subtle": "0 17 39",
		"--color-border-muted": "248 247 247",
	}),
];

export const cashierStockFilterTheme = [
	cashierStockTheme,
	vars({
		"--color-border": "231 231 231",
		"--color-border-muted": "231 231 231",
		"--color-surface-subtle": "245 245 245",
		"--color-surface-strong": "238 238 238",
	}),
];
