export type LoginData = {
	token: string;
};

export type LoginFailError = {
	attempts: number;
	max_attempts: number;
};

export type LoginFailLimited = {
	seconds: number;
};

export type UserData = {
	user: User;
	roles: string[];
	permissions: string[];
};

export type User = {
	id: string;
	avatar?: string | null;
	name: string;
	email: string;
	phone: string;
	team_id: string | null;
	password: string;
	remember_token: null;
	created_at: string;
	updated_at: string;
};
