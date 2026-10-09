import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { FormDateTimePicker, FormInput } from "@/components/common/Form";
import { expiryDateText, parseExpiryDate } from "@/lib/inventory/material-date";

export default function BillPaymentDateInput({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	if (Platform.OS === "android")
		return (
			<FormDateTimePicker
				placeholder="Pilih tanggal pembayaran"
				onPress={() => {
					const selected = parseExpiryDate(value);
					DateTimePickerAndroid.open({
						mode: "date",
						value:
							selected && Number.isFinite(selected.getTime())
								? selected
								: new Date(),
						onChange: (event, date) => {
							if (event.type === "set" && date) onChange(expiryDateText(date));
						},
					});
				}}
			/>
		);
	return (
		<FormInput
			placeholder="YYYY-MM-DD"
			fieldProps={{
				value,
				onChangeText: onChange,
				maxLength: 10,
				autoCorrect: false,
				autoCapitalize: "none",
			}}
		/>
	);
}
