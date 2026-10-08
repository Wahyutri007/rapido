import CashEntryForm from "@/components/feature/accounting/CashEntryForm";
import { incomeFormValues } from "@/lib/manage/incomes";
import type { Income } from "@/types/ui/accounting/income";

export default function IncomeForm({ income }: { income?: Income }) {
	return (
		<CashEntryForm
			kind="income"
			initialValues={incomeFormValues(income)}
			id={income?.id}
		/>
	);
}
