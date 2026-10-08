import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Dimensions, Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { State } from "@/types";

export type StoreDeleteModalProps = {
	isOpen?: boolean;
	openState?: State<boolean>;
	onClose?: () => void;
	onConfirm: (password?: string) => void | Promise<void>;
	title?: string;
	description?: string;
	isLoading?: boolean;
};

export default function StoreDeleteModal(props: StoreDeleteModalProps) {
	const {
		isOpen: propIsOpen,
		openState,
		onClose,
		onConfirm,
		title = "Apakah yakin ingin menghapus",
		description = "Produk akan hilang permanen jika kamu sudah mengkonfirmasi",
		isLoading = false,
	} = props;

	const isControlled = openState !== undefined;
	const isModalOpen = isControlled ? openState[0] : (propIsOpen ?? false);

	const [isAcknowledged, setIsAcknowledged] = React.useState(true);
	const [password, setPassword] = React.useState("");

	const handleClose = () => {
		if (isControlled) {
			openState[1](false);
		}
		onClose?.();
		setPassword("");
	};

	const handleConfirm = () => {
		onConfirm(password);
		handleClose();
	};

	return (
		<Modal isOpen={isModalOpen} onClose={handleClose}>
			<ModalBackdrop />
			<ModalContent
				className="rounded-3xl p-4 shadow-main bg-white"
				style={{ width: Dimensions.get("screen").width - 32, maxWidth: 380 }}
			>
				<ModalHeader className="flex-col items-start gap-1 p-0">
					<Text className="text-left text-gray-900" w="bold">
						{title}
					</Text>
				</ModalHeader>

				<ModalBody className="mx-0 my-4 gap-4 p-0">
					<Pressable
						onPress={() => setIsAcknowledged(!isAcknowledged)}
						className="flex-row items-center gap-3"
					>
						<View
							className={cn(
								"size-5 items-center justify-center rounded border",
								isAcknowledged
									? "border-primary bg-primary"
									: "border-zinc-300 bg-white",
							)}
						>
							{isAcknowledged && (
								<Feather name="check" size={14} color="#FFFFFF" />
							)}
						</View>
						<Text size="small" className="flex-1 text-muted leading-tight">
							{description}
						</Text>
					</Pressable>

					<Input className="h-12 rounded-xl border border-zinc-200 bg-white px-3 mt-3">
						<InputField
							placeholder="Masukkan Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							className="text-foreground"
						/>
					</Input>
				</ModalBody>

				<ModalFooter className="flex-row gap-3 p-0 mt-2">
					<ButtonGroup className="flex-1">
						<Button
							size="xl"
							onPress={handleClose}
							variant="outline"
							className="h-12 w-full rounded-full border-primary bg-white"
							disabled={isLoading}
						>
							<ButtonText size="sm" className="font-semibold text-primary">
								Batalkan
							</ButtonText>
						</Button>
					</ButtonGroup>

					<ButtonGroup className="flex-1">
						<Button
							size="xl"
							onPress={handleConfirm}
							className="h-12 w-full rounded-full bg-primary"
							disabled={isLoading || !isAcknowledged}
						>
							<ButtonText size="sm" className="font-semibold text-white">
								Yakin
							</ButtonText>
						</Button>
					</ButtonGroup>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
