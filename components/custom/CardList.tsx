import { Feather } from "@expo/vector-icons";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export type CardListRowVariant = "default" | "negative" | "positive";

export function CardListGap(props: React.ComponentProps<typeof View>) {
	const { className, ...rest } = props;
	return <View className={cn("my-1", className)} {...rest} />;
}

export function CardListSeparator(props: React.ComponentProps<typeof View>) {
	const { className, ...rest } = props;
	return (
		<View className={cn("h-px w-full bg-border-muted", className)} {...rest} />
	);
}

const itemValueVariant = tva({
	base: "",
	variants: {
		variant: {
			default: "",
			negative: "",
			positive: "",
		},
		important: {
			true: "",
			false: "",
		},
	},
	compoundVariants: [
		{
			variant: "default",
			important: true,
			class: "",
		},
		{
			variant: "default",
			important: false,
			class: "text-zinc-700",
		},
		{
			variant: "negative",
			important: true,
			class: "text-red-600",
		},
		{
			variant: "negative",
			important: false,
			class: "text-red-500",
		},
		{
			variant: "positive",
			important: true,
			class: "text-green-600",
		},
		{
			variant: "positive",
			important: false,
			class: "text-green-500",
		},
	],
});

export function CardListGroup(props: React.ComponentProps<typeof View>) {
	const { children, className, ...rest } = props;
	return (
		<View className={cn("gap-1", className)} {...rest}>
			{children}
		</View>
	);
}

export type CardListItemProps = React.ComponentProps<typeof View> & {
	id?: string;
	type?: "row";
	/** Primary (left) text. */
	label?: string;
	/** Secondary (left) text, rendered under the label for two-line rows. */
	description?: string;
	/** Optional middle value/text for 3-column rows (e.g. quantity, visits). */
	middleValue?: string;
	/** Custom node for the middle slot (overrides `middleValue`). */
	middle?: React.ReactNode;
	/** Class name for middle text. */
	middleClassName?: string;
	/** Container class name for middle column. */
	middleContainerClassName?: string;
	/** Container class name for left column. */
	leftContainerClassName?: string;
	/** Container class name for right column. */
	rightContainerClassName?: string;
	/** Right value text for the common label/value row. */
	value?: string;
	/** Secondary right text stacked above the value (e.g. 'Jumlah Transaksi: 5'). */
	subValue?: string;
	/** Alias for subValue. */
	rightDescription?: string;
	/** Custom class name for subValue text. */
	subValueClassName?: string;
	/** Custom node for the right slot (overrides `value`). */
	right?: React.ReactNode;
	/** Custom class name for the left label text. */
	labelClassName?: string;
	/** Custom font weight for the left label text. */
	labelWeight?: "regular" | "bold" | "medium" | "semibold";
	/** Custom class name for the right value text. */
	valueClassName?: string;
	/** Proportional flex ratio [left, middle, right] for 3-column layout. Defaults to [4.2, 2.6, 3.2] when middle is present. */
	colFlex?: [number, number, number];
	important?: boolean;
	variant?: CardListRowVariant;
	sub?: boolean;
	/** Render a divider above this item (works anywhere in a list). */
	separator?: boolean;
	/** Fully custom row — replaces the default label/value layout. */
	render?: () => React.ReactNode;
};

const DEFAULT_3COL_FLEX: [number, number, number] = [4.2, 2.6, 3.2];

