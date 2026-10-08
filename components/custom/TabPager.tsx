import type React from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import Text from "@/components/common/Text";
import { Constants } from "@/constants";
import { cn } from "@/lib/utils";

export type TabItem = {
	key: string;
	label: string;
	component: React.ReactNode;
};

export type TabPagerProps = {
	tabs: TabItem[];
	initialIndex?: number;
	onIndexChange?: (index: number) => void;
	className?: string;
};

export default function TabPager({
	tabs,
	initialIndex = 0,
	onIndexChange,
	className,
}: TabPagerProps) {
	const [activeIndex, setActiveIndex] = useState(initialIndex);
	const pagerRef = useRef<PagerView>(null);
	const scrollViewRef = useRef<ScrollView>(null);

	const handleTabPress = (index: number) => {
		if (index === activeIndex) return;
		setActiveIndex(index);
		pagerRef.current?.setPage(index);
		onIndexChange?.(index);
	};

	const onPageSelected = (e: any) => {
		const index = e.nativeEvent.position;
		if (index !== activeIndex) {
			setActiveIndex(index);
			onIndexChange?.(index);
		}
	};

	// Ensure initialIndex is respected if it changes externally
	useEffect(() => {
		if (
			initialIndex !== activeIndex &&
			initialIndex >= 0 &&
			initialIndex < tabs.length
		) {
			setActiveIndex(initialIndex);
			pagerRef.current?.setPage(initialIndex);
		}
	}, [initialIndex, tabs.length]);

	return (
		<View className={cn("flex-1 bg-white", className)}>
			{/* Scrollable Tab Bar */}
			<View
				className="w-full border-b border-gray-200 bg-white"
				style={{ zIndex: 10 }}
			>
				<ScrollView
					ref={scrollViewRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					className="h-12"
				>
					{tabs.map((tab, index) => {
						const active = activeIndex === index;
						const isFirst = index === 0;
						const isLast = index === tabs.length - 1;

						return (
							<Fragment key={tab.key}>
								{isFirst && <View className="w-4" />}

								<Pressable
									onPress={() => handleTabPress(index)}
									className={cn(
										"h-full items-center justify-center border-b-2 px-1",
										active ? "border-main-500" : "border-transparent",
									)}
									style={{ flex: 1 }}
								>
									<Text
										className={cn("text-xs", {
											"text-primary": active,
											"text-muted": !active,
										})}
										w={active ? "semibold" : "regular"}
									>
										{tab.label}
									</Text>
								</Pressable>

								{!isLast && <View className="w-4" />}

								{isLast && <View className="w-4" />}
							</Fragment>
						);
					})}
				</ScrollView>
			</View>

			{/* Pager View for Swipable Content */}
			<PagerView
				ref={pagerRef}
				style={{ flex: 1 }}
				initialPage={initialIndex}
				onPageSelected={onPageSelected}
			>
				{tabs.map((tab) => (
					<View key={tab.key} style={{ flex: 1 }}>
						{tab.component}
					</View>
				))}
			</PagerView>
		</View>
	);
}
