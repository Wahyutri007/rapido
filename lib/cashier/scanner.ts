import type {
	ScannerPreviewDevice,
	ScannerPreviewStatus,
} from "@/types/ui/cashier/scanner";

export function scannerStatusLabel(status: ScannerPreviewStatus) {
	return status === "connected" ? "Terhubung" : "Tersedia";
}

export function scannerPreviewGroups(
	devices: readonly ScannerPreviewDevice[],
	search: string,
) {
	const query = search.trim().toLocaleLowerCase("id-ID");
	const sections: { status: ScannerPreviewStatus; title: string }[] = [
		{ status: "connected", title: "Barcode Scanner Terhubung" },
		{ status: "available", title: "Barcode Scanner Tersedia" },
	];
	return sections.map((section) => ({
		...section,
		devices: devices.filter(
			(device) =>
				device.status === section.status &&
				device.name.toLocaleLowerCase("id-ID").includes(query),
		),
	}));
}

export function findScannerPreview(
	devices: readonly ScannerPreviewDevice[],
	id: unknown,
): ScannerPreviewDevice | undefined {
	if (typeof id !== "string" || !id.trim() || id !== id.trim())
		return undefined;
	const matches = devices.filter((device) => device.id === id);
	return matches.length === 1 ? matches[0] : undefined;
}
