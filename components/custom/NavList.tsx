import Entypo from "@expo/vector-icons/Entypo";
import { type Href, router } from "expo-router";
import type React from "react";
import { Fragment } from "react";
import { Image, type ImageRequireSource, View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import useSearch from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

export type NavListVariant = "default" | "card" | "inventory" | "manage";

export type NavListProps = {
	/**
	 * @deprecated Redundant for static menu lists. Keying falls back to `title`. // TODO: Remove usage
	 */
	id?: string;
	title: string;
	href?: Href;
	withAnchor?: boolean;
	image?: ImageRequireSource;
	imageScale?: number;
	permission?: string;
	icon?: React.ReactNode;
	rightIconOverride?: React.ReactNode;
	iconTone?: "primary" | "muted";
};

export type NavListGroup = {
	/**
	 * @deprecated Redundant for static menu lists. Keying falls back to `title`. // TODO: Remove usage
	 */
	id?: string;
	title: string;
	items: NavListProps[];
};

export function NavListItem(
	props: NavListProps & {
		variant?: NavListVariant;
	},
) {
	const {
		title,
		href,
		image,
		imageScale = 1,
		icon,
		variant,
		rightIconOverride,
	} = props;

	const isCard = variant === "card";

	function handlePress() {
		if (!href) return;
		if (props.withAnchor === undefined) router.push(href);
		else router.push(href, { withAnchor: props.withAnchor });
	}

	if (variant === "manage") {
		return (
			<BouncyPressable
				onPress={handlePress}
				ripple
				hapticType="light"
				disabled={!href}
				accessibilityRole="button"
				accessibilityLabel={title}
				accessibilityState={{ disabled: !href }}
				className="min-h-12 flex-row items-center gap-3 rounded-lg"
			>
				<View
					className={cn(
						"size-8 items-center justify-center rounded-lg",
						props.iconTone === "muted" ? "bg-surface-muted" : "bg-primary-50",
					)}
				>
					{icon}
				</View>
				<Text
					size="normal"
					w="medium"
					className="flex-1 shrink text-foreground"
				>
					{title}
				</Text>
				{rightIconOverride ?? (
					<Entypo name="chevron-right" size={10} color={Colors.zinc[400]} />
				)}
			</BouncyPressable>
		);
	}

	return (
		<BouncyPressable
			onPress={handlePress}
			ripple={true}
			hapticType="light"
			disabled={!href}
			className={cn("w-full flex-row items-center overflow-hidden rounded-lg", {
				"gap-3": !!image,
				"py-2": isCard && !!image,
				"gap-1": !!icon,
				"pl-2 pr-4": isCard,
				"px-3 py-3": !isCard,
			})}
		>
			<View
				className={cn(
					"aspect-square items-center justify-center overflow-hidden rounded-lg bg-primary-100",
					{
						"w-8": !isCard,
						"w-10": isCard,
						"bg-white": image,
					},
				)}
			>
				{image && (
					<Image
						source={image}
						className="size-full"
						resizeMode="cover"
						style={{
							...(variant === "inventory" ? { width: 32, height: 32 } : {}),
							transform: [{ scale: imageScale }],
						}}
					/>
				)}
				{icon}
			</View>
			<View
				className={cn(
					"flex-1 flex-row items-center justify-between",
					variant !== "inventory" && "ml-2",
				)}
			>
				<Text
					className={cn({
						"text-gray-900": isCard,
						"text-foreground": !isCard,
					})}
					size="normal"
					w="medium"
				>
					{title}
				</Text>
				{rightIconOverride ? (
					rightIconOverride
				) : (
					<Entypo name="chevron-right" size={16} color={Colors.zinc[400]} />
				)}
			</View>
		</BouncyPressable>
	);
}

export function NavList(props: {
	groups: NavListGroup[];
	search: string;
	variant?: NavListVariant;
}) {
	const { groups, search, variant = "default" } = props;

	const isCard = variant === "card";

	const { results: filteredItems, isSearching } = useSearch(
		groups.flatMap((group) => group.items),
		search,
		(item) => item.title,
	);

	if (variant === "manage") {
		const visibleGroups = isSearching
			? [{ title: "", items: filteredItems }]
			: groups;
		return (
			<View className="gap-4">
				{visibleGroups.map((group) => (
					<View key={group.id ?? group.title} className="gap-2">
						{group.title !== "" && (
							<Text size="normal" w="semibold" className="text-muted">
								{group.title}
							</Text>
						)}
						<Card density="compact">
							{group.items.length === 0 ? (
								<SearchNotFound text="Tidak ada hasil ditemukan" />
							) : (
								group.items.map((item, index) => (
									<Fragment key={item.id ?? item.title}>
										{index > 0 && <View className="h-px bg-border-muted" />}
										<NavListItem {...item} variant="manage" />
									</Fragment>
								))
							)}
						</Card>
					</View>
				))}
			</View>
		);
	}

	return (
		<View>
			{search !== "" ? (
				<View
					className={cn(
						"overflow-hidden rounded-xl bg-white py-2",
						variant === "card" ? "" : "",
					)}
				>
					{filteredItems.length > 0 ? (
						filteredItems.map((item, index) => {
							const isLast = index === filteredItems.length - 1;

							return (
								<Fragment key={item.id ?? item.title}>
									<NavListItem {...item} variant={variant} />
									{!isLast && (
										<View
											className={cn("h-px bg-gray-100", {
												"mx-2 my-1": variant === "card",
											})}
										/>
									)}
								</Fragment>
							);
						})
					) : (
						<SearchNotFound text="Tidak ada hasil ditemukan" />
					)}
				</View>
			) : (
				groups.map((group) => {
					return (
						<View
							key={group.id ?? group.title}
							className={isCard ? "pb-3" : "pb-4"}
						>
							<Text
								className={isCard ? "text-zinc-500" : "text-muted"}
								size="normal"
								w="semibold"
							>
								{group.title}
							</Text>
							<View
								className={cn("overflow-hidden rounded-xl bg-white", {
									"mt-2 gap-1 border border-zinc-200 py-2": isCard,
									"mt-2 border border-surface-muted shadow-main": !isCard,
								})}
							>
								{group.items.map((item, index) => {
									const isLast = index === group.items.length - 1;

									return (
										<Fragment key={item.id ?? item.title}>
											<NavListItem {...item} variant={variant} />
											{!isLast && (
												<View
													className={cn("h-px", {
														"mx-2 bg-gray-100": isCard,
														"mx-3 bg-border-muted": !isCard,
													})}
												/>
											)}
										</Fragment>
									);
								})}
							</View>
						</View>
					);
				})
			)}
		</View>
	);
}
