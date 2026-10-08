export type SupplierFields = {
	name: string;
	address: string;
	phone: string;
	email: string;
	province: string;
	city: string;
	district: string;
	postalCode: string;
};

export type InventorySupplier = SupplierFields & {
	id: string;
	active: boolean;
	primary: boolean;
	products: string[];
	priorPurchaseTotal: number;
};

export type SupplierResult =
	| { id: string }
	| { error: string; field?: keyof SupplierFields };
