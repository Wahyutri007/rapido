export type CustomerData = {
	id: string;
	user_id: string;
	name: string;
	phone: string;
	email: string | null;
	id_number: string | null;
	address: string | null;
	date_of_birth: string | null;
	gender: "male" | "female" | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
};

export type CustomerPayload = Omit<
	CustomerData,
	"id" | "user_id" | "created_at" | "updated_at"
>;
