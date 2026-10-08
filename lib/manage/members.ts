import type { CustomerSchema } from "@/schema/add/customer";
import type { CustomerData, CustomerPayload } from "@/types/api/customer";

export const MEMBER_DEFAULTS: CustomerSchema = {
	name: "",
	phone: "",
	email: "",
	id_number: "",
	address: "",
	date_of_birth: "",
	gender: "",
	notes: "",
};
export const MEMBER_GENDERS = [
	{ value: "", label: "Tidak diisi" },
	{ value: "male", label: "Laki-laki" },
	{ value: "female", label: "Perempuan" },
];
export function memberFormValues(member: CustomerData): CustomerSchema {
	return {
		name: member.name,
		phone: member.phone,
		email: member.email ?? "",
		id_number: member.id_number ?? "",
		address: member.address ?? "",
		date_of_birth: member.date_of_birth?.slice(0, 10) ?? "",
		gender: member.gender ?? "",
		notes: member.notes ?? "",
	};
}
export function memberPayload(values: CustomerSchema): CustomerPayload {
	return {
		name: values.name,
		phone: values.phone,
		email: values.email || null,
		id_number: values.id_number || null,
		address: values.address || null,
		date_of_birth: values.date_of_birth || null,
		gender: values.gender || null,
		notes: values.notes || null,
	};
}
export function memberGender(value: CustomerData["gender"]) {
	return MEMBER_GENDERS.find((item) => item.value === value)?.label ?? "—";
}
export function memberDate(value: string | null | undefined) {
	if (!value) return "—";
	const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
	return Number.isNaN(date.getTime())
		? "—"
		: date.toLocaleDateString("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});
}
