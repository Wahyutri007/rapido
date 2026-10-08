import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { WalletIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";

export default function IncomeDetailScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const incomes = useAccountingStore((state) => state.incomes);

	const income = useMemo(() => {
		return incomes.find((item) => item.id === params.id) || incomes[0];
	}, [incomes, params.id]);

	if (!income) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50 p-4">
				<Text className="text-zinc-500">Penerimaan tidak ditemukan</Text>
			</View>
		);
	}

	const infoItems = [
		{
			label: "Nama Akun",
			value: income.accountName ?? "Pendapatan Operasional",
		},
		{ label: "Kode Akun", value: income.accountCode ?? "41001" },
		{ label: "No. Referensi", value: income.referenceNumber },
		{ label: "Sumber Dana", value: income.fundingSource ?? "Kas" },
		{ label: "Toko", value: income.store ?? "Sushiro" },
		{ label: "Tanggal", value: income.date },
		{
			label: "Nominal",
			value: formatRp(income.amount).replace(/\s/g, ""),
		},
		{ label: "Deskripsi", value: income.description ?? "-" },
	];

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Top Header Card */}
				<Card className="flex-row items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4">
					<View className="size-12 items-center justify-center rounded-2xl bg-blue-50">
						<WalletIcon color={Colors.primary} size={24} />
					</View>
					<View className="flex-1">
						<Text w="bold" className="text-base text-foreground">
							{income.accountName ?? "Pendapatan Operasional"}
						</Text>
						<Text className="text-xs text-zinc-400">
							{income.categoryDescription ||
								"Pajak yang dihitung berdasarkan persantese."}
						</Text>
					</View>
				</Card>

				{/* Section: Informasi Penerimaan / Pengeluaran */}
				<View className="gap-2">
					<Text w="medium" className="px-1 text-xs text-zinc-500">
						Informasi Pengeluaran
					</Text>

					<Card className="rounded-2xl border border-gray-100 bg-white px-4 py-1">
						{infoItems.map((item, index) => (
							<View
								key={item.label}
								className={cn(
									"flex-row items-center justify-between py-3.5",
									index < infoItems.length - 1 && "border-b border-gray-100",
								)}
							>
								<Text w="medium" className="text-sm text-foreground">
									{item.label}
								</Text>
								<Text className="text-sm text-zinc-600">{item.value}</Text>
							</View>
						))}
					</Card>
				</View>
			</ScrollView>
		</View>
	);
}
