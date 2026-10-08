import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetItem,
	ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import useSearchParamState from "@/hooks/useSearchParamState";
import { cn } from "@/lib/utils";
import type { State } from "@/types";

type PaymentMethodActionProps = {
	openState: State<boolean>;
};

const PAYMENT_METHODS = ["Tunai", "Dana", "QRIS", "Transfer"];

export default function PaymentMethodAction(props: PaymentMethodActionProps) {
	const { openState } = props;

	const [open, setOpen] = openState;

	const [selected, setSelected] = useSearchParamState(
		"paymentMethod",
		PAYMENT_METHODS[0],
	);

	function handlePress(type: string) {
		setSelected(type);
	}

	return (
		<Actionsheet isOpen={open} onClose={() => setOpen(false)}>
			<ActionsheetBackdrop />

			<ActionsheetContent className="p-5">
				<View className="w-full flex-row justify-between">
					<Text className="text-gray-900" w="semibold">
						Metode Pembayaran
					</Text>
					<Pressable
						className="size-6 items-center justify-center rounded-full bg-gray-200"
						onPress={() => setOpen(false)}
					>
						<AntDesign name="close" size={16} color="black" />
					</Pressable>
				</View>
				<View className="mt-6 w-full gap-2">
					{PAYMENT_METHODS.map((item) => {
						const isSelected = selected === item;

						return (
							<Pressable key={item} onPress={() => handlePress(item)}>
								<View
									className={
										"flex-row items-center justify-between rounded-[10px] border border-gray-300 px-2 py-3"
									}
								>
									<Text className="text-sm text-gray-900" w="medium">
										{item}
									</Text>
									<View
										className={cn(
											"size-6 items-center justify-center rounded-full bg-gray-100",
											{
												"bg-primary-400": isSelected,
											},
										)}
									>
										<Feather
											name="check"
											size={10}
											color={isSelected ? "white" : Colors.zinc[400]}
										/>
									</View>
								</View>
							</Pressable>
						);
					})}
				</View>
				<ButtonGroup className="mt-8 w-full">
					<Button size="xl" onPress={() => setOpen(false)}>
						<ButtonText size="md">Lanjut</ButtonText>
					</Button>
				</ButtonGroup>
			</ActionsheetContent>
		</Actionsheet>
	);
}
