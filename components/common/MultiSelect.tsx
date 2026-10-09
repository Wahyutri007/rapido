import { Entypo, Feather } from "@expo/vector-icons";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { Pressable, View } from "react-native";
import SearchBar from "@/components/common/SearchBar";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetScrollView,
} from "../ui/actionsheet";
import Text from "./Text";

const multiSelectTriggerStyle = tva({
	base: "border-zinc-200 rounded-lg px-3 bg-zinc-100 flex-row overflow-hidden content-center items-center justify-between",
	variants: {
		size: {
			xl: "h-11",
			lg: "h-11",
			md: "h-10",
			sm: "h-9",
		},
		variant: {
			underlined: "rounded-none border-b border-zinc-200",
			outline: "border border-zinc-200",
			rounded: "rounded-lg border-0",
		},
	},
});

export type MultiSelectItem = {
	label: string;
	value: string;
	description?: string;
	icon?: React.ReactNode;
};

export type MultiSelectProps = {
	items: MultiSelectItem[];
	selectedValues: string[];
	onValueChange: (values: string[]) => void;
	placeholder?: string;
	label?: string;
	searchPlaceholder?: string;
	itemUnit?: string;
	variant?: "underlined" | "outline" | "rounded";
	size?: "xl" | "lg" | "md" | "sm";
	className?: string;
	renderIcon?: (item: MultiSelectItem) => React.ReactNode;
};

