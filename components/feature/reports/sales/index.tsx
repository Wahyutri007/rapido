import React from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import {
	type CardListFilterOption,
	CardListItem,
	type CardListSection,
	CardListSubGroup,
} from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export const SALES_REPORT_FILTER_OPTIONS: CardListFilterOption[] = [
	{ id: "penjualan-kotor", label: "Penjualan Kotor" },
	{ id: "penjualan-bersih", label: "Penjualan Bersih" },
	{ id: "laba-kotor", label: "Laba Kotor" },
	{ id: "biaya-tambahan", label: "Biaya Tambahan" },
	{ id: "pajak", label: "Pajak" },
	{ id: "diskon", label: "Diskon" },
	{ id: "tipe-penjualan", label: "Tipe Penjualan" },
	{ id: "metode-pembayaran", label: "Metode Pembayaran" },
	{ id: "produk-terjual", label: "Produk Terjual" },
];

export type AdditionalFeeItem = {
	name: string;
	percentage?: string;
	amount: number;
};

export type TaxItem = {
	name: string;
	percentage?: string;
	amount: number;
};

export type DiscountItem = {
	name: string;
	amount: number;
};

export type DiscountGroup = {
	title: string;
	items: DiscountItem[];
	total: number;
};

export type SalesTypeItem = {
	name: string;
	transactions: number;
	amount: number;
};

export type PaymentMethodItem = {
	name: string;
	type: string;
	transactions: number;
	amount: number;
};

export type SoldProductItem = {
	id: string;
	name: string;
	quantity: number;
};

export type SoldProductCategory = {
	categoryName: string;
	totalCategoryItems: number;
	items: SoldProductItem[];
};

export type SalesProfitReportData = {
	omzet: {
		penjualanKotor: number;
		refund: number;
		diskon: number;
		totalOmzet: number;
	};
	penjualanBersih: {
		totalOmzet: number;
		biayaTambahan: number;
		pajak: number;
		totalPenjualanBersih: number;
	};
	labaKotor: {
		totalPenjualanBersih: number;
		hargaModal: number;
		totalLabaKotor: number;
	};
	biayaTambahan: {
		items: AdditionalFeeItem[];
		total: number;
	};
	pajak: {
		items: TaxItem[];
		total: number;
	};
	diskon: {
		diskon: DiscountGroup;
		promo: DiscountGroup;
		voucher: DiscountGroup;
		totalDiskon: number;
	};
	tipePenjualan: SalesTypeItem[];
	metodePembayaran: PaymentMethodItem[];
	produkTerjual: {
		categories: SoldProductCategory[];
		totalItemTerjual: number;
	};
};

