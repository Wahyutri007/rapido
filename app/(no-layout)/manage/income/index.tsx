import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import {
	INCOME_FUNDING_SOURCES,
	INCOME_STORES,
} from "@/constants/data/accounting/incomes";
import { accountingDateLabel } from "@/lib/accounting/date";
import {
	filterIncomes,
	groupIncomes,
	removeManagedIncome,
} from "@/lib/manage/incomes";
import { formatRp, route } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";
import type { Income, IncomeType } from "@/types/ui/accounting/income";

export default function IncomesScreen() {
	const incomes = useAccountingStore((state) => state.incomes);

	const [search, setSearch] = React.useState("");
	const [funding, setFunding] = React.useState("");
	const [store, setStore] = React.useState("");
	const [selected, setSelected] = React.useState<Income | null>(null);
	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [confirm, setConfirm] = React.useState(false);
	const [type, setType] = React.useState<"" | "manual" | "invoice">("");
	const items = filterIncomes(incomes, search, funding, store, type);
	const total = items.reduce((sum, item) => sum + item.amount, 0);
	const groups = groupIncomes(items);
	const filtered = !!(search.trim() || funding || store || type);
	const open = (screen: "detail" | "modify", id: string) =>
		router.push(route(`/manage/income/${screen}`, { id }));
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari penerimaan..."
					/>
					<View className="flex-row gap-3">
						<View className="min-w-0 flex-1">
							<SingleSelect
								label="Filter Sumber Dana"
								items={[
									{ label: "Semua sumber dana", value: "" },
									...INCOME_FUNDING_SOURCES,
								]}
								value={funding}
								onValueChange={setFunding}
							/>
						</View>
						<View className="min-w-0 flex-1">
							<SingleSelect
								label="Filter Toko"
								items={[{ label: "Semua toko", value: "" }, ...INCOME_STORES]}
								value={store}
								onValueChange={setStore}
							/>
						</View>
					</View>
					<SingleSelect<IncomeType | "">
						label="Filter Jenis Penerimaan"
						items={[
							{ label: "Semua penerimaan", value: "" },
							{ label: "Manual", value: "manual" },
							{ label: "Penjualan", value: "invoice" },
						]}
						value={type}
						onValueChange={setType}
					/>
					<Card density="compact" className="gap-2">
						<View className="flex-row flex-wrap items-center justify-between gap-2">
							<Text size="small" className="text-muted">
								{filtered ? "Total hasil filter" : "Total Penerimaan"}
							</Text>
							<Text size="small" className="text-muted">
								{items.length} penerimaan
							</Text>
						</View>
						<View className="flex-row flex-wrap items-center justify-between gap-2">
							<Text size="body" w="bold" className="!text-success">
								{formatRp(total)}
							</Text>
							{filtered && (
								<Button
									variant="link"
									size="sm"
									onPress={() => {
										setSearch("");
										setFunding("");
										setStore("");
										setType("");
									}}
								>
									<ButtonText>Reset Filter</ButtonText>
								</Button>
							)}
						</View>
					</Card>
					<FlatList
						data={groups}
						keyExtractor={(group) => group.date}
						contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
						showsVerticalScrollIndicator={false}
						renderItem={({ item: group }) => (
							<View className="gap-2">
								<Text size="small" w="medium" className="text-muted">
									{accountingDateLabel(group.date)}
								</Text>
								{group.items.map((item) => (
									<CatalogItemCard
										key={item.id}
										density="compact"
										onPress={() => open("detail", item.id)}
										title={
											<Text
												size="normal"
												w="semibold"
												className="flex-1 shrink"
											>
												{item.referenceNumber}
											</Text>
										}
										subtitle={`${item.type === "invoice" ? "Penjualan" : "Manual"} · ${item.store ?? "-"}`}
										right={
											<Pressable
												accessibilityRole="button"
												accessibilityLabel={`Pilihan ${item.referenceNumber}`}
												className="size-10 items-center justify-center"
												onPress={() => {
													setSelected(item);
													setSheetOpen(true);
												}}
											>
												<Feather
													name="more-horizontal"
													size={20}
													color={Colors.primary}
												/>
											</Pressable>
										}
									>
										<Text size="small" className="text-muted">
											{item.type === "invoice"
												? `Jumlah Item: ${item.itemCount ?? "-"}`
												: `Sumber Dana: ${item.fundingSource ?? "-"}`}
										</Text>
										<Text size="small" className="text-muted">
											Dibuat oleh: {item.createdBy}
										</Text>
										<View className="flex-row flex-wrap justify-between gap-2 pt-1">
											<Text size="small" className="text-muted">
												{item.time}
											</Text>
											<Text
												size="normal"
												w="semibold"
												className="!text-success"
											>
												+{formatRp(item.amount)}
											</Text>
										</View>
									</CatalogItemCard>
								))}
							</View>
						)}
						ListEmptyComponent={
							<SearchNotFound
								text={
									filtered
										? "Penerimaan tidak ditemukan."
										: "Belum ada penerimaan."
								}
							/>
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton onPress={() => router.push("/manage/income/modify")}>
				Tambah Penerimaan
			</BottomActionButton>
			<ItemActionSheet
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
				title={selected?.referenceNumber}
				entityName="Penerimaan"
				onViewDetail={() => {
					if (selected) open("detail", selected.id);
				}}
				onEdit={
					selected?.type === "manual"
						? () => open("modify", selected.id)
						: undefined
				}
				onDelete={
					selected?.type === "manual" ? () => setConfirm(true) : undefined
				}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				title="Hapus Penerimaan?"
				itemName={selected?.referenceNumber}
				description="Penerimaan ini akan dihapus dari daftar dan laporan pratinjau."
				onConfirm={() => {
					if (selected) removeManagedIncome(selected.id);
					setConfirm(false);
					setSelected(null);
				}}
			/>
		</>
	);
}