export function CardListItem(props: CardListItemProps) {
	const {
		children,
		className,
		label,
		description,
		middleValue,
		middle,
		middleClassName,
		middleContainerClassName,
		leftContainerClassName,
		rightContainerClassName,
		value,
		subValue,
		rightDescription,
		subValueClassName,
		right,
		labelClassName,
		labelWeight,
		valueClassName,
		colFlex,
		variant = "default",
		important = false,
		sub = false,
		separator = false,
		render,
		...rest
	} = props;

	const secondaryValue = subValue ?? rightDescription;

	const divider = separator ? (
		<View className="h-px w-full bg-border-muted" />
	) : null;

	if (render) {
		return (
			<>
				{divider}
				{render()}
			</>
		);
	}

	const hasMiddle = middle !== undefined || middleValue !== undefined;
	const flexRatio = colFlex ?? (hasMiddle ? DEFAULT_3COL_FLEX : undefined);

	return (
		<>
			{divider}
			<View
				className={cn(
					"flex-row items-center justify-between gap-3",
					sub && "-mt-2",
					className,
				)}
				{...rest}
			>
				<View
					style={flexRatio ? { flex: flexRatio[0] } : undefined}
					className={cn(
						flexRatio ? "min-w-0 pr-1" : "flex-1",
						"gap-0.5",
						leftContainerClassName,
					)}
				>
					<Text
						className={cn(
							important ? "text-zinc-700" : "text-zinc-500",
							labelClassName,
						)}
						size="small"
						w={labelWeight ?? (important ? "medium" : "regular")}
					>
						{label}
					</Text>
					{description && (
						<Text className="text-subtle" size="small">
							{description}
						</Text>
					)}
				</View>

				{hasMiddle && (
					<View
						style={flexRatio ? { flex: flexRatio[1] } : undefined}
						className={cn(
							"items-start justify-center pr-1",
							middleContainerClassName,
						)}
					>
						{middle ?? (
							<Text
								className={cn("text-zinc-700", middleClassName)}
								size="small"
								w="medium"
								numberOfLines={1}
							>
								{middleValue}
							</Text>
						)}
					</View>
				)}

				<View
					style={flexRatio ? { flex: flexRatio[2] } : undefined}
					className={cn("items-end justify-center", rightContainerClassName)}
				>
					{right ??
						(secondaryValue ? (
							<View className="items-end gap-0.5">
								<Text
									className={cn("text-zinc-700", subValueClassName)}
									size="small"
								>
									{secondaryValue}
								</Text>
								<Text
									className={cn(
										itemValueVariant({ variant, important }),
										valueClassName,
									)}
									size="small"
									w={important ? "semibold" : "medium"}
								>
									{value}
								</Text>
							</View>
						) : (
							<Text
								className={cn(
									itemValueVariant({ variant, important }),
									valueClassName,
								)}
								size="small"
								w={important ? "semibold" : "medium"}
							>
								{value}
							</Text>
						))}
				</View>
			</View>
		</>
	);
}

export type CardListSubGroupProps = React.ComponentProps<typeof View> & {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	header?: React.ReactNode;
	variant?: "card" | "plain";
	colFlex?: [number, number, number];
	separator?: boolean;
};

export function CardListSubGroup(props: CardListSubGroupProps) {
	const {
		children,
		className,
		title,
		description,
		action,
		header,
		variant = "card",
		separator = false,
		...rest
	} = props;

	const divider = separator ? (
		<View className="h-px w-full bg-border-muted" />
	) : null;

	const isCard = variant === "card";

	return (
		<>
			{divider}
			<View
				className={cn(
					isCard
						? "rounded-xl border border-border-muted bg-white p-3 gap-2.5"
						: "gap-2",
					className,
				)}
				{...rest}
			>
				{header ??
					(title ? (
						<View className="flex-row items-center justify-between">
							<View className="gap-0.5">
								<Text size="small" w="bold">
									{title}
								</Text>
								{description && (
									<Text size="small" className="text-subtle">
										{description}
									</Text>
								)}
							</View>
							{action}
						</View>
					) : null)}
				{children}
			</View>
		</>
	);
}

export const CardListSubCard = CardListSubGroup;

