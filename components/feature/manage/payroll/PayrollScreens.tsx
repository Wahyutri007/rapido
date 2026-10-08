import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, Share, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import DetailRow from "@/components/custom/DetailRow";
import { Button, ButtonText } from "@/components/ui/button";
import { PAYROLL_DEMO_STORE } from "@/constants/data/manage/payroll";
import { accountingDateLabel } from "@/lib/accounting/date";
import {
	payrollLines,
	payrollPeriodLabel,
	payrollTotals,
} from "@/lib/manage/payroll";
import { payrollSlipHTML, payrollSlipText } from "@/lib/manage/payroll-slip";
import { formatRp, route } from "@/lib/utils";
import { usePayrollStore } from "@/store/payrollStore";
import type { PayrollRecord } from "@/types/ui/manage/payroll";
import {
	PayrollBalance,
	PayrollHero,
	PayrollStatusBadge,
} from "./PayrollCommon";
import PayrollPaymentForm from "./PayrollPaymentForm";
import PayrollSettingsForm from "./PayrollSettingsForm";

function useRecord() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	return usePayrollStore((state) =>
		state.records.find((record) => record.id === id),
	);
}
function Unavailable({
	text = "Penggajian tidak ditemukan.",
}: {
	text?: string;
}) {
	return (
		<Wrapper contentContainerStyle={{ padding: 16 }}>
			<SearchNotFound text={text} />
		</Wrapper>
	);
}
function IncomeLines({ record }: { record: PayrollRecord }) {
	return (
		<Card density="compact">
			<Text size="normal" w="medium">
				Rincian Penghasilan
			</Text>
			{payrollLines(record).map((line) => (
				<View
					key={line.label}
					className="gap-1 border-b border-border-muted py-3"
				>
					<Text size="normal" w="medium">
						{line.label}
					</Text>
					<View className="flex-row flex-wrap justify-between gap-2">
						<Text size="small" className="text-muted">
							{line.quantity} × {formatRp(line.rate)}
						</Text>
						<Text size="normal" w="semibold">
							{formatRp(line.total)}
						</Text>
					</View>
				</View>
			))}
			<DetailRow
				label="Total Penghasilan"
				value={formatRp(payrollTotals(record).gross)}
			/>
			<DetailRow label="Bonus" value={formatRp(record.adjustments.bonus)} />
			<DetailRow
				label="Potongan"
				value={formatRp(record.adjustments.deduction)}
			/>
			<DetailRow
				label="Kasbon"
				value={formatRp(record.adjustments.advance)}
				isLast
			/>
		</Card>
	);
}
function PaymentHistory({ record }: { record: PayrollRecord }) {
	return (
		<Card density="compact" className="gap-3">
			<Text size="normal" w="medium">
				Riwayat Pembayaran
			</Text>
			{record.payments.length ? (
				[...record.payments]
					.sort((a, b) => b.date.localeCompare(a.date))
					.map((payment) => (
						<View
							key={payment.id}
							className="gap-2 border-b border-border-muted pb-3"
						>
							<View className="flex-row flex-wrap justify-between gap-2">
								<Text size="normal" w="medium">
									{accountingDateLabel(payment.date)}
								</Text>
								<Text size="normal" w="semibold" className="!text-success">
									{formatRp(payment.amount)}
								</Text>
							</View>
							<Text size="small" className="text-muted">
								{payment.method === "transfer" ? "Transfer Bank" : "Tunai"} ·{" "}
								{payment.source}
							</Text>
							{!!payment.destination && (
								<Text size="small" className="text-muted">
									Tujuan: {payment.destination}
								</Text>
							)}
							<Text size="small" className="text-muted">
								Referensi: {payment.reference}
							</Text>
							{!!payment.note && (
								<Text size="small" className="text-muted">
									{payment.note}
								</Text>
							)}
						</View>
					))
			) : (
				<Text size="normal" className="text-muted">
					Belum ada pembayaran.
				</Text>
			)}
		</Card>
	);
}
export function PayrollDetailScreen() {
	const record = useRecord();
	if (!record) return <Unavailable />;
	const totals = payrollTotals(record);
	return (
		<>
			<Wrapper
				hasActionButton={totals.remaining > 0}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<PayrollHero record={record} />
				<PayrollBalance record={record} />
				<IncomeLines record={record} />
				<Card density="compact">
					<DetailRow
						label="Dimulai Dari"
						value={accountingDateLabel(record.settings.startDate)}
					/>
					{record.settings.method === "service" && (
						<DetailRow
							label="Total Layanan Selesai"
							value={payrollLines(record).reduce(
								(sum, line) => sum + line.quantity,
								0,
							)}
						/>
					)}
					<DetailRow
						label="Catatan Gaji"
						value={record.settings.note || "-"}
						isLast
					/>
				</Card>
				<Text size="small" className="text-muted">
					Aktivitas contoh untuk pratinjau. Perhitungan belum mengambil absensi,
					pekerjaan nyata, pajak, atau prorata.
				</Text>
				<Card density="compact" className="gap-3">
					<Button
						variant="outline"
						size="xl"
						isDisabled={!!record.payments.length}
						onPress={() =>
							router.push(route("/manage/payroll/modify", { id: record.id }))
						}
					>
						<ButtonText>Atur Gaji</ButtonText>
					</Button>
					{!!record.payments.length && (
						<Text size="small" className="text-muted">
							Pengaturan dikunci karena periode ini sudah memiliki pembayaran.
						</Text>
					)}
					<Button
						variant="outline"
						size="xl"
						onPress={() =>
							router.push(route("/manage/payroll/history", { id: record.id }))
						}
					>
						<ButtonText>Riwayat Penghasilan</ButtonText>
					</Button>
					<Button
						variant="outline"
						size="xl"
						onPress={() =>
							router.push(route("/manage/payroll/slip", { id: record.id }))
						}
					>
						<ButtonText>Lihat Slip Gaji</ButtonText>
					</Button>
				</Card>
				<PaymentHistory record={record} />
			</Wrapper>
			{totals.remaining > 0 && (
				<BottomActionButton
					onPress={() =>
						router.push(route("/manage/payroll/payment", { id: record.id }))
					}
				>
					Catat Pembayaran
				</BottomActionButton>
			)}
		</>
	);
}
export function PayrollModifyScreen() {
	const record = useRecord();
	if (!record) return <Unavailable />;
	if (record.payments.length)
		return (
			<Unavailable text="Pengaturan periode yang sudah dibayar tidak dapat diubah." />
		);
	return <PayrollSettingsForm key={record.id} record={record} />;
}
function PaymentEntry({ record }: { record: PayrollRecord }) {
	const [settledAtOpen] = React.useState(
		() => payrollTotals(record).remaining <= 0,
	);
	return settledAtOpen ? (
		<Unavailable text="Gaji periode ini sudah lunas." />
	) : (
		<PayrollPaymentForm record={record} />
	);
}
export function PayrollPaymentScreen() {
	const record = useRecord();
	return record ? (
		<PaymentEntry key={record.id} record={record} />
	) : (
		<Unavailable />
	);
}
export function PayrollHistoryScreen() {
	const record = useRecord();
	const records = usePayrollStore((state) => state.records);
	if (!record) return <Unavailable />;
	const history = records
		.filter((item) => item.employeeId === record.employeeId)
		.sort((a, b) => b.period.localeCompare(a.period));
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<PayrollHero record={record} />
			<Text size="normal" w="medium">
				Riwayat Penghasilan
			</Text>
			{history.map((item) => (
				<CatalogItemCard
					key={item.id}
					density="compact"
					title={payrollPeriodLabel(item.period)}
					onPress={() =>
						router.push(route("/manage/payroll/detail", { id: item.id }))
					}
				>
					<View className="gap-2 pt-2">
						<PayrollStatusBadge status={payrollTotals(item).status} />
						<DetailRow
							label="Total Bersih"
							value={formatRp(payrollTotals(item).net)}
						/>
						<DetailRow
							label="Dibayar"
							value={formatRp(payrollTotals(item).paid)}
						/>
						<DetailRow
							label="Sisa"
							value={formatRp(payrollTotals(item).remaining)}
							isLast
						/>
					</View>
				</CatalogItemCard>
			))}
		</Wrapper>
	);
}
export function PayrollSlipScreen() {
	const record = useRecord();
	const [exportError, setExportError] = React.useState("");
	if (!record) return <Unavailable />;
	const exportSlip = async () => {
		setExportError("");
		try {
			if (Platform.OS === "web") {
				const url = URL.createObjectURL(
					new Blob([payrollSlipHTML(record)], {
						type: "text/html;charset=utf-8",
					}),
				);
				const link = document.createElement("a");
				link.href = url;
				link.download = `slip-gaji-${record.employeeId}-${record.period}.html`;
				link.click();
				setTimeout(() => URL.revokeObjectURL(url), 1000);
			} else
				await Share.share({
					message: payrollSlipText(record),
					title: "Slip Gaji Pratinjau",
				});
		} catch {
			setExportError("Slip belum dapat diekspor. Silakan coba lagi.");
		}
	};
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card density="compact" className="gap-2">
					<Text size="body" w="bold" className="text-center">
						{PAYROLL_DEMO_STORE.name}
					</Text>
					<Text size="small" className="text-center text-muted">
						{PAYROLL_DEMO_STORE.address}
					</Text>
					<Text size="small" className="text-center text-muted">
						Telp. {PAYROLL_DEMO_STORE.phone}
					</Text>
					<Text size="body" w="semibold" className="text-center">
						Slip Gaji · Pratinjau
					</Text>
				</Card>
				<PayrollHero record={record} />
				<IncomeLines record={record} />
				<PayrollBalance record={record} />
				<PaymentHistory record={record} />
				<Text size="small" className="text-muted">
					Data contoh lokal, bukan bukti transfer atau pembayaran nyata.{" "}
					{Platform.OS === "web"
						? "Unduhan HTML dapat dibuka dan dicetak melalui browser."
						: "Bagikan ringkasan slip sebagai teks."}
				</Text>
				{!!exportError && (
					<Text size="small" className="!text-destructive">
						{exportError}
					</Text>
				)}
			</Wrapper>
			<BottomActionButton onPress={exportSlip}>
				{Platform.OS === "web" ? "Unduh Slip Gaji" : "Bagikan Slip Gaji"}
			</BottomActionButton>
		</>
	);
}