export const DEFAULT_SALES_PROFIT_REPORT: SalesProfitReportData = {
	omzet: {
		penjualanKotor: 100000000,
		refund: -20000000,
		diskon: -5000000,
		totalOmzet: 75000000,
	},
	penjualanBersih: {
		totalOmzet: 75000000,
		biayaTambahan: -1500000,
		pajak: -7650000,
		totalPenjualanBersih: 65850000,
	},
	labaKotor: {
		totalPenjualanBersih: 65850000,
		hargaModal: 50000000,
		totalLabaKotor: 15850000,
	},
	biayaTambahan: {
		items: [{ name: "Service Charge", percentage: "3%", amount: 12000 }],
		total: 22000,
	},
	pajak: {
		items: [
			{ name: "PPN", percentage: "11%", amount: 12000 },
			{ name: "Admin", percentage: "10%", amount: 10000 },
		],
		total: 22000,
	},
	diskon: {
		diskon: {
			title: "Diskon",
			items: [
				{ name: "Diskon A", amount: 10000 },
				{ name: "Diskon B", amount: 10000 },
			],
			total: 20000,
		},
		promo: {
			title: "Promo",
			items: [
				{ name: "Promo Akhir Tahun", amount: 10000 },
				{ name: "Promo Lebaran", amount: 10000 },
			],
			total: 20000,
		},
		voucher: {
			title: "Voucher",
			items: [
				{ name: "Voucher - Membership", amount: 10000 },
				{ name: "Voucher - Membership", amount: 10000 },
			],
			total: 20000,
		},
		totalDiskon: 60000,
	},
	tipePenjualan: [
		{ name: "Dine In", transactions: 5, amount: 561000 },
		{ name: "Online", transactions: 15, amount: 150000 },
		{ name: "Take Away", transactions: 20, amount: 100000 },
	],
	metodePembayaran: [
		{ name: "Cash", type: "Tunai", transactions: 5, amount: 561000 },
		{
			name: "BCA",
			type: "Kartu Debit",
			transactions: 15,
			amount: 150000,
		},
		{ name: "QRIS", type: "Qris", transactions: 20, amount: 100000 },
	],
	produkTerjual: {
		categories: [
			{
				categoryName: "Makanan",
				totalCategoryItems: 10,
				items: [
					{ id: "m-1", name: "Ayam Goreng", quantity: 7 },
					{ id: "m-2", name: "Ayam Geprek", quantity: 2 },
					{ id: "m-3", name: "Mie Goreng", quantity: 1 },
					{ id: "m-4", name: "Mie Rebus", quantity: 1 },
				],
			},
			{
				categoryName: "Minuman",
				totalCategoryItems: 10,
				items: [
					{ id: "d-1", name: "Teh Es", quantity: 7 },
					{ id: "d-2", name: "Milo Dingin", quantity: 2 },
					{ id: "d-3", name: "Kopi Susu", quantity: 2 },
					{ id: "d-4", name: "Mie Rebus", quantity: 1 },
					{ id: "d-5", name: "Mie Rebus", quantity: 1 },
				],
			},
			{
				categoryName: "Cemilan",
				totalCategoryItems: 3,
				items: [
					{ id: "s-1", name: "Mie Rebus", quantity: 1 },
					{ id: "s-2", name: "Mie Rebus", quantity: 1 },
					{ id: "s-3", name: "Mie Rebus", quantity: 1 },
				],
			},
		],
		totalItemTerjual: 20,
	},
};

/**
 * Interactive card body component for multi-tier discounts (Diskon, Promo, Voucher).
 */
export function DiscountCardBody({
	data,
}: {
	data: SalesProfitReportData["diskon"];
}) {
	const groups = [data.diskon, data.promo, data.voucher];

	return (
		<View className="gap-3">
			{groups.map((grp) => (
				<CardListSubGroup key={grp.title} title={grp.title}>
					{grp.items.map((item) => (
						<CardListItem
							key={`${grp.title}-${item.name}`}
							label={item.name}
							value={formatRp(item.amount)}
						/>
					))}
					<CardListItem
						label={`Total ${grp.title}`}
						value={formatRp(grp.total)}
						important
						separator
					/>
				</CardListSubGroup>
			))}

			<CardListItem
				label="Total Diskon"
				value={formatRp(data.totalDiskon)}
				important
				separator
				labelWeight="bold"
				valueClassName=" font-bold"
			/>
		</View>
	);
}

/**
 * Interactive card body component for categorized sold products with expand/collapse buttons.
 */
