import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { ICONS } from "@/assets/images/icons";
import SearchBar from "@/components/common/SearchBar";
import {
	NavList,
	type NavListGroup,
	type NavListProps,
} from "@/components/custom/NavList";
import { route } from "@/lib/utils";

const TRANSACTION_MANAGEMENT_ITEMS: NavListProps[] = [
	{
		title: "Akun & Saldo",
		href: route("/report/accounting/accounts"),
		image: ICONS.accounting.akun,
	},
	{
		title: "Biaya & Pengeluaran",
		href: route("/report/accounting/expenses"),
		image: ICONS.accounting.cost,
	},
	{
		title: "Pendapatan & Penerimaan",
		href: route("/report/accounting/incomes"),
		image: ICONS.accounting.income,
	},
	{
		title: "Jurnal Umum",
		href: route("/report/accounting/general-journal"),
		image: ICONS.accounting.generalJournal,
	},
	{
		title: "Jurnal Penyesuaian",
		href: route("/report/accounting/adjusting-journal"),
		image: ICONS.accounting.adjusting,
	},
	{
		title: "Buku Besar",
		href: route("/report/accounting/general-ledger"),
		image: ICONS.accounting.ledger,
	},
	{
		title: "Jurnal Penutup",
		href: route("/report/accounting/closing-journal"),
		image: ICONS.accounting.closing,
	},
];

const FINANCIAL_REPORT_ITEMS: NavListProps[] = [
	{
		title: "Laporan Laba rugi",
		href: route("/report/accounting/profit-loss"),
		image: ICONS.accounting.profit,
	},
	{
		title: "Laporan Posisi Keuangan",
		href: route("/report/accounting/balance-sheet"),
		image: ICONS.accounting.financial,
	},
	{
		title: "Laporan Perubahan Modal",
		href: route("/report/accounting/capital-changes"),
		image: ICONS.accounting.capital,
	},
	{
		title: "Laporan Arus kas",
		href: route("/report/accounting/cash-flow"),
		image: ICONS.accounting.cash,
	},
];

const GROUPS: NavListGroup[] = [
	{
		title: "Manajemen Transaksi",
		items: TRANSACTION_MANAGEMENT_ITEMS,
	},
	{
		title: "Laporan Keuangan",
		items: FINANCIAL_REPORT_ITEMS,
	},
];

export default function AccountingIndexScreen() {
	const [search, setSearch] = useState("");

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView
				contentContainerStyle={{ padding: 16, gap: 16 }}
				showsVerticalScrollIndicator={false}
			>
				<SearchBar
					search={search}
					setSearch={setSearch}
					placeholder="Cari..."
					variant="light"
					className="shadow-main rounded-xl"
				/>

				<NavList groups={GROUPS} search={search} />
			</ScrollView>
		</View>
	);
}
