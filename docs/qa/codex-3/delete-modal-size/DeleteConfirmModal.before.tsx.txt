import type React from "react";
import {
	Dimensions,
	Image,
	type ImageSourcePropType,
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
import type { State } from "@/types";

export type DeleteConfirmModalProps = {
	isOpen?: boolean;
	openState?: State<boolean>;
	onClose?: () => void;
	onConfirm: () => void | Promise<void>;
	title?: string;
	itemName?: string;
	description?: string | React.ReactNode;
	message?: string | React.ReactNode;
	cancelText?: string;
	confirmText?: string;
	isLoading?: boolean;
	image?: ImageSourcePropType;
};

export default function DeleteConfirmModal(props: DeleteConfirmModalProps) {
	const {
		isOpen: propIsOpen,
		openState,
		onClose,
		onConfirm,
		title,
		itemName,
		description,
		message,
		cancelText = "Batal",
		confirmText = "Hapus",
		isLoading = false,
		image = ILLUSTRATIONS.deleteConfirmation,
	} = props;

	const isControlled = openState !== undefined;
	const isModalOpen = isControlled ? openState[0] : (propIsOpen ?? false);

	const handleClose = () => {
		if (isControlled) {
			openState[1](false);
		}
		onClose?.();
	};

	const resolvedTitle =
		title ?? (itemName ? `Hapus ${itemName}?` : "Hapus Item?");
	const resolvedDescription =
		description ??
		message ??
		"Data ini akan dihapus dan tidak dapat digunakan lagi.";

	return (
		<Modal isOpen={isModalOpen} onClose={handleClose}>
			<ModalBackdrop />
			<ModalContent
				className="rounded-[28px] p-6 shadow-main"
				style={{ width: Dimensions.get("screen").width - 32, maxWidth: 380 }}
			>
				<ModalHeader className="flex-col items-center gap-3">
					{image && (
						<View className="w-full items-center justify-center overflow-hidden">
							<Image
								source={image}
								className="h-44 w-full"
								resizeMode="contain"
							/>
						</View>
					)}
					<Text
						className="w-full text-center text-[19px] text-gray-900"
						w="bold"
					>
						{resolvedTitle.trim()}
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

				<ModalFooter className="mt-4 flex-row gap-3 p-0">
					<ButtonGroup className="flex-1">
						<Button
							size="xl"
							onPress={handleClose}
							variant="outline"
							className="h-12 w-full rounded-full border-gray-200"
							disabled={isLoading}
						>
							<ButtonText size="sm" className="font-semibold text-gray-800">
								{cancelText}
							</ButtonText>
						</Button>
					</ButtonGroup>
					<ButtonGroup className="flex-1">
						<Button
							size="xl"
							onPress={onConfirm}
							action="negative"
							className="h-12 w-full rounded-full bg-error-600 active:bg-error-700"
							disabled={isLoading}
						>
							<ButtonText size="sm" className="font-semibold text-white">
								{confirmText}
							</ButtonText>
						</Button>
					</ButtonGroup>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export { useAlertModal } from "@/hooks/useAlertModal";
