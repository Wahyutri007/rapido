import Feather from "@expo/vector-icons/Feather";
import type React from "react";
import {
	Image,
	type ImageSourcePropType,
	Pressable,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import { ILLUSTRATIONS } from "@/assets/images/illustrations";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import { Colors } from "@/constants/Colors";
import type { State } from "@/types";

export type SuccessModalProps = {
	isOpen?: boolean;
	openState?: State<boolean>;
	onClose?: () => void;
	title: string;
	description?: string | React.ReactNode;
	message?: string | React.ReactNode;
	buttonText?: string;
	confirmText?: string;
	onButtonPress?: () => void;
	hideCloseButton?: boolean;
	image?: ImageSourcePropType;
};

export default function SuccessModal(props: SuccessModalProps) {
	const { width, height } = useWindowDimensions();
	const {
		isOpen: propIsOpen,
		openState,
		onClose,
		title,
		description,
		message,
		buttonText,
		confirmText,
		onButtonPress,
		hideCloseButton = false,
		image = ILLUSTRATIONS.actionSuccess,
	} = props;

	const isControlled = openState !== undefined;
	const isModalOpen = isControlled ? openState[0] : (propIsOpen ?? false);

	const handleClose = () => {
		if (isControlled) {
			openState[1](false);
		}
		onClose?.();
	};

	const handleAction = () => {
		if (onButtonPress) {
			onButtonPress();
		} else {
			handleClose();
		}
	};

	const resolvedButtonText = buttonText ?? confirmText ?? "Tutup";
	const resolvedDescription = description ?? message;

	return (
		<Modal isOpen={isModalOpen} onClose={handleClose}>
			<ModalBackdrop />
			<ModalContent
				className="relative rounded-[28px] p-6 shadow-main"
				style={{ width: width - 32, maxWidth: 380, maxHeight: height - 32 }}
			>
				{!hideCloseButton && (
					<Pressable
						onPress={handleClose}
						hitSlop={8}
						className="absolute right-4 top-4 z-10 size-8 items-center justify-center rounded-full bg-zinc-100 active:bg-zinc-200"
					>
						<Feather name="x" size={16} color={Colors.zinc[500]} />
					</Pressable>
				)}

				<ScrollView style={{ flexShrink: 1, minHeight: 0 }}>
					<ModalHeader className="flex-col items-center gap-3">
						{image && (
							<View className="w-full items-center justify-center overflow-hidden">
								<Image
									source={image}
									style={{ height: 176, width: "100%" }}
									className="h-44 w-full"
									resizeMode="contain"
								/>
							</View>
						)}
						<Text
							className="w-full text-center text-[19px] text-gray-900"
							w="bold"
						>
							{title.trim()}
						</Text>
					</ModalHeader>

					{resolvedDescription && (
						<ModalBody className="mx-0 mb-2 mt-1">
							{typeof resolvedDescription === "string" ? (
								<Text className="text-center text-sm leading-relaxed text-muted">
									{resolvedDescription}
								</Text>
							) : (
								resolvedDescription
							)}
						</ModalBody>
					)}
				</ScrollView>

				<ModalFooter className="mt-4 w-full p-0">
					<ButtonGroup className="w-full">
						<Button
							size="xl"
							onPress={handleAction}
							className="h-12 w-full rounded-full bg-primary-500 active:bg-primary-600"
						>
							<ButtonText size="sm" className="font-semibold text-white">
								{resolvedButtonText}
							</ButtonText>
						</Button>
					</ButtonGroup>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export { useAlertModal } from "@/hooks/useAlertModal";
