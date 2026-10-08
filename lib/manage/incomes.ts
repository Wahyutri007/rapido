import { accountingDateISO, accountingDateLabel } from "@/lib/accounting/date";
import {
	type ManageIncomeValues,
	manageIncomeSchema,
} from "@/schema/manage/income";
import { useAccountingStore } from "@/store/accountingStore";
import type {
	GroupedIncomes,
	Income,
	IncomeType,
} from "@/types/ui/accounting/income";

export function incomeFormValues(income?: Income): ManageIncomeValues {
	return {
		accountName: income?.accountName ?? "",
		accountCode: income?.accountCode ?? "",
		referenceNumber: income?.referenceNumber ?? "",
		fundingSource: income?.fundingSource ?? "",
		store: income?.store ?? "",
		date: income ? accountingDateISO(income.date) : "",
		amount: income?.amount ?? 0,
		description: income?.description ?? "",
	};
}

export function filterIncomes(
	incomes: Income[],
	search = "",
	fundingSource = "",
	store = "",
	type: IncomeType | "" = "",
): Income[] {
	const query = search.trim().toLocaleLowerCase("id-ID");
	return incomes
		.filter(
			(income) =>
				(!fundingSource || income.fundingSource === fundingSource) &&
				(!store || income.store === store) &&
				(!type || income.type === type) &&
				[
					income.accountName,
					income.accountCode,
					income.referenceNumber,
					income.description,
					income.createdBy,
					income.fundingSource,
					income.store,
				].some((value) => value?.toLocaleLowerCase("id-ID").includes(query)),
		)
		.sort((a, b) =>
			accountingDateISO(b.date).localeCompare(accountingDateISO(a.date)),
		);
}

export function groupIncomes(incomes: Income[]): GroupedIncomes[] {
	const groups = new Map<string, Income[]>();
	for (const income of incomes) {
		const date = accountingDateISO(income.date) || income.date;
		groups.set(date, [...(groups.get(date) ?? []), income]);
	}
	return Array.from(groups, ([date, items]) => ({
		date,
		displayDate: accountingDateLabel(date),
		items,
	}));
}

export function saveManagedIncome(
	values: ManageIncomeValues,
	id?: string,
):
	| { id: string }
	| { error: "invalid" | "missing" | "duplicate" | "readonly" } {
	const parsed = manageIncomeSchema.safeParse(values);
	if (!parsed.success) return { error: "invalid" };
	const state = useAccountingStore.getState();
	const existing = state.incomes.find((income) => income.id === id);
	if (id && !existing) return { error: "missing" };
	if (existing?.type === "invoice") return { error: "readonly" };
	const data = parsed.data;
	if (
		state.incomes.some(
			(income) =>
				income.id !== id &&
				income.store === data.store &&
				income.referenceNumber.trim().toLocaleLowerCase("id-ID") ===
					data.referenceNumber.toLocaleLowerCase("id-ID"),
		)
	)
		return { error: "duplicate" };
	if (existing) {
		state.updateIncome(existing.id, data);
		return { id: existing.id };
	}
	return {
		id: state.addIncome({
			...data,
			type: "manual",
			createdBy: "Pratinjau lokal",
			time: `${new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })} WIB`,
		}),
	};
}

export function removeManagedIncome(id: string): boolean {
	const state = useAccountingStore.getState();
	if (
		!state.incomes.some(
			(income) => income.id === id && income.type === "manual",
		)
	)
		return false;
	state.deleteIncome(id);
	return true;
}
