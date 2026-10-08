import type { MenuItemProps } from "../ui/add/menu";
import type { VariantDetailProps } from "../ui/add/variant";

// * NOTE: This is still placeholder props

export type CartDetailItem = {
	id: string;
	menu: MenuItemProps;
	amount: number;
	variants: VariantDetailProps[];
};

export type CartDetail = {
	id: string;
	orderType: {
		name: string;
	};
	items: CartDetailItem[];
};

export type Cart = {
	id: string;
	details: CartDetail[];
};
