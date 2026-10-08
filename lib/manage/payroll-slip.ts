import { PAYROLL_DEMO_STORE } from "@/constants/data/manage/payroll";
import { accountingDateLabel } from "@/lib/accounting/date";
import {
	payrollLines,
	payrollMethodLabel,
	payrollPeriodLabel,
	payrollTotals,
} from "@/lib/manage/payroll";
import { formatRp } from "@/lib/utils";
import type { PayrollRecord } from "@/types/ui/manage/payroll";

export function payrollSlipText(record: PayrollRecord): string {
	const totals = payrollTotals(record);
	const status =
		totals.status === "paid"
			? "Lunas"
			: totals.status === "partial"
				? "Sebagian"
				: "Belum Dibayar";
	return [
		"SLIP GAJI — PRATINJAU",
		PAYROLL_DEMO_STORE.name,
		PAYROLL_DEMO_STORE.address,
		`Telp. ${PAYROLL_DEMO_STORE.phone}`,
		"",
		`Karyawan: ${record.employeeName}`,
		`Periode: ${payrollPeriodLabel(record.period)}`,
		`Metode: ${payrollMethodLabel(record.settings.method)}`,
		"",
		"RINCIAN PENGHASILAN",
		...payrollLines(record).map(
			(line) =>
				`${line.label}: ${line.quantity} × ${formatRp(line.rate)} = ${formatRp(line.total)}`,
		),
		`Total Penghasilan: ${formatRp(totals.gross)}`,
		`Bonus: ${formatRp(record.adjustments.bonus)}`,
		`Potongan: ${formatRp(record.adjustments.deduction)}`,
		`Kasbon: ${formatRp(record.adjustments.advance)}`,
		`Total Gaji Bersih: ${formatRp(totals.net)}`,
		`Status: ${status}`,
		`Total Dibayar: ${formatRp(totals.paid)}`,
		`Sisa Pembayaran: ${formatRp(totals.remaining)}`,
		"",
		"RIWAYAT PEMBAYARAN",
		...(record.payments.length
			? record.payments.map(
					(payment) =>
						`${accountingDateLabel(payment.date)} — ${formatRp(payment.amount)}\n${payment.method === "transfer" ? "Transfer Bank" : "Tunai"}: ${payment.source}${payment.destination ? ` → ${payment.destination}` : ""}\nReferensi: ${payment.reference}${payment.note ? `\nCatatan: ${payment.note}` : ""}`,
				)
			: ["Belum ada pembayaran."]),
		"",
		"Data contoh lokal. Dokumen ini bukan bukti transfer atau pembayaran nyata.",
	].join("\n");
}
export function payrollSlipHTML(record: PayrollRecord): string {
	const escaped = payrollSlipText(record).replace(
		/[&<>"']/g,
		(character) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				character
			] ?? character,
	);
	return `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slip Gaji Pratinjau</title><style>body{margin:24px;font:14px/1.6 system-ui,sans-serif;color:#202020}main{max-width:640px;margin:auto}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{margin:0}}</style><main><pre>${escaped}</pre></main></html>`;
}
