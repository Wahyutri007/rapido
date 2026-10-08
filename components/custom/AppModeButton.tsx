import { Entypo } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { useStoresQuery } from "@/api/hooks/stores";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
	APP_MODE_LABELS,
	APP_MODES,
	type AppMode,
	useAppModeStore,
} from "@/store/appModeStore";
import { useActiveStore } from "@/store/useActiveStore";
import Text from "../common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetHeader,
	ActionsheetHeaderTitle,
	ActionsheetItem,
	ActionsheetItemText,
} from "../ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "../ui/button";

export default function AppModeButton(props: {
	buttonProps?: React.ComponentPropsWithoutRef<typeof Button>;
}) {
	const { buttonProps } = props;

	const [showActionSheet, setShowActionSheet] = React.useState(false);
	const [showStorePicker, setShowStorePicker] = React.useState(false);
	const [pendingAction, setPendingAction] = React.useState<null | AppMode>(
		null,
	);

	const { user } = useAuth();
	const { activeStoreId, setActiveStoreId } = useActiveStore();
	const { mode: selectedMode, switchModeWithTransition } = useAppModeStore();

	const storesQuery = useStoresQuery();

	const handleOptionPress = (appMode: AppMode) => {
		if (!user) return;

		setShowActionSheet(false);
		setPendingAction(appMode);

		const isOwner = user.roles.includes("owner");

		if (appMode === "cashier" || appMode === "operator") {
			if (isOwner) {
				setShowStorePicker(true);
			} else {
				setActiveStoreId(user.user.team_id);
				switchModeWithTransition(appMode);
			}
		} else {
			// back-office and absence modes do not require store selection upfront
			switchModeWithTransition(appMode);
		}
	};

	return (
		<>
			<Actionsheet
				isOpen={showActionSheet}
				onClose={() => setShowActionSheet(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="p-4">
					<ActionsheetHeader onClose={() => setShowActionSheet(false)}>
						<ActionsheetHeaderTitle>Mode Aplikasi</ActionsheetHeaderTitle>
					</ActionsheetHeader>
					<View className="mt-4" />
					{Object.entries(APP_MODES).map(([key, value], index) => (
						<ActionsheetItem
							onPress={() => handleOptionPress(value)}
							isSelected={selectedMode === value}
							key={value}
							className="mb-2.5"
						>
							<ActionsheetItemText>
								Mode {APP_MODE_LABELS[value]}
							</ActionsheetItemText>
						</ActionsheetItem>
					))}
				</ActionsheetContent>
			</Actionsheet>

			{/* Store Picker for Owner */}
			<Actionsheet
				isOpen={showStorePicker}
				onClose={() => setShowStorePicker(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="p-5">
					<ActionsheetHeader onClose={() => setShowStorePicker(false)}>
						<ActionsheetHeaderTitle>Pilih Toko</ActionsheetHeaderTitle>
					</ActionsheetHeader>
					<View className="mt-2 w-full items-start">
						{storesQuery.isLoading ? (
							<ActionsheetItem disabled>
								<ActionsheetItemText>Memuat Toko...</ActionsheetItemText>
							</ActionsheetItem>
						) : storesQuery.data && storesQuery.data.length > 0 ? (
							storesQuery.data.map((store) => (
								<ActionsheetItem
									key={store.id}
									isSelected={activeStoreId === store.id}
									className="mb-2.5"
									onPress={() => {
										if (!pendingAction) return;

										setActiveStoreId(store.id);
										setShowStorePicker(false);
										switchModeWithTransition(pendingAction);
									}}
								>
									<ActionsheetItemText>{store.name}</ActionsheetItemText>
								</ActionsheetItem>
							))
						) : (
							<View className="py-4">
								<Text className="text-zinc-500">
									Anda tidak memiliki toko. Silakan buat toko terlebih dahulu.
								</Text>
							</View>
						)}
					</View>
				</ActionsheetContent>
			</Actionsheet>

			<ButtonGroup>
				<Button
					action="secondary"
					className={cn("bg-white pl-1.5 pr-2 rounded-lg gap-0", buttonProps?.className)}
					onPress={() => setShowActionSheet(true)}
				>
					<Entypo name="dot-single" size={40} color={Colors.green[500]} />
					<ButtonText>{APP_MODE_LABELS[selectedMode]}</ButtonText>
					<Entypo
						name="chevron-down"
						size={16}
						color={Colors.zinc[700]}
						className="ml-2"
					/>
				</Button>
			</ButtonGroup>
		</>
	);
}
