import React from "react";
import { INVENTORY_IMAGES } from "@/assets/images/inventory";
import SearchBar from "@/components/common/SearchBar";
import Wrapper from "@/components/common/Wrapper";
import { NavList, type NavListGroup } from "@/components/custom/NavList";
import { route } from "@/lib/utils";

const GROUPS: NavListGroup[] = [
	{
		title: "Operasional Barang",
		items: [
			{
				title: "Ringkasan Inventory",
				href: route("/inventory/summary"),
				image: INVENTORY_IMAGES.summary,
				imageScale: 1.24,
			},
			{
				title: "Transfer Stok",
				href: route("/inventory/stock-transfer"),
				image: INVENTORY_IMAGES.transfer,
				imageScale: 1.26,
			},
			{
				title: "Penyesuaian Stok",
				href: route("/inventory/stock-adjustment"),
				image: INVENTORY_IMAGES.adjustment,
				imageScale: 1.24,
			},
		],
	},
	{
		title: "Bahan & Komposisi",
		items: [
			{
				title: "Bahan Baku",
				href: route("/inventory/materials"),
				image: INVENTORY_IMAGES.material,
				imageScale: 1.2,
			},
			{
				title: "Komposisi Produk",
				href: route("/inventory/compositions"),
				image: INVENTORY_IMAGES.composition,
				imageScale: 1.16,
			},
		],
	},
	{
		title: "Barang Masuk",
		items: [
			{
				title: "Pembelian Barang",
				href: route("/inventory/purchase-order"),
				image: INVENTORY_IMAGES.purchase,
				imageScale: 1.14,
			},
			{
				title: "Pemasok",
				href: route("/inventory/suppliers"),
				image: INVENTORY_IMAGES.supplier,
				imageScale: 1.17,
			},
			{
				title: "Pembayaran Tagihan",
				href: route("/inventory/bill-payments"),
				image: INVENTORY_IMAGES.payment,
				imageScale: 1.14,
			},
		],
	},
	{
		title: "Riwayat",
		items: [
			{
				title: "Riwayat Mutasi Stok",
				href: route("/inventory/stock-movement"),
				image: INVENTORY_IMAGES.movement,
				imageScale: 1.1,
			},
			{
				title: "Stok Akhir",
				href: route("/inventory/closing-stock"),
				image: INVENTORY_IMAGES.closing,
				imageScale: 1.11,
			},
		],
	},
];

export default function InventoryScreen() {
	const [search, setSearch] = React.useState("");
	return (
		<Wrapper hasBottomBar contentContainerStyle={{ padding: 16, gap: 16 }}>
			<SearchBar search={search} setSearch={setSearch} />
			<NavList groups={GROUPS} search={search} variant="inventory" />
		</Wrapper>
	);
}
