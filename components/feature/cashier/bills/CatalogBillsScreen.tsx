import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Keyboard, Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlertModal } from "@/components/common/AlertModal";
import BottomActionBar from "@/components/common/BottomActionBar";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogBillCard from "@/components/feature/cashier/bills/CatalogBillCard";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import {
	BILL_PREVIEW_TABLE_OPTIONS,
	BILL_REFERENCE_PREVIEW,
	type BillReferencePreview,
} from "@/lib/cashier/bill-reference-preview";
import { filterCatalogBillPreview } from "@/lib/cashier/catalog-bill-preview";
import {
	catalogBillBellTheme,
	catalogBillFilterTheme,
	catalogBillTheme,
} from "@/lib/cashier/catalog-bill-theme";

export default function CatalogBillsScreen() {
	const [search, setSearch] = useState("");
	const [table, setTable] = useState("all");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [selected, setSelected] = useState<BillReferencePreview | null>(null);
	const [footerHeight, setFooterHeight] = useState(80);
	const modal = useAlertModal();
	const closeModal = modal.close;
	const insets = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const footerPadding = height - insets.top - insets.bottom < 240 ? 8 : 16;
	const cards = filterCatalogBillPreview(search, table);
	const filterLabel = table === "all" ? "Semua" : `Meja ${table}`;
	const resetFilters = () => {
		setSearch("");
		setTable("all");
	};

	useFocusEffect(
		useCallback(() => {
			return () => {
				closeModal();
				setSelected(null);
				setFiltersOpen(false);
			};
		}, [closeModal]),
	);

	return (
		<View style={catalogBillTheme} className="flex-1">
			<View className="flex-1" style={{ paddingBottom: footerHeight + 1 }}>
				<Wrapper
					hasActionButton
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingTop: 12,
						paddingBottom: Math.max(0, footerHeight - 128 - insets.bottom),
						gap: 16,
					}}
				>
					<View className="gap-4" style={{ marginBottom: 8 }}>
						<View
							className="flex-row flex-wrap items-center justify-between gap-2"
							style={{ paddingVertical: 5 }}
						>
							<View
								className="min-w-0 shrink flex-row items-center"
								style={{ gap: 6 }}
							>
								<View
									className="size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10"
									style={catalogBillBellTheme}
								>
									<Image
										source={require("@/assets/images/cashier/bills/bell.svg")}
										style={{ width: 14, height: 14 }}
										accessible={false}
									/>
								</View>
								<Text size="small" className="shrink !text-destructive">
									{BILL_REFERENCE_PREVIEW.unpaidCountInDesign} Tagihan belum
									dibayar
								</Text>
							</View>
							<Pressable
								className="flex-row items-center gap-1"
								style={[catalogBillFilterTheme, { padding: 5 }]}
								accessibilityRole="button"
								accessibilityLabel={`Filter contoh tagihan katalog: ${filterLabel}`}
								aria-expanded={filtersOpen}
								accessibilityState={{ expanded: filtersOpen }}
								hitSlop={8}
								onPress={() => {
									Keyboard.dismiss();
									setFiltersOpen((open) => !open);
								}}
							>
								<Text
									size="small"
									className="text-subtle"
									style={{ lineHeight: 14.4 }}
								>
									{filterLabel}
								</Text>
								<Image
									source={require("@/assets/images/cashier/bills/catalog-chevron-down.svg")}
									style={{ width: 12, height: 12 }}
									accessible={false}
								/>
							</Pressable>
						</View>
						{filtersOpen && (
							<View className="gap-4">
								<SearchBar
									search={search}
									setSearch={setSearch}
									debounce={false}
									appearance="figma"
									viewportSafe
									variant="light"
									placeholder="Cari pelanggan atau meja"
								/>
								<SingleSelect
									label="Meja pada contoh Figma"
									items={BILL_PREVIEW_TABLE_OPTIONS}
									value={table}
									onValueChange={setTable}
									viewportSafe
								/>
								<Button variant="outline" onPress={resetFilters}>
									<ButtonText>Reset filter</ButtonText>
								</Button>
							</View>
						)}
					</View>
					{cards.length === 0 ? (
						<Card className="gap-4">
							<Text size="normal">Tidak ada contoh tagihan sesuai filter.</Text>
							<Button variant="outline" onPress={resetFilters}>
								<ButtonText>Reset filter</ButtonText>
							</Button>
						</Card>
					) : (
						<View className="gap-4">
							{cards.map((item) => (
								<CatalogBillCard
									key={item.referenceNode}
									bill={item}
									onAdd={(bill) => {
										setSelected(bill);
										modal.open();
									}}
								/>
							))}
						</View>
					)}
					<Text size="small" className="text-muted">
						Pratinjau Figma. 13 pada acuan; 3 kartu contoh. Penambahan pesanan
						belum tersimpan.
					</Text>
				</Wrapper>
			</View>
			<BottomActionBar
				className="rounded-t-3xl"
				topPadding={footerPadding}
				bottomPadding={footerPadding}
			>
				<View
					onLayout={(event) =>
						setFooterHeight(
							event.nativeEvent.layout.height +
								footerPadding * 2 +
								insets.bottom,
						)
					}
				>
					<Button
						size="xl"
						className="w-full"
						animationType="none"
						style={{ minHeight: 48, height: "auto" }}
						onPress={() => router.replace("/(no-layout)/(cashier)/catalog")}
					>
						<ButtonText className="shrink text-center">
							Kembali Katalog
						</ButtonText>
					</Button>
				</View>
			</BottomActionBar>
			<Actionsheet isOpen={modal.isOpen} onClose={closeModal}>
				<ActionsheetBackdrop />
				<ActionsheetContent
					className="items-stretch"
					style={{ maxHeight: Math.max(0, height - insets.top - 16) }}
				>
					<ActionsheetScrollView
						className="min-h-0"
						contentContainerStyle={{ gap: 16 }}
						keyboardShouldPersistTaps="handled"
					>
						<Text size="body" w="semibold" accessibilityRole="header">
							Pratinjau penambahan pesanan
						</Text>
						<Text size="normal">
							{selected?.customer ?? "Pelanggan"} - Meja {selected?.table ?? ""}{" "}
							adalah contoh Figma. Penambahan pesanan ke tagihan toko belum
							tersedia.
						</Text>
						<Button
							size="xl"
							animationType="none"
							style={{ minHeight: 48, height: "auto" }}
							onPress={closeModal}
						>
							<ButtonText className="shrink text-center">Tutup</ButtonText>
						</Button>
					</ActionsheetScrollView>
				</ActionsheetContent>
			</Actionsheet>
		</View>
	);
}
