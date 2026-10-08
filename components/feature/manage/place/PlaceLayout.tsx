import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { PanResponder, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { PLACE_KINDS } from "@/constants/data/manage/place";
import { movePlace } from "@/lib/manage/place";
import { cn } from "@/lib/utils";
import type { ManagedPlace } from "@/types/ui/manage/place";

function LayoutTile({
	place,
	index,
	cellWidth,
	onMove,
	onSelect,
	onDragging,
	selected,
	outletActive,
}: {
	place: ManagedPlace;
	index: number;
	cellWidth: number;
	onMove: (index: number, dx: number, dy: number) => void;
	onSelect: (id: string) => void;
	onDragging: (dragging: boolean) => void;
	selected: boolean;
	outletActive: boolean;
}) {
	const offset = useSharedValue({ x: 0, y: 0 });
	const animated = useAnimatedStyle(() => {
		const { x, y } = offset.get();
		return {
			transform: [{ translateX: x }, { translateY: y }],
			zIndex: x || y ? 10 : 0,
		};
	});
	const responder = React.useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onPanResponderGrant: () => {
					onSelect(place.id);
					onDragging(true);
				},
				onPanResponderMove: (_event, gesture) => {
					offset.set({ x: gesture.dx, y: gesture.dy });
				},
				onPanResponderRelease: (_event, gesture) => {
					onMove(
						index,
						Math.round(gesture.dx / cellWidth),
						Math.round(gesture.dy / 136),
					);
					offset.set({ x: 0, y: 0 });
					onDragging(false);
				},
				onPanResponderTerminate: () => {
					offset.set({ x: 0, y: 0 });
					onDragging(false);
				},
				onPanResponderTerminationRequest: () => false,
			}),
		[cellWidth, index, onDragging, onMove, onSelect, offset, place.id],
	);
	const kind = PLACE_KINDS.find((item) => item.value === place.kind);
	return (
		<Animated.View
			{...responder.panHandlers}
			accessibilityRole="button"
			accessibilityLabel={`Pindahkan ${place.name}`}
			className={cn(
				"absolute items-center justify-center gap-2 rounded-lg border p-2",
				place.active && outletActive
					? "border-primary-200 bg-primary-50"
					: "border-border-muted bg-surface-muted",
				selected && "border-primary",
			)}
			style={[
				{
					left: (index % 3) * cellWidth + 8,
					top: Math.floor(index / 3) * 136 + 8,
					width: cellWidth - 16,
					height: 112,
				},
				animated,
			]}
		>
			<Feather name={kind?.icon ?? "grid"} size={24} color={Colors.primary} />
			<Text size="small" w="medium" numberOfLines={2} className="text-center">
				{place.name}
			</Text>
			<Text size="small" numberOfLines={1} className="text-center text-muted">
				{place.capacity} {kind?.unit}
			</Text>
		</Animated.View>
	);
}

export default function PlaceLayout({
	places,
	order,
	onChange,
	onDragging,
	outletActive,
}: {
	places: ManagedPlace[];
	order: string[];
	onChange: (order: string[]) => void;
	onDragging: (dragging: boolean) => void;
	outletActive: boolean;
}) {
	const [width, setWidth] = React.useState(0);
	const [selected, setSelected] = React.useState(order[0] ?? "");
	const move = React.useCallback(
		(index: number, dx: number, dy: number) =>
			onChange(movePlace(order, index, dx, dy)),
		[onChange, order],
	);
	const directions = [
		{ label: "Geser ke kiri", icon: "arrow-left", dx: -1, dy: 0 },
		{ label: "Geser ke atas", icon: "arrow-up", dx: 0, dy: -1 },
		{ label: "Geser ke bawah", icon: "arrow-down", dx: 0, dy: 1 },
		{ label: "Geser ke kanan", icon: "arrow-right", dx: 1, dy: 0 },
	] as const;
	const selectedId = order.includes(selected) ? selected : (order[0] ?? "");
	const index = order.indexOf(selectedId);
	return (
		<View className="gap-3">
			<Text size="small" className="text-muted">
				Drag & drop untuk mengatur posisi
			</Text>
			<View
				testID="place-layout-board"
				onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
				className="relative overflow-hidden rounded-xl border border-border-muted bg-white"
				style={{ height: Math.max(1, Math.ceil(order.length / 3)) * 136 + 16 }}
			>
				{width > 0 &&
					order.map((id, position) => {
						const place = places.find((item) => item.id === id);
						return (
							place && (
								<LayoutTile
									key={id}
									place={place}
									index={position}
									cellWidth={width / 3}
									onMove={move}
									onSelect={setSelected}
									onDragging={onDragging}
									selected={selectedId === id}
									outletActive={outletActive}
								/>
							)
						);
					})}
			</View>
			{!places.length ? (
				<Text size="normal" className="text-center text-muted">
					Belum ada tempat di area ini.
				</Text>
			) : (
				<View className="gap-3">
					<SingleSelect
						items={places.map((place) => ({
							value: place.id,
							label: place.name,
						}))}
						value={selectedId}
						onValueChange={setSelected}
						label="Pilih tempat untuk dipindahkan"
					/>
					<View className="flex-row justify-center gap-3">
						{directions.map((direction) => {
							const disabled =
								index < 0 ||
								movePlace(order, index, direction.dx, direction.dy) === order;
							return (
								<Pressable
									key={direction.label}
									accessibilityRole="button"
									accessibilityLabel={direction.label}
									accessibilityState={{ disabled }}
									disabled={disabled}
									onPress={() => move(index, direction.dx, direction.dy)}
									className={cn(
										"size-12 items-center justify-center rounded-lg border border-border-muted",
										disabled ? "bg-surface-muted opacity-40" : "bg-white",
									)}
								>
									<Feather
										name={direction.icon}
										size={20}
										color={Colors.primary}
									/>
								</Pressable>
							);
						})}
					</View>
					<Text size="small" className="text-center text-muted">
						Pilih tempat lalu gunakan panah untuk menggeser satu posisi.
					</Text>
				</View>
			)}
		</View>
	);
}
