import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Wrapper from "@/components/common/Wrapper";
import ExpenseForm from "@/components/feature/manage/expenses/ExpenseForm";
import { useAccountingStore } from "@/store/accountingStore";

export default function ExpenseModifyScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const expense = useAccountingStore((state) =>
		state.expenses.find((item) => item.id === id && item.type === "expense"),
	);
	if (id && !expense)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pengeluaran tidak ditemukan." />
			</Wrapper>
		);
	return <ExpenseForm key={id ?? "new"} expense={expense} />;
}
