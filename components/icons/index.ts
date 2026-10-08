import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

// Custom SVG Icons
export { default as AddIcon } from "./add";
export { default as AIIcon } from "./ai";
export { default as ArrowCircleRightIcon } from "./arrow-circle-right";
export { default as ArrowUpIcon } from "./arrow-up";
export { default as BackspaceIcon } from "./backspace";
export { default as CalculatorIcon } from "./calculator";
export { default as CalendarIcon } from "./calendar";
export { default as CameraIcon } from "./camera";
export { default as CardIcon } from "./card";
export { default as ChartIcon } from "./chart";
export { default as CheckCircleIcon } from "./check-circle";
// Scaffold & types for custom icons
export {
	type CreateIconOptions,
	type CustomIconProps,
	createIcon,
	default as createIconDefault,
} from "./createIcon";
export { default as DiscountIcon } from "./discount";
export { default as DownTrendIcon } from "./down-trend";
export { default as DownloadIcon } from "./download";
export { default as FilterIcon } from "./filter";
export { default as InfoIcon } from "./info";
export { default as InventoryIcon, Inventory } from "./inventory";
export { default as JournalCodeIcon } from "./journal-code";
export { default as ListIcon } from "./list";
export { default as ManagerIcon, Manager } from "./manager";
export { default as MenuIcon } from "./menu";
export { default as ProfitIcon, Profit } from "./profit";
export { default as ReceiptIcon } from "./receipt";
export { default as ReportIcon, Report } from "./report";
export { default as SearchIcon } from "./search";
export { default as StoreIcon } from "./store";
export { default as TableIcon, Table } from "./table";
export { default as WalletIcon } from "./wallet";

/**
 * HOC that bridges Gluestack's PrimitiveIcon color system with Expo Vector Icons.
 *
 * PrimitiveIcon (used by ButtonIcon/FabIcon/CheckboxIcon) converts the
 * NativeWind className color into a `stroke` prop before passing it to
 * the `as` component. Expo Vector Icons expect a `color` prop instead.
 *
 * This wrapper intercepts `stroke` and passes it as `color`.
 *
 * NOTE: Uses React.createElement instead of JSX because this is a .ts file.
 */
function withGluestackIcon<T extends React.ComponentType<any>>(
	IconComponent: T,
) {
	const Wrapped = React.forwardRef((props: any, ref: any) => {
		const { stroke, height, width, size, ...rest } = props;
		// PrimitiveIcon converts theme color → stroke prop, but Expo icons need color
		const resolvedColor = rest.color || stroke;
		// NativeWind maps w-4 h-4 to width and height, but Expo icons need size
		const resolvedSize = size ?? height ?? width;
		return React.createElement(IconComponent as any, {
			...rest,
			color: resolvedColor,
			size: resolvedSize,
			ref,
		});
	});
	Wrapped.displayName =
		IconComponent.displayName || IconComponent.name || "WithGluestackIcon";
	return Wrapped as unknown as T;
}

// Wrapped Expo Vector Icons that work inside Gluestack ButtonIcon/FabIcon etc.
export const EFeather = withGluestackIcon(Feather);
export const EMaterial = withGluestackIcon(MaterialIcons);
export const EEntypo = withGluestackIcon(Entypo);
export const EAntDesign = withGluestackIcon(AntDesign);
export const EFontAwesome = withGluestackIcon(FontAwesome);
export const EFontAwesome5 = withGluestackIcon(FontAwesome5);
export const EFontAwesome6 = withGluestackIcon(FontAwesome6);
export const EIonicons = withGluestackIcon(Ionicons);
