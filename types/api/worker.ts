export type WorkerRole = {
	id: string;
	name: string;
	display_name: string | null;
};

export type WorkerData = {
	id: string;
	name: string;
	email: string;
	phone: string;
	team_id: string;
	role_id: string | null;
	roles: WorkerRole[];
	assigned_store: { id: string; name: string; address: string } | null;
	worker_profile: {
		id: string;
		address: string | null;
		date_of_birth: string | null;
		face_scan: string | null;
		id_scan: string | null;
	} | null;
	created_at: string;
	updated_at: string;
};
