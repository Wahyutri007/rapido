import { expenseDateISO, expenseDateLabel } from "@/lib/manage/expense-date";
import {
	type ManageExpenseValues,
	manageExpenseSchema,
} from "@/schema/manage/expense";
import { useAccountingStore } from "@/store/accountingStore";
import type { Expense, GroupedExpenses } from "@/types/ui/accounting/expense";

export function expenseFormValues(expense?: Expense): ManageExpenseValues {
	return expense
		? {
				accountName: expense.accountName,
				accountCode: expense.accountCode,
				referenceNumber: expense.referenceNumber,
				fundingSource: expense.fundingSource,
				store: expense.store,
				date: expenseDateISO(expense.date),
				amount: expense.amount,
				description: expense.description,
			}
		: {
				accountName: "",
				accountCode: "",
				referenceNumber: "",
				fundingSource: "",
				store: "",
				date: "",
				amount: 0,
				description: "",
			};
}

export function filterExpenses(
	expenses: Expense[],
	search = "",
	fundingSource = "",
	store = "",
): Expense[] {
	const query = search.trim().toLocaleLowerCase("id-ID");
	return expenses
		.filter(
			(expense) =>
				expense.type === "expense" &&
				(!fundingSource || expense.fundingSource === fundingSource) &&
				(!store || expense.store === store) &&
				[
					expense.accountName,
					expense.accountCode,
					expense.referenceNumber,
					expense.description,
					expense.createdBy,
					expense.fundingSource,
					expense.store,
				].some((value) => value.toLocaleLowerCase("id-ID").includes(query)),
		)
		.sort((a, b) =>
			expenseDateISO(b.date).localeCompare(expenseDateISO(a.date)),
		);
}

export function groupExpenses(expenses: Expense[]): GroupedExpenses[] {
	const groups = new Map<string, Expense[]>();
	for (const expense of expenses) {
		const date = expenseDateISO(expense.date) || expense.date;
		groups.set(date, [...(groups.get(date) ?? []), expense]);
	}
	return Array.from(groups, ([date, items]) => ({
		date,
		displayDate: expenseDateLabel(date),
		items,
	}));
}

export function saveManagedExpense(
	values: ManageExpenseValues,
	id?: string,
): { id: string } | { error: "invalid" | "missing" | "duplicate" } {
	const parsed = manageExpenseSchema.safeParse(values);
	if (!parsed.success) return { error: "invalid" };
	const state = useAccountingStore.getState();
	const existing = state.expenses.find(
		(expense) => expense.id === id && expense.type === "expense",
	);
	if (id && !existing) return { error: "missing" };
	const data = parsed.data;
	if (
		state.expenses.some(
			(expense) =>
				expense.type === "expense" &&
				expense.id !== id &&
				expense.store === data.store &&
				expense.referenceNumber.trim().toLocaleLowerCase("id-ID") ===
					data.referenceNumber.toLocaleLowerCase("id-ID"),
		)
	)
		return { error: "duplicate" };
	if (existing) {
		state.updateExpense(existing.id, data);
		return { id: existing.id };
	}
	return {
		id: state.addExpense({
			...data,
			type: "expense",
			createdBy: "Pratinjau lokal",
			time: `${new Date().toLocaleTimeString("id-ID", {
				timeZone: "Asia/Jakarta",
				hour: "2-digit",
				minute: "2-digit",
			})} WIB`,
		}),
	};
}
