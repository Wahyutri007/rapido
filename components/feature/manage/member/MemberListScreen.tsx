import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useCustomersQuery } from "@/api/hooks/customers";
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
import { route } from "@/lib/utils";
import type { CustomerData } from "@/types/api/customer";
import MemberDeleteDialog from "./MemberDeleteDialog";
import MemberIcon from "./MemberIcon";
import MemberQueryError from "./MemberQueryError";

export default function MemberListScreen() {
	const query = useCustomersQuery();
	const refresh = useRefreshControl(query.refetch);
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<{
		item: CustomerData;
		version: number;
	} | null>(null);
	const current = query.data?.find((item) => item.id === selection?.item.id);
	const selected = current ?? selection?.item ?? null;
	const needle = search.trim().toLocaleLowerCase("id");
	const members = (query.data ?? []).filter((member) =>
		`${member.name} ${member.phone} ${member.email ?? ""}`
			.toLocaleLowerCase("id")
			.includes(needle),
	);
	function navigate(path: "detail" | "modify") {
		if (selected)
			router.push(route(`/manage/member/${path}`, { id: selected.id }));
	}
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						variant="light"
						placeholder="Cari nama, telepon, atau email..."
					/>
					<View className="flex-row items-center justify-between">
						<Text size="normal" w="medium" numberOfLines={1} className="flex-1">
							Daftar Member
						</Text>
						{query.data && !query.isError && (
							<Text size="small" className="text-muted" numberOfLines={1}>
								{query.data.length} member
							</Text>
						)}
					</View>
					{query.isLoading ? (
						<LoadingPlaceholder />
					) : query.isError ? (
						<MemberQueryError
							message="Daftar member belum dapat dimuat."
							onRetry={() => {
								void query.refetch();
							}}
						/>
					) : (
						<FlatList
							data={members}
							keyExtractor={(item) => item.id}
							contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
							refreshControl={<RefreshControl {...refresh} />}
							renderItem={({ item }) => (
								<CatalogItemCard
									density="compact"
									leading={<MemberIcon />}
									title={
										<Text
											size="normal"
											w="medium"
											numberOfLines={1}
											className="flex-1"
										>
											{item.name}
										</Text>
									}
									subtitle={
										<Text size="small" className="text-muted" numberOfLines={1}>
											{item.phone}
										</Text>
									}
									onPress={() =>
										router.push(route("/manage/member/detail", { id: item.id }))
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
									{item.email && (
										<Text size="small" className="text-muted" numberOfLines={1}>
											{item.email}
										</Text>
									)}
								</CatalogItemCard>
							)}
							ListEmptyComponent={
								<SearchNotFound
									text={
										needle
											? "Member tidak ditemukan"
											: "Belum ada member. Tambahkan data pelanggan Anda."
									}
								/>
							}
						/>
					)}
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/manage/member/modify"))}
			>
				Tambah Member
			</BottomActionButton>
			{selection && selected && (
				<ManageListActions
					key={selection.version}
					title={selected.name}
					entityName="Member"
					available={!!current && !query.isLoading && !query.isError}
					onViewDetail={() => navigate("detail")}
					onEdit={() => navigate("modify")}
					renderDelete={(openState) => (
						<MemberDeleteDialog member={selected} openState={openState} />
					)}
				/>
			)}
		</>
	);
}
