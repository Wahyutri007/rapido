import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import DetailRow from "@/components/custom/DetailRow";
import { WalletIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { formatRp } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";

export default function AccountDetailScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const accounts = useAccountingStore((state) => state.accounts);
	const getTotals = useAccountingStore((state) => state.getTotals);

	const account = useMemo(() => {
		return accounts.find((acc) => acc.id === params.id) || accounts[0];
	}, [accounts, params.id]);

	const totals = getTotals();
	const isBalanced = totals.difference === 0;

	if (!account) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50 p-4">
				<Text className="text-zinc-500">Akun tidak ditemukan</Text>
			</View>
		);
	}

	const nominal = Math.max(account.debit, account.credit);

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Top Header Card */}
				<Card className="flex-row items-center gap-3.5 rounded-2xl border border-gray-100">
					<View className="size-12 items-center justify-center rounded-2xl bg-blue-50">
						<WalletIcon color={Colors.primary} size={24} />
					</View>
					<View className="flex-1">
						<Text w="bold" className="text-base text-foreground">
							{account.name}
						</Text>
						<Text className="text-xs text-zinc-400">
							{account.description ||
								"Pajak yang dihitung berdasarkan persantese."}
						</Text>
					</View>
				</Card>

				{/* Section: Informasi Pengeluaran */}
				<View className="gap-2">
					<Text w="medium" className="px-1 text-xs text-zinc-500">
						Informasi Pengeluaran
					</Text>

					<Card className="py-1">
						<DetailRow label="Klasifikasi" value={account.classification} />
						<DetailRow
							label="Subklasifikasi"
							value={account.subClassification}
						/>
						<DetailRow label="Kode" value={account.code} />
						<DetailRow label="Nama" value={account.name} />
						<DetailRow
							label="Mata Uang"
							value={account.currency === "IDR" ? "Rupiah" : account.currency}
						/>
						<DetailRow
							label="Nominal"
							value={formatRp(nominal).replace(/\s/g, "")}
							isLast
						/>
					</Card>
				</View>

				{/* Section: Ringkasan */}
				<Card className="rounded-2xl border border-gray-100">
					<Text w="bold" className="text-base text-foreground mb-4">
						Ringkasan
					</Text>

					{/* Total Debit & Kredit */}
					<View className="flex-row items-center justify-between pb-3">
						<View className="flex-1 items-center">
							<Text className="text-xs text-zinc-500 mb-1">Total Debit</Text>
							<Text w="bold" className="text-sm text-primary-500">
								{formatRp(totals.totalDebit).replace(/\s/g, "")}
							</Text>
						</View>

						<View className="h-8 w-[1px] bg-gray-200" />

						<View className="flex-1 items-center">
							<Text className="text-xs text-zinc-500 mb-1">Total Kredit</Text>
							<Text w="bold" className="text-sm text-primary-500">
								{formatRp(totals.totalCredit).replace(/\s/g, "")}
							</Text>
						</View>
					</View>

					{/* Selisih */}
					<View className="items-center border-t border-gray-100 pt-3 pb-3">
						<Text className="text-xs text-zinc-500 mb-1">Selisih</Text>
						<Text w="bold" className="text-sm text-primary-500">
							{formatRp(totals.difference).replace(/\s/g, "")}
						</Text>
					</View>

					{/* Balance Status Badge */}
					<View className="items-center pt-1">
						{isBalanced ? (
							<View className="flex-row items-center rounded-full bg-emerald-50 px-3.5 py-1.5 gap-1.5">
								<View className="size-4 items-center justify-center rounded-full bg-emerald-500">
									<Feather name="check" size={10} color="#FFFFFF" />
								</View>
								<Text w="medium" className="text-xs text-success">
									Seimbang
								</Text>
							</View>
						) : (
							<View className="flex-row items-center rounded-full bg-amber-50 px-3.5 py-1.5 gap-1.5">
								<Feather name="alert-circle" size={14} color="#D97706" />
								<Text w="medium" className="text-xs text-warning">
									Tidak Seimbang
								</Text>
							</View>
						)}
					</View>
				</Card>
			</ScrollView>
		</View>
	);
}
