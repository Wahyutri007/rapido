import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import Text from "../common/Text";
import { EEntypo } from "../icons";
import { Button, ButtonGroup, ButtonIcon } from "../ui/button";

export type IncrementerProps = {
	value?: number;
	initialValue?: number;
	min?: number;
	max?: number;
	disabled?: boolean;
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
		disabled = false,
		onChange,
		variant = "default",
		size = "sm",
		className,
	} = props;

	const [value, setValue] = React.useState<number>(
		controlledValue ?? (initialValue < min ? min : initialValue),
	);
	const [previousControlledValue, setPreviousControlledValue] =
		React.useState(controlledValue);

	// Reconcile before children render; retain the last accepted value if the
	// caller switches back to local state.
	if (!Object.is(previousControlledValue, controlledValue)) {
		setPreviousControlledValue(controlledValue);
		if (controlledValue !== undefined) {
			setValue(controlledValue);
		}
	}

	const handlePlus = () => {
		if (disabled) return;
		const nextValue =
			max !== undefined ? (value < max ? value + 1 : value) : value + 1;
		if (controlledValue === undefined) {
			setValue(nextValue);
		}
		onChange?.(nextValue);
	};

	const handleMinus = () => {
		if (disabled) return;
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
						isDisabled={disabled}
						size={buttonSize}
						variant="ghost"
						className={cn(
							"rounded-lg active:bg-zinc-100",
							isLarge ? "size-8" : "size-6",
						)}
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
						isDisabled={disabled}
						size={buttonSize}
						variant="ghost"
						className={cn(
							"rounded-lg active:bg-zinc-100",
							isLarge ? "size-8" : "size-6",
						)}
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
					isDisabled={disabled}
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
					isDisabled={disabled}
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
