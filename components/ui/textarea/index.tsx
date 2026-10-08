// @ts-nocheck
"use client";
import { createTextarea } from "@gluestack-ui/core/textarea/creator";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import {
	tva,
	useStyleContext,
	withStyleContext,
} from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { TextInput, View } from "react-native";
import { FONT_NAMES } from "@/constants/Fonts";

const SCOPE = "TEXTAREA";
const UITextarea = createTextarea({
	Root: withStyleContext(View, SCOPE),
	Input: TextInput,
});

const textareaStyle = tva({
	base: "w-full h-[100px] rounded-md border-none bg-zinc-100 data-[hover=true]:border-outline-400 data-[focus=true]:border-primary-700 data-[focus=true]:data-[hover=true]:border-primary-700 data-[disabled=true]:opacity-40 data-[disabled=true]:bg-background-50 data-[disabled=true]:data-[hover=true]:border-background-300",

	variants: {
		variant: {
			outline:
				"rounded-lg border border-solid border-border bg-surface data-[focus=true]:border-primary data-[invalid=true]:border-destructive",
			default:
				"data-[focus=true]:border-primary-700 data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[focus=true]:web:ring-indicator-primary data-[invalid=true]:border-error-700 data-[invalid=true]:web:ring-1 data-[invalid=true]:web:ring-inset data-[invalid=true]:web:ring-indicator-error data-[invalid=true]:data-[hover=true]:border-error-700 data-[invalid=true]:data-[focus=true]:data-[hover=true]:border-primary-700 data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-indicator-primary data-[invalid=true]:data-[disabled=true]:data-[hover=true]:border-error-700 data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-indicator-error ",
		},
		size: {
			sm: "",
			md: "",
			lg: "",
			xl: "",
		},
		height: {
			default: "",
			short: "h-28",
			tall: "h-[152px]",
		},
	},
});

const textareaInputStyle = tva({
	base: "p-2 web:outline-0 web:outline-none flex-1 color-typography-900 align-text-top placeholder:text-typography-500 web:cursor-text web:data-[disabled=true]:cursor-not-allowed",
	parentVariants: {
		variant: {
			outline: "p-3 text-foreground placeholder:text-muted",
		},
		size: {
			sm: "text-sm",
			md: "text-base",
			lg: "text-lg",
			xl: "text-xl",
		},
	},
});

type ITextareaProps = React.ComponentProps<typeof UITextarea> &
	VariantProps<typeof textareaStyle>;

const Textarea = React.forwardRef<
	React.ComponentRef<typeof UITextarea>,
	ITextareaProps
>(function Textarea(
	{ className, variant = "default", size = "sm", height = "default", ...props },
	ref,
) {
	return (
		<UITextarea
			ref={ref}
			{...props}
			className={textareaStyle({ variant, height, class: className })}
			context={{ size, variant }}
		/>
	);
});

type ITextareaInputProps = React.ComponentProps<typeof UITextarea.Input> &
	VariantProps<typeof textareaInputStyle>;

const TextareaInput = React.forwardRef<
	React.ComponentRef<typeof UITextarea.Input>,
	ITextareaInputProps
>(function TextareaInput({ className, style, ...props }, ref) {
	const { size: parentSize, variant: parentVariant } = useStyleContext(SCOPE);

	return (
		<UITextarea.Input
			ref={ref}
			{...props}
			style={[
				parentVariant === "outline" && { fontFamily: FONT_NAMES.regular },
				style,
			]}
			className={textareaInputStyle({
				parentVariants: {
					size: parentSize,
					variant: parentVariant,
				},
				class: className,
			})}
		/>
	);
});

Textarea.displayName = "Textarea";
TextareaInput.displayName = "TextareaInput";

export { Textarea, TextareaInput };