export function CardListTitle(
	props: React.ComponentProps<typeof View> & {
		title: string;
		subtitle?: string;
		icon?: React.ReactNode;
		action?: React.ReactNode;
		/** Bleed the band to the card's top edge (set automatically for the first title). */
		bleedTop?: boolean;
		collapsible?: boolean;
		isExpanded?: boolean;
		onToggle?: () => void;
	},
) {
	const {
		children,
		className,
		title,
		subtitle,
		icon,
		action,
		bleedTop,
		collapsible = false,
		isExpanded = true,
		onToggle,
		...rest
	} = props;

	const Container = collapsible ? Pressable : View;
	const containerProps = collapsible
		? { onPress: onToggle, activeOpacity: 0.8 }
		: {};

	return (
		<Container
			{...containerProps}
			className={cn(
				"-mx-3 flex-row items-center justify-between gap-3 bg-primary-500/10 px-3 py-3",
				bleedTop && "-mt-3",
				collapsible && "active:opacity-80",
				className,
			)}
			{...rest}
		>
			<View className="flex-1 flex-row items-center gap-3">
				{icon}
				<View className="flex-1">
					<Text
						className={subtitle ? "" : "text-primary-500"}
						size={subtitle ? "small" : "normal"}
						w={subtitle ? "bold" : "semibold"}
					>
						{title}
					</Text>
					{subtitle && (
						<Text className="text-zinc-500 mt-0.5" size="small">
							{subtitle}
						</Text>
					)}
				</View>
			</View>
			{action ? (
				action
			) : collapsible ? (
				<Feather
					name={isExpanded ? "chevron-down" : "chevron-right"}
					size={18}
					color="#94A3B8"
				/>
			) : null}
		</Container>
	);
}

export type CardListCollapsibleProps = {
	title: string;
	subtitle?: string;
	icon?: React.ReactNode;
	action?: React.ReactNode;
	defaultExpanded?: boolean;
	isExpanded?: boolean;
	onToggle?: () => void;
	children?: React.ReactNode;
	className?: string;
	headerClassName?: string;
};

export function CardListCollapsible(props: CardListCollapsibleProps) {
	const {
		title,
		subtitle,
		icon,
		action,
		defaultExpanded = true,
		isExpanded: controlledExpanded,
		onToggle: controlledOnToggle,
		children,
		className,
		headerClassName,
	} = props;

	const [uncontrolledExpanded, setUncontrolledExpanded] =
		React.useState(defaultExpanded);
	const isControlled = controlledExpanded !== undefined;
	const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;

	const handleToggle = () => {
		if (isControlled) {
			controlledOnToggle?.();
		} else {
			setUncontrolledExpanded((prev) => !prev);
		}
	};

	return (
		<CardList
			className={cn(
				"overflow-hidden rounded-xl bg-white shadow-main border border-zinc-100",
				!expanded && "gap-0 pb-0",
				className,
			)}
		>
			<CardListTitle
				title={title}
				subtitle={subtitle}
				icon={icon}
				action={action}
				collapsible
				isExpanded={expanded}
				onToggle={handleToggle}
				bleedTop
				className={cn(
					"border border-primary-500/20 bg-primary-500/10",
					!expanded && "-mb-3 rounded-xl",
					expanded && "rounded-t-xl border-b border-primary-500/20",
					headerClassName,
				)}
			/>
			{expanded && children}
		</CardList>
	);
}

export type CardListSubGroupConfig = {
	id?: string;
	type: "group";
	title?: string;
	description?: string;
	action?: React.ReactNode;
	variant?: "card" | "plain";
	separator?: boolean;
	rows: CardListItemProps[];
	colFlex?: [number, number, number];
	className?: string;
};

export type CardListRowConfig = CardListItemProps & {
	type?: "row";
};

export type CardListEntry = CardListRowConfig | CardListSubGroupConfig;

function isCardListSubGroup(
	entry: CardListEntry,
): entry is CardListSubGroupConfig {
	return "type" in entry && entry.type === "group";
}

/**
 * Declarative section: sequential list of rows and/or sub-groups, or a custom `render` for the body.
 */
export type CardListSection = {
	id?: string;
	title: string;
	/** Custom label to display in the filter sheet if different from card title. */
	filterLabel?: string;
	rows?: CardListEntry[];
	/** Optional flex ratio [left, middle, right] applied to all 3-column rows in this section. */
	colFlex?: [number, number, number];
	/** Replaces the card body (rendered under the title band). */
	render?: () => React.ReactNode;
};

/**
 * Renders an array of sections as cards. This is the high-level entry point —
 * build an array of `CardListSection` and render it directly.
 */
