import { vars } from "nativewind";
import { cashierBillTheme } from "@/lib/cashier/bill-theme";

// Semantic values scoped to the alternate bill frame 29:48148.
export const catalogBillTheme = [
	cashierBillTheme,
	vars({
		"--color-error-500": "233 92 92",
		"--color-border-muted": "238 238 238",
		"--color-surface-muted": "245 245 245",
		"--color-text-subtle": "75 75 75",
	}),
];

export const catalogBillActionTheme = vars({
	"--color-primary": "159 159 159",
	"--color-text-muted": "159 159 159",
});

export const catalogBillFilterTheme = vars({
	"--color-text-subtle": "84 84 84",
});

export const catalogBillBellTheme = vars({
	"--color-error-500": "217 83 79",
});
