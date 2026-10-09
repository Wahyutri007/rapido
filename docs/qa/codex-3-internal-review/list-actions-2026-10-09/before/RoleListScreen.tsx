import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useRolesQuery } from "@/api/hooks/roles";
import { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import {
	LoadingPlaceholder,
	SearchNotFound,
} from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { EFeather } from "@/components/icons";
import useRefreshControl from "@/hooks/useRefreshControl";
import { roleAccessLabels, roleName } from "@/lib/manage/roles";
import { route } from "@/lib/utils";
import type { RoleData } from "@/types/api/role";
import RoleDeleteDialog from "./RoleDeleteDialog";
import RoleQueryError from "./RoleQueryError";

export default function RoleListScreen() {
	const query = useRolesQuery();
	const refresh = useRefreshControl(query.refetch);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<RoleData | null>(null);
	const [actionsOpen, setActionsOpen] = useState(false);
	const deleteDialog = useAlertModal();
	const needle = search.trim().toLocaleLowerCase("id");
	const items = (query.data ?? []).filter((role) =>
		`${roleName(role)} ${roleAccessLabels(role.permissions).join(" ")}`
			.toLocaleLowerCase("id")
			.includes(needle),
	);
	const navigate = (path: "detail" | "modify") => {
		if (selected)
			router.push(route(`/manage/roles/${path}`, { id: selected.id }));
	};
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						variant="light"
						placeholder="Cari role atau hak akses..."
					/>
					<Text size="normal" w="medium">
						Daftar Hak Akses
					</Text>
					{query.isLoading ? (
						<LoadingPlaceholder />
					) : query.isError ? (
						<RoleQueryError
							message="Daftar role belum dapat dimuat."
							onRetry={() => {
								void query.refetch();
							}}
						/>
					) : (
						<FlatList
							data={items}
							keyExtractor={(item) => item.id}
							contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
							refreshControl={<RefreshControl {...refresh} />}
							renderItem={({ item }) => (
								<CatalogItemCard
									density="compact"
									title={
										<Text size="normal" w="medium">
											{roleName(item)}
										</Text>
									}
									subtitle={
										<Text size="small" className="text-muted">
											{roleAccessLabels(item.permissions).join(" · ") ||
												"Belum ada hak akses"}
										</Text>
									}
									leading={
										<View className="size-10 items-center justify-center rounded-lg bg-primary/10">
											<EFeather
												name="user"
												size={24}
												className="text-primary"
											/>
										</View>
									}
									onPress={() =>
										router.push(route("/manage/roles/detail", { id: item.id }))
									}
									right={
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Tindakan ${roleName(item)}`}
											hitSlop={8}
											onPress={(event) => {
												event.stopPropagation();
												setSelected(item);
												setActionsOpen(true);
											}}
										>
											<EFeather
												name="chevron-down"
												size={20}
												className="text-muted"
											/>
										</Pressable>
									}
								/>
							)}
							ListEmptyComponent={
								<SearchNotFound
									text={
										needle
											? "Role tidak ditemukan"
											: "Belum ada role. Tambahkan role untuk mengatur hak akses karyawan."
									}
								/>
							}
						/>
					)}
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/manage/roles/modify"))}
			>
				Tambah Role
			</BottomActionButton>
			<ItemActionSheet
				isOpen={actionsOpen}
				onClose={() => setActionsOpen(false)}
				title={selected ? roleName(selected) : "Role"}
				entityName="Role"
				onViewDetail={() => navigate("detail")}
				onEdit={() => navigate("modify")}
				onDelete={deleteDialog.open}
			/>
			<RoleDeleteDialog role={selected} openState={deleteDialog.openState} />
		</>
	);
}
