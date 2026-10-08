export type PromoType = "discount" | "free_item";
export type PromoRequirementType = "category" | "item" | "combination";
export type DiscountValueType = "percentage" | "fixed";

export type PromoRequirementData = {
	id?: string;
	applicable_id: string;
	minimum_quantity: number;
	applicable_type?: string;
	group_id?: string | null;
	variant_id?: string;
	applicable?: {
		id: string;
		name: string;
	};
};

export type PromoStoreItem = {
	id: string;
	name: string;
	address?: string;
	is_active?: boolean;
};

export type PromoUsageItem = {
	id: string;
	invoice_number: string;
	amount: number;
	created_at: string;
	cashier_name: string;
	customer_name: string;
	store_name: string;
};

export type PromoData = {
	id: string;
	name: string;
	type: PromoType;
	promo_requirement: PromoRequirementType;
	order_type_id: string;
	order_type?: {
		id: string;
		name: string;
	};
	start_period: string;
	end_period: string;
	is_active: boolean;
	days?: string[];
	store_ids?: string[];
	stores?: PromoStoreItem[];

	// Requirements from backend (requirements relation) or frontend state (promo_requirements)
	requirements?: PromoRequirementData[];
	promo_requirements?: PromoRequirementData[] | PromoRequirementData[][];

	// Rewards
	discount?: {
		type: DiscountValueType;
		amount: number;
	};
	free_item?: {
		menu_entry_id: string;
		quantity: number;
		menu_entry?: {
			id: string;
			name?: string;
			variant_name?: string;
			menu?: {
				id: string;
				name: string;
			};
		};
	};

	created_at: string;
	updated_at: string;
};