export function SoldProductsCardBody({
	data,
}: {
	data: SalesProfitReportData["produkTerjual"];
}) {
	const [expandedCategories, setExpandedCategories] = React.useState<
		Record<string, boolean>
	>({
		Minuman: true, // Default expanded state as shown in mockup
	});

	const toggleCategory = (categoryName: string) => {
		setExpandedCategories((prev) => ({
			...prev,
			[categoryName]: !prev[categoryName],
		}));
	};

	return (
		<View className="gap-4">
			{data.categories.map((category) => {
				const isExpanded = !!expandedCategories[category.categoryName];
				const initialLimit = 3;
				const shouldShowToggle = category.items.length > initialLimit;
				const displayItems = isExpanded
					? category.items
					: category.items.slice(0, initialLimit);

				return (
					<View key={category.categoryName} className="gap-2">
						<Text size="small" w="semibold" className="text-zinc-800">
							{category.categoryName} ({category.totalCategoryItems})
						</Text>

						{displayItems.map((item, index) => (
							<View
								key={item.id}
								className="flex-row items-center justify-between"
							>
								<Text size="small" className="text-zinc-600">
									{index + 1}) {item.name}
								</Text>
								<Text size="small" w="medium" className="text-zinc-700">
									{item.quantity} Item
								</Text>
							</View>
						))}

						{shouldShowToggle ? (
							<Pressable
								onPress={() => toggleCategory(category.categoryName)}
								className="mt-1 h-9 items-center justify-center rounded-xl border border-primary-500 bg-white active:bg-primary-50"
							>
								<Text size="small" w="medium" className="text-primary-500">
									{isExpanded ? "Sembunyikan" : "Lihat Selengkapnya"}
								</Text>
							</Pressable>
						) : null}
					</View>
				);
			})}

			<View className="h-px w-full bg-border-muted" />

			<View className="flex-row items-center justify-between">
				<Text size="small" w="semibold">
					Total Item Terjual
				</Text>
				<Text size="small" w="bold">
					{data.totalItemTerjual} Item
				</Text>
			</View>
		</View>
	);
}

/**
 * Returns sections for "Ringkasan Penjualan" group.
 */
export function getSalesSummarySections(
	customData?: Partial<SalesProfitReportData>,
): CardListSection[] {
	const data: SalesProfitReportData = {
		...DEFAULT_SALES_PROFIT_REPORT,
		...customData,
		omzet: {
			...DEFAULT_SALES_PROFIT_REPORT.omzet,
			...customData?.omzet,
		},
		penjualanBersih: {
			...DEFAULT_SALES_PROFIT_REPORT.penjualanBersih,
			...customData?.penjualanBersih,
		},
		labaKotor: {
			...DEFAULT_SALES_PROFIT_REPORT.labaKotor,
			...customData?.labaKotor,
		},
	};

	return [
		{
			id: "penjualan-kotor",
			title: "Penjualan Kotor",
			rows: [
				{
					label: "Total Penjualan Kotor",
					value: formatRp(data.omzet.penjualanKotor),
				},
				{
					label: "Total Refund",
					value: `(${formatRp(Math.abs(data.omzet.refund))})`,
					variant: "negative",
				},
				{
					label: "Total Diskon",
					value: `(${formatRp(Math.abs(data.omzet.diskon))})`,
					variant: "negative",
				},
				{
					label: "Total Omzet",
					value: formatRp(data.omzet.totalOmzet),
					important: true,
					separator: true,
				},
			],
		},
		{
			id: "penjualan-bersih",
			title: "Penjualan Bersih",
			rows: [
				{
					label: "Total Omzet",
					value: formatRp(data.penjualanBersih.totalOmzet),
				},
				{
					label: "Total Biaya Tambahan",
					value: `(${formatRp(Math.abs(data.penjualanBersih.biayaTambahan))})`,
					variant: "negative",
				},
				{
					label: "Total Pajak",
					value: `(${formatRp(Math.abs(data.penjualanBersih.pajak))})`,
					variant: "negative",
				},
				{
					label: "Total Penjualan Bersih",
					value: formatRp(data.penjualanBersih.totalPenjualanBersih),
					important: true,
					separator: true,
				},
			],
		},
		{
			id: "laba-kotor",
			title: "Laba Kotor",
			rows: [
				{
					label: "Total Penjualan Bersih",
					value: formatRp(data.labaKotor.totalPenjualanBersih),
				},
				{
					label: "Total Harga Modal",
					value: formatRp(data.labaKotor.hargaModal),
				},
				{
					label: "Total Laba Kotor",
					value: formatRp(data.labaKotor.totalLabaKotor),
					important: true,
					separator: true,
				},
			],
		},
	];
}

