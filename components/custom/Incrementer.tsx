import React from "react";
import { View } from "react-native";
import Text from "../common/Text";
import { EEntypo } from "../icons";
import { Button, ButtonGroup, ButtonIcon } from "../ui/button";
import { cn } from "@/lib/utils";

export type IncrementerProps = {
	value?: number;
	initialValue?: number;
	min?: number;
	max?: number;
	onChange?: (value: number) => void;
	variant?: "default" | "outline";
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
};

export default function Incrementer(props: IncrementerProps) {
	const {
		value: controlledValue,
		initialValue = 0,
		min = 0,
		max,
		onChange,
		variant = "default",
		size = "sm",
		className,
	} = props;

	const [value, setValue] = React.useState<number>(
		initialValue < min ? min : initialValue,
	);

	React.useEffect(() => {
		if (controlledValue !== undefined) {
			setValue(controlledValue);
		}
	}, [controlledValue]);

	const handlePlus = () => {
		const nextValue =
			max !== undefined ? (value < max ? value + 1 : value) : value + 1;
		if (controlledValue === undefined) {
			setValue(nextValue);
		}
		onChange?.(nextValue);
	};

	const handleMinus = () => {
		const nextValue = value > min ? value - 1 : value;
		if (controlledValue === undefined) {
			setValue(nextValue);
		}
		onChange?.(nextValue);
	};

	const isLarge = size === "xl" || size === "lg";
	const isMedium = size === "md";

	const buttonSize = isLarge ? "iconSm" : isMedium ? "iconSm" : "iconXs";
	const textSize = isLarge ? "normal" : "small";

	if (variant === "outline") {
		const heightClass = isLarge ? "h-11" : isMedium ? "h-10" : "h-8";
		const paddingClass = isLarge ? "px-2.5" : "px-1.5";

		return (
			<View
				className={cn(
					"w-full flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white",
					heightClass,
					paddingClass,
					className,
				)}
			>
				<ButtonGroup>
					<Button
						onPress={handleMinus}
						size={buttonSize}
						variant="ghost"
						className={cn("rounded-lg active:bg-zinc-100", isLarge ? "size-8" : "size-6")}
					>
						<ButtonIcon as={EEntypo} name="minus" />
					</Button>
				</ButtonGroup>

				<Text size={textSize} w="semibold" className="text-foreground">
					{value}
				</Text>

				<ButtonGroup>
					<Button
						onPress={handlePlus}
						size={buttonSize}
						variant="ghost"
						className={cn("rounded-lg active:bg-zinc-100", isLarge ? "size-8" : "size-6")}
					>
						<ButtonIcon as={EEntypo} name="plus" />
					</Button>
				</ButtonGroup>
			</View>
		);
	}

	// Default pill style
	const heightClass = isLarge ? "h-11 px-3" : isMedium ? "h-9 px-2" : "p-1";

	return (
		<View
			className={cn(
				"flex-row items-center bg-zinc-100 rounded-full gap-2 justify-between",
				heightClass,
				className,
			)}
		>
			<ButtonGroup>
				<Button
					onPress={handleMinus}
					size={buttonSize}
					variant="ghost"
					className={isLarge ? "size-8" : undefined}
				>
					<ButtonIcon as={EEntypo} name="minus" />
				</Button>
			</ButtonGroup>

			<Text size={textSize} w="semibold" className="text-foreground">
				{value}
			</Text>

			<ButtonGroup>
				<Button
					onPress={handlePlus}
					size={buttonSize}
					variant="ghost"
					className={isLarge ? "size-8" : undefined}
				>
					<ButtonIcon as={EEntypo} name="plus" />
				</Button>
			</ButtonGroup>
		</View>
	);
}
