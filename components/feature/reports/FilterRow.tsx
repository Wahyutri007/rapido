import React from "react";
import { View } from "react-native";
import { useStoresQuery } from "@/api/hooks/stores";
import BouncyPressable from "@/components/common/BouncyPressable";
import SingleSelect from "@/components/common/SingleSelect";
import { CalendarIcon, FilterIcon, StoreIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { cn, tw } from "@/lib/utils";

const PERIOD_OPTIONS = ["Hari Ini", "Minggu Ini", "Bulan Ini", "Tahun Ini"];

export type FilterRowProps = {
	storeId?: string;
	onStoreChange?: (storeId: string) => void;
	period?: string;
	onPeriodChange?: (period: string) => void;
	onFilterPress?: () => void;
	className?: string;
};

/**
 * Shared filter row for report group screens: store select + period select + filter button.
 * Works controlled (`storeId`/`period`) or uncontrolled (internal state).
 */
export default function FilterRow(props: FilterRowProps) {
	const {
		storeId,
		onStoreChange,
		period,
		onPeriodChange,
		onFilterPress,
		className,
	} = props;

	const storesQuery = useStoresQuery();

	const [internalStore, setInternalStore] = React.useState("");
	const [internalPeriod, setInternalPeriod] = React.useState(PERIOD_OPTIONS[0]);

	const selectedStore = storeId ?? internalStore;
	const selectedPeriod = period ?? internalPeriod;

	const handleStoreChange = onStoreChange ?? setInternalStore;
	const handlePeriodChange = onPeriodChange ?? setInternalPeriod;

	const storeItems = React.useMemo(
		() => [
			{ value: "", label: "Semua Toko" },
			...(storesQuery.data?.map((store) => ({
				value: store.id,
				label: store.name,
			})) ?? []),
		],
		[storesQuery.data],
	);

	const periodItems = React.useMemo(
		() => PERIOD_OPTIONS.map((option) => ({ value: option, label: option })),
		[],
	);

	return (
		<View className={cn("flex-row items-center gap-3.5", className)}>
			<SingleSelect
				className="flex-1 border-border-muted"
				size="md"
				items={storeItems}
				value={selectedStore}
				onValueChange={handleStoreChange}
				placeholder="Semua Toko"
				label="Pilih Toko"
				leftIcon={<StoreIcon size={tw(3.5)} color={Colors.zinc[400]} />}
			/>

			<SingleSelect
				className="flex-1 border-border-muted"
				size="md"
				items={periodItems}
				value={selectedPeriod}
				onValueChange={handlePeriodChange}
				placeholder="Hari Ini"
				label="Pilih Periode"
				leftIcon={<CalendarIcon size={tw(4)} color={Colors.zinc[400]} />}
			/>

			<BouncyPressable
				onPress={onFilterPress}
				activeScale={0.92}
				hapticType="light"
				className="h-10 w-12 items-center justify-center rounded-lg bg-primary-500 active:bg-primary-600"
			>
				<FilterIcon size={tw(5)} color={Colors.zinc[50]} />
			</BouncyPressable>
		</View>
	);
}
