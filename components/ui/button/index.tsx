// @ts-nocheck
"use client";
import { createButton } from "@gluestack-ui/core/button/creator";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/core/icon/creator";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import {
	tva,
	useStyleContext,
	withStyleContext,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import React from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { FONT_NAMES } from "@/constants/Fonts";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const SCOPE = "BUTTON";

const Root = withStyleContext(Pressable, SCOPE);

const UIButton = createButton({
	Root: Root,
	Text,
	Group: View,
	Spinner: ActivityIndicator,
	Icon: UIIcon,
});

cssInterop(PrimitiveIcon, {
	className: {
		target: "style",
		nativeStyleToProp: {
			height: true,
			width: true,
			fill: true,
			color: "classNameColor",
			stroke: true,
		},
	},
});

// For Option autocomplete
type ButtonVariantOptions = {
	action: "primary" | "secondary" | "positive" | "negative" | "default";
	variant: "link" | "outline" | "solid" | "disabled" | "ghost" | "muted";
	size:
		| "xs"
		| "sm"
		| "md"
		| "lg"
		| "xl"
		| "iconSm"
		| "iconMd"
		| "iconLg"
		| "iconXs";
	hasIcon: "left" | "right" | "both";
};

type ButtonStyleContext = {
	variant: ButtonVariantOptions["variant"];
	size: ButtonVariantOptions["size"];
	action: ButtonVariantOptions["action"];
};

const buttonStyle = tva({
	base: "group/button overflow-hidden rounded-full bg-primary flex-row items-center justify-center data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 gap-2",
	variants: {
		action: {
			primary:
				"bg-primary-500 data-[hover=true]:bg-primary-500 data-[active=true]:bg-primary-600 border-main-400 data-[hover=true]:border-main-300 data-[active=true]:border-main-400 data-[focus-visible=true]:web:ring-indicator-info",
			secondary:
				"bg-secondary-500 border-secondary-300 data-[hover=true]:bg-secondary-400 data-[hover=true]:border-secondary-400 data-[active=true]:bg-secondary-400 data-[active=true]:border-secondary-700 data-[focus-visible=true]:web:ring-indicator-info",
			positive:
				"bg-success-500 border-success-300 data-[hover=true]:bg-success-600 data-[hover=true]:border-success-400 data-[active=true]:bg-success-700 data-[active=true]:border-success-500 data-[focus-visible=true]:web:ring-indicator-info",
			negative:
				"bg-red-500 border-red-300 data-[hover=true]:bg-red-300 data-[hover=true]:border-red-200 data-[active=true]:bg-red-300 data-[active=true]:border-red-500 data-[focus-visible=true]:web:ring-indicator-info",
			default:
				"bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent",
		} satisfies Record<ButtonVariantOptions["action"], string>,
		variant: {
			link: "px-0",
			outline:
				"bg-transparent text-primary border border-primary data-[hover=true]:bg-primary-50 data-[active=true]:bg-primary-50",
			solid: "",
			disabled: "opacity-50",
			ghost:
				"bg-white data-[hover=true]:bg-zinc-200 data-[active=true]:bg-zinc-200",
			muted:
				"bg-transparent border border-border-muted data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent",
		} satisfies Record<ButtonVariantOptions["variant"], string>,
		size: {
			xs: "px-3 h-8",
			sm: "px-4 h-9",
			md: "px-5 h-10",
			lg: "px-6 h-11",
			xl: "px-7 h-12",
			iconXs: "h-6 w-6 items-center justify-center px-0",
			iconSm: "h-8 w-8 items-center justify-center px-0",
			iconMd: "h-10 w-10 items-center justify-center px-0",
			iconLg: "h-12 w-12 items-center justify-center px-0",
		} satisfies Record<ButtonVariantOptions["size"], string>,
		hasIcon: {
			left: "flex-row",
			right: "flex-row",
			both: "flex-row",
		} satisfies Record<ButtonVariantOptions["hasIcon"], string>,
	},
	compoundVariants: [
		{
			action: "primary",
			variant: "link",
			class:
				"px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
		},
		{
			action: "secondary",
			variant: "link",
			class:
				"px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
		},
		{
			action: "positive",
			variant: "link",
			class:
				"px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
		},
		{
			action: "negative",
			variant: "link",
			class:
				"px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent",
		},
		{
			action: "primary",
			variant: "outline",
			class:
				"bg-transparent data-[hover=true]:bg-primary-50 data-[active=true]:bg-primary-50",
		},
		{
			action: "secondary",
			variant: "outline",
			class:
				"bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent",
		},
		{
			action: "positive",
			variant: "outline",
			class:
				"bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent",
		},
		{
			action: "negative",
			variant: "outline",
			class:
				"bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent",
		},
	],
});

