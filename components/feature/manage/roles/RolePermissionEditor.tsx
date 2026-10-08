import { useState } from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { EFeather } from "@/components/icons";
import {
	Checkbox,
	CheckboxIconDefault,
	CheckboxIndicator,
} from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
	backOfficePermissionOptions,
	changeRolePermission,
	expandRolePermissions,
	isBackOfficePermission,
	ROLE_ACCESS,
	rolePermissionSections,
	toggleRolePermissions,
} from "@/lib/manage/roles";
import type { RolePermissionGroups } from "@/types/api/role";

type Props = {
	value: string[];
	onChange: (value: string[]) => void;
	groups: RolePermissionGroups;
	disabled?: boolean;
};

function AccessToggle({
	label,
	checked,
	onChange,
	disabled,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}) {
	return (
		<View className="min-h-12 flex-row items-center justify-between gap-3 rounded-lg border border-border-muted px-3 py-2">
			<Text size="body" className="flex-1">
				{label}
			</Text>
			<Switch
				accessibilityLabel={label}
				value={checked}
				onToggle={onChange}
				isDisabled={disabled}
			/>
		</View>
	);
}

export default function RolePermissionEditor({
	value,
	onChange,
	groups,
	disabled,
}: Props) {
	const [expanded, setExpanded] = useState<string[]>([]);
	const sections = rolePermissionSections(groups);
	const selectedValue = expandRolePermissions(value, sections);
	const options = backOfficePermissionOptions(sections);
	const backOfficeKeys = options.map((option) => option.value);
	const backOfficeEnabled = value.some(isBackOfficePermission);
	const extraKeys = value.filter(
		(permission) =>
			isBackOfficePermission(permission) &&
			!backOfficeKeys.includes(permission),
	);
	const change = (keys: string[], selected: boolean) =>
		onChange(toggleRolePermissions(selectedValue, keys, selected));
	const changePermission = (key: string, selected: boolean) =>
		onChange(changeRolePermission(value, key, selected, sections));

	return (
		<View className="gap-4">
			<View className="gap-2">
				{ROLE_ACCESS.map((access) => (
					<AccessToggle
						key={access.value}
						label={access.name}
						checked={value.includes(access.value)}
						onChange={(checked) => change([access.value], checked)}
						disabled={disabled}
					/>
				))}
				<AccessToggle
					label="Back Office"
					checked={backOfficeEnabled}
					onChange={(checked) =>
						change(
							checked
								? ["dashboard"]
								: selectedValue.filter(isBackOfficePermission),
							checked,
						)
					}
					disabled={disabled}
				/>
			</View>
			{backOfficeEnabled && (
				<View className="gap-2">
					<Text size="body" w="medium">
						Hak Akses
					</Text>
					<AccessToggle
						label="Semua Fitur"
						checked={backOfficeKeys.every((key) => selectedValue.includes(key))}
						onChange={(checked) =>
							change(
								checked
									? backOfficeKeys
									: backOfficeKeys.filter((key) => key !== "dashboard"),
								checked,
							)
						}
						disabled={disabled}
					/>
					<AccessToggle
						label="Dashboard"
						checked={selectedValue.includes("dashboard")}
						onChange={(checked) => changePermission("dashboard", checked)}
						disabled={disabled}
					/>
					{sections.map((section) => {
						const isExpanded = expanded.includes(section.id);
						const selectedCount = section.options.filter((option) =>
							selectedValue.includes(option.value),
						).length;
						return (
							<View
								key={section.id}
								className="overflow-hidden rounded-lg border border-border-muted"
							>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel={`Hak akses ${section.name}`}
									accessibilityState={{ expanded: isExpanded }}
									onPress={() =>
										setExpanded((current) =>
											current.includes(section.id)
												? current.filter((id) => id !== section.id)
												: [...current, section.id],
										)
									}
									className="min-h-12 flex-row items-center gap-3 p-3"
								>
									<Text size="body" className="flex-1">
										{section.name}
									</Text>
									<Text size="small" className="text-muted">
										{selectedCount}/{section.options.length}
									</Text>
									<EFeather
										name={isExpanded ? "chevron-up" : "chevron-down"}
										size={20}
										className="text-muted"
									/>
								</Pressable>
								{isExpanded && (
									<View className="gap-3 border-t border-border-muted p-3">
										{section.options.map((option) => (
											<Checkbox
												key={option.value}
												value={option.value}
												isChecked={selectedValue.includes(option.value)}
												onChange={(selected: boolean) =>
													changePermission(option.value, selected)
												}
												isDisabled={disabled}
												accessibilityLabel={option.name}
												aria-label={option.name}
											>
												<CheckboxIndicator>
													<CheckboxIconDefault />
												</CheckboxIndicator>
												<Text size="normal" className="flex-1">
													{option.name}
												</Text>
											</Checkbox>
										))}
									</View>
								)}
							</View>
						);
					})}
					{!!extraKeys.length && (
						<View className="gap-3 rounded-lg border border-border-muted p-3">
							<Text size="normal" w="medium">
								Hak akses tambahan
							</Text>
							{extraKeys.map((permission) => (
								<Checkbox
									key={permission}
									value={permission}
									isChecked
									onChange={(selected: boolean) =>
										changePermission(permission, selected)
									}
									isDisabled={disabled}
									accessibilityLabel={permission}
									aria-label={permission}
								>
									<CheckboxIndicator>
										<CheckboxIconDefault />
									</CheckboxIndicator>
									<Text size="normal" className="flex-1">
										{permission}
									</Text>
								</Checkbox>
							))}
						</View>
					)}
				</View>
			)}
		</View>
	);
}