export function MultiSelect({
	items,
	selectedValues,
	onValueChange,
	placeholder = "Select items",
	label = "Pilih Opsi",
	searchPlaceholder,
	itemUnit,
	variant = "rounded",
	size = "xl",
	className,
	renderIcon,
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [draftSelected, setDraftSelected] = React.useState<string[]>([]);
	const [search, setSearch] = React.useState("");
	const selectionKey = JSON.stringify(selectedValues);
	const [previousSelectionKey, setPreviousSelectionKey] =
		React.useState(selectionKey);

	// External resets replace the draft before children render. Fresh arrays
	// with the same values must not erase edits in the open sheet.
	if (previousSelectionKey !== selectionKey) {
		setPreviousSelectionKey(selectionKey);
		setDraftSelected([...selectedValues]);
	}

	const handleOpen = () => {
		setDraftSelected([...selectedValues]);
		setSearch("");
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
		setSearch("");
	};

	const handleSave = () => {
		onValueChange(draftSelected);
		setIsOpen(false);
		setSearch("");
	};

	const handleTogglePill = (value: string) => {
		onValueChange(selectedValues.filter((v) => v !== value));
	};

	const handleToggleDraftItem = (value: string) => {
		setDraftSelected((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);
	};

	const unit =
		itemUnit ??
		(label.toLowerCase().startsWith("pilih ")
			? label.slice(6).toLowerCase()
			: "item");

	const filteredItems = React.useMemo(() => {
		if (!search.trim()) return items;
		const query = search.toLowerCase();
		return items.filter(
			(item) =>
				item.label.toLowerCase().includes(query) ||
				item.description?.toLowerCase().includes(query),
		);
	}, [items, search]);

	const isAllSelected =
		filteredItems.length > 0 &&
		filteredItems.every((item) => draftSelected.includes(item.value));

	const handleToggleAll = () => {
		setDraftSelected((prev) => {
			const filteredSet = new Set(filteredItems.map((i) => i.value));
			if (filteredItems.every((item) => prev.includes(item.value))) {
				return prev.filter((v) => !filteredSet.has(v));
			}
			return Array.from(new Set([...prev, ...filteredSet]));
		});
	};

	const selectedItemsLabel = React.useMemo(() => {
		if (selectedValues.length === 0) return placeholder;
		return `${selectedValues.length} dipilih`;
	}, [selectedValues, placeholder]);

	return (
		<View className="gap-2">
			<Pressable
				onPress={handleOpen}
				className={cn(multiSelectTriggerStyle({ variant, size }), className)}
			>
				<Text
					size="normal"
					className={selectedValues.length === 0 ? "text-muted" : undefined}
				>
					{selectedItemsLabel}
				</Text>
				<Entypo name="chevron-down" size={20} color={Colors.zinc[400]} />
			</Pressable>

			{/* Selected Items Pills */}
			{selectedValues.length > 0 && (
				<View className="flex-row flex-wrap gap-2">
					{selectedValues.map((value) => {
						const item = items.find((i) => i.value === value);
						return (
							<Pressable
								key={value}
								onPress={() => handleTogglePill(value)}
								className="flex-row items-center rounded-full bg-zinc-100 px-3 py-1"
							>
								<Text size="small" w="medium" className="mr-1">
									{item?.label ?? value}
								</Text>
								<Entypo name="cross" size={12} color={Colors.zinc[700]} />
							</Pressable>
						);
					})}
				</View>
			)}

			<Actionsheet isOpen={isOpen} onClose={handleClose}>
				<ActionsheetBackdrop />
				<ActionsheetContent className="px-4 pb-6 pt-2">
					<ActionsheetDragIndicatorWrapper className="mb-2">
						<ActionsheetDragIndicator className="h-1 w-10 rounded-full bg-zinc-300" />
					</ActionsheetDragIndicatorWrapper>

					{/* Modal Header */}
					<View className="w-full flex-row items-center justify-between pb-3">
						<Pressable onPress={handleClose} hitSlop={8}>
							<Text size="body" w="medium" className="text-primary">
								Batal
							</Text>
						</Pressable>
						<Text size="body" w="bold">
							{label}
						</Text>
						<Pressable onPress={handleSave} hitSlop={8}>
							<Text size="body" w="semibold" className="text-primary">
								Selesai
							</Text>
						</Pressable>
					</View>

					<View className="mb-3 h-px w-full bg-zinc-100" />

					{/* Search Bar */}
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder={searchPlaceholder ?? `Cari ${unit}...`}
						className="mb-3 bg-white"
						debounce={false}
					/>

					{/* Select All Row */}
					<Pressable
						onPress={handleToggleAll}
						className="mb-2 w-full flex-row items-center justify-between px-2 py-1.5"
					>
						<View className="flex-row items-center gap-3">
							<View
								className={cn(
									"h-5 w-5 items-center justify-center rounded-md border",
									isAllSelected
										? "border-primary bg-primary"
										: "border-zinc-300 bg-white",
								)}
							>
								{isAllSelected && (
									<Feather name="check" size={14} color="#ffffff" />
								)}
							</View>
							<Text size="normal" w="medium">
								Pilih Semua
							</Text>
						</View>
						<Text size="small" className="text-muted">
							{filteredItems.length} {unit}
						</Text>
					</Pressable>

					{/* Items List */}
					<ActionsheetScrollView
						className="max-h-[60vh] w-full"
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						{filteredItems.length === 0 ? (
							<View className="items-center justify-center py-8">
								<Text size="normal" className="text-muted">
									Tidak ada {unit} ditemukan
								</Text>
							</View>
						) : (
							filteredItems.map((item) => {
								const isChecked = draftSelected.includes(item.value);
								const iconNode = item.icon ?? renderIcon?.(item);

								return (
									<Pressable
										key={item.value}
										onPress={() => handleToggleDraftItem(item.value)}
										className="mb-2.5 flex-row items-center gap-3 rounded-xl border border-border bg-white p-3.5"
									>
										<View
											className={cn(
												"h-5 w-5 items-center justify-center rounded-md border",
												isChecked
													? "border-primary bg-primary"
													: "border-zinc-300 bg-white",
											)}
										>
											{isChecked && (
												<Feather name="check" size={14} color="#ffffff" />
											)}
										</View>

										{iconNode ? (
											<View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
												{iconNode}
											</View>
										) : null}

										<View className="flex-1 justify-center">
											<Text
												size="normal"
												w="semibold"
												className="leading-tight"
											>
												{item.label}
											</Text>
											{item.description ? (
												<Text
													size="small"
													className="mt-1 leading-tight text-muted"
												>
													{item.description}
												</Text>
											) : null}
										</View>
									</Pressable>
								);
							})
						)}
					</ActionsheetScrollView>
				</ActionsheetContent>
			</Actionsheet>
		</View>
	);
}
