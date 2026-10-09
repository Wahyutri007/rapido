import { Image } from "expo-image";
import { useState } from "react";
import {
	FlatList,
	Keyboard,
	Platform,
	Pressable,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import BillReferenceCard from "@/components/feature/cashier/bills/BillReferenceCard";
import { Button, ButtonText } from "@/components/ui/button";
import {
	BILL_PREVIEW_TABLE_OPTIONS,
	BILL_REFERENCE_PREVIEW,
	type BillReferencePreview,
	filterBillReferencePreview,
} from "@/lib/cashier/bill-reference-preview";
import { cashierBillTheme } from "@/lib/cashier/bill-theme";
import { bottomTabClearance } from "@/lib/ui/bottom-navigation";

export default function BillsFigmaPreview() {
	const [search, setSearch] = useState("");
	const [searchResetKey, setSearchResetKey] = useState(0);
	const [table, setTable] = useState("all");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [action, setAction] = useState<{
		kind: "add" | "pay";
		bill: BillReferencePreview;
	} | null>(null);
	const modal = useAlertModal();
	const insets = useSafeAreaInsets();
	const { fontScale } = useWindowDimensions();
	const cards = filterBillReferencePreview(search, table);
	const filterLabel = table === "all" ? "Semua" : `Meja ${table}`;
	const showAction = (kind: "add" | "pay", bill: BillReferencePreview) => {
		setAction({ kind, bill });
		modal.open();
	};
	return (
		<View style={cashierBillTheme} className="flex-1">
			<Wrapper isNotScrollable>
				<FlatList
					className="flex-1"
					data={cards}
					keyExtractor={(item) => item.referenceNode}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode={Platform.OS === "web" ? "none" : "on-drag"}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingTop: 24,
						paddingBottom: bottomTabClearance(insets.bottom, fontScale) + 16,
					}}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					ListHeaderComponentStyle={{ paddingBottom: 8 }}
					ListHeaderComponent={
						<View className="gap-4">
							<View className="flex-row flex-wrap items-center justify-between gap-2">
								<View
									className="flex-row items-center rounded-lg bg-error-500/5 px-2"
									style={{ height: 24, gap: 6 }}
									testID="bill-preview-count"
								>
									<Image
										source={require("@/assets/images/cashier/bills/bell.svg")}
										style={{ width: 14, height: 14 }}
										accessible={false}
									/>
									<Text
										size="small"
										className="!text-destructive"
										style={{ lineHeight: 16, minWidth: 145 }}
									>
										{BILL_REFERENCE_PREVIEW.unpaidCountInDesign} Tagihan belum
										dibayar
									</Text>
									<View
										pointerEvents="none"
										className="absolute inset-0 rounded-lg border border-error-500/10"
									/>
								</View>
								<Pressable
									className="flex-row items-center gap-1 rounded-lg px-2"
									style={{ height: 26 }}
									accessibilityRole="button"
									accessibilityLabel={`Filter contoh tagihan: ${filterLabel}${search ? ", pencarian aktif" : ""}`}
									accessibilityState={{ expanded: filtersOpen }}
									hitSlop={8}
									onPress={() => {
										if (filtersOpen) Keyboard.dismiss();
										setFiltersOpen((open) => !open);
									}}
								>
									<Text
										size="small"
										w="medium"
										className="!text-primary"
										style={{ lineHeight: 16, minWidth: 40 }}
									>
										{filterLabel}
									</Text>
									<Image
										source={require("@/assets/images/cashier/bills/chevron-down.svg")}
										style={{ width: 12, height: 12 }}
										accessible={false}
									/>
									<View
										pointerEvents="none"
										className="absolute inset-0 rounded-lg border border-primary"
									/>
								</Pressable>
							</View>
							<View
								className="gap-4"
								style={{ display: filtersOpen ? "flex" : "none" }}
								pointerEvents={filtersOpen ? "auto" : "none"}
								accessibilityElementsHidden={!filtersOpen}
								importantForAccessibility={
									filtersOpen ? "auto" : "no-hide-descendants"
								}
							>
								<SearchBar
									key={searchResetKey}
									search={search}
									setSearch={setSearch}
									placeholder="Cari pelanggan atau meja"
									variant="light"
								/>
								<SingleSelect
									label="Meja pada contoh Figma"
									items={BILL_PREVIEW_TABLE_OPTIONS}
									value={table}
									onValueChange={setTable}
								/>
								<Button
									variant="outline"
									onPress={() => {
										setSearchResetKey((key) => key + 1);
										setSearch("");
										setTable("all");
									}}
								>
									<ButtonText>Reset filter</ButtonText>
								</Button>
							</View>
						</View>
					}
					ListEmptyComponent={
						<Card>
							<Text size="normal">Tidak ada contoh tagihan sesuai filter.</Text>
						</Card>
					}
					renderItem={({ item }) => (
						<BillReferenceCard bill={item} onAction={showAction} />
					)}
					ListFooterComponent={
						<View className="mt-4 gap-1" testID="bill-preview-notice">
							<Text size="small" className="!text-muted">
								Pratinjau Figma · bukan transaksi toko.
							</Text>
							<Text size="small" className="!text-muted">
								13 pada acuan; 3 kartu contoh ditampilkan.
							</Text>
						</View>
					}
				/>
			</Wrapper>
			<AlertModal
				openState={modal.openState}
				title={
					action?.kind === "pay" ? "Pratinjau pembayaran" : "Pratinjau pesanan"
				}
				message={`${action?.bill.customer ?? "Tagihan"} - Meja ${action?.bill.table ?? ""} adalah contoh dari Figma. ${action?.kind === "pay" ? "Pembayaran" : "Penambahan pesanan"} belum terhubung ke transaksi toko.`}
				hideCancelButton
				confirmText="Tutup"
				onConfirm={modal.close}
			/>
		</View>
	);
}
