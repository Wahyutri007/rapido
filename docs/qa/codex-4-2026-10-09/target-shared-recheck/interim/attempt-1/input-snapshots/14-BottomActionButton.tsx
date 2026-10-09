import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ButtonText } from "../ui/button";
import { cn } from "@/lib/utils";

type BottomActionButtonProps = React.PropsWithChildren<{
	onPress?: () => void;
	isDisabled?: boolean;
	isLoading?: boolean;
	className?: string;
}>;

export default function BottomActionButton({
	onPress,
	children,
	isDisabled,
	isLoading,
	className,
}: BottomActionButtonProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className={cn(
				"absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 pt-3",
				className,
			)}
			style={{ paddingBottom: Math.max(insets.bottom, 16) }}
		>
			<Button
				size="xl"
				className="h-12 w-full rounded-full bg-primary-500"
				onPress={onPress}
				isDisabled={isDisabled}
				isLoading={isLoading}
			>
				<ButtonText className="text-base font-semibold text-white">
					{children}
				</ButtonText>
			</Button>
		</View>
	);
}
