import React from "react";
import { FormInput } from "@/components/common/Form";

export default function InventoryQuantityInput({
	value,
	onChange,
}: {
	value: number;
	onChange: (value: number) => void;
}) {
	const [draft, setDraft] = React.useState(value ? String(value) : "");
	// Keep a trailing decimal separator; derive resets from the form value.
	const inputValue =
		Number(draft.replace(",", ".")) === value
			? draft
			: value
				? String(value)
				: "";
	return (
		<FormInput
			type="number"
			placeholder="0"
			fieldProps={{
				value: inputValue,
				keyboardType: "decimal-pad",
				onChangeText: (text) => {
					if (/^\d*(?:[.,]\d*)?$/.test(text)) {
						setDraft(text);
						onChange(Number(text.replace(",", ".")));
					}
				},
			}}
		/>
	);
}
