import type { PayrollRecord, PayrollSettings } from "@/types/ui/manage/payroll";

export const PAYROLL_METHODS = [
	{ value: "monthly", label: "Bulanan" },
	{ value: "daily", label: "Harian" },
	{ value: "hourly", label: "Per Jam" },
	{ value: "service", label: "Per Layanan" },
] as const;
export const PAYROLL_STATUSES = [
	{ value: "", label: "Semua status" },
	{ value: "unpaid", label: "Belum Dibayar" },
	{ value: "partial", label: "Sebagian" },
	{ value: "paid", label: "Lunas" },
] as const;
export const PAYROLL_SERVICES = [
	{ id: "light", name: "Servis Ringan", rate: 25_000 },
	{ id: "oil", name: "Ganti Oli", rate: 15_000 },
	{ id: "wash", name: "Cuci Motor", rate: 10_000 },
	{ id: "tune", name: "Tune Up", rate: 40_000 },
] as const;
export const PAYROLL_PAYMENT_METHODS = [
	{ value: "cash", label: "Tunai" },
	{ value: "transfer", label: "Transfer Bank" },
];
export const PAYROLL_DEMO_STORE = {
	name: "Bengkel Maju Jaya",
	address: "Jl. Mekanik No.123, Jakarta Selatan",
	phone: "(021) 12354-5678",
};

// Isolated design fixtures from Figma. These are not workers or payroll API data.
const settings: PayrollSettings = {
	method: "monthly",
	startDate: "2026-01-01",
	baseSalary: 6_000_000,
	allowance: 500_000,
	meal: 500_000,
	transport: 500_000,
	rate: 300_000,
	commissions: PAYROLL_SERVICES.map(({ id, rate }) => ({
		serviceId: id,
		rate,
	})),
	note: "",
};
const activity = {
	days: 22,
	hours: 160,
	services: { light: 12, oil: 20, wash: 30, tune: 15 },
};
function record(
	id: string,
	employeeId: string,
	employeeName: string,
	role: string,
	method: PayrollSettings["method"],
	period = "2026-10",
	paid = 0,
): PayrollRecord {
	return {
		id,
		employeeId,
		employeeName,
		role,
		period,
		settings: {
			...settings,
			method,
			rate: method === "hourly" ? 55_000 : 300_000,
			commissions: settings.commissions.map((item) => ({ ...item })),
		},
		activity: { ...activity, services: { ...activity.services } },
		adjustments: { bonus: 0, deduction: 0, advance: 0 },
		payments: paid
			? [
					{
						id: `${id}-payment`,
						amount: paid,
						date: `${period}-08`,
						method: "transfer",
						source: "Bank BCA",
						destination: "BCA **** 1234",
						reference: `DEMO-${id}`,
						note: "Contoh pembayaran untuk pratinjau",
					},
				]
			: [],
	};
}
export const PAYROLL_DEMO_RECORDS: PayrollRecord[] = [
	record(
		"payroll-dewi-oct",
		"dewi",
		"Dewi Anggraini",
		"Teknisi Servis",
		"service",
		"2026-10",
		1_500_000,
	),
	record(
		"payroll-andi-oct",
		"andi",
		"Andi Pratama",
		"Mekanik Senior",
		"daily",
		"2026-10",
		2_000_000,
	),
	record("payroll-budi-oct", "budi", "Budi Santoso", "Admin Servis", "monthly"),
	record(
		"payroll-citra-oct",
		"citra",
		"Citra Lestari",
		"Admin Servis",
		"hourly",
		"2026-10",
		8_800_000,
	),
	record(
		"payroll-dewi-sep",
		"dewi",
		"Dewi Anggraini",
		"Teknisi Servis",
		"service",
		"2026-09",
		1_500_000,
	),
	record(
		"payroll-dewi-aug",
		"dewi",
		"Dewi Anggraini",
		"Teknisi Servis",
		"service",
		"2026-08",
		1_000_000,
	),
];
