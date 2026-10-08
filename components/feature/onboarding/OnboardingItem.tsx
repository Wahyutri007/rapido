import { Image } from "expo-image";
import { View } from "react-native";
import Text from "@/components/common/Text";
import { Skeleton } from "@/components/ui/skeleton";

export type OnboardingItemProps = {
	id: string;
	title: string;
	description: string;
	image: string;
	image_url: string;
};

export function OnboardingItemSkeleton({ width }: { width: number }) {
	return (
		<View style={{ width }} className="flex-1 items-center justify-center">
			<Skeleton className="h-full max-h-64 w-full max-w-64" />
			<View className="mt-8 items-center px-12">
				<Skeleton className="h-[28px] w-48 shrink-0 text-gray-900"></Skeleton>
				<Skeleton className="mt-4 h-[8px] w-64 shrink-0 text-gray-900"></Skeleton>
				<Skeleton className="mt-2 h-[8px] w-32 shrink-0 text-gray-900"></Skeleton>
			</View>
			<View className="mt-4" />
		</View>
	);
}

export default function OnboardingItem({
	item,
	width,
}: {
	item: OnboardingItemProps;
	width: number;
}) {
	return (
		<View style={{ width }} className="items-center justify-center">
			<Image
				source={{ uri: item.image_url }}
				contentFit="contain"
				style={{ height: 256, width: 256 }}
				className="h-64 w-64"
			/>
			<View className="mt-8 px-12">
				<Text className="text-center text-lg text-gray-900" w="semibold">
					{item.title}
				</Text>
				<Text className="mt-4 text-center text-sm text-muted">
					{item.description}
				</Text>
			</View>
			<View className="mt-4" />
		</View>
	);
}
