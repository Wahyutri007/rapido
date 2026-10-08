export type SupportFormMode = "feature-request" | "feedback";

export type FaqCategory =
	| "back-office"
	| "cashier"
	| "operator"
	| "order"
	| "absence";

export type FaqEntry = {
	id: string;
	question: string;
	answer: string;
	categories: FaqCategory[];
	icon: "sales" | "inventory" | "cashier" | "absence" | "order" | "catalog";
};
