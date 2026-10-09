export type ScannerPreviewStatus = "connected" | "available";

/** Design examples; these IDs/statuses never identify a physical device. */
export type ScannerPreviewDevice = {
	id: string;
	name: string;
	status: ScannerPreviewStatus;
};
