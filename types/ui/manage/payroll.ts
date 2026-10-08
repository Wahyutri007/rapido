export type PayrollMethod = "monthly" | "daily" | "hourly" | "service";
export type PayrollStatus = "unpaid" | "partial" | "paid";
export type PayrollSettings = {
	method: PayrollMethod;
	startDate: string;
	baseSalary: number;
	allowance: number;
	meal: number;
	transport: number;
	rate: number;
	commissions: { serviceId: string; rate: number }[];
	note: string;
};
export type PayrollAdjustments = {
	bonus: number;
	deduction: number;
	advance: number;
};
export type PayrollPayment = {
	id: string;
	amount: number;
	date: string;
	method: "cash" | "transfer";
	source: string;
	destination: string;
	reference: string;
	note: string;
};
export type PayrollRecord = {
	id: string;
	employeeId: string;
	employeeName: string;
	role: string;
	period: string;
	settings: PayrollSettings;
	activity: { days: number; hours: number; services: Record<string, number> };
	adjustments: PayrollAdjustments;
	payments: PayrollPayment[];
};
export type PayrollLine = {
	label: string;
	quantity: number;
	rate: number;
	total: number;
};
