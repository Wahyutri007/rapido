import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import React from "react";
import { Platform } from "react-native";
import { FormDateTimePicker, FormInput } from "@/components/common/Form";
import { expiryDateText, parseExpiryDate } from "@/lib/inventory/material-date";

export default function MaterialExpiryInput({
	value,
	onChange,
}: {
	value: Date | null;
	onChange: (date: Date | null) => void;
}) {
	const [draft, setDraft] = React.useState(() => expiryDateText(value));
	if (Platform.OS === "android")
		return (
			<FormDateTimePicker
				placeholder="Pilih tanggal expire"
				onPress={() =>
					DateTimePickerAndroid.open({
						mode: "date",
						value: value ?? new Date(),
						onChange: (event, date) => {
							if (event.type === "set" && date) onChange(date);
						},
					})
				}
			/>
		);
	return (
		<FormInput
			placeholder="YYYY-MM-DD"
			fieldProps={{
				value: draft,
				maxLength: 10,
				autoCapitalize: "none",
				autoCorrect: false,
				onChangeText: (text) => {
					setDraft(text);
					onChange(parseExpiryDate(text));
				},
			}}
		/>
	);
}
