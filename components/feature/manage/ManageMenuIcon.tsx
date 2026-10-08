import { Image } from "expo-image";

const SOURCES = {
	account: require("@/assets/images/manage/account.svg"),
	store: require("@/assets/images/manage/store.svg"),
	"pos-settings": require("@/assets/images/manage/pos-settings.svg"),
	"generate-barcode": require("@/assets/images/manage/generate-barcode.svg"),
	workers: require("@/assets/images/manage/workers.svg"),
	member: require("@/assets/images/manage/member.svg"),
	roles: require("@/assets/images/manage/roles.svg"),
	absence: require("@/assets/images/manage/absence.svg"),
	"sales-target": require("@/assets/images/manage/sales-target.svg"),
	expenses: require("@/assets/images/manage/expenses.svg"),
	income: require("@/assets/images/manage/income.svg"),
	payroll: require("@/assets/images/manage/payroll.svg"),
	place: require("@/assets/images/manage/place.svg"),
	receipt: require("@/assets/images/manage/receipt.svg"),
	external: require("@/assets/images/manage/external.svg"),
	ai: require("@/assets/images/manage/ai.svg"),
	export: require("@/assets/images/manage/export.svg"),
	referral: require("@/assets/images/manage/referral.svg"),
	faq: require("@/assets/images/manage/faq.svg"),
	"feature-request": require("@/assets/images/manage/feature-request.svg"),
	feedback: require("@/assets/images/manage/feedback.svg"),
};

type ManageMenuIconName = keyof typeof SOURCES;

const SIZES: Partial<
	Record<ManageMenuIconName, { width: number; height: number }>
> = {
	roles: { width: 16.6667, height: 17.3454 },
	"sales-target": { width: 16.6667, height: 16.6667 },
	income: { width: 17.9179, height: 17.0833 },
};

export function ManageMenuIcon({ name }: { name: ManageMenuIconName }) {
	return (
		<Image
			source={SOURCES[name]}
			contentFit="contain"
			style={SIZES[name] ?? { width: 20, height: 20 }}
		/>
	);
}

export function ManageMenuChevron() {
	return (
		<Image
			source={require("@/assets/images/manage/chevron.svg")}
			contentFit="contain"
			style={{ width: 10, height: 10, transform: [{ scaleX: -1 }] }}
		/>
	);
}
