import type { CardListSection } from "@/components/custom/CardList";
import { formatRp } from "@/lib/utils";

export type CashierPerformanceItem = {
	name: string;
	packCount: number;
	amount: number;
};

export type OperationalTeamReportData = {
	performaKasir: CashierPerformanceItem[];
	absensiDanJamKerja: {
		totalJamKerja: number;
		produktivitasPerJam: number;
	};
	refund: {
		jumlahRefund: number;
		totalRefund: number;
		kasirRefundTertinggi: number;
	};
};

export const DEFAULT_OPERATIONAL_TEAM_REPORT: OperationalTeamReportData = {
	performaKasir: [
		{ name: "Dinda A.", packCount: 68, amount: 2384000 },
		{ name: "Budi Seetiawan", packCount: 54, amount: 1872000 },
		{ name: "Siti Nurhaliza", packCount: 5, amount: 1412000 },
	],
	absensiDanJamKerja: {
		totalJamKerja: 612,
		produktivitasPerJam: 1285000,
	},
	refund: {
		jumlahRefund: 1000000,
		totalRefund: 1000000,
		kasirRefundTertinggi: 1000000,
	},
};

export function getOperationalTeamReportSections(
	customData?: Partial<OperationalTeamReportData>,
): CardListSection[] {
	const data: OperationalTeamReportData = {
		...DEFAULT_OPERATIONAL_TEAM_REPORT,
		...customData,
		absensiDanJamKerja: {
			...DEFAULT_OPERATIONAL_TEAM_REPORT.absensiDanJamKerja,
			...customData?.absensiDanJamKerja,
		},
		refund: {
			...DEFAULT_OPERATIONAL_TEAM_REPORT.refund,
			...customData?.refund,
		},
		performaKasir:
			customData?.performaKasir ?? DEFAULT_OPERATIONAL_TEAM_REPORT.performaKasir,
	};

	return [
		{
			title: "Performa Kasir",
			rows: data.performaKasir.map((item) => ({
				label: item.name,
				middleValue: `${item.packCount} Pack`,
				value: formatRp(item.amount),
			})),
		},
		{
			title: "Absensi & Jam Kerja",
			rows: [
				{
					label: "Total Jam Kerja",
					value: `${data.absensiDanJamKerja.totalJamKerja} Jam`,
				},
				{
					label: "Produktivitas per Jam Kerja",
					value: formatRp(data.absensiDanJamKerja.produktivitasPerJam),
				},
			],
		},
		{
			title: "Refund",
			rows: [
				{
					label: "Jumlah Refund",
					value: formatRp(data.refund.jumlahRefund),
				},
				{
					label: "Total Refund",
					value: formatRp(data.refund.totalRefund),
				},
				{
					label: "Kasir Refund Tertinggi",
					value: formatRp(data.refund.kasirRefundTertinggi),
				},
			],
		},
	];
}
