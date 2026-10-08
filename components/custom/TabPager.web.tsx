import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";
import type { TabPagerProps } from "./TabPager";

export type { TabItem, TabPagerProps } from "./TabPager";

export default function TabPager({
	tabs,
	initialIndex = 0,
	onIndexChange,
	className,
}: TabPagerProps) {
	const [activeIndex, setActiveIndex] = React.useState(initialIndex);
	const [width, setWidth] = React.useState(0);
	const pagerRef = React.useRef<ScrollView>(null);
	const activeRef = React.useRef(initialIndex);
	const scrollTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	React.useEffect(
		() => () => {
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		},
		[],
	);
	React.useEffect(() => {
		if (initialIndex >= 0 && initialIndex < tabs.length) {
			activeRef.current = initialIndex;
			setActiveIndex(initialIndex);
		}
	}, [initialIndex, tabs.length]);
	React.useEffect(() => {
		pagerRef.current?.scrollTo({ x: activeIndex * width, animated: false });
	}, [activeIndex, width]);
	const selectTab = (index: number) => {
		if (index === activeRef.current) return;
		activeRef.current = index;
		setActiveIndex(index);
		onIndexChange?.(index);
	};
	return (
		<View className={cn("flex-1 bg-white", className)}>
			<View className="border-b border-border bg-white">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: 16,
						gap: 16,
					}}
				>
					{tabs.map((tab, index) => (
						<Pressable
							key={tab.key}
							accessibilityRole="tab"
							aria-selected={activeIndex === index}
							onPress={() => selectTab(index)}
							className={cn(
								"h-12 flex-1 items-center justify-center border-b-2 px-1",
								activeIndex === index ? "border-primary" : "border-transparent",
							)}
						>
							<Text
								size="small"
								w={activeIndex === index ? "semibold" : "regular"}
								className={
									activeIndex === index ? "text-primary" : "text-muted"
								}
							>
								{tab.label}
							</Text>
						</Pressable>
					))}
				</ScrollView>
			</View>
			<ScrollView
				ref={pagerRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				className="flex-1"
				onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
				scrollEventThrottle={16}
				onScroll={(event) => {
					if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
					if (width <= 0) return;
					const index = Math.max(
						0,
						Math.min(
							tabs.length - 1,
							Math.round(event.nativeEvent.contentOffset.x / width),
						),
					);
					scrollTimeout.current = setTimeout(() => selectTab(index), 150);
				}}
			>
				{width > 0 &&
					tabs.map((tab) => (
						<View key={tab.key} style={{ width, flexShrink: 0 }}>
							{tab.component}
						</View>
					))}
			</ScrollView>
		</View>
	);
}
