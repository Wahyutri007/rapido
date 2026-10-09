import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ManageListActions from "@/components/feature/manage/ManageListActions";
import { EFeather } from "@/components/icons";
import { route } from "@/lib/utils";
import { useManagePaymentMethodStore } from "@/store/managePaymentMethodStore";
import type { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";
import PaymentMethodDeleteDialog from "./PaymentMethodDeleteDialog";

export default function PaymentMethodListScreen() {
	const items = useManagePaymentMethodStore((state) => state.items);
	const [search, setSearch] = useState("");
	const [selection, setSelection] = useState<{
		item: PaymentMethodItemProps;
		version: number;
	} | null>(null);
	const current = items.find((item) => item.id === selection?.item.id);
	const selected = current ?? selection?.item;
	const needle = search.trim().toLocaleLowerCase("id");
	const results = items.filter((item) =>
		`${item.name} ${item.bank} ${item.accountName}`
			.toLocaleLowerCase("id")
			.includes(needle),
	);
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<Text size="small" className="text-muted">
						Data tersedia selama aplikasi terbuka dan belum terhubung ke
						transaksi.
					</Text>
					<SearchBar
						search={search}
						setSearch={setSearch}
						variant="light"
						placeholder="Cari metode, bank, atau pemilik rekening..."
					/>
					<Text size="normal" w="medium">
						{items.length} metode pembayaran
					</Text>
					<FlatList
						data={results}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => (
							<CatalogItemCard
								density="compact"
								leading={
									<EFeather
										name="credit-card"
										size={20}
										className="text-primary"
									/>
								}
								title={
									<Text size="normal" w="medium" numberOfLines={1}>
										{item.name}
									</Text>
								}
								subtitle={
									<Text size="small" className="text-muted" numberOfLines={1}>
										{item.bank.toUpperCase()} · {item.accountName}
									</Text>
								}
								onPress={() =>
									router.push(
										route("/manage/payment-method/detail", { id: item.id }),
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
							/>
						)}
						ListEmptyComponent={
							<SearchNotFound
								text={
									needle
										? "Metode pembayaran tidak ditemukan"
										: "Belum ada metode pembayaran. Tambahkan metode pertama Anda."
								}
							/>
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/manage/payment-method/modify"))}
			>
				Tambah Metode Pembayaran
			</BottomActionButton>
			{selection && selected && (
				<ManageListActions
					key={selection.version}
					title={selected.name}
					entityName="Metode Pembayaran"
					available={!!current}
					onViewDetail={() =>
						router.push(
							route("/manage/payment-method/detail", { id: selected.id }),
						)
					}
					onEdit={() =>
						router.push(
							route("/manage/payment-method/modify", { id: selected.id }),
						)
					}
					renderDelete={(openState) => (
						<PaymentMethodDeleteDialog item={selected} openState={openState} />
					)}
				/>
			)}
		</>
	);
}
