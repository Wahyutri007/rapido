import CashEntryForm from "@/components/feature/accounting/CashEntryForm";
import { expenseFormValues } from "@/lib/manage/expenses";
import type { Expense } from "@/types/ui/accounting/expense";

export default function ExpenseForm({ expense }: { expense?: Expense }) {
	return (
		<CashEntryForm
			kind="expense"
			initialValues={expenseFormValues(expense)}
			id={expense?.id}
		/>
	);
}
