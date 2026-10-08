import React from "react";
import { View } from "react-native";
import { ICONS } from "@/assets/images/icons";
import SearchBar from "@/components/common/SearchBar";
import Wrapper from "@/components/common/Wrapper";
import {
	NavList,
	type NavListGroup,
	type NavListProps,
} from "@/components/custom/NavList";
import { Permissions } from "@/constants/Permissions";
import { useAuth } from "@/context/AuthContext";
import { route, tw } from "@/lib/utils";

const TRANSACTION_ITEMS: NavListProps[] = [
	{
		title: "Metode Pembayaran",
		href: route("/catalog/payment-method"),
		image: ICONS.catalog.paymentMethod,
		permission: Permissions.MANAGE_PAYMENT_METHODS,
	},
	{
		title: "Tipe Pesanan",
		href: route("/catalog/order-type"),
		image: ICONS.catalog.orderType,
		permission: Permissions.MANAGE_ORDER_TYPES,
	},
	{
		title: "Pajak",
		href: route("/catalog/tax"),
		image: ICONS.catalog.tax,
		permission: Permissions.MANAGE_TAXES,
	},
	{
		title: "Biaya Tambahan",
		href: route("/catalog/extra-cost"),
		image: ICONS.catalog.extraCost,
		permission: Permissions.MANAGE_EXTRA_COSTS,
	},
];
const PRODUCT_ITEMS: NavListProps[] = [
	{
		title: "Kategori",
		href: route("/catalog/category"),
		image: ICONS.catalog.category,
		permission: Permissions.MANAGE_CATEGORIES,
	},
	{
		title: "Merk",
		href: route("/catalog/brand"),
		image: ICONS.catalog.brand,
		permission: Permissions.MANAGE_BRANDS,
	},
	{
		title: "Satuan",
		href: route("/catalog/unit"),
		image: ICONS.catalog.unit,
		permission: Permissions.MANAGE_UNITS,
	},
	{
		title: "Menu",
		href: route("/catalog/menu"),
		image: ICONS.catalog.product,
		permission: Permissions.MANAGE_MENUS,
	},
	{
		title: "Tambahan",
		href: route("/catalog/extra-menu"),
		image: ICONS.catalog.extras,
		permission: Permissions.MANAGE_EXTRA_COSTS,
	},
	{
		title: "Bundling",
		href: route("/catalog/bundling"),
		image: ICONS.catalog.bundle,
		permission: Permissions.MANAGE_BUNDLINGS,
	},
];
const OFFER_ITEMS: NavListProps[] = [
	{
		title: "Diskon",
		href: route("/catalog/discount"),
		image: ICONS.catalog.discount,
		permission: Permissions.MANAGE_DISCOUNTS,
	},
	{
		title: "Promo",
		href: route("/catalog/promo"),
		image: ICONS.catalog.promo,
		permission: Permissions.MANAGE_PROMO,
	},
	{
		title: "Voucher",
		href: route("/catalog/voucher"),
		image: ICONS.catalog.voucher,
		permission: Permissions.MANAGE_VOUCHERS,
	},
];

const GROUPS: NavListGroup[] = [
	{
		title: "Transaksi",
		items: TRANSACTION_ITEMS,
	},
	{
		title: "Produk",
		items: PRODUCT_ITEMS,
	},
	{
		title: "Penawaran",
		items: OFFER_ITEMS,
	},
];

export default function CatalogListScreen() {
	const [search, setSearch] = React.useState("");

	const { hasPermission } = useAuth();

	const authorizedGroups = GROUPS.map((group) => {
		return {
			...group,
			items: group.items.filter((item) =>
				item.permission ? hasPermission(item.permission) : true,
			),
		};
	}).filter((group) => group.items.length > 0);

	return (
		<Wrapper hasBottomBar pt={tw(4)} className="px-4">
			<SearchBar
				search={search}
				setSearch={setSearch}
				variant="light"
				className="shadow-main rounded-xl"
			/>
			<View className="h-4" />
			<NavList groups={authorizedGroups} search={search} />
		</Wrapper>
	);
}
