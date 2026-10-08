import React from "react";
import { View } from "react-native";
import { ICONS } from "@/assets/images/icons";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	NavList,
	type NavListGroup,
	type NavListProps,
} from "@/components/custom/NavList";
import { route, tw } from "@/lib/utils";

const SUMMARY: NavListProps[] = [
	{
		title: "Ringkasan Bisnis",
		image: ICONS.reports.report,
		href: route("/report/summary"),
	},
];

const SALES: NavListProps[] = [
	{
		title: "Penjualan & Keuntungan",
		href: route("/report/sales"),
		image: ICONS.reports.sales,
	},
	{
		title: "Riwayat Transaksi",
		href: route("/report/transaction"),
		image: ICONS.reports.sales,
	},
	{
		title: "Pelanggan & Promo",
		href: route("/report/customers-promos"),
		image: ICONS.reports.sales,
	},
];

const FINANCE_ITEMS: NavListProps[] = [
	{
		title: "Kas",
		href: route("/report/cash"),
		image: ICONS.reports.kas,
	},
	{
		title: "Akuntansi",
		href: route("/report/accounting"),
		image: ICONS.reports.accounting,
	},
];
const PRODUCT_ITEMS: NavListProps[] = [
	{
		title: "Produk & Stok",
		href: route("/report/product-stock"),
		image: ICONS.reports.product,
	},
	{
		title: "Pembelian & Pemasok",
		href: route("/report/purchase-supplier"),
		image: ICONS.reports.supplier,
	},
];
const OPERATIONAL_ITEMS: NavListProps[] = [
	{
		title: "Operasional & Tim",
		href: route("/report/operational-team"),
		image: ICONS.reports.operational,
	},
];
const AI_ITEMS: NavListProps[] = [
	{
		title: "Analisis Laporan AI",
		image: ICONS.reports.ai,
		rightIconOverride: (
			<View className="rounded-md bg-primary-500/10 px-3 py-1.5">
				<Text className="text-primary-500" size="small" w="semibold">
					Coming Soon
				</Text>
			</View>
		),
	},
];

const GROUPS: NavListGroup[] = [
	{
		title: "Ringkasan",
		items: SUMMARY,
	},
	{
		title: "Penjualan & Pelanggan",
		items: SALES,
	},
	{
		title: "Keuangan",
		items: FINANCE_ITEMS,
	},
	{
		title: "Produk & Pengadaan",
		items: PRODUCT_ITEMS,
	},
	{
		title: "Operasional & Tim",
		items: OPERATIONAL_ITEMS,
	},
	{
		title: "Artificial Intelligence",
		items: AI_ITEMS,
	},
];

export default function ReportScreen() {
	const [search, setSearch] = React.useState("");

	return (
		<Wrapper hasBottomBar pt={tw(4)} className="px-4">
			<SearchBar
				search={search}
				setSearch={setSearch}
				variant="light"
				className="shadow-main rounded-xl"
			/>
			<View className="h-4" />
			<NavList groups={GROUPS} search={search} />
		</Wrapper>
	);
}
