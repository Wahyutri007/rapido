import { cssInterop } from "nativewind";
import type React from "react";
import { Pressable, ScrollView, View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import { EFeather, FilterIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { StockKind } from "@/types/ui/inventory";

type IconName = React.ComponentProps<typeof EFeather>["name"];
const metricValueClasses = {
	primary: "!text-primary",
	success: "!text-success",
	warning: "!text-warning",
	destructive: "!text-destructive",
};
const InventoryVectorIcon = cssInterop(EFeather, {
	className: { target: "style", nativeStyleToProp: { color: "color" } },
});

export function InventoryIcon({
	name,
	tone = "primary",
	size = 16,
}: {
	name: IconName;
	tone?: "primary" | "success" | "warning" | "destructive" | "muted";
	size?: number;
}) {
	return (
		<InventoryVectorIcon
			name={name}
			size={size}
			className={cn({
				"text-primary": tone === "primary",
				"text-success": tone === "success",
				"text-warning": tone === "warning",
				"text-destructive": tone === "destructive",
				"text-muted": tone === "muted",
			})}
		/>
	);
}

export function InventorySectionHeading({
	title,
	description,
	icon,
	right,
}: {
	title: string;
	description?: string;
	icon: IconName;
	right?: React.ReactNode;
}) {
	return (
		<View className="flex-row items-center gap-3 border-b border-border-muted pb-3">
			<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
				<InventoryIcon name={icon} />
			</View>
			<View className="flex-1 gap-1">
				<Text size="normal" w="medium">
					{title}
				</Text>
				{description && (
					<Text size="small" className="text-muted">
						{description}
					</Text>
				)}
			</View>
			{right}
		</View>
	);
}

export function InventorySearch({
	search,
	setSearch,
	onFilter,
	active,
}: {
	search: string;
	setSearch: (value: string) => void;
	onFilter: () => void;
	active: boolean;
}) {
	return (
		<View className="flex-row items-center gap-4">
			<View className="flex-1">
				<SearchBar search={search} setSearch={setSearch} />
			</View>
			<BouncyPressable
				accessibilityRole="button"
				accessibilityLabel="Filter inventaris"
				accessibilityState={{ expanded: active }}
				onPress={onFilter}
				className={cn(
					"size-12 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 shadow-main",
					active && "border-primary",
				)}
			>
				<FilterIcon className="text-primary" size={20} />
			</BouncyPressable>
		</View>
	);
}

export function InventoryTabs<T extends string>({
	items,
	value,
	onChange,
}: {
	items: { value: T; label: string }[];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<ScrollView
			horizontal
			style={{ flexGrow: 0, flexShrink: 0 }}
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{ gap: 8 }}
		>
			{items.map((item) => (
				<Pressable
					key={item.value}
					accessibilityRole="tab"
					accessibilityState={{ selected: item.value === value }}
					onPress={() => onChange(item.value)}
					className={cn(
						"rounded-lg border border-border-muted bg-white px-4 py-2",
						item.value === value && "border-primary bg-primary",
					)}
				>
					<Text
						size="normal"
						className={item.value === value ? "text-inverse" : "text-muted"}
					>
						{item.label}
					</Text>
				</Pressable>
			))}
		</ScrollView>
	);
}

export function StockKindBadge({ kind }: { kind: StockKind }) {
	return (
		<View
			className={cn(
				"rounded-full px-3 py-1",
				kind === "product" ? "bg-success-bg" : "bg-warning-bg",
			)}
		>
			<Text
				size="small"
				className={kind === "product" ? "text-success" : "text-warning"}
			>
				{kind === "product" ? "Produk" : "Bahan Baku"}
			</Text>
		</View>
	);
}

export function InventoryMetrics({
	items,
	variant = "default",
	valueTone = "default",
}: {
	variant?: "default" | "supplier";
	valueTone?: "default" | "item";
	items: {
		label: string;
		value: string | number;
		description?: string;
		icon: IconName;
		tone?: "primary" | "success" | "warning" | "destructive";
	}[];
}) {
	return (
		<View className="flex-row flex-wrap gap-2">
			{items.map((item) => (
				<View
					key={item.label + item.description}
					style={{ width: items.length === 3 ? "31.5%" : "48.5%", flexGrow: 1 }}
				>
					<Card
						density={variant === "supplier" ? "compact" : "default"}
						className={cn(
							"gap-3",
							items.length === 3 ? "items-center" : "flex-row items-start",
						)}
					>
						<View
							className={cn(
								"items-center justify-center rounded-lg",
								variant === "supplier" ? "size-10" : "size-9",
								{
									"bg-primary-50": !item.tone || item.tone === "primary",
									"bg-success-bg": item.tone === "success",
									"bg-warning-bg": item.tone === "warning",
									"bg-error-bg": item.tone === "destructive",
								},
							)}
						>
							<InventoryIcon
								name={item.icon}
								tone={item.tone}
								size={variant === "supplier" ? 24 : 16}
							/>
						</View>
						<View className={cn("gap-1", items.length === 3 && "items-center")}>
							{variant === "supplier" && (
								<Text
									size="body"
									w="semibold"
									className={
										valueTone === "item" && item.tone
											? metricValueClasses[item.tone]
											: undefined
									}
								>
									{item.value}
								</Text>
							)}
							<Text size="small">{item.label}</Text>
							{variant !== "supplier" && (
								<Text
									size="body"
									w="semibold"
									className={
										valueTone === "item" && item.tone
											? metricValueClasses[item.tone]
											: undefined
									}
								>
									{item.value}
								</Text>
							)}
							{item.description && (
								<Text size="small" className="text-muted">
									{item.description}
								</Text>
							)}
						</View>
					</Card>
				</View>
			))}
		</View>
	);
}

export function InventoryMetadata({
	icon,
	label,
	value,
	tone,
}: {
	icon: IconName;
	label: string;
	value: string;
	tone?: "primary" | "muted";
}) {
	return (
		<View className="flex-row items-start gap-2">
			<InventoryIcon name={icon} tone={tone} />
			<View className="flex-1 gap-1">
				<Text size="small" className="text-muted">
					{label}
				</Text>
				<Text size="small">{value}</Text>
			</View>
		</View>
	);
}
