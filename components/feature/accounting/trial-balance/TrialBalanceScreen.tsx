import { useState } from "react";
import { FlatList, View } from "react-native";
import { BottomActionInset } from "@/components/common/BottomActionBar";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Button, ButtonText } from "@/components/ui/button";
import {
	balanceAmount,
	balanceCurrencies,
	currencyLabel,
	trialBalance,
	UNKNOWN_CURRENCY,
} from "@/lib/accounting/trial-balance";
import { useAccountingStore } from "@/store/accountingStore";

export default function TrialBalanceScreen() {
	const accounts = useAccountingStore((s) => s.accounts);
	const [search, setSearch] = useState("");
	const [classification, setClassification] = useState("");
	const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
	const currencies = balanceCurrencies(accounts);
	const currency =
		selectedCurrency ??
		currencies.find((c) => c.value === "IDR")?.value ??
		currencies[0]?.value ??
		"";
	const report = trialBalance(accounts, currency, search, classification);
	const classifications = [
		{ label: "Semua klasifikasi", value: "" },
		...[...new Set(accounts.map((a) => a.classification))]
			.filter(Boolean)
			.sort()
			.map((value) => ({ label: value, value })),
	];
	return (
		<Wrapper isNotScrollable>
			<FlatList
				data={report.rows}
				keyExtractor={(row) => row.account.id}
				ListFooterComponent={<BottomActionInset />}
				contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
				ListHeaderComponent={
					<View className="gap-4">
						<Card className="gap-2">
							<Text w="semibold">Neraca saldo sesi</Text>
							<Text size="normal" className="text-muted">
								Mengikuti saldo pada Akun & Saldo, termasuk data contoh. Belum
								merupakan laporan per periode atau hasil posting jurnal
								otomatis.
							</Text>
						</Card>
						<SearchBar
							search={search}
							setSearch={setSearch}
							placeholder="Cari nama atau kode akun"
							variant="light"
						/>
						<SingleSelect
							label="Mata uang"
							items={currencies}
							value={currency}
							onValueChange={setSelectedCurrency}
							placeholder="Belum ada mata uang"
						/>
						<SingleSelect
							label="Klasifikasi akun"
							items={classifications}
							value={classification}
							onValueChange={setClassification}
						/>
						<Button
							variant="outline"
							onPress={() => {
								setSearch("");
								setClassification("");
								setSelectedCurrency(null);
							}}
						>
							<ButtonText>Reset filter</ButtonText>
						</Button>
						<Card className="gap-2">
							<Text w="semibold">{report.rows.length} akun ditampilkan</Text>
							<Text size="normal" className="text-muted">
								Total hanya untuk hasil filter dalam{" "}
								{currencyLabel(currency) || "mata uang terpilih"}. Mata uang
								berbeda tidak dijumlahkan.
							</Text>
							{report.totals ? (
								<>
									<DetailRow
										label="Total debit"
										value={balanceAmount(report.totals.debit)}
									/>
									<DetailRow
										label="Total kredit"
										value={balanceAmount(report.totals.credit)}
									/>
									<DetailRow
										label="Selisih debit - kredit"
										value={balanceAmount(report.totals.difference)}
										isLast
									/>
									<Text
										size="normal"
										className={
											report.totals.balanced ? "text-success" : "text-warning"
										}
									>
										{report.totals.balanced
											? "Debit = kredit pada hasil filter"
											: "Debit dan kredit berbeda pada hasil filter"}
									</Text>
								</>
							) : (
								<Text size="normal" className="text-muted">
									Total tidak tersedia.
								</Text>
							)}
							{report.invalidCount > 0 && (
								<Text size="normal" className="text-destructive">
									{report.invalidCount} akun memiliki saldo tidak valid. Periksa
									angka nonnegatif dengan maksimal dua desimal di Akun & Saldo.
								</Text>
							)}
							{report.overflow && (
								<Text size="normal" className="text-destructive">
									Jumlah melebihi batas perhitungan aman.
								</Text>
							)}
							{currency === UNKNOWN_CURRENCY && (
								<Text size="normal" className="text-warning">
									Lengkapi mata uang akun sebelum menghitung total.
								</Text>
							)}
						</Card>
					</View>
				}
				ListEmptyComponent={
					<Card>
						<Text size="normal">
							Tidak ada akun sesuai filter. Pilih kembali mata uang atau reset
							filter.
						</Text>
					</Card>
				}
				renderItem={({ item }) => (
					<Card className="gap-2">
						<Text w="semibold">
							{item.account.code} · {item.account.name}
						</Text>
						<Text size="normal" className="text-muted">
							{item.account.classification} · {currencyLabel(currency)}
						</Text>
						<DetailRow
							label="Debit"
							value={
								item.debitMinor === null
									? "Tidak valid"
									: balanceAmount(item.debitMinor / 100)
							}
						/>
						<DetailRow
							label="Kredit"
							value={
								item.creditMinor === null
									? "Tidak valid"
									: balanceAmount(item.creditMinor / 100)
							}
							isLast
						/>
					</Card>
				)}
			/>
		</Wrapper>
	);
}
