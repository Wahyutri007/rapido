export type RoleData = {
	id: string;
	name: string;
	display_name: string | null;
	permissions: string[];
	created_at: string;
	updated_at: string;
};

export type RolePermissionOption = { value: string; name: string };
export type RolePermissionGroups = Record<string, RolePermissionOption[]>;
