import type { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import { Constants } from "@/constants";
import { cn } from "@/lib/utils";

export default function TopTabBar(props: MaterialTopTabBarProps) {
	const { state, navigation, descriptors } = props;

	return (
		<View
			className="absolute top-0 z-10 w-full"
			style={{ paddingTop: Constants.statusBarHeight }}
		>
			<View className="pt-14">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="h-10 bg-white"
					contentContainerStyle={{ flexGrow: 1 }}
				>
					{state.routes.map((route, index) => {
						const { tabBarLabel } = descriptors[route.key].options;

						const label =
							typeof tabBarLabel === "string" ? tabBarLabel : route.name;

						const active = state.index === index;

						function handlePress() {
							const event = navigation.emit({
								type: "tabPress",
								target: route.key,
								canPreventDefault: true,
							});

							if (!active && !event.defaultPrevented) {
								navigation.navigate(route.name);
							}
						}

						return (
							<Pressable
								className={cn(
									"h-full items-center justify-center border-b border-gray-300",
									{
										"border-main-400": active,
									},
								)}
								style={{ flex: 1, minWidth: 120 }}
								onPress={handlePress}
								key={route.key}
							>
								<Text
									className={cn("text-xs", {
										"text-primary": active,
										"text-muted": !active,
									})}
									w={active ? "semibold" : "regular"}
								>
									{label}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
			</View>
		</View>
	);
}
