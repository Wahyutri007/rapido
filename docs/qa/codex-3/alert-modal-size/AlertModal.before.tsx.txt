import type React from "react";
import {
	Dimensions,
	Image,
	type ImageSourcePropType,
	View,
} from "react-native";
import Text from "@/components/common/Text";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import type { State } from "@/types";
import {
	Button,
	ButtonGroup,
	ButtonText,
	type ButtonVariantProps,
} from "../ui/button";

type AlertModal = {
	openState: State<boolean>;
	onClose?: () => void;
	onConfirm?: () => void;
	image?: ImageSourcePropType;
	title?: string;
	message?: string | React.ReactNode;
	cancelText?: string;
	confirmText?: string;
	hideCancelButton?: boolean;
	hideConfirmButton?: boolean;
	confirmAction?: ButtonVariantProps["action"];
	isLoading?: boolean;
};

export { useAlertModal } from "@/hooks/useAlertModal";

export default function AlertModal(props: React.PropsWithChildren<AlertModal>) {
	const {
		openState,
		image,
		message,
		title,
		onClose = () => setIsOpen(false),
		onConfirm,
		cancelText = "Tidak, batal",
		confirmText = "Iya, lanjut",
		hideCancelButton = false,
		hideConfirmButton = false,
		confirmAction = "primary",
		isLoading = false,
		children,
	} = props;

	const [isOpen, setIsOpen] = openState;

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalBackdrop />
			<ModalContent
				className="rounded-[20px] p-5 shadow-main"
				style={{ width: Dimensions.get("screen").width - 32 }}
			>
				<ModalHeader className="flex-col items-center gap-5">
					{image && (
						<View className="w-full overflow-hidden rounded-2xl">
							<Image
								source={image}
								className="h-32 w-full"
								resizeMode="cover"
							/>
						</View>
					)}
					{title && (
						<Text
							className="w-full text-center text-[20px] text-gray-900"
							w="semibold"
						>
							{title.trim()}
						</Text>
					)}
				</ModalHeader>

				{children}

				{message && (
					<ModalBody className="mx-0 mb-0 mt-4">
						{typeof message === "string" ? (
							<Text className="text-center text-muted">{message}</Text>
						) : (
							message
						)}
					</ModalBody>
				)}
				{(!hideCancelButton || !hideConfirmButton) && (
					<ModalFooter className="mt-4 gap-4">
						{!hideCancelButton && (
							<ButtonGroup className="flex-1">
								<Button size="xl" onPress={onClose} variant="outline">
									<ButtonText size="sm">{cancelText}</ButtonText>
								</Button>
							</ButtonGroup>
						)}
						{!hideConfirmButton && (
							<ButtonGroup className="flex-1">
								<Button
									size="xl"
									onPress={onConfirm ? onConfirm : onClose}
									action={confirmAction}
									disabled={isLoading}
								>
									<ButtonText size="sm">{confirmText}</ButtonText>
								</Button>
							</ButtonGroup>
						)}
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	);
}

export { default as DeleteConfirmModal } from "./DeleteConfirmModal";
export { default as SuccessModal } from "./SuccessModal";
