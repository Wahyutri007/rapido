import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useRolePermissionsQuery, useRoleQuery } from "@/api/hooks/roles";
import { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import { delayedBack } from "@/components/custom/JSStack";
import { EFeather } from "@/components/icons";
import {
	roleAccessLabels,
	roleName,
	rolePermissionName,
} from "@/lib/manage/roles";
import { route } from "@/lib/utils";
import RoleDeleteDialog from "./RoleDeleteDialog";
import RoleQueryError from "./RoleQueryError";
import RoleWorkers from "./RoleWorkers";

export default function RoleDetailScreen({ id }: { id?: string }) {
	const query = useRoleQuery(id);
	const permissions = useRolePermissionsQuery();
	const [search, setSearch] = useState("");
	const deleteDialog = useAlertModal();
	const role = query.data;
	const needle = search.trim().toLocaleLowerCase("id");
	const filtered =
		role?.permissions.filter((key) =>
			rolePermissionName(key, permissions.data)
				.toLocaleLowerCase("id")
				.includes(needle),
		) ?? [];
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{!id ? (
					<RoleQueryError
						message="Role belum dipilih."
						onRetry={() => router.back()}
					/>
				) : query.isLoading ? (
					<LoadingPlaceholder />
				) : query.isError || !role ? (
					<RoleQueryError
						message="Detail role belum dapat dimuat."
						onRetry={() => {
							void query.refetch();
						}}
					/>
				) : (
					<>
						<SearchBar
							search={search}
							setSearch={setSearch}
							variant="light"
							placeholder="Cari hak akses..."
						/>
						<Card density="compact" className="flex-row items-center gap-3">
							<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
								<EFeather name="user" size={24} className="text-primary" />
							</View>
							<View className="flex-1 gap-1">
								<Text size="body" w="medium">
									{roleName(role)}
								</Text>
								<Text size="small" className="text-muted">
									{roleAccessLabels(role.permissions).join(" · ") ||
										"Belum ada hak akses"}
								</Text>
							</View>
						</Card>
						<View className="flex-row items-center justify-between">
							<Text size="normal" w="medium">
								Hak Akses
							</Text>
							<View className="rounded-lg bg-primary/10 px-2 py-1">
								<Text size="small" className="text-primary">
									{role.permissions.length} Akses
								</Text>
							</View>
						</View>
						<View className="gap-2">
							{filtered.map((permission) => (
								<Card
									key={permission}
									density="compact"
									className="flex-row items-center gap-3"
								>
									<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
										<EFeather
											name="shield"
											size={24}
											className="text-primary"
										/>
									</View>
									<View className="flex-1 gap-1">
										<Text size="normal" w="medium">
											{rolePermissionName(permission, permissions.data)}
										</Text>
										<Text size="small" className="text-muted">
											Dapat mengakses fitur ini
										</Text>
									</View>
								</Card>
							))}
							{!filtered.length && (
								<Text size="normal" className="text-muted">
									{needle
										? "Hak akses tidak ditemukan"
										: "Role ini belum memiliki hak akses"}
								</Text>
							)}
						</View>
						<RoleWorkers roleId={role.id} />
					</>
				)}
			</Wrapper>
			{role && id && !query.isError && (
				<DetailBottomActions
					onEdit={() => router.push(route("/manage/roles/modify", { id }))}
					onDelete={deleteDialog.open}
				/>
			)}
			<RoleDeleteDialog
				role={role ?? null}
				openState={deleteDialog.openState}
				onDeleted={delayedBack}
			/>
		</>
	);
}
