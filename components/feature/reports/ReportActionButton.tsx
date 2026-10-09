import { Feather, FontAwesome } from "@expo/vector-icons";
import type React from "react";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Pressable, View } from "react-native";
import BottomActionBar from "@/components/common/BottomActionBar";
import Text from "@/components/common/Text";
import { DownloadIcon } from "@/components/icons";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetItem,
	ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReportAction = {
	key: string;
	label: string;
	icon?: React.ReactNode;
	variant?: "default" | "destructive";
	disabled?: boolean;
	onPress?: () => void;
};

export const DEFAULT_REPORT_ACTIONS: ReportAction[] = [
	{
		key: "download",
		label: "Download",
		icon: <DownloadIcon size="xl" className="text-zinc-700" />,
	},
	{
		key: "whatsapp",
		label: "WhatsApp",
		icon: <FontAwesome name="whatsapp" size={24} color="#262626" />,
	},
	{
		key: "print",
		label: "Print",
		icon: <Feather name="printer" size={22} color="#262626" />,
	},
	{
		key: "email",
		label: "Email",
		icon: <Feather name="mail" size={22} color="#262626" />,
	},
];

export type ReportActionsheetProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	actions?: ReportAction[];
	layout?: "grid" | "list";
	onSelectAction?: (key: string, action: ReportAction) => void;
	children?: React.ReactNode;
};

export function ReportActionsheet({
	isOpen,
	onClose,
	title = "Pilih Aksi",
	actions = DEFAULT_REPORT_ACTIONS,
	layout = "grid",
	onSelectAction,
	children,
}: ReportActionsheetProps) {
	const handleSelect = (action: ReportAction) => {
		onClose();
		action.onPress?.();
		onSelectAction?.(action.key, action);
	};

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="px-4 pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				{title ? (
					<View className="w-full border-b border-border-muted pb-3 pt-2">
						<Text size="normal" w="bold" className="text-center">
							{title}
						</Text>
					</View>
				) : null}

				{children ??
					(layout === "grid" ? (
						<View className="w-full flex-row items-start justify-around pb-2 pt-6">
							{actions.map((action) => (
								<Pressable
									key={action.key}
									onPress={() => handleSelect(action)}
									disabled={action.disabled}
									className="flex-1 items-center gap-2"
								>
									<View className="h-14 w-14 items-center justify-center rounded-full bg-zinc-100 active:bg-zinc-200">
										{action.icon}
									</View>
									<Text
										size="small"
										w="medium"
										className="text-center text-zinc-800"
									>
										{action.label}
									</Text>
								</Pressable>
							))}
						</View>
					) : (
						actions.map((action) => (
							<ActionsheetItem
								key={action.key}
								onPress={() => handleSelect(action)}
								disabled={action.disabled}
								className={cn(
									action.variant === "destructive" &&
										"bg-red-50 data-[active=true]:bg-red-100",
								)}
							>
								{action.icon ? (
									<View className="mr-3">{action.icon}</View>
								) : null}
								<ActionsheetItemText
									className={cn(
										action.variant === "destructive" && "text-red-500",
									)}
								>
									{action.label}
								</ActionsheetItemText>
							</ActionsheetItem>
						))
					))}
			</ActionsheetContent>
		</Actionsheet>
	);
}

export type ReportActionButtonRef = {
	open: () => void;
	close: () => void;
	toggle: () => void;
};

export type ReportActionButtonProps = {
	/** Custom list of actions. Defaults to PDF Download, Share, and Print. */
	actions?: ReportAction[];
	/** Callback when an action is selected. */
	onSelectAction?: (key: string, action: ReportAction) => void;
	/** Label for the trigger button. Defaults to "Aksi". */
	label?: string;
	/** Optional title inside the actionsheet. */
	sheetTitle?: string;
	/** Controlled visibility of the actionsheet. */
	isOpen?: boolean;
	/** Controlled callback for visibility changes. */
	onOpenChange?: (open: boolean) => void;
	/** Callback invoked when the trigger button is pressed. */
	onPress?: () => void;
	/** Class name for the outer bottom bar container. */
	containerClassName?: string;
	/** Class name for the button. */
	buttonClassName?: string;
	/** Class name for the button label text. */
	textClassName?: string;
	/** If true, renders only the button and sheet without the fixed absolute bottom bar container. */
	standalone?: boolean;
	/** Layout for the actions in the sheet: 'grid' (horizontal circular icon buttons) or 'list' (vertical rows). Defaults to 'grid'. */
	sheetLayout?: "grid" | "list";
};

export const ReportActionButton = forwardRef<
	ReportActionButtonRef,
	ReportActionButtonProps
>(function ReportActionButton(
	{
		actions = DEFAULT_REPORT_ACTIONS,
		onSelectAction,
		label = "Aksi",
		sheetTitle,
		isOpen: controlledIsOpen,
		onOpenChange,
		onPress,
		containerClassName,
		buttonClassName,
		textClassName,
		standalone = false,
		sheetLayout = "grid",
	},
	ref,
) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const isControlled = controlledIsOpen !== undefined;
	const isOpen = isControlled ? controlledIsOpen : uncontrolledOpen;

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(open);
			}
			onOpenChange?.(open);
		},
		[isControlled, onOpenChange],
	);

	useImperativeHandle(
		ref,
		() => ({
			open: () => handleOpenChange(true),
			close: () => handleOpenChange(false),
			toggle: () => handleOpenChange(!isOpen),
		}),
		[isOpen, handleOpenChange],
	);

	const handlePress = () => {
		onPress?.();
		handleOpenChange(true);
	};

	const buttonElement = (
		<Button
			onPress={handlePress}
			variant="outline"
			size="lg"
			className={cn("w-full", buttonClassName)}
		>
			<ButtonText className={cn("text-primary-500", textClassName)}>
				{label}
			</ButtonText>
		</Button>
	);

	return (
		<>
			{standalone ? (
				buttonElement
			) : (
				<BottomActionBar
					bottomPadding={24}
					topPadding={8}
					className={containerClassName}
				>
					{buttonElement}
				</BottomActionBar>
			)}

			<ReportActionsheet
				isOpen={isOpen}
				onClose={() => handleOpenChange(false)}
				title={sheetTitle}
				actions={actions}
				layout={sheetLayout}
				onSelectAction={onSelectAction}
			/>
		</>
	);
});

export default ReportActionButton;
