import Feather from "@expo/vector-icons/Feather";
import { useFormContext } from "react-hook-form";
import { View } from "react-native";
import Card from "@/components/common/Card";
import {
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
	FormSelect,
} from "@/components/common/Form";
import Text from "@/components/common/Text";
import DetailRow from "@/components/custom/DetailRow";
import { Colors } from "@/constants/Colors";
import { PAYROLL_STATUSES } from "@/constants/data/manage/payroll";
import {
	payrollMethodLabel,
	payrollPeriodLabel,
	payrollTotals,
} from "@/lib/manage/payroll";
import { formatRp } from "@/lib/utils";
import type { PayrollRecord, PayrollStatus } from "@/types/ui/manage/payroll";

export function PayrollPreviewNotice() {
	return (
		<Card density="compact" className="gap-1">
			<Text size="normal" w="medium">
				Pratinjau Penggajian
			</Text>
			<Text size="small" className="text-muted">
				Data contoh. Catatan hanya tersedia selama aplikasi terbuka dan tidak
				mengirim uang.
			</Text>
		</Card>
	);
}
export function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
	const color =
		status === "paid"
			? "!text-success"
			: status === "partial"
				? "!text-warning"
				: "text-muted";
	const background =
		status === "paid"
			? "bg-success-50"
			: status === "partial"
				? "bg-warning-50"
				: "bg-background";
	return (
		<View className={`self-start rounded-lg px-2 py-1 ${background}`}>
			<Text size="small" w="medium" className={color}>
				{PAYROLL_STATUSES.find((item) => item.value === status)?.label}
			</Text>
		</View>
	);
}
export function PayrollHero({ record }: { record: PayrollRecord }) {
	return (
		<Card density="compact" className="flex-row items-center gap-3">
			<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
				<Feather name="user" size={24} color={Colors.primary} />
			</View>
			<View className="flex-1 gap-1">
				<Text size="body" w="semibold">
					{record.employeeName}
				</Text>
				<Text size="small" className="text-muted">
					{record.role} · {payrollMethodLabel(record.settings.method)}
				</Text>
				<Text size="small" className="text-muted">
					{payrollPeriodLabel(record.period)}
				</Text>
			</View>
			<PayrollStatusBadge status={payrollTotals(record).status} />
		</Card>
	);
}
export function PayrollBalance({ record }: { record: PayrollRecord }) {
	const totals = payrollTotals(record);
	return (
		<Card density="compact">
			<DetailRow label="Total Gaji Bersih" value={formatRp(totals.net)} />
			<DetailRow label="Total Dibayar" value={formatRp(totals.paid)} />
			<DetailRow
				label="Sisa Pembayaran"
				value={formatRp(totals.remaining)}
				isLast
			/>
		</Card>
	);
}
export function PayrollField({
	name,
	label,
	number = false,
	readOnly = false,
	multiline = false,
	maxLength = 80,
}: {
	name: string;
	label: string;
	number?: boolean;
	readOnly?: boolean;
	multiline?: boolean;
	maxLength?: number;
}) {
	const form = useFormContext();
	return (
		<FormField
			control={form.control}
			name={name}
			render={() => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<FormInput
							type={number ? "number" : "text"}
							multiline={multiline}
							placeholder={label}
							fieldProps={{
								"aria-label": label,
								...(number && {
									onChangeText: (value: string) =>
										form.setValue(name, value.trim() ? Number(value) : 0, {
											shouldValidate: true,
											shouldDirty: true,
											shouldTouch: true,
										}),
								}),
								editable: !readOnly,
								maxLength,
								style: { minWidth: 0 },
							}}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
export function PayrollSelectField({
	name,
	label,
	items,
	disabled = false,
}: {
	name: string;
	label: string;
	items: { value: string; label: string }[];
	disabled?: boolean;
}) {
	const form = useFormContext();
	return (
		<FormField
			control={form.control}
			name={name}
			render={() => (
				<FormItem>
					<FormLabel required>{label}</FormLabel>
					<FormControl>
						<FormSelect
							data={items}
							label={label}
							placeholder={label}
							disabled={disabled}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
