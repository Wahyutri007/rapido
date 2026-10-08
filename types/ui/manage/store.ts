import type { StoreSchema } from "@/schema/manage/store";

export type StoreItemProps = StoreSchema & {
	id: string;
	status?: "active" | "trial" | "expired";
	statusLabel?: string;
	expiryDate?: string;
	subscription?: {
		planName: string;
		expiryDate: string;
		remainingDays: string;
	};
};
