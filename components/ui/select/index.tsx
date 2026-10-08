// @ts-nocheck
"use client";

import { Entypo } from "@expo/vector-icons";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/core/icon/creator";
import { createSelect } from "@gluestack-ui/core/select/creator";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import {
	tva,
	useStyleContext,
	withStyleContext,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { FONT_NAMES } from "@/constants/Fonts";
import { cn } from "@/lib/utils";
import type { IconProps } from "@/types";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetFlatList,
	ActionsheetItem,
	ActionsheetItemText,
	ActionsheetScrollView,
	ActionsheetSectionHeaderText,
	ActionsheetSectionList,
	ActionsheetVirtualizedList,
} from "../actionsheet";

const SelectTriggerWrapper = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	React.ComponentProps<typeof Pressable>
>(function SelectTriggerWrapper({ ...props }, ref) {
	return <Pressable {...props} ref={ref} />;
});

const selectIconStyle = tva({
	base: "justify-center items-center text-typography-400 fill-none",
	parentVariants: {
		size: {
			"2xs": "h-3 w-3",
			xs: "h-3.5 w-3.5",
			sm: "h-4 w-4",
			md: "h-[18px] w-[18px]",
			lg: "h-5 w-5",
			xl: "h-6 w-6",
		},
	},
});

const selectStyle = tva({
	base: "",
});

const selectTriggerStyle = tva({
	base: "border-zinc-200 rounded-lg px-4 bg-zinc-100 flex-row overflow-hidden content-center data-[focus=true]:border-main-50 data-[focus=true]:bg-primary-50 data-[focus=true]:hover:bg-primary-100 data-[disabled=true]:opacity-40 data-[disabled=true]:hover:bg-primary-100  items-center",
	variants: {
		size: {
			xl: "h-12",
			lg: "h-11",
			md: "h-10",
			sm: "h-9",
		},
		variant: {
			underlined:
				"rounded-none border-b data-[invalid=true]:border-b-2 data-[invalid=true]:border-error-700 data-[invalid=true]:hover:border-error-700 data-[invalid=true]:data-[focus=true]:border-error-700 data-[invalid=true]:data-[focus=true]:hover:border-error-700 data-[invalid=true]:data-[disabled=true]:hover:border-error-700",
			outline:
				" border data-[invalid=true]:border-error-700 data-[invalid=true]:hover:border-error-700 data-[invalid=true]:data-[focus=true]:border-error-700 data-[invalid=true]:data-[focus=true]:hover:border-error-700 data-[invalid=true]:data-[disabled=true]:hover:border-error-700 data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[focus=true]:web:ring-indicator-primary data-[invalid=true]:web:ring-1 data-[invalid=true]:web:ring-inset data-[invalid=true]:web:ring-indicator-error data-[invalid=true]:data-[focus=true]:hover:web:ring-1 data-[invalid=true]:data-[focus=true]:hover:web:ring-inset data-[invalid=true]:data-[focus=true]:hover:web:ring-indicator-error data-[invalid=true]:data-[disabled=true]:hover:web:ring-1 data-[invalid=true]:data-[disabled=true]:hover:web:ring-inset data-[invalid=true]:data-[disabled=true]:hover:web:ring-indicator-error",
			light:
				"bg-white border-white data-[focus=true]:bg-white data-[focus=true]:border-main-50 data-[focus=true]:hover:bg-primary-100 data-[disabled=true]:hover:bg-white data-[invalid=true]:border-error-700 data-[invalid=true]:hover:border-error-700 data-[invalid=true]:data-[focus=true]:border-error-700 data-[invalid=true]:data-[focus=true]:hover:border-error-700 data-[invalid=true]:data-[disabled=true]:hover:border-error-700",
			rounded: "web:outline-0 web:outline-none px-4",
		},
	},
});

const selectInputStyle = tva({
	base: "py-auto px-3 placeholder:text-typography-500 web:w-full h-full text-typography-900 pointer-events-none web:outline-none ios:leading-[0px]",
	parentVariants: {
		size: {
			xl: "text-xl",
			lg: "text-lg",
			md: "text-base",
			sm: "text-sm",
		},
		variant: {
			underlined: "px-0",
			outline: "",
			rounded: "px-4",
		},
	},
});

const UISelect = createSelect(
	{
		Root: View,
		Trigger: withStyleContext(SelectTriggerWrapper),
		Input: ({ style, ...rest }: React.ComponentProps<typeof TextInput>) => (
			<TextInput
				style={[{ fontFamily: FONT_NAMES.regular, fontSize: 16 }, style]}
				{...rest}
			/>
		),
		Icon: UIIcon,
	},
	{
		Portal: Actionsheet,
		Backdrop: ActionsheetBackdrop,
		Content: ActionsheetContent,
		DragIndicator: ActionsheetDragIndicator,
		DragIndicatorWrapper: ActionsheetDragIndicatorWrapper,
		Item: ActionsheetItem,
		ItemText: ActionsheetItemText,
		ScrollView: ActionsheetScrollView,
		VirtualizedList: ActionsheetVirtualizedList,
		FlatList: ActionsheetFlatList,
		SectionList: ActionsheetSectionList,
		SectionHeaderText: ActionsheetSectionHeaderText,
	},
);

