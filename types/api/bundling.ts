import type { SingleDocumentPickerResult } from "@/types";

export type BundlingDetailItem = {
	id?: string;
	menu_id: string;
	menu_name?: string;
	variant_name?: string;
	quantity: number;
};

export type BundlingOrderTypePrice = {
	order_type_id: string;
	order_type_name?: string;
	sell_price: number;
};

export type BundlingStoreItem = {
	id: string;
	name: string;
	address?: string;
	is_active?: boolean;
};

export type BundlingData = {
	id: string;
	name: string;
	code?: string;
	image?: string | null;
	start_period: string;
	end_period: string;
	store_ids?: string[];
	stores?: BundlingStoreItem[];
	details: BundlingDetailItem[];
	has_price_variation?: boolean;
	sell_price?: number;
	prices?: BundlingOrderTypePrice[];
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
};
