import { useStoresQuery } from "@/api/hooks/stores";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetItem,
	ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { ModalHeader } from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useActiveStore } from "@/store/useActiveStore";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { View } from "react-native";

type ChangeStoreButtonProps = {
	variant?: "outline" | "solid" | "link";
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
	showChevron?: boolean;
	label?: string;
};

export default function ChangeStoreButton({
	variant = "outline",
	size = "md",
	className,
	showChevron = false,
	label = "Pindah Toko",
}: ChangeStoreButtonProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	const { user } = useAuth();
	const { activeStoreId, setActiveStoreId } = useActiveStore();
	const storeQuery = useStoresQuery();

	const isOwner = user?.roles.includes("owner");

	// If not owner, don't show the change store button
	if (!isOwner) return null;

	return (
		<>
			<ButtonGroup>
				<Button
					action="secondary"
					variant={variant}
					size={size}
					className={cn("flex-row items-center gap-1", className)}
					onPress={() => setIsOpen(true)}
				>
					<ButtonText>{label}</ButtonText>
					{showChevron && (
						<Feather name="chevron-right" size={14} color="#71717a" />
					)}
				</Button>
			</ButtonGroup>

			<Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<ActionsheetBackdrop />

				<ActionsheetContent className="p-4">
					<ModalHeader>
						<Text size="body" w="semibold" className="text-center">
							Pilih Toko
						</Text>
					</ModalHeader>
					<View className="mt-2 w-full items-start">
						{storeQuery.isLoading ? (
							<ActionsheetItem disabled>
								<ActionsheetItemText>Memuat...</ActionsheetItemText>
							</ActionsheetItem>
						) : (
							storeQuery.data?.map((item) => (
								<ActionsheetItem
									key={item.id}
									onPress={() => {
										setActiveStoreId(item.id);
										setIsOpen(false);
									}}
									isSelected={activeStoreId === item.id}
								>
									<ActionsheetItemText>{item.name}</ActionsheetItemText>
								</ActionsheetItem>
							))
						)}
					</View>
				</ActionsheetContent>
			</Actionsheet>
		</>
	);
}