cssInterop(UISelect, { className: "style" });
cssInterop(UISelect.Input, {
	className: { target: "style", nativeStyleToProp: { textAlign: true } },
});
cssInterop(SelectTriggerWrapper, { className: "style" });

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

type ISelectProps = VariantProps<typeof selectStyle> &
	React.ComponentProps<typeof UISelect> & { className?: string };

const Select = React.forwardRef<
	React.ComponentRef<typeof UISelect>,
	ISelectProps
>(function Select({ className, ...props }, ref) {
	return (
		<UISelect
			className={selectStyle({
				class: className,
			})}
			ref={ref}
			{...props}
		/>
	);
});

type ISelectTriggerProps = VariantProps<typeof selectTriggerStyle> &
	React.ComponentProps<typeof UISelect.Trigger> & { className?: string };

const SelectTrigger = React.forwardRef<
	React.ComponentRef<typeof UISelect.Trigger>,
	ISelectTriggerProps
>(function SelectTrigger(
	{ className, size = "md", variant = "outline", ...props },
	ref,
) {
	return (
		<UISelect.Trigger
			className={selectTriggerStyle({
				class: className,
				size,
				variant,
			})}
			ref={ref}
			context={{ size, variant }}
			{...props}
		/>
	);
});

type ISelectInputProps = VariantProps<typeof selectInputStyle> &
	React.ComponentProps<typeof UISelect.Input> & { className?: string };

const SelectInput = React.forwardRef<
	React.ComponentRef<typeof UISelect.Input>,
	ISelectInputProps
>(function SelectInput({ className, ...props }, ref) {
	const { size: parentSize, variant: parentVariant } = useStyleContext();
	return (
		<UISelect.Input
			className={selectInputStyle({
				class: cn(className, "px-0"),
				parentVariants: {
					size: parentSize,
					variant: parentVariant,
				},
			})}
			ref={ref}
			{...props}
		/>
	);
});

type ISelectIcon = VariantProps<typeof selectIconStyle> &
	React.ComponentProps<typeof UISelect.Icon> & { className?: string };

const SelectIcon = React.forwardRef<
	React.ComponentRef<typeof UISelect.Icon>,
	ISelectIcon
>(function SelectIcon({ className, size, ...props }, ref) {
	const { size: parentSize } = useStyleContext();
	if (typeof size === "number") {
		return (
			<UISelect.Icon
				ref={ref}
				{...props}
				className={selectIconStyle({ class: className })}
				size={size}
			/>
		);
	} else if (
		//@ts-expect-error : web only
		(props?.height !== undefined || props?.width !== undefined) &&
		size === undefined
	) {
		return (
			<UISelect.Icon
				ref={ref}
				{...props}
				className={selectIconStyle({ class: className })}
			/>
		);
	}
	return (
		<UISelect.Icon
			className={selectIconStyle({
				class: className,
				parentVariants: {
					size: parentSize,
				},
			})}
			ref={ref}
			{...props}
		/>
	);
});

const SelectDefaultIcon = (props: IconProps) => {
	const { size = 20, color = Colors.zinc[400] } = props;

	return <Entypo name="chevron-down" size={size} color={color} />;
};

Select.displayName = "Select";
SelectTrigger.displayName = "SelectTrigger";
SelectInput.displayName = "SelectInput";
SelectIcon.displayName = "SelectIcon";

// Actionsheet Components
const SelectPortal = UISelect.Portal;
const SelectBackdrop = UISelect.Backdrop;
const SelectContent = UISelect.Content;
const SelectDragIndicator = UISelect.DragIndicator;
const SelectDragIndicatorWrapper = UISelect.DragIndicatorWrapper;
const SelectItem = UISelect.Item;
const SelectScrollView = UISelect.ScrollView;
const SelectVirtualizedList = UISelect.VirtualizedList;
const SelectFlatList = UISelect.FlatList;
const SelectSectionList = UISelect.SectionList;
const SelectSectionHeaderText = UISelect.SectionHeaderText;

export {
	Select,
	SelectBackdrop,
	SelectContent,
	SelectDefaultIcon,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectFlatList,
	SelectIcon,
	SelectInput,
	SelectItem,
	SelectPortal,
	SelectScrollView,
	SelectSectionHeaderText,
	SelectSectionList,
	SelectTrigger,
	SelectVirtualizedList,
};

