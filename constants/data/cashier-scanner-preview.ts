import type { ScannerPreviewDevice } from "@/types/ui/cashier/scanner";

// Figma gbdKqL2EcYNenWiQXG4SRW / 29:21652. IDs are row nodes, not hardware IDs.
export const CASHIER_SCANNER_PREVIEW: readonly ScannerPreviewDevice[] = [
	{ id: "29:21659", name: "Epson Lk 1211", status: "connected" },
	{ id: "29:21666", name: "Canon 1221", status: "available" },
	{ id: "29:21671", name: "Hp Printer", status: "available" },
];
