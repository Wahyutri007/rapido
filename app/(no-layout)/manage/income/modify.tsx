import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Wrapper from "@/components/common/Wrapper";
import IncomeForm from "@/components/feature/manage/income/IncomeForm";
import { useAccountingStore } from "@/store/accountingStore";

export default function IncomeModifyScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const income = useAccountingStore((state) =>
		state.incomes.find((item) => item.id === id),
	);
	if (id && (!income || income.type === "invoice"))
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound
					text={
						income
							? "Penerimaan penjualan hanya dapat dilihat melalui detail."
							: "Penerimaan tidak ditemukan."
					}
				/>
			</Wrapper>
		);
	return <IncomeForm key={id ?? "new"} income={income} />;
}
