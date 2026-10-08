import type { CardListSection } from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export type TopCustomerItem = {
	name: string;
	visits: number;
	amount: number;
};

export type TopPromoItem = {
	name: string;
	amount: number;
};

export type CustomersPromosReportData = {
	ringkasanPelanggan: {
		memberAktif: number;
		pelangganBaru: number;
	};
	pelangganTerbaik: TopCustomerItem[];
	ringkasanPromo: {
		promoAktif: number;
		promoDigunakan: number;
		voucherDigunakan: number;
		totalDiskon: number;
		omzetDariPromo: number;
	};
	promoTeratas: TopPromoItem[];
	efektivitasPromo: {
		omzetDariPromo: number;
		totalDiskon: number;
	};
};

export const DEFAULT_CUSTOMERS_PROMOS_REPORT: CustomersPromosReportData = {
	ringkasanPelanggan: {
		memberAktif: 1245,
		pelangganBaru: 328,
	},
	pelangganTerbaik: [
		{ name: "Budi Susanto", visits: 28, amount: 5450000 },
		{ name: "Prajogo Pangestu", visits: 24, amount: 4860000 },
		{ name: "Andi Pratama", visits: 21, amount: 3970000 },
	],
	ringkasanPromo: {
		promoAktif: 12,
		promoDigunakan: 286,
		voucherDigunakan: 1286,
		totalDiskon: -2145000,
		omzetDariPromo: 14860000,
	},
	promoTeratas: [
		{ name: "Diskon 20%", amount: 7450000 },
		{ name: "Beli 2 Gratis 1", amount: 5230000 },
		{ name: "Gratis Ongkir", amount: 3880000 },
	],
	efektivitasPromo: {
		omzetDariPromo: 14860000,
		totalDiskon: -2145000,
	},
};

export function getCustomersPromosReportSections(
	customData?: Partial<CustomersPromosReportData>,
): CardListSection[] {
	const data: CustomersPromosReportData = {
		...DEFAULT_CUSTOMERS_PROMOS_REPORT,
		...customData,
		ringkasanPelanggan: {
			...DEFAULT_CUSTOMERS_PROMOS_REPORT.ringkasanPelanggan,
			...customData?.ringkasanPelanggan,
		},
		ringkasanPromo: {
			...DEFAULT_CUSTOMERS_PROMOS_REPORT.ringkasanPromo,
			...customData?.ringkasanPromo,
		},
		efektivitasPromo: {
			...DEFAULT_CUSTOMERS_PROMOS_REPORT.efektivitasPromo,
			...customData?.efektivitasPromo,
		},
		pelangganTerbaik:
			customData?.pelangganTerbaik ??
			DEFAULT_CUSTOMERS_PROMOS_REPORT.pelangganTerbaik,
		promoTeratas:
			customData?.promoTeratas ?? DEFAULT_CUSTOMERS_PROMOS_REPORT.promoTeratas,
	};

	return [
		{
			title: "Ringkasan Pelanggan",
			rows: [
				{
					label: "Member Aktif",
					value: `${data.ringkasanPelanggan.memberAktif.toLocaleString("id-ID")} Member`,
				},
				{
					label: "Pelanggan Baru",
					value: `${data.ringkasanPelanggan.pelangganBaru.toLocaleString("id-ID")} Pelanggan`,
				},
			],
		},
		{
			title: "Pelanggan Terbaik",
			rows: data.pelangganTerbaik.map((item) => ({
				label: item.name,
				middleValue: `${item.visits} Kunj.`,
				value: formatRp(item.amount),
			})),
		},
		{
			title: "Ringkasan Promo",
			rows: [
				{
					label: "Promo Aktif",
					value: `${data.ringkasanPromo.promoAktif} Promo`,
				},
				{
					label: "Promo Digunakan",
					value: `${data.ringkasanPromo.promoDigunakan} Kali`,
				},
				{
					label: "Voucher Digunakan",
					value: `${data.ringkasanPromo.voucherDigunakan.toLocaleString("id-ID")} Voucher`,
				},
				{
					label: "Total Diskon",
					value: `(${formatRp(Math.abs(data.ringkasanPromo.totalDiskon))})`,
					variant: "negative",
				},
				{
					label: "Omzet dari Promo",
					value: formatRp(data.ringkasanPromo.omzetDariPromo),
				},
			],
		},
		{
			title: "Promo Teratas",
			rows: data.promoTeratas.map((item) => ({
				label: item.name,
				value: formatRp(item.amount),
			})),
		},
		{
			title: "Efektivitas Promo",
			rows: [
				{
					label: "Omzet dari Promo",
					value: formatRp(data.efektivitasPromo.omzetDariPromo),
				},
				{
					label: "Total Diskon",
					value: `(${formatRp(Math.abs(data.efektivitasPromo.totalDiskon))})`,
					variant: "negative",
				},
			],
		},
	];
}