const buttonTextStyle = tva({
	base: "text-typography-0 font-semibold web:select-none",
	parentVariants: {
		action: {
			primary:
				"text-primary data-[hover=true]:text-primary data-[active=true]:text-primary-600",
			secondary:
				"text-typography-500 data-[hover=true]:text-typography-600 data-[active=true]:text-typography-700",
			positive:
				"text-success-600 data-[hover=true]:text-success-600 data-[active=true]:text-success-700",
			negative:
				"text-red-900 data-[hover=true]:text-red-600 data-[active=true]:text-red-700",
			default: "",
		} satisfies Record<ButtonVariantOptions["action"], string>,
		variant: {
			link: "data-[hover=true]:underline data-[active=true]:underline",
			outline: "",
			solid:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
			disabled: "",
			ghost:
				"text-primary data-[hover=true]:text-primary data-[active=true]:text-primary",
			muted:
				"text-muted data-[hover=true]:text-subtle data-[active=true]:text-subtle",
		} satisfies Record<ButtonVariantOptions["variant"], string>,
		size: {
			xs: "text-xs",
			sm: "text-sm",
			md: "text-sm",
			lg: "text-base",
			xl: "text-base",
			iconLg: "",
			iconMd: "",
			iconSm: "",
			iconXs: "",
		} satisfies Record<ButtonVariantOptions["size"], string>,
	},
	parentCompoundVariants: [
		{
			variant: "solid",
			action: "primary",
			class:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
		},
		{
			variant: "solid",
			action: "secondary",
			class:
				"text-typography-800 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-800",
		},
		{
			variant: "solid",
			action: "positive",
			class:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
		},
		{
			variant: "solid",
			action: "negative",
			class: "text-white",
		},
		{
			variant: "outline",
			action: "primary",
			class:
				"text-primary data-[hover=true]:text-primary-600 data-[active=true]:text-primary-600",
		},
		{
			variant: "outline",
			action: "secondary",
			class:
				"text-typography-500 data-[hover=true]:text-primary-600 data-[active=true]:text-typography-700",
		},
		{
			variant: "outline",
			action: "positive",
			class:
				"text-primary data-[hover=true]:text-primary data-[active=true]:text-primary-600",
		},
		{
			variant: "outline",
			action: "negative",
			class:
				"text-red-400 data-[hover=true]:text-red-600 data-[active=true]:text-red-600",
		},
	],
});

const buttonIconStyle = tva({
	base: "fill-none",
	parentVariants: {
		variant: {
			link: "data-[hover=true]:underline data-[active=true]:underline",
			outline: "",
			solid:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
			disabled: "",
			ghost:
				"text-primary data-[hover=true]:text-primary data-[active=true]:text-primary",
			muted:
				"text-muted data-[hover=true]:text-subtle data-[active=true]:text-subtle",
		} satisfies Record<ButtonVariantOptions["variant"], string>,
		size: {
			xs: "h-3.5 w-3.5",
			sm: "h-4 w-4",
			md: "h-[18px] w-[18px]",
			lg: "h-[18px] w-[18px]",
			xl: "h-5 w-5",
			iconXs: "h-3 w-3",
			iconSm: "h-4 w-4",
			iconMd: "h-5 w-5",
			iconLg: "h-6 w-6",
		} satisfies Record<ButtonVariantOptions["size"], string>,
		action: {
			primary:
				"text-primary-600 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700",
			secondary:
				"text-typography-500 data-[hover=true]:text-typography-600 data-[active=true]:text-typography-700",
			positive:
				"text-success-600 data-[hover=true]:text-success-600 data-[active=true]:text-success-700",

			negative:
				"text-red-600 data-[hover=true]:text-red-600 data-[active=true]:text-red-700",
			default: "",
		} satisfies Record<ButtonVariantOptions["action"], string>,
	},
	parentCompoundVariants: [
		{
			variant: "solid",
			action: "primary",
			class:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
		},
		{
			variant: "solid",
			action: "secondary",
			class:
				"text-typography-800 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-800",
		},
		{
			variant: "solid",
			action: "positive",
			class:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
		},
		{
			variant: "solid",
			action: "negative",
			class:
				"text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0",
		},
		{
			variant: "ghost",
			action: "primary",
			class:
				"text-typography-800 data-[hover=true]:text-white data-[active=true]:text-white",
		},
	],
});

