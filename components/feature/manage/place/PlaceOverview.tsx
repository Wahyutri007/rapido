import Feather from "@expo/vector-icons/Feather";
import type React from "react";
import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { StoreIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import type { placeSummary } from "@/lib/manage/place";
import { cn } from "@/lib/utils";

export function PlaceStatus({ active }: { active: boolean }) {
	return (
		<View
			className={cn(
				"rounded-full px-3 py-1",
				active ? "bg-success-50" : "bg-surface-muted",
			)}
		>
			<Text
				size="small"
				w="medium"
				className={active ? "text-success" : "text-muted"}
			>
				{active ? "Aktif" : "Nonaktif"}
			</Text>
		</View>
	);
}

export function PlaceHero({
	title,
	subtitle,
	active,
	description,
}: {
	title: string;
	subtitle: string;
	active: boolean;
	description?: string;
}) {
	return (
		<Card density="compact" className="flex-row items-center gap-3">
			<View className="size-12 items-center justify-center rounded-lg bg-primary-50">
				<StoreIcon size={24} color={Colors.primary} />
			</View>
			<View className="flex-1 gap-1">
				<View className="flex-row flex-wrap items-center justify-between gap-2">
					<Text w="semibold" className="shrink">
						{title}
					</Text>
					<PlaceStatus active={active} />
				</View>
				<Text size="small" className="text-muted">
					{subtitle}
				</Text>
				{description && (
					<Text size="small" className="text-muted">
						{description}
					</Text>
				)}
			</View>
		</Card>
	);
}

export function PlaceTabs({
	active,
	onChange,
	tabs,
}: {
	active: string;
	onChange: (id: string) => void;
	tabs: { id: string; title: string }[];
}) {
	return (
		<View className="flex-row overflow-hidden rounded-xl border border-border-muted bg-white">
			{tabs.map((tab) => (
				<Pressable
					key={tab.id}
					accessibilityRole="tab"
					accessibilityState={{ selected: active === tab.id }}
					onPress={() => onChange(tab.id)}
					className={cn(
						"flex-1 items-center justify-center py-3",
						active === tab.id ? "rounded-lg bg-primary" : "bg-transparent",
					)}
				>
					<Text
						size="normal"
						w={active === tab.id ? "bold" : "medium"}
						className={active === tab.id ? "text-white" : "text-muted"}
					>
						{tab.title}
					</Text>
				</Pressable>
			))}
		</View>
	);
}

export function PlaceStats({
	summary,
	global = false,
}: {
	summary: ReturnType<typeof placeSummary>;
	global?: boolean;
}) {
	const metrics: {
		title: string;
		value: number;
		icon: React.ComponentProps<typeof Feather>["name"];
	}[] = [
		...(global
			? [
					{
						title: "Toko / Outlet",
						value: summary.outlets,
						icon: "home" as const,
					},
				]
			: []),
		{ title: "Total Tempat", value: summary.total, icon: "grid" },
		{ title: "Aktif", value: summary.active, icon: "check-circle" },
		{ title: "Nonaktif", value: summary.inactive, icon: "minus-circle" },
	];
	if (!global)
		return (
			<Card density="compact" className="flex-row gap-3">
				{metrics.map((metric) => (
					<View key={metric.title} className="flex-1 gap-2">
						<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
							<Feather name={metric.icon} size={20} color={Colors.primary} />
						</View>
						<View className="gap-1">
							<Text w="bold">{metric.value}</Text>
							<Text size="small" className="text-muted">
								{metric.title}
							</Text>
						</View>
					</View>
				))}
			</Card>
		);
	return (
		<View className="gap-2">
			{[metrics.slice(0, 2), metrics.slice(2)].map((row) => (
				<View key={row[0].title} className="flex-row gap-2">
					{row.map((metric) => (
						<Card
							key={metric.title}
							density="compact"
							className="flex-1 flex-row items-center gap-3"
						>
							<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
								<Feather name={metric.icon} size={20} color={Colors.primary} />
							</View>
							<View className="flex-1 gap-1">
								<Text w="bold">{metric.value}</Text>
								<Text size="small" className="text-muted">
									{metric.title}
								</Text>
							</View>
						</Card>
					))}
				</View>
			))}
		</View>
	);
}