export function CardListSections(props: { sections: CardListSection[] }) {
	const { sections } = props;

	return (
		<>
			{sections.map((section) => (
				<CardList key={section.id ?? section.title}>
					<CardListTitle title={section.title} />
					{section.render
						? section.render()
						: section.rows?.map((entry, idx) => {
								if (isCardListSubGroup(entry)) {
									return (
										<CardListSubGroup
											key={entry.id ?? `${entry.title ?? "group"}-${idx}`}
											title={entry.title}
											description={entry.description}
											action={entry.action}
											variant={entry.variant}
											className={entry.className}
											colFlex={entry.colFlex ?? section.colFlex}
											separator={entry.separator}
										>
											{entry.rows.map((row, rIdx) => (
												<CardListItem
													key={row.id ?? `${row.label ?? "subrow"}-${rIdx}`}
													colFlex={
														row.colFlex ?? entry.colFlex ?? section.colFlex
													}
													{...row}
												/>
											))}
										</CardListSubGroup>
									);
								}

								return (
									<CardListItem
										key={entry.id ?? `${entry.label ?? "row"}-${idx}`}
										colFlex={entry.colFlex ?? section.colFlex}
										{...entry}
									/>
								);
							})}
				</CardList>
			))}
		</>
	);
}

/**
 * Card container. The title band bleeds to the card edges (the first one also
 * to the top); rows are spaced by the container `gap` and inset by its padding.
 */
export default function CardList(props: React.ComponentProps<typeof View>) {
	const { children, className, ...rest } = props;

	const items = React.Children.toArray(children);
	const first = items[0];
	const isFirstTitle =
		React.isValidElement(first) && first.type === CardListTitle;

	const content = isFirstTitle
		? [
				React.cloneElement(
					first as React.ReactElement<{ bleedTop?: boolean }>,
					{ bleedTop: true },
				),
				...items.slice(1),
			]
		: items;

	return (
		<View
			className={cn(
				"overflow-hidden rounded-xl border border-surface-muted bg-white p-3 shadow-main",
				"gap-3",
				className,
			)}
			{...rest}
		>
			{content}
		</View>
	);
}

export type CardListFilterOption = {
	id: string;
	label: string;
};

export type CardListFilterSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	sections: CardListSection[];
	selectedIds: string[];
	onApply: (selectedIds: string[]) => void;
	onReset?: () => void;
	title?: string;
	subtitle?: string;
};

/**
 * Filter sheet scaffold for CardList sections.
 * Displays checkbox cards for each section to filter visible sections on the screen.
 */
