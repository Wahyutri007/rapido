import Entypo from "@expo/vector-icons/Entypo";
import { ArrowUpDown } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import SortActionSheet from "@/components/common/SortActionSheet";
import { Colors } from "@/constants/Colors";
import type { SortOption } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { FilterIcon } from "../icons";
import { Input, InputField } from "../ui/input";

const DEFAULT_DEBOUNCE_DELAY_IN_MS = 150;

type SearchBarProps = {
	search: string;
	setSearch: (text: string) => void;

	debounce?: boolean;
	debounceDelay?: number;
	placeholder?: string;

	// Sort props (rebranded from filter)
	withSort?: boolean;
	sortBy?: SortOption;
	onSortChange?: (sort: SortOption) => void;
	onSortPress?: () => void;
	sortActive?: boolean;

	// Backward-compatible filter props
	withFilter?: boolean;
	onFilterPress?: () => void;
	filterActive?: boolean;
};

export default function SearchBar(
	props: React.ComponentProps<typeof Input> & SearchBarProps,
) {
	const {
		search,
		setSearch,
		debounce = true,
		debounceDelay = DEFAULT_DEBOUNCE_DELAY_IN_MS,
		placeholder = "Cari...",

		withSort = false,
		sortBy,
		onSortChange,
		onSortPress,
		sortActive = false,

		withFilter = false,
		onFilterPress,
		filterActive = false,

		size = "xl",
		variant = "outline",
		className,

		...inputProps
	} = props;

	const [inputValue, setInputValue] = React.useState(search);
	const [isSortOpen, setIsSortOpen] = React.useState(false);
	const prevSearchRef = React.useRef(search);

	// Only update inputValue from parent if parent search is cleared or changed externally
	React.useEffect(() => {
		if (search !== prevSearchRef.current) {
			setInputValue(search);
			prevSearchRef.current = search;
		}
	}, [search]);

	React.useEffect(() => {
		if (!debounce) {
			setSearch(inputValue);
			prevSearchRef.current = inputValue;
			return;
		}
		const handler = setTimeout(() => {
			setSearch(inputValue);
			prevSearchRef.current = inputValue;
		}, debounceDelay);
		return () => {
			clearTimeout(handler);
		};
	}, [inputValue, debounce, debounceDelay, setSearch]);

	const handleSortClick = () => {
		if (onSortPress) {
			onSortPress();
		} else if (onSortChange) {
			setIsSortOpen(true);
		}
	};

	const showAction = withSort || withFilter;

	return (
		<>
			<Input
				size={size}
				variant={variant}
				className={cn(
					"items-center rounded-xl shadow-main",
					showAction ? "pl-3.5 pr-1" : "px-4",
					className,
				)}
				{...inputProps}
			>
				<View className="shrink-0 items-center justify-center">
					<Entypo name="magnifying-glass" size={20} color={Colors.zinc[400]} />
				</View>

				<InputField
					placeholder={placeholder}
					value={inputValue}
					onChangeText={setInputValue}
					className="flex-1 shrink text-sm"
					style={{ flexShrink: 1 }}
				/>

				{withSort && (
					<>
						<View className="mx-2 py-2">
							<View className="h-full w-px bg-border" />
						</View>

						<BouncyPressable
							onPress={handleSortClick}
							activeScale={0.96}
							hapticType="light"
							className={cn(
								"mr-1 aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-primary active:opacity-80",
								(sortActive || (sortBy && sortBy !== "newest")) &&
									"bg-primary-600",
							)}
							hitSlop={4}
						>
							<ArrowUpDown color="#FFFFFF" size={18} />
						</BouncyPressable>
					</>
				)}

				{!withSort && withFilter && (
					<>
						<View className="mx-2 py-2">
							<View className="h-full w-px bg-border" />
						</View>

						<BouncyPressable
							onPress={onFilterPress}
							activeScale={0.96}
							hapticType="light"
							className={cn(
								"mr-1 aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 active:opacity-80",
								filterActive && "bg-primary-600",
							)}
							hitSlop={4}
						>
							<FilterIcon color="#FFFFFF" size={20} />
						</BouncyPressable>
					</>
				)}
			</Input>

			{withSort && onSortChange && (
				<SortActionSheet
					isOpen={isSortOpen}
					onClose={() => setIsSortOpen(false)}
					value={sortBy}
					onChange={onSortChange}
				/>
			)}
		</>
	);
}
