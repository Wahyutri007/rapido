import { createGetHook, createMutationHook } from "../factory";

export type RoundingSettingData = {
	id?: string;
	user_id?: string;
	enabled: boolean;
	method: "up" | "down" | "nearest";
	decimal_places: number;
};

export type RoundingSettingPayload = {
	enabled: boolean;
	method: "up" | "down" | "nearest";
	decimal_places: number;
};

export type StockSettingDetail = {
	id?: string;
	stock_setting_id?: string;
	stockable_id: string;
	stockable_type: string;
	stockable?: any;
};

export type StockSettingData = {
	id?: string;
	user_id?: string;
	enabled: boolean;
	type: "all" | "hybrid";
	content_type?: "item" | "category";
	details?: StockSettingDetail[];
};

export type StockSettingPayload = {
	enabled: boolean;
	type: "all" | "hybrid";
	content_type?: "item" | "category";
	stockable_ids?: string[];
};

export type AutomaticNotificationData = {
	id?: string;
	user_id?: string;
	enabled: boolean;
	email: string;
	phone_number: string;
	notification_time: string;
	details?: {
		id?: string;
		type: string;
	}[];
};

export type AutomaticNotificationPayload = {
	enabled: boolean;
	email: string;
	phone_number: string;
	notification_time: string;
	notifications?: string[];
};

export const useRoundingSettingQuery = createGetHook<RoundingSettingData>({
	path: "/settings/rounding-settings",
	queryKey: ["settings", "rounding"],
	name: "rounding-setting",
});

export const useRoundingSettingMutation = createMutationHook<
	RoundingSettingData,
	RoundingSettingPayload
>({
	path: "/settings/rounding-settings",
	method: "post",
	name: "rounding-setting",
	invalidateKeys: [["settings", "rounding"]],
});

export const useStockSettingQuery = createGetHook<StockSettingData>({
	path: "/settings/stock-settings",
	queryKey: ["settings", "stock"],
	name: "stock-setting",
});

export const useStockSettingMutation = createMutationHook<
	StockSettingData,
	StockSettingPayload
>({
	path: "/settings/stock-settings",
	method: "post",
	name: "stock-setting",
	invalidateKeys: [["settings", "stock"]],
});

export const useAutomaticNotificationQuery =
	createGetHook<AutomaticNotificationData>({
		path: "/settings/automatic-notifications",
		queryKey: ["settings", "automatic-notifications"],
		name: "automatic-notifications",
	});

export const useAutomaticNotificationMutation = createMutationHook<
	AutomaticNotificationData,
	AutomaticNotificationPayload
>({
	path: "/settings/automatic-notifications",
	method: "post",
	name: "automatic-notifications",
	invalidateKeys: [["settings", "automatic-notifications"]],
});
