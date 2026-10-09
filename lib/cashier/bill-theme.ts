import { vars } from "nativewind";
import { figmaStockTheme } from "@/lib/ui/figma-stock";

// Frame 29:26627 shares these semantic values with the existing Figma theme.
// Button palette aliases are local to the bill list, never global overrides.
export const cashierBillTheme = [
	figmaStockTheme,
	vars({
		"--color-primary-500": "46 120 249",
		"--color-primary-600": "46 120 249",
		"--color-primary-700": "46 120 249",
		"--color-border-muted": "248 247 247",
		"--color-text-subtle": "75 75 75",
	}),
];
