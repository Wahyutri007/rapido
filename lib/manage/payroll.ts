import {
	PAYROLL_METHODS,
	PAYROLL_SERVICES,
} from "@/constants/data/manage/payroll";
import { accountingDateLabel } from "@/lib/accounting/date";
import {
	PAYROLL_MAX_AMOUNT,
	type PayrollPaymentValues,
	payrollPaymentSchema,
	payrollSettingsSchema,
} from "@/schema/manage/payroll";
import { usePayrollStore } from "@/store/payrollStore";
import type {
	PayrollAdjustments,
	PayrollLine,
	PayrollRecord,
	PayrollSettings,
	PayrollStatus,
} from "@/types/ui/manage/payroll";

export const payrollMethodLabel = (method: PayrollSettings["method"]) =>
	PAYROLL_METHODS.find((item) => item.value === method)?.label ?? "-";
export function payrollPeriodLabel(period: string): string {
	return accountingDateLabel(`${period}-01`).replace(/^1 /, "");
}
export function payrollLines(
	record: PayrollRecord,
	settings = record.settings,
): PayrollLine[] {
	const line = (label: string, quantity: number, rate: number) => ({
		label,
		quantity,
		rate,
		total: Math.round(quantity * rate),
	});
	if (settings.method === "monthly")
		return [
			line("Gaji Pokok", 1, settings.baseSalary),
			line("Tunjangan Tetap", 1, settings.allowance),
			line("Uang Makan Tetap", 1, settings.meal),
			line("Uang Transport Tetap", 1, settings.transport),
		];
	if (settings.method === "daily")
		return [line("Hari Kerja", record.activity.days, settings.rate)];
	if (settings.method === "hourly")
		return [line("Jam Kerja", record.activity.hours, settings.rate)];
	return settings.commissions.map((item) =>
		line(
			PAYROLL_SERVICES.find((service) => service.id === item.serviceId)?.name ??
				"Layanan",
			record.activity.services[item.serviceId] ?? 0,
			item.rate,
		),
	);
}
export function payrollTotals(
	record: PayrollRecord,
	adjustments: PayrollAdjustments = record.adjustments,
	settings = record.settings,
) {
	const gross = payrollLines(record, settings).reduce(
		(sum, line) => sum + line.total,
		0,
	);
	const net =
		gross + adjustments.bonus - adjustments.deduction - adjustments.advance;
	const paid = record.payments.reduce((sum, item) => sum + item.amount, 0);
	const remaining = net - paid;
	const status: PayrollStatus =
		paid === 0 ? "unpaid" : remaining === 0 ? "paid" : "partial";
	return { gross, net, paid, remaining, status };
}
export function filterPayroll(
	records: PayrollRecord[],
	period: string,
	search = "",
	status: PayrollStatus | "" = "",
) {
	const query = search.trim().toLocaleLowerCase("id-ID");
	return records.filter(
		(record) =>
			record.period === period &&
			(!status || payrollTotals(record).status === status) &&
			[
				record.employeeName,
				record.role,
				payrollMethodLabel(record.settings.method),
			].some((value) => value.toLocaleLowerCase("id-ID").includes(query)),
	);
}
export function savePayrollSettings(
	id: string,
	values: PayrollSettings,
): { id: string } | { error: string } {
	const state = usePayrollStore.getState();
	const record = state.records.find((item) => item.id === id);
	if (!record) return { error: "Penggajian tidak ditemukan." };
	if (record.payments.length)
		return {
			error: "Pengaturan periode yang sudah dibayar tidak dapat diubah.",
		};
	const parsed = payrollSettingsSchema.safeParse(values);
	if (!parsed.success) return { error: "Periksa kembali pengaturan gaji." };
	if (parsed.data.startDate.slice(0, 7) > record.period)
		return { error: "Tanggal mulai melewati periode gaji ini." };
	const totals = payrollTotals(record, record.adjustments, parsed.data);
	if (totals.net < 1 || totals.net > PAYROLL_MAX_AMOUNT)
		return { error: "Total gaji harus antara Rp1 dan Rp1 triliun." };
	state.replaceRecord({ ...record, settings: parsed.data });
	return { id };
}
export function recordPayrollPayment(
	id: string,
	values: PayrollPaymentValues,
	savedPaymentId?: string,
): { id: string } | { error: string } {
	const state = usePayrollStore.getState();
	const record = state.records.find((item) => item.id === id);
	if (!record) return { error: "Penggajian tidak ditemukan." };
	if (savedPaymentId)
		return record.payments.some((payment) => payment.id === savedPaymentId)
			? { id: savedPaymentId }
			: { error: "Catatan pembayaran tidak ditemukan." };
	const parsed = payrollPaymentSchema.safeParse(values);
	if (!parsed.success) return { error: "Periksa kembali data pembayaran." };
	const data = parsed.data;
	const adjustments = {
		bonus: data.bonus,
		deduction: data.deduction,
		advance: data.advance,
	};
	if (
		record.payments.length &&
		Object.keys(adjustments).some(
			(key) =>
				adjustments[key as keyof PayrollAdjustments] !==
				record.adjustments[key as keyof PayrollAdjustments],
		)
	)
		return {
			error: "Bonus, potongan, dan kasbon dikunci setelah pembayaran pertama.",
		};
	const totals = payrollTotals(record, adjustments);
	if (totals.net < 1 || totals.net > PAYROLL_MAX_AMOUNT)
		return { error: "Total bersih harus antara Rp1 dan Rp1 triliun." };
	if (totals.remaining <= 0) return { error: "Gaji periode ini sudah lunas." };
	if (
		data.amount > totals.remaining ||
		(data.kind === "full" && data.amount !== totals.remaining)
	)
		return {
			error:
				"Nominal harus sesuai sisa pembayaran; pembayaran penuh harus melunasi sisa.",
		};
	if (data.date.slice(0, 7) < record.period)
		return { error: "Tanggal pembayaran tidak boleh sebelum periode gaji." };
	if (
		state.records.some((item) =>
			item.payments.some(
				(payment) =>
					payment.reference.toLocaleLowerCase("id-ID") ===
					data.reference.toLocaleLowerCase("id-ID"),
			),
		)
	)
		return { error: "Nomor referensi pembayaran sudah digunakan." };
	const base = `salary-${Date.now()}`;
	let paymentId = base,
		suffix = 1;
	while (
		state.records.some((item) =>
			item.payments.some((payment) => payment.id === paymentId),
		)
	)
		paymentId = `${base}-${suffix++}`;
	state.replaceRecord({
		...record,
		adjustments,
		payments: [
			...record.payments,
			{
				id: paymentId,
				amount: data.amount,
				date: data.date,
				method: data.method,
				source: data.source,
				destination: data.method === "transfer" ? data.destination : "",
				reference: data.reference,
				note: data.note,
			},
		],
	});
	return { id: paymentId };
}