export function CardListFilterSheet({
	isOpen,
	onClose,
	sections,
	selectedIds,
	onApply,
	onReset,
	title = "Opsi Filter",
	subtitle = "Filter Berdasarkan Laporan",
}: CardListFilterSheetProps) {
	const [tempSelected, setTempSelected] = React.useState<string[]>(selectedIds);
	const selectedIdsKey = JSON.stringify(selectedIds);
	const [previousProps, setPreviousProps] = React.useState({
		isOpen,
		selectedIdsKey,
	});

	// A new array with the same IDs must not discard an in-progress draft.
	if (
		previousProps.isOpen !== isOpen ||
		previousProps.selectedIdsKey !== selectedIdsKey
	) {
		setPreviousProps({ isOpen, selectedIdsKey });
		if (isOpen) {
			setTempSelected(selectedIds);
		}
	}

	const options = React.useMemo<CardListFilterOption[]>(
		() =>
			sections.map((s) => ({
				id: s.id ?? s.title,
				label: s.filterLabel ?? s.title,
			})),
		[sections],
	);

	const toggleOption = (id: string) => {
		setTempSelected((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleReset = () => {
		const allIds = options.map((opt) => opt.id);
		setTempSelected(allIds);
		onReset?.();
	};

	const handleApply = () => {
		onApply(tempSelected);
		onClose();
	};

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="max-h-[85vh] px-4 pb-6 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				{title ? (
					<View className="w-full pb-3 pt-1">
						<Text size="normal" w="bold" className="text-center">
							{title}
						</Text>
					</View>
				) : null}

				{subtitle ? (
					<View className="w-full gap-3 pb-2 pt-1">
						<Text size="small" w="bold">
							{subtitle}
						</Text>
					</View>
				) : null}

				<ScrollView
					showsVerticalScrollIndicator={false}
					className="max-h-[50vh] w-full"
					contentContainerStyle={{ gap: 10 }}
				>
					{options.map((option) => {
						const isSelected = tempSelected.includes(option.id);
						return (
							<Pressable
								key={option.id}
								onPress={() => toggleOption(option.id)}
								className={cn(
									"flex-row items-center gap-3 rounded-xl border px-3.5 py-3.5",
									isSelected
										? "border-primary-500 bg-primary-50/60"
										: "border-zinc-200 bg-white",
								)}
							>
								<View
									className={cn(
										"h-5 w-5 items-center justify-center rounded",
										isSelected
											? "bg-primary-500"
											: "border border-zinc-300 bg-white",
									)}
								>
									{isSelected ? (
										<Feather name="check" size={13} color={Colors.zinc[50]} />
									) : null}
								</View>
								<Text
									size="small"
									w={isSelected ? "semibold" : "regular"}
									className={cn(
										isSelected ? "text-primary-900" : "text-zinc-800",
									)}
								>
									{option.label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>

				<View className="w-full flex-row items-center gap-3 pt-4">
					<Button
						onPress={handleReset}
						variant="outline"
						action="secondary"
						size="lg"
						className="flex-1"
					>
						<ButtonText>Reset</ButtonText>
					</Button>

					<Button onPress={handleApply} size="lg" className="flex-1">
						<ButtonText>Terapkan</ButtonText>
					</Button>
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}

/**
 * Hook for managing CardList section filtering without re-render cascades.
 */
export function useCardListFilter(
	sectionsInput: CardListSection[] | CardListSection[][],
	config?: {
		title?: string;
		subtitle?: string;
		initialSelected?: "all" | string[];
	},
) {
	const flattenedSections = React.useMemo(() => {
		if (sectionsInput.length === 0) return [];
		if (Array.isArray(sectionsInput[0])) {
			return (sectionsInput as CardListSection[][]).flat();
		}
		return sectionsInput as CardListSection[];
	}, [sectionsInput]);

	// Stable key based on all section IDs
	const sectionIdsKey = React.useMemo(() => {
		return JSON.stringify(flattenedSections.map((s) => s.id ?? s.title));
	}, [flattenedSections]);

	const allIds = React.useMemo(() => {
		return flattenedSections.map((s) => s.id ?? s.title);
	}, [flattenedSections]);

	const [selectedIds, setSelectedIds] = React.useState<string[]>(() => {
		if (Array.isArray(config?.initialSelected)) return config.initialSelected;
		return allIds;
	});

	const [previousSectionIdsKey, setPreviousSectionIdsKey] =
		React.useState(sectionIdsKey);
	// Apply a new report identity before rendering its filtered sections.
	if (previousSectionIdsKey !== sectionIdsKey) {
		setPreviousSectionIdsKey(sectionIdsKey);
		setSelectedIds(allIds);
	}

	const [isOpen, setIsOpen] = React.useState(false);

	const open = React.useCallback(() => setIsOpen(true), []);
	const close = React.useCallback(() => setIsOpen(false), []);

	const apply = React.useCallback((newSelectedIds: string[]) => {
		setSelectedIds(newSelectedIds);
	}, []);

	const reset = React.useCallback(() => {
		setSelectedIds(allIds);
	}, [allIds]);

	const filterSections = React.useCallback(
		(sections: CardListSection[]) =>
			sections.filter((sec) => selectedIds.includes(sec.id ?? sec.title)),
		[selectedIds],
	);

	const isFiltered = selectedIds.length < allIds.length;

	const filterSheetProps: CardListFilterSheetProps = React.useMemo(
		() => ({
			isOpen,
			onClose: close,
			sections: flattenedSections,
			selectedIds,
			onApply: apply,
			onReset: reset,
			title: config?.title,
			subtitle: config?.subtitle,
		}),
		[
			isOpen,
			close,
			flattenedSections,
			selectedIds,
			apply,
			reset,
			config?.title,
			config?.subtitle,
		],
	);

	return {
		isOpen,
		open,
		close,
		selectedIds,
		setSelectedIds,
		apply,
		reset,
		filterSections,
		isFiltered,
		filterSheetProps,
	};
}
