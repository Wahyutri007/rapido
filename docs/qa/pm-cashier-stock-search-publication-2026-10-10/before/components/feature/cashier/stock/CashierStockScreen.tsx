import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { CASHIER_STOCK_PREVIEW } from "@/constants/data/cashier-stock-preview";
import {
	cashierStockGroups,
	defaultCashierStockFilter,
} from "@/lib/cashier/stock";
import { cashierStockTheme } from "@/lib/cashier/stock-theme";
import { figmaStockShadows } from "@/lib/ui/figma-stock";
import StockFilterSheet from "./StockFilterSheet";
import StockGroupCard from "./StockGroupCard";

export default function CashierStockScreen() {
	const [search, setSearch] = React.useState("");
	const [filter, setFilter] = React.useState(defaultCashierStockFilter);
	const [draft, setDraft] = React.useState(defaultCashierStockFilter);
	const [isOpen, setIsOpen] = React.useState(false);
	const groups = cashierStockGroups(CASHIER_STOCK_PREVIEW, search, filter);
	const hasResults = groups.some((group) => group.rows.length > 0);
	const resetAll = () => {
		setSearch("");
		setFilter(defaultCashierStockFilter());
	};
	return (
		<View className="flex-1" style={cashierStockTheme}>
			<Wrapper contentContainerStyle={{ padding: 16, paddingTop: 24, gap: 16 }}>
				<View className="flex-row items-center gap-4">
					<View className="min-w-0 flex-1">
						<SearchBar
							appearance="figma"
							search={search}
							setSearch={setSearch}
							debounce={false}
							accessibilityLabel="Cari stok produk"
						/>
					</View>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Opsi filter stok"
						aria-expanded={isOpen}
						accessibilityState={{ expanded: isOpen }}
						onPress={() => {
							setDraft({ ...filter, categories: [...filter.categories] });
							setIsOpen(true);
						}}
						className="size-12 items-center justify-center rounded-lg border border-primary/10 bg-primary/10"
						style={figmaStockShadows.card}
					>
						<Image
							source={require("@/assets/images/cashier/stock/filter.svg")}
							style={{
								width: 17,
								height: 17,
								transform: [{ rotate: "-90deg" }],
							}}
						/>
					</Pressable>
				</View>
				{groups.map((group) => (
					<StockGroupCard
						key={group.category}
						group={group}
						referenceStatus={filter.status}
					/>
				))}
				{!hasResults && (
					<Card className="items-center gap-3">
						<Text w="semibold">Produk tidak ditemukan</Text>
						<Text size="normal" className="text-center !text-muted">
							Ubah kata pencarian atau pilihan filter.
						</Text>
						<Button variant="outline" size="xl" onPress={resetAll}>
							<ButtonText>Reset Pencarian & Filter</ButtonText>
						</Button>
					</Card>
				)}
				<Text size="small" className="!text-muted">
					Data contoh desain. Jumlah ini belum terhubung ke stok toko.
				</Text>
			</Wrapper>
			<StockFilterSheet
				isOpen={isOpen}
				draft={draft}
				onChange={setDraft}
				onClose={() => setIsOpen(false)}
				onApply={() => {
					setFilter({ ...draft, categories: [...draft.categories] });
					setIsOpen(false);
				}}
			/>
		</View>
	);
}
