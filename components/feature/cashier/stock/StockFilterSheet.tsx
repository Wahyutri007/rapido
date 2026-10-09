import { Image } from "expo-image";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { CASHIER_STOCK_CATEGORIES } from "@/constants/data/cashier-stock-preview";
import {
	defaultCashierStockFilter,
	toggleCashierStockCategory,
} from "@/lib/cashier/stock";
import { cashierStockFilterTheme } from "@/lib/cashier/stock-theme";
import { cn } from "@/lib/utils";
import type { CashierStockFilter } from "@/types/ui/cashier/stock";

const STATUS_OPTIONS: { value: CashierStockFilter["status"]; label: string }[] =
	[
		{ value: "all", label: "Semua" },
		{ value: "available", label: "Tersedia" },
		{ value: "low", label: "Menipis" },
		{ value: "empty", label: "Habis" },
	];

export default function StockFilterSheet({
	isOpen,
	draft,
	onChange,
	onClose,
	onApply,
}: {
	isOpen: boolean;
	draft: CashierStockFilter;
	onChange: (value: CashierStockFilter) => void;
	onClose: () => void;
	onApply: () => void;
}) {
	const insets = useSafeAreaInsets();
	const { height, width } = useWindowDimensions();
	const sheetHeight = Math.min(619 + insets.bottom, height - insets.top);
	const scrollActions = sheetHeight - insets.bottom < 320;
	const stackActions = width - insets.left - insets.right < 300;
	const reset = () => onChange(defaultCashierStockFilter());
	const actions = (
		<View
			className={cn(
				"relative w-full shrink-0 px-4 pt-4",
				stackActions ? "flex-col" : "flex-row",
			)}
			style={{
				gap: 14,
				paddingBottom: 32 + (scrollActions ? 0 : insets.bottom),
			}}
		>
			<View
				pointerEvents="none"
				className="absolute top-0 left-0 h-px w-full bg-surface-subtle"
			/>
			<View className={stackActions ? "w-full" : "flex-1"}>
				<Button variant="muted" size="xl" className="w-full" onPress={reset}>
					<ButtonText className="!text-muted" style={{ lineHeight: 19.2 }}>
						Reset
					</ButtonText>
				</Button>
			</View>
			<View className={stackActions ? "w-full" : "flex-1"}>
				<Button size="xl" className="w-full" onPress={onApply}>
					<ButtonText style={{ lineHeight: 19.2 }}>Terapkan</ButtonText>
				</Button>
			</View>
		</View>
	);
	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent
				bottomInsetHandled
				className="gap-0 rounded-t-[20px] border-0 bg-white p-0"
				style={[
					cashierStockFilterTheme,
					{
						// Exact reference geometry; OS navigation adds its own clearance.
						minHeight: sheetHeight,
						maxHeight: sheetHeight,
						boxShadow: "0px -2px 9.1px 0px rgba(0, 0, 0, 0.06)",
					},
				]}
			>
				<View className="relative w-full shrink-0 px-4 pt-8 pb-4">
					<ActionsheetDragIndicatorWrapper
						style={{ position: "absolute", top: 4, left: 0, right: 0 }}
					>
						<ActionsheetDragIndicator className="w-9 bg-border" />
					</ActionsheetDragIndicatorWrapper>
					<View className="min-h-6 flex-row items-center">
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Tutup filter stok"
							onPress={onClose}
							hitSlop={12}
						>
							<Image
								source={require("@/assets/images/cashier/stock/close.svg")}
								style={{ width: 24, height: 24 }}
							/>
						</Pressable>
						<Text
							w="semibold"
							className="min-w-0 flex-1 text-center"
							style={{ lineHeight: 21 }}
						>
							Opsi Filter
						</Text>
						<View className="w-6 items-end">
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Reset pilihan filter stok"
								onPress={reset}
								hitSlop={12}
							>
								<Text
									size="normal"
									w="medium"
									className="!text-primary"
									style={{ lineHeight: 18 }}
								>
									Reset
								</Text>
							</Pressable>
						</View>
					</View>
					<View
						pointerEvents="none"
						className="absolute bottom-0 left-0 h-px w-full bg-surface-subtle"
					/>
				</View>
				<ActionsheetScrollView
					className="min-h-0 w-full flex-1"
					contentContainerStyle={{
						gap: 24,
						padding: 16,
						paddingTop: 24,
						paddingBottom: scrollActions ? 0 : 24,
					}}
				>
					<View className="gap-4" style={{ marginHorizontal: 6 }}>
						<Text w="semibold" style={{ lineHeight: 21 }}>
							Filter Berdasarkan Status
						</Text>
						<View className="flex-row flex-wrap gap-4">
							{STATUS_OPTIONS.map((option, index) => (
								<Pressable
									key={option.value}
									accessibilityRole="radio"
									accessibilityLabel={option.label}
									hitSlop={8}
									aria-checked={draft.status === option.value}
									accessibilityState={{
										checked: draft.status === option.value,
									}}
									onPress={() => onChange({ ...draft, status: option.value })}
									className={cn(
										"items-center justify-center rounded-2xl px-4",
										draft.status === option.value ? "bg-primary" : "bg-white",
									)}
									style={{
										minWidth: [78, 90, 85, 71][index],
										minHeight: 30,
										paddingVertical: 6,
									}}
								>
									{draft.status !== option.value && (
										<View
											pointerEvents="none"
											className="absolute inset-0 rounded-2xl border border-surface-strong"
										/>
									)}
									<Text
										size="normal"
										w="medium"
										style={{ lineHeight: 18 }}
										className={
											draft.status === option.value
												? "!text-inverse"
												: "text-foreground"
										}
									>
										{option.label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>
					<View className="gap-3">
						<Text
							size="normal"
							w="semibold"
							style={{ lineHeight: 18 }}
							accessibilityHint="Tanpa pilihan menampilkan semua kategori."
						>
							Filter Berdasarkan Kategori
						</Text>
						<View className="gap-2">
							{CASHIER_STOCK_CATEGORIES.map((category) => {
								const selected = draft.categories.includes(category);
								return (
									<Pressable
										key={category}
										accessibilityRole="checkbox"
										accessibilityLabel={category}
										aria-checked={selected}
										accessibilityState={{ checked: selected }}
										onPress={() =>
											onChange({
												...draft,
												categories: toggleCashierStockCategory(
													draft.categories,
													category,
												),
											})
										}
										className={cn(
											"flex-row items-center rounded-lg px-3 py-2",
											selected ? "bg-primary/10" : "bg-white",
										)}
										style={{ minHeight: 53, gap: 14 }}
									>
										<View
											pointerEvents="none"
											className={cn(
												"absolute inset-0 rounded-lg border",
												selected ? "border-primary" : "border-border",
											)}
										/>
										<View
											className={cn(
												"size-4 items-center justify-center rounded border",
												selected
													? "border-primary bg-primary"
													: "border-border bg-white",
											)}
										>
											{selected && (
												<Image
													source={require("@/assets/images/cashier/stock/check.svg")}
													style={{ width: 12, height: 12 }}
												/>
											)}
										</View>
										<Text
											size="normal"
											w="medium"
											className="min-w-0 flex-1"
											style={{ lineHeight: 18 }}
										>
											{category}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
					{scrollActions && (
						<View style={{ marginHorizontal: -16 }}>{actions}</View>
					)}
				</ActionsheetScrollView>
				{scrollActions ? (
					<View pointerEvents="none" style={{ height: insets.bottom }} />
				) : (
					actions
				)}
			</ActionsheetContent>
		</Actionsheet>
	);
}
