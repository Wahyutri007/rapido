import type { RoleSchema } from "@/schema/add/role";
import type { RoleData, RolePermissionGroups } from "@/types/api/role";
import { createGetHook, createMutationHook } from "../factory";

export const useRolesQuery = createGetHook<RoleData[]>({
	path: "/contents/roles",
	queryKey: ["roles"],
	name: "roles",
});
export const useRoleQuery = createGetHook<RoleData, string>({
	path: (id) => `/contents/roles/${encodeURIComponent(id)}`,
	queryKey: (id) => ["roles", id],
	name: "role",
});
export const useRolePermissionsQuery = createGetHook<RolePermissionGroups>({
	path: "/reference-data/permissions",
	queryKey: ["role-permissions"],
	name: "role permissions",
});
export const useRoleRequest = createMutationHook<RoleData, RoleSchema>({
	path: "/contents/roles",
	name: "role",
	invalidateKeys: ["roles"],
});
export const useRoleUpdateRequest = createMutationHook<
	RoleData,
	RoleSchema,
	string
>({
	path: (id) => `/contents/roles/${encodeURIComponent(id)}`,
	method: "put",
	name: "role",
	invalidateKeys: (_data, _payload, id) => [
		["roles"],
		["roles", id],
		["workers"],
	],
});
export const useRoleDeleteRequest = createMutationHook<null, void, string>({
	path: (id) => `/contents/roles/${encodeURIComponent(id)}`,
	method: "delete",
	name: "role",
	invalidateKeys: (_data, _payload, id) => [
		["roles"],
		["roles", id],
		["workers"],
	],
});
