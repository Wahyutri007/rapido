import { cssInterop } from "nativewind";
import React from "react";
import { type ColorValue, StyleSheet } from "react-native";
import Svg, { type SvgProps } from "react-native-svg";

export type CustomIconProps = Omit<SvgProps, "color"> & {
	size?: number | string;
	color?: ColorValue;
	className?: string;
};

export type CreateIconOptions = {
	name?: string;
	viewBox?: string;
	defaultFill?: string;
	path?: React.ReactNode;
	children?: React.ReactNode;
};

const ICON_SIZE_MAP: Record<string, number> = {
	"2xs": 10,
	xs: 12,
	sm: 16,
	md: 18,
	lg: 20,
	xl: 24,
	"2xl": 32,
	"3xl": 40,
	iconXs: 12,
	iconSm: 16,
	iconMd: 20,
	iconLg: 24,
};

function resolveSize(
	size?: number | string,
	width?: number | string,
	height?: number | string,
	style?: any,
): number {
	if (typeof size === "number") return size;
	if (typeof size === "string") {
		if (size in ICON_SIZE_MAP) return ICON_SIZE_MAP[size];
		const parsed = parseFloat(size);
		if (!Number.isNaN(parsed)) return parsed;
	}
	const flatStyle = style ? StyleSheet.flatten(style) : undefined;
	const resolvedWidth = width ?? flatStyle?.width;
	const resolvedHeight = height ?? flatStyle?.height;

	if (typeof resolvedWidth === "number") return resolvedWidth;
	if (typeof resolvedHeight === "number") return resolvedHeight;
	if (typeof resolvedWidth === "string") {
		const parsed = parseFloat(resolvedWidth);
		if (!Number.isNaN(parsed)) return parsed;
	}
	if (typeof resolvedHeight === "string") {
		const parsed = parseFloat(resolvedHeight);
		if (!Number.isNaN(parsed)) return parsed;
	}
	return 24;
}

function resolveColor(props: Record<string, any>): ColorValue | undefined {
	const flatStyle = props.style ? StyleSheet.flatten(props.style) : undefined;
	return (
		props.color ||
		props.stroke ||
		props.classNameColor ||
		flatStyle?.color ||
		flatStyle?.stroke ||
		undefined
	);
}

/**
 * Standard factory for creating production-ready custom SVG icons.
 *
 * Supports two creation methods:
 * 1. Config object: `createIcon({ viewBox: "0 0 24 24", path: <Path ... /> })`
 * 2. Component wrapper: `createIcon(SvgComponent)`
 *
 * Handles:
 * - Standalone usage (`<Icon size={20} color="#..." />`)
 * - NativeWind utility classes (`<Icon className="size-5 text-primary-500" />`)
 * - Gluestack UI components (`<ButtonIcon as={Icon} />`, `<FabIcon as={Icon} />`)
 * - React Navigation tabs (`tabBarIcon: (props) => <Icon {...props} />`)
 */
export function createIcon(
	optionsOrComponent: CreateIconOptions | React.ComponentType<CustomIconProps>,
): React.ForwardRefExoticComponent<
	CustomIconProps & React.RefAttributes<React.ElementRef<typeof Svg>>
> {
	let IconComponent: React.ForwardRefExoticComponent<any>;

	if (typeof optionsOrComponent === "function") {
		const WrappedComponent = optionsOrComponent;
		IconComponent = React.forwardRef<any, CustomIconProps>(
			function WrappedIcon(props, ref) {
				const { size, width, height, color, stroke, className, ...rest } =
					props as any;

				const resolvedSize = resolveSize(
					size,
					width,
					height,
					(props as any).style,
				);
				const resolvedColor = resolveColor(props);

				return React.createElement(WrappedComponent, {
					ref,
					size: resolvedSize,
					width: resolvedSize,
					height: resolvedSize,
					color: resolvedColor,
					...rest,
				});
			},
		);
		IconComponent.displayName =
			WrappedComponent.displayName || WrappedComponent.name || "CustomIcon";
	} else {
		const {
			name = "CustomIcon",
			viewBox = "0 0 24 24",
			defaultFill = "none",
			path,
			children,
		} = optionsOrComponent;

		const content = path ?? children;

		IconComponent = React.forwardRef<any, CustomIconProps>(
			function SvgIcon(props, ref) {
				const { size, width, height, color, stroke, fill, className, ...rest } =
					props as any;

				const resolvedSize = resolveSize(
					size,
					width,
					height,
					(props as any).style,
				);
				const resolvedColor = resolveColor(props);

				return (
					<Svg
						ref={ref}
						width={resolvedSize}
						height={resolvedSize}
						viewBox={viewBox}
						className={className}
						fill={fill ?? defaultFill}
						color={resolvedColor}
						{...rest}
					>
						{content}
					</Svg>
				);
			},
		);

		IconComponent.displayName = name;
	}

	cssInterop(IconComponent, {
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

	return IconComponent;
}

export default createIcon;