/**
 * Returns sections for "Rincian Penjualan" group.
 */
export function getSalesDetailSections(
	customData?: Partial<SalesProfitReportData>,
): CardListSection[] {
	const data: SalesProfitReportData = {
		...DEFAULT_SALES_PROFIT_REPORT,
		...customData,
		biayaTambahan: {
			...DEFAULT_SALES_PROFIT_REPORT.biayaTambahan,
			...customData?.biayaTambahan,
		},
		pajak: {
			...DEFAULT_SALES_PROFIT_REPORT.pajak,
			...customData?.pajak,
		},
		diskon: {
			...DEFAULT_SALES_PROFIT_REPORT.diskon,
			...customData?.diskon,
		},
		tipePenjualan:
			customData?.tipePenjualan ?? DEFAULT_SALES_PROFIT_REPORT.tipePenjualan,
		metodePembayaran:
			customData?.metodePembayaran ??
			DEFAULT_SALES_PROFIT_REPORT.metodePembayaran,
		produkTerjual: {
			...DEFAULT_SALES_PROFIT_REPORT.produkTerjual,
			...customData?.produkTerjual,
		},
	};

	return [
		{
			id: "biaya-tambahan",
			title: "Biaya Tambahan",
			rows: [
				...data.biayaTambahan.items.map((item) => ({
					label: item.name,
					description: item.percentage,
					value: formatRp(item.amount),
				})),
				{
					label: "Total",
					value: formatRp(data.biayaTambahan.total),
					important: true,
					separator: true,
				},
			],
		},
		{
			id: "pajak",
			title: "Pajak",
			rows: [
				...data.pajak.items.map((item) => ({
					label: item.name,
					description: item.percentage,
					value: formatRp(item.amount),
				})),
				{
					label: "Total",
					value: formatRp(data.pajak.total),
					important: true,
					separator: true,
				},
			],
		},
		{
			id: "diskon",
			title: "Diskon",
			rows: [
				{
					type: "group",
					title: "Diskon",
					rows: [
						...data.diskon.diskon.items.map((item) => ({
							label: item.name,
							value: formatRp(item.amount),
						})),
						{
							label: "Total Diskon",
							value: formatRp(data.diskon.diskon.total),
							important: true,
							separator: true,
						},
					],
				},
				{
					type: "group",
					title: "Promo",
					rows: [
						...data.diskon.promo.items.map((item) => ({
							label: item.name,
							value: formatRp(item.amount),
						})),
						{
							label: "Total Promo",
							value: formatRp(data.diskon.promo.total),
							important: true,
							separator: true,
						},
					],
				},
				{
					type: "group",
					title: "Voucher",
					rows: [
						...data.diskon.voucher.items.map((item) => ({
							label: item.name,
							value: formatRp(item.amount),
						})),
						{
							label: "Total Voucher",
							value: formatRp(data.diskon.voucher.total),
							important: true,
							separator: true,
						},
					],
				},
				{
					label: "Total Diskon",
					value: formatRp(data.diskon.totalDiskon),
					important: true,
					separator: true,
					labelClassName: "",
					labelWeight: "bold",
					valueClassName: " font-bold",
				},
			],
		},
		{
			id: "tipe-penjualan",
			title: "Tipe Penjualan",
			rows: data.tipePenjualan.map((item) => ({
				label: item.name,
				subValue: `Jumlah Transaksi: ${item.transactions}`,
				value: formatRp(item.amount),
			})),
		},
		{
			id: "metode-pembayaran",
			title: "Metode Pembayaran",
			rows: data.metodePembayaran.map((item) => ({
				label: item.name,
				labelClassName: "",
				labelWeight: "semibold",
				description: item.type,
				subValue: `Jumlah Transaksi: ${item.transactions}`,
				value: formatRp(item.amount),
			})),
		},
		{
			id: "produk-terjual",
			title: "Produk Terjual",
			render: () => <SoldProductsCardBody data={data.produkTerjual} />,
		},
	];
}
