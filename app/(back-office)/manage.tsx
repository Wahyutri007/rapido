import React from "react";
import { View } from "react-native";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	NavList,
	type NavListGroup,
	type NavListProps,
} from "@/components/custom/NavList";
import {
	ManageMenuChevron,
	ManageMenuIcon,
} from "@/components/feature/manage/ManageMenuIcon";
import { route } from "@/lib/utils";

function menuItem(
	title: string,
	path: string,
	name: React.ComponentProps<typeof ManageMenuIcon>["name"],
): NavListProps {
	return {
		id: name,
		title,
		href: route(path),
		icon: <ManageMenuIcon name={name} />,
		rightIconOverride: <ManageMenuChevron />,
	};
}

const GROUPS: NavListGroup[] = [
	{
		title: "Pengaturan",
		items: [
			menuItem("Akun", "/manage/account", "account"),
			menuItem("Toko", "/manage/store", "store"),
			menuItem("Pengaturan POS", "/manage/pos-settings", "pos-settings"),
			menuItem(
				"Generate Barcode Produk",
				"/manage/generate-barcode",
				"generate-barcode",
			),
		],
	},
	{
		title: "Member dan Karyawan",
		items: [
			menuItem("Karyawan", "/manage/workers", "workers"),
			{
				...menuItem("Member", "/(no-layout)/manage/member", "member"),
				withAnchor: false,
			},
			menuItem("Role", "/manage/roles", "roles"),
			menuItem("Absensi", "/manage/absence", "absence"),
		],
	},
	{
		title: "Keuangan",
		items: [
			menuItem("Target Penjualan", "/manage/sales-target", "sales-target"),
			menuItem("Biaya & Pengeluaran", "/manage/expenses", "expenses"),
			menuItem("Pendapatan & Penerimaan", "/manage/income", "income"),
			menuItem("Penggajian", "/manage/payroll", "payroll"),
		],
	},
	{
		title: "Denah dan Struk",
		items: [
			menuItem("Manajemen Tempat", "/manage/place", "place"),
			menuItem("Tampilan Struk", "/manage/receipt", "receipt"),
		],
	},
	{
		title: "Hubungkan",
		items: [
			{
				id: "external",
				title: "Integrasi Eksternal",
				icon: <ManageMenuIcon name="external" />,
				iconTone: "muted",
				rightIconOverride: (
					<View className="rounded-lg bg-primary-50 px-3 py-1">
						<Text className="text-primary" size="small" w="semibold">
							Coming Soon
						</Text>
					</View>
				),
			},
		],
	},
	{
		title: "Fitur Tambahan",
		items: [
			menuItem("Artificial Intelligence", "/manage/ai", "ai"),
			menuItem("Ekspor Data", "/manage/export", "export"),
			menuItem("Kode Referral", "/manage/referral", "referral"),
		],
	},
	{
		title: "Bantuan",
		items: [
			menuItem("FAQ", "/manage/faq", "faq"),
			menuItem("Pengajuan Fitur", "/manage/feature-request", "feature-request"),
			menuItem("Feedback", "/manage/feedback", "feedback"),
		],
	},
];

export default function ManageScreen() {
	const [search, setSearch] = React.useState("");
	return (
		<Wrapper hasBottomBar contentContainerStyle={{ padding: 16, gap: 16 }}>
			<SearchBar search={search} setSearch={setSearch} variant="light" />
			<NavList groups={GROUPS} search={search} variant="manage" />
		</Wrapper>
	);
}