const buttonGroupStyle = tva({
	base: "",
	variants: {
		space: {
			xs: "gap-1",
			sm: "gap-2",
			md: "gap-3",
			lg: "gap-4",
			xl: "gap-5",
			"2xl": "gap-6",
			"3xl": "gap-7",
			"4xl": "gap-8",
		},
		isAttached: {
			true: "gap-0",
		},
		flexDirection: {
			row: "flex-row",
			column: "flex-col",
			"row-reverse": "flex-row-reverse",
			"column-reverse": "flex-col-reverse",
		},
	},
});

export type ButtonVariantProps = VariantProps<typeof buttonStyle>;

const ButtonSpinner = UIButton.Spinner;

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
	VariantProps<typeof buttonTextStyle> & { className?: string };

const ButtonText = React.forwardRef<
	React.ComponentRef<typeof UIButton.Text>,
	IButtonTextProps
>(function ButtonText(
	{ className, style, variant, size, action, ...props },
	ref,
) {
	const {
		variant: parentVariant,
		size: parentSize,
		action: parentAction,
	} = useStyleContext(SCOPE) as ButtonStyleContext;

	return (
		<UIButton.Text
			ref={ref}
			style={[style, { fontFamily: FONT_NAMES.semibold }]}
			{...props}
			className={buttonTextStyle({
				parentVariants: {
					variant: parentVariant,
					size: parentSize,
					action: parentAction,
				},
				variant,
				size,
				action,
				class: className,
			})}
		/>
	);
});

function getSpinnerColor(
	variant?: string,
	action?: string,
	customColor?: string,
): string {
	if (customColor) return customColor;
	if (variant === "outline" || variant === "ghost" || variant === "link") {
		if (action === "negative") return Colors.red["500"];
		if (action === "secondary") return Colors.zinc["700"];
		return Colors.primary;
	}
	if (action === "secondary") {
		return Colors.zinc["800"];
	}
	return "#ffffff";
}

function getButtonRippleColor(variant?: string, action?: string): string {
	if (variant === "outline" || variant === "ghost" || variant === "muted") {
		return "rgba(0, 0, 0, 0.08)";
	}
	if (action === "secondary") {
		return "rgba(0, 0, 0, 0.08)";
	}
	// For solid primary, positive, negative:
	return "rgba(255, 255, 255, 0.22)";
}

type IButtonProps = Omit<
	React.ComponentPropsWithoutRef<typeof UIButton>,
	"context"
> &
	ButtonVariantProps & {
		className?: string;
		loading?: boolean;
		isLoading?: boolean;
		loadingText?: string;
		spinnerColor?: string;
		animationType?: "ripple" | "scale" | "none";
		/** Shorthand to enable scale animation (backward compatibility) */
		bouncy?: boolean;
		hapticFeedback?: boolean;
	};

const BUTTON_SPRING_CONFIG = {
	damping: 18,
	stiffness: 450,
	mass: 0.5,
};

const Button = React.forwardRef<
	React.ComponentRef<typeof UIButton>,
	IButtonProps
