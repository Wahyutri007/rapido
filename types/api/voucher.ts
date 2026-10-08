export type DiscountValueType = "percentage" | "fixed";

export type VoucherCodeData = {
	id?: string;
	voucher_id?: string;
	code: string;
	max_uses: number;
	uses_count?: number;
};

export type VoucherData = {
	id: string;
	name: string;
	code?: string;
	type: DiscountValueType;
	value_type?: DiscountValueType;
	amount: number;
	minimum_transaction: number;
	maximum_discount?: number | null;
	start_period: string;
	end_period: string;
	is_active?: boolean;

	// Relations
	codes?: VoucherCodeData[];
	stores?: {
		id: string;
		name: string;
		address?: string;
	}[];
	store_ids?: string[];

	created_at?: string;
	updated_at?: string;
};
