import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useWorkersQuery } from "@/api/hooks/workers";
import BottomActionButton from "@/components/common/BottomActionButton";
import {
	LoadingPlaceholder,
	SearchNotFound,
} from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ManageListActions from "@/components/feature/manage/ManageListActions";
import { EFeather } from "@/components/icons";
import useRefreshControl from "@/hooks/useRefreshControl";
import { workerRoleName } from "@/lib/manage/workers";
import { route } from "@/lib/utils";
import type { WorkerData } from "@/types/api/worker";
import WorkerAvatar from "./WorkerAvatar";
import WorkerDeleteDialog from "./WorkerDeleteDialog";
import WorkerQueryError from "./WorkerQueryError";

export default function WorkerListScreen() {
	const query = useWorkersQuery();
	const refresh = useRefreshControl(query.refetch);
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<{
		item: WorkerData;
		version: number;
	} | null>(null);
	const current = query.data?.find((item) => item.id === selection?.item.id);
	const selected = current ?? selection?.item ?? null;
	const needle = search.trim().toLocaleLowerCase("id");
	const items = (query.data ?? []).filter((worker) =>
		`${worker.name} ${worker.email} ${worker.phone} ${workerRoleName(worker)} ${worker.assigned_store?.name ?? ""}`
			.toLocaleLowerCase("id")
			.includes(needle),
	);
	const navigate = (path: "detail" | "modify") => {
		if (selected)
			router.push(route(`/manage/workers/${path}`, { id: selected.id }));
	};
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						variant="light"
						placeholder="Cari nama, role, atau toko..."
					/>
					<View className="flex-row items-center justify-between">
						<Text size="normal" w="medium">
							Daftar Karyawan
						</Text>
						{query.data && (
							<Text size="small" className="text-muted">
								{query.data.length} karyawan
							</Text>
						)}
					</View>
					{query.isLoading ? (
						<LoadingPlaceholder />
					) : query.isError ? (
						<WorkerQueryError
							message="Daftar karyawan belum dapat dimuat."
							onRetry={() => {
								void query.refetch();
							}}
						/>
					) : (
						<FlatList
							data={items}
							keyExtractor={(item) => item.id}
							contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
							refreshControl={<RefreshControl {...refresh} />}
							renderItem={({ item }) => (
								<CatalogItemCard
									density="compact"
									leading={
										<WorkerAvatar uri={item.worker_profile?.face_scan} />
									}
									title={
										<Text size="normal" w="medium">
											{item.name}
										</Text>
									}
									subtitle={
										<Text size="small" className="text-muted">
											{item.assigned_store?.name ?? "Toko belum ditetapkan"}
										</Text>
									}
									description={
										<Text size="small" className="text-muted">
											{item.email}
										</Text>
									}
									onPress={() =>
										router.push(
											route("/manage/workers/detail", { id: item.id }),
										)
									}
									right={
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Tindakan ${item.name}`}
											hitSlop={8}
											onPress={(event) => {
												event.stopPropagation();
												setSelection((previous) => ({
													item,
													version: (previous?.version ?? 0) + 1,
												}));
											}}
										>
											<EFeather
												name="more-vertical"
												size={20}
												className="text-muted"
											/>
										</Pressable>
									}
								>
									<View className="self-start rounded-lg bg-primary/10 px-3 py-1">
										<Text size="small" className="text-primary">
											{workerRoleName(item)}
										</Text>
									</View>
								</CatalogItemCard>
							)}
							ListEmptyComponent={
								<SearchNotFound
									text={
										needle
											? "Karyawan tidak ditemukan"
											: "Belum ada karyawan. Tambahkan akun karyawan untuk toko Anda."
									}
								/>
							}
						/>
					)}
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/manage/workers/modify"))}
			>
				Tambah Karyawan
			</BottomActionButton>
			{selection && selected && (
				<ManageListActions
					key={selection.version}
					title={selected.name}
					entityName="Karyawan"
					available={!!current && !query.isLoading && !query.isError}
					onViewDetail={() => navigate("detail")}
					onEdit={() => navigate("modify")}
					renderDelete={(openState) => (
						<WorkerDeleteDialog worker={selected} openState={openState} />
					)}
				/>
			)}
		</>
	);
}
