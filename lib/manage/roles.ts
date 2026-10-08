import type {
	RoleData,
	RolePermissionGroups,
	RolePermissionOption,
} from "@/types/api/role";

// Canonical keys verified against backend PermissionEnum; Back Office is a UI mode.
export const ROLE_ACCESS = [
	{ value: "cashier", name: "Kasir" },
	{ value: "order", name: "Order" },
	{ value: "production", name: "Kitchen" },
	{ value: "absence", name: "Absensi" },
] satisfies RolePermissionOption[];

const REPORT_OPTIONS: RolePermissionOption[] = [
	{ value: "sales report", name: "Penjualan" },
	{ value: "product report", name: "Produk" },
	{ value: "promotion report", name: "Promo" },
	{ value: "member report", name: "Pelanggan" },
	{ value: "tax and extra reports", name: "Pajak dan biaya tambahan" },
];

export type RolePermissionSection = {
	id: string;
	name: string;
	allPermission?: string;
	options: RolePermissionOption[];
};

export function rolePermissionSections(
	groups: RolePermissionGroups = {},
): RolePermissionSection[] {
	return [
		{
			id: "reports",
			name: "Laporan",
			allPermission: "manage reports",
			options: [
				{ value: "manage reports", name: "Semua laporan" },
				...REPORT_OPTIONS,
			],
		},
		{
			id: "catalogs",
			name: "Katalog",
			allPermission: "manage catalogs",
			options: [
				{ value: "manage catalogs", name: "Semua katalog" },
				{ value: "manage menus", name: "Produk dan menu" },
				...(groups.catalogs ?? []),
			],
		},
		{
			id: "inventory",
			name: "Inventory",
			allPermission: "manage inventory",
			options: [
				{ value: "manage inventory", name: "Semua inventory" },
				...(groups.inventory ?? []),
			],
		},
		{ id: "others", name: "Kelola", options: groups.others ?? [] },
	];
}

export function roleName(role: RoleData) {
	return role.display_name || role.name;
}

export function isBackOfficePermission(value: string) {
	return !ROLE_ACCESS.some((access) => access.value === value);
}

export function roleAccessLabels(permissions: string[]) {
	const labels = ROLE_ACCESS.filter((access) =>
		permissions.includes(access.value),
	).map((access) => access.name);
	if (permissions.some(isBackOfficePermission)) labels.push("Back Office");
	return labels;
}

export function toggleRolePermissions(
	current: string[],
	values: string[],
	selected: boolean,
) {
	return selected
		? [...new Set([...current, ...values])]
		: current.filter((value) => !values.includes(value));
}

export function backOfficePermissionOptions(sections: RolePermissionSection[]) {
	return [
		{ value: "all feature", name: "Semua Fitur" },
		{ value: "dashboard", name: "Dashboard" },
		...sections.flatMap((section) => section.options),
	];
}

export function expandRolePermissions(
	current: string[],
	sections: RolePermissionSection[],
) {
	const additional = current.includes("all feature")
		? backOfficePermissionOptions(sections).map((option) => option.value)
		: sections
				.filter(
					(section) =>
						section.allPermission && current.includes(section.allPermission),
				)
				.flatMap((section) => section.options.map((option) => option.value));
	return [...new Set([...current, ...additional])];
}

export function changeRolePermission(
	current: string[],
	key: string,
	selected: boolean,
	sections: RolePermissionSection[],
) {
	const section = sections.find((group) =>
		group.options.some((option) => option.value === key),
	);
	const keys =
		section?.allPermission === key
			? section.options.map((option) => option.value)
			: [key];
	const next = toggleRolePermissions(
		expandRolePermissions(current, sections),
		keys,
		selected,
	);
	if (selected || !isBackOfficePermission(key)) return next;
	// Removing an individual permission also removes broader grants that include it.
	return next.filter(
		(value) => value !== "all feature" && value !== section?.allPermission,
	);
}

export function rolePermissionName(
	value: string,
	groups?: RolePermissionGroups,
) {
	return (
		[
			...ROLE_ACCESS,
			...backOfficePermissionOptions(rolePermissionSections(groups)),
		].find((option) => option.value === value)?.name ?? value
	);
}
