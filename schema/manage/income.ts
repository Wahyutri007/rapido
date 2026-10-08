import {
	INCOME_ACCOUNTS,
	INCOME_FUNDING_SOURCES,
	INCOME_STORES,
} from "@/constants/data/accounting/incomes";
import {
	type CashEntryValues,
	createCashEntrySchema,
} from "@/schema/accounting/cash-entry";

export const manageIncomeSchema = createCashEntrySchema({
	accounts: INCOME_ACCOUNTS,
	fundingSources: INCOME_FUNDING_SOURCES,
	stores: INCOME_STORES,
});
export type ManageIncomeValues = CashEntryValues;
