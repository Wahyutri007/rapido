import {
	EXPENSE_ACCOUNTS,
	EXPENSE_FUNDING_SOURCES,
	EXPENSE_STORES,
} from "@/constants/data/accounting/expenses";
import {
	type CashEntryValues,
	createCashEntrySchema,
} from "@/schema/accounting/cash-entry";

export const manageExpenseSchema = createCashEntrySchema({
	accounts: EXPENSE_ACCOUNTS,
	fundingSources: EXPENSE_FUNDING_SOURCES,
	stores: EXPENSE_STORES,
});
export type ManageExpenseValues = CashEntryValues;
