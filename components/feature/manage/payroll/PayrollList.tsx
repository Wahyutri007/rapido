import { router } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import { Button, ButtonText } from "@/components/ui/button";
import { PAYROLL_STATUSES } from "@/constants/data/manage/payroll";
import {
	filterPayroll,
	payrollMethodLabel,
	payrollPeriodLabel,
	payrollTotals,
} from "@/lib/manage/payroll";
import { formatRp, route } from "@/lib/utils";
import { usePayrollStore } from "@/store/payrollStore";
import type { PayrollStatus } from "@/types/ui/manage/payroll";
import { PayrollPreviewNotice, PayrollStatusBadge } from "./PayrollCommon";

export default function PayrollList() {
	const records = usePayrollStore((state) => state.records);
	const periods = Array.from(new Set(records.map((item) => item.period)))
		.sort()
		.reverse();
	const [period, setPeriod] = React.useState(periods[0] ?? "");
	const [search, setSearch] = React.useState("");
	const [status, setStatus] = React.useState<PayrollStatus | "">("");
	const filtered = !!(search.trim() || status);
	const items = filterPayroll(records, period, search, status);
	const summary = items.reduce(
		(result, record) => {
			const totals = payrollTotals(record);
			result.total += totals.net;
			result[totals.status] += totals.net;
			return result;
		},
		{ total: 0, unpaid: 0, partial: 0, paid: 0 },
	);
	return (
		<Wrapper isNotScrollable py={16}>
			<View className="flex-1 gap-4 px-4">
				<PayrollPreviewNotice />
				<SearchBar
					search={search}
					setSearch={setSearch}
					placeholder="Cari karyawan atau metode..."
				/>
				<View className="flex-row gap-3">
					<View className="min-w-0 flex-1">
						<SingleSelect
							label="Periode Gaji"
							value={period}
							onValueChange={setPeriod}
							items={periods.map((value) => ({
								value,
								label: payrollPeriodLabel(value),
							}))}
							placeholder="Pilih periode"
						/>
					</View>
					<View className="min-w-0 flex-1">
						<SingleSelect<PayrollStatus | "">
							label="Status Pembayaran"
							value={status}
							onValueChange={setStatus}
							items={[...PAYROLL_STATUSES]}
						/>
					</View>
				</View>
				<Card density="compact" className="gap-3">
					<Text size="small" className="text-muted">
						{filtered ? "Total hasil filter" : "Total Gaji Periode Ini"}
					</Text>
					<Text size="body" w="bold">
						{formatRp(summary.total)}
					</Text>
					<View className="flex-row gap-2">
						{PAYROLL_STATUSES.filter((item) => item.value).map((item) => (
							<View key={item.value} className="min-w-0 flex-1 gap-1">
								<Text size="small" className="text-muted">
									{item.label}
								</Text>
								<Text size="small" w="semibold">
									{formatRp(summary[item.value as PayrollStatus])}
								</Text>
							</View>
						))}
					</View>
				</Card>
				<View className="flex-row items-center justify-between">
					<Text size="normal" w="medium">
						Daftar Karyawan · {items.length}
					</Text>
					{filtered && (
						<Button
							variant="link"
							size="sm"
							onPress={() => {
								setSearch("");
								setStatus("");
							}}
						>
							<ButtonText>Reset Filter</ButtonText>
						</Button>
					)}
				</View>
				<FlatList
					data={items}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<CatalogItemCard
							density="compact"
							title={
								<Text size="normal" w="semibold" className="flex-1 shrink">
									{item.employeeName}
								</Text>
							}
							subtitle={item.role}
							onPress={() =>
								router.push(route("/manage/payroll/detail", { id: item.id }))
							}
						>
							<Text size="small" className="text-muted">
								{payrollMethodLabel(item.settings.method)}
							</Text>
							<View className="flex-row flex-wrap items-center justify-between gap-2 pt-2">
								<PayrollStatusBadge status={payrollTotals(item).status} />
								<Text size="normal" w="semibold">
									{formatRp(payrollTotals(item).net)}
								</Text>
							</View>
						</CatalogItemCard>
					)}
					ListEmptyComponent={
						<SearchNotFound
							text={
								filtered
									? "Penggajian tidak ditemukan."
									: "Belum ada penggajian pada periode ini."
							}
						/>
					}
				/>
			</View>
		</Wrapper>
	);
}
