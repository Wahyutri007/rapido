import { useRouter } from "expo-router";
import React from "react";
import {
	Animated,
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	useWindowDimensions,
	View,
} from "react-native";
import useOnboardingDataQuery from "@/api/hooks/onboarding-data";
import transformOnboardingData from "@/api/transformers/onboarding-data";
import OnboardingItem, {
	type OnboardingItemProps,
	OnboardingItemSkeleton,
} from "@/components/feature/onboarding/OnboardingItem";
import Paginator from "@/components/feature/onboarding/Paginator";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import Keys from "@/constants/Keys";
import * as SecureStore from "@/lib/storage";

export default function OnboardingScreen() {
	const router = useRouter();

	const onboardingDataQuery = useOnboardingDataQuery();

	const [currentIndex, setCurrentIndex] = React.useState(0);
	const { width: windowWidth } = useWindowDimensions();
	const [pageWidth, setPageWidth] = React.useState(windowWidth);
	const scrollX = React.useRef(new Animated.Value(0)).current;

	const flatListRef = React.useRef<FlatList<OnboardingItemProps>>(null);

	function handleScrollToIndex(index: number) {
		setCurrentIndex(index);
		flatListRef.current?.scrollToIndex({ index, animated: true });
	}

	const dataLength = onboardingDataQuery.data?.length ?? 0;

	function handleContinue() {
		if (onboardingDataQuery.isLoading) return;

		if (currentIndex < dataLength - 1) {
			handleScrollToIndex(currentIndex + 1);
		} else {
			SecureStore.setItemAsync(Keys.ONBOARDING_COMPLETED, "true");
			router.replace("/(onboarding)/login");
		}
	}

	function handleJoin() {
		if (onboardingDataQuery.isLoading) return;

		if (currentIndex < dataLength - 1) {
			handleScrollToIndex(dataLength - 1);
		} else {
			SecureStore.setItemAsync(Keys.ONBOARDING_COMPLETED, "true");
			router.replace("/(onboarding)/register");
		}
	}

	const transformedData = React.useMemo(() => {
		if (!onboardingDataQuery.data) return null;

		return onboardingDataQuery.data.map(transformOnboardingData);
	}, [onboardingDataQuery.data]);

	return (
		<View
			className="grow items-center bg-white"
			onLayout={(event) => {
				if (event.nativeEvent.layout.width > 0)
					setPageWidth(event.nativeEvent.layout.width);
			}}
		>
			{!onboardingDataQuery.isLoading ? (
				<FlatList
					ref={flatListRef}
					data={transformedData}
					renderItem={({ item }) => (
						<OnboardingItem item={item} width={pageWidth} />
					)}
					getItemLayout={(_, index) => ({
						length: pageWidth,
						offset: pageWidth * index,
						index,
					})}
					extraData={pageWidth}
					style={{ width: pageWidth }}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					bounces={false}
					className="flex-1"
					keyExtractor={(item) => item.id}
					scrollEventThrottle={16}
					onScroll={Animated.event(
						[{ nativeEvent: { contentOffset: { x: scrollX } } }],
						{
							useNativeDriver: false,
							listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
								if (pageWidth > 0 && dataLength > 0)
									setCurrentIndex(
										Math.max(
											0,
											Math.min(
												dataLength - 1,
												Math.round(
													event.nativeEvent.contentOffset.x / pageWidth,
												),
											),
										),
									);
							},
						},
					)}
				/>
			) : (
				<OnboardingItemSkeleton width={pageWidth} />
			)}

			<View className="mb-8">
				<Paginator
					data={transformedData}
					scrollX={scrollX}
					pageWidth={pageWidth}
				/>
			</View>

			<ButtonGroup className="mb-8 mt-auto w-full shrink-0 px-8">
				<Button
					size="xl"
					onPress={handleContinue}
					isDisabled={onboardingDataQuery.isLoading}
				>
					<ButtonText>
						{currentIndex === dataLength - 1 ? "Mulai" : "Lanjutkan"}
					</ButtonText>
				</Button>
				<Button
					size="xl"
					onPress={handleJoin}
					variant="outline"
					isDisabled={onboardingDataQuery.isLoading}
				>
					<ButtonText>Gabung Sekarang</ButtonText>
				</Button>
			</ButtonGroup>
		</View>
	);
}
