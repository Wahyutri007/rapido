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
	EXPENSE_FUNDING_SOURCES,
	EXPENSE_STORES,
} from "@/constants/data/accounting/expenses";
import { expenseDateLabel } from "@/lib/manage/expense-date";
import { filterExpenses, groupExpenses } from "@/lib/manage/expenses";
import { formatRp, route } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";
import type { Expense } from "@/types/ui/accounting/expense";

export default function ExpensesScreen() {
	const expenses = useAccountingStore((state) => state.expenses);
	const remove = useAccountingStore((state) => state.deleteExpense);
	const [search, setSearch] = React.useState("");
	const [funding, setFunding] = React.useState("");
	const [store, setStore] = React.useState("");
	const [selected, setSelected] = React.useState<Expense | null>(null);
	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [confirm, setConfirm] = React.useState(false);
	const items = filterExpenses(expenses, search, funding, store);
	const total = items.reduce((sum, item) => sum + item.amount, 0);
	const groups = groupExpenses(items);
	const filtered = !!(search.trim() || funding || store);
	const open = (screen: "detail" | "modify", id: string) =>
		router.push(route(`/manage/expenses/${screen}`, { id }));
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari pengeluaran..."
					/>
					<View className="flex-row gap-3">
						<View className="min-w-0 flex-1">
							<SingleSelect
								label="Filter Sumber Dana"
								items={[
									{ label: "Semua sumber dana", value: "" },
									...EXPENSE_FUNDING_SOURCES,
								]}
								value={funding}
								onValueChange={setFunding}
							/>
						</View>
						<View className="min-w-0 flex-1">
							<SingleSelect
								label="Filter Toko"
								items={[{ label: "Semua toko", value: "" }, ...EXPENSE_STORES]}
								value={store}
								onValueChange={setStore}
							/>
						</View>
					</View>
					<Card density="compact" className="gap-2">
						<View className="flex-row flex-wrap items-center justify-between gap-2">
							<Text size="small" className="text-muted">
								{filtered ? "Total hasil filter" : "Total Pengeluaran"}
							</Text>
							<Text size="small" className="text-muted">
								{items.length} pengeluaran
							</Text>
						</View>
						<View className="flex-row flex-wrap items-center justify-between gap-2">
							<Text size="body" w="bold" className="!text-destructive">
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
									{expenseDateLabel(group.date)}
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
										subtitle={`${item.accountName} · ${item.store}`}
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
											Sumber Dana: {item.fundingSource}
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
												className="!text-destructive"
											>
												−{formatRp(item.amount)}
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
										? "Pengeluaran tidak ditemukan."
										: "Belum ada pengeluaran."
								}
							/>
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push("/manage/expenses/modify")}
			>
				Tambah Pengeluaran
			</BottomActionButton>
			<ItemActionSheet
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
				title={selected?.referenceNumber}
				entityName="Pengeluaran"
				onViewDetail={() => {
					if (selected) open("detail", selected.id);
				}}
				onEdit={() => {
					if (selected) open("modify", selected.id);
				}}
				onDelete={() => setConfirm(true)}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				title="Hapus Pengeluaran?"
				itemName={selected?.referenceNumber}
				description="Pengeluaran ini akan dihapus dari daftar dan laporan pratinjau."
				onConfirm={() => {
					if (selected) remove(selected.id);
					setConfirm(false);
					setSelected(null);
				}}
			/>
		</>
	);
}
