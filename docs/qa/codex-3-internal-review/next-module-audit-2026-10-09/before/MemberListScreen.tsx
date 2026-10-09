import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useCustomersQuery } from "@/api/hooks/customers";
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
import { route } from "@/lib/utils";
import type { CustomerData } from "@/types/api/customer";
import MemberDeleteDialog from "./MemberDeleteDialog";
import MemberIcon from "./MemberIcon";
import MemberQueryError from "./MemberQueryError";

export default function MemberListScreen() {
	const query = useCustomersQuery();
	const refresh = useRefreshControl(query.refetch);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<CustomerData | null>(null);
	const [actionsOpen, setActionsOpen] = useState(false);
	const deletion = useAlertModal();
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
												setSelected(item);
												setActionsOpen(true);
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
			<ItemActionSheet
				isOpen={actionsOpen}
				onClose={() => setActionsOpen(false)}
				title={selected?.name ?? "Member"}
				entityName="Member"
				onViewDetail={() => navigate("detail")}
				onEdit={() => navigate("modify")}
				onDelete={deletion.open}
			/>
			<MemberDeleteDialog member={selected} openState={deletion.openState} />
		</>
	);
}