>(function Button(props, ref) {
	const {
		className,
		variant = "solid",
		size = "md",
		action = "primary",
		isDisabled,
		loading = false,
		isLoading,
		loadingText,
		spinnerColor,
		children,
		style,
		animationType,
		bouncy,
		hapticFeedback = true,
		onPressIn,
		onPressOut,
		...rest
	} = props;

	const isButtonLoading = Boolean(loading || isLoading);
	const isButtonDisabled = Boolean(isDisabled || isButtonLoading);
	const resolvedSpinnerColor = getSpinnerColor(variant, action, spinnerColor);

	const resolvedAnimationType =
		animationType ?? (variant === "link" ? "none" : "scale");

	const useScale = resolvedAnimationType === "scale";
	const useRipple = resolvedAnimationType === "ripple";

	const scale = useSharedValue(1);
	const pressInTimeRef = React.useRef(0);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = React.useCallback(
		(e: any) => {
			pressInTimeRef.current = Date.now();
			if (!isButtonDisabled) {
				if (useScale) {
					scale.value = withSpring(0.98, BUTTON_SPRING_CONFIG);
				}
				if (hapticFeedback) {
					if (action === "negative") {
						haptic.warning();
					} else {
						haptic.light();
					}
				}
			}
			onPressIn?.(e);
		},
		[isButtonDisabled, useScale, hapticFeedback, action, onPressIn, scale],
	);

	const handlePressOut = React.useCallback(
		(e: any) => {
			if (!isButtonDisabled && useScale) {
				const elapsed = Date.now() - pressInTimeRef.current;
				const remaining = Math.max(0, 50 - elapsed);
				if (remaining > 0) {
					setTimeout(() => {
						scale.value = withSpring(1, BUTTON_SPRING_CONFIG);
					}, remaining);
				} else {
					scale.value = withSpring(1, BUTTON_SPRING_CONFIG);
				}
			}
			onPressOut?.(e);
		},
		[isButtonDisabled, useScale, onPressOut, scale],
	);

	const resolvedRipple =
		useRipple && !isButtonDisabled
			? {
					color: getButtonRippleColor(variant, action),
					borderless: false,
				}
			: undefined;

	const isFlex1 = Boolean(className?.includes("flex-1"));
	const isFullWidth = Boolean(className?.includes("w-full"));

	const buttonElement = (
		<UIButton
			ref={ref}
			{...rest}
			android_ripple={resolvedRipple}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			isDisabled={isButtonDisabled}
			style={style}
			className={cn(
				buttonStyle({ variant, size, action, class: className }),
				(isFullWidth || isFlex1) && "w-full",
				isButtonDisabled && "opacity-50",
			)}
			context={{ variant, size, action } satisfies ButtonStyleContext}
		>
			{isButtonLoading ? (
				<>
					<ButtonSpinner color={resolvedSpinnerColor} />
					{loadingText ? <ButtonText>{loadingText}</ButtonText> : null}
				</>
			) : (
				children
			)}
		</UIButton>
	);

	if (useScale) {
		return (
			<Animated.View
				style={[
					animatedStyle,
					isFlex1 && { flex: 1 },
					isFullWidth && { width: "100%" },
				]}
				className={cn(isFlex1 && "flex-1", isFullWidth && "w-full")}
			>
				{buttonElement}
			</Animated.View>
		);
	}

	return buttonElement;
});

type IButtonIcon<T extends React.ElementType = typeof UIButton.Icon> =
	React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
		VariantProps<typeof buttonIconStyle> & {
			className?: string | undefined;
			as?: T;
			height?: number;
			width?: number;
		} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "size">;

const ButtonIcon = React.forwardRef(function ButtonIcon<
	T extends React.ElementType = typeof UIButton.Icon,
>(
	{ className, size, ...props }: IButtonIcon<T>,
	ref: React.Ref<React.ComponentRef<T>>,
) {
	const {
		variant: parentVariant,
		size: parentSize,
		action: parentAction,
	} = useStyleContext(SCOPE) as ButtonStyleContext;

	if (typeof size === "number") {
		return (
			<UIButton.Icon
				ref={ref as any}
				{...props}
				className={buttonIconStyle({
					parentVariants: {
						size: parentSize,
						variant: parentVariant,
						action: parentAction,
					},
					class: className,
				})}
				size={size}
			/>
		);
	} else if (
		(props.height !== undefined || props.width !== undefined) &&
		size === undefined
	) {
		return (
			<UIButton.Icon
				ref={ref as any}
				{...props}
				className={buttonIconStyle({
					parentVariants: {
						size: parentSize,
						variant: parentVariant,
						action: parentAction,
					},
					class: className,
				})}
			/>
		);
	}
	return (
		<UIButton.Icon
			{...props}
			className={buttonIconStyle({
				parentVariants: {
					size: parentSize,
					variant: parentVariant,
					action: parentAction,
				},
				size,
				class: className,
			})}
			ref={ref as any}
		/>
	);
}) as (<T extends React.ElementType = typeof UIButton.Icon>(
	props: IButtonIcon<T> & { ref?: React.Ref<React.ComponentRef<T>> },
) => React.ReactElement | null) & { displayName?: string };

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
	VariantProps<typeof buttonGroupStyle>;

const ButtonGroup = React.forwardRef<
	React.ComponentRef<typeof UIButton.Group>,
	IButtonGroupProps
>(function ButtonGroup(
	{
		className,
		space = "md" as const,
		isAttached = false,
		flexDirection = "column" as const,
		...props
	},
	ref,
) {
	return (
		<UIButton.Group
			className={buttonGroupStyle({
				class: className,
				space,
				isAttached,
				flexDirection,
			})}
			{...props}
			ref={ref}
		/>
	);
});

Button.displayName = "Button";
ButtonText.displayName = "ButtonText";
ButtonSpinner.displayName = "ButtonSpinner";
ButtonIcon.displayName = "ButtonIcon";
ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText };
