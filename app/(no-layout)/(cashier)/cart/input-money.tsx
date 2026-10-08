import { zodResolver } from "@hookform/resolvers/zod";
import { router, useGlobalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { z } from "zod";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import { Form, FormField, FormMessage } from "@/components/common/Form";
import Header from "@/components/common/Header";
import Keypad, { type KeypadState } from "@/components/common/Keypad";
import Text from "@/components/common/Text";
import { BackspaceIcon, CheckCircleIcon, InfoIcon } from "@/components/icons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import useSecureStore from "@/hooks/useSecureStore";
import { cn, parseNumber, parseRp, wait } from "@/lib/utils";
import { State } from "@/types";

export default function InputKas() {
	const params = useGlobalSearchParams();

	const keypadState = React.useState<KeypadState>("");
	const [value, setValue] = keypadState;

	const moneyInputSchema = React.useMemo(
		() =>
			z
				.object({
					value: z
						.string({
							required_error: "Uang diterima tidak boleh kosong",
						})
						.min(1, { message: "Uang diterima tidak boleh kosong" }),
				})
				.refine(
					(data) => {
						// make sure the value is greater than the params.totalPrice
						const totalPrice = parseNumber((params?.totalPrice as string) ?? 0);
						const value = parseNumber(data.value);
						return value >= totalPrice;
					},
					{
						message: `Uang diterima tidak boleh kurang dari Rp ${parseRp(
							params?.totalPrice as string,
							false,
						)}`,
						path: ["value"],
					},
				),
		[params],
	);

	const form = useForm({
		resolver: zodResolver(moneyInputSchema),
	});

	// set form value for validation
	React.useEffect(() => {
		if (value) {
			form.setValue("value", value.toString());
		}
	}, [value]);

	// Set value to 0 if the params.value is not empty
	React.useEffect(() => {
		if (params?.value) {
			form.setValue("value", params.value as string);
		}
	}, [params]);

	const watchedValue = form.watch("value");
	const isValid = watchedValue !== "0" && watchedValue !== "";

	function handleContinue() {
		router.replace({
			pathname: "/cart/input-money-confirm",
			params: {
				value: parseNumber(watchedValue),
				totalPrice: parseNumber(params?.totalPrice as string),
			},
		});
	}

	return (
		<View className="grow bg-zinc-50">
			<View className="grow items-center justify-center gap-1 px-16">
				<View className="items-center gap-2">
					<View className="flex-row items-center justify-center">
						<Text className="shrink-0 text-[32px] text-muted" w="medium">
							Rp
						</Text>
						<Text className="text-[32px] text-gray-900" w="medium">
							{parseRp(watchedValue, false)}
						</Text>
					</View>
					<Form {...form}>
						<FormField
							control={form.control}
							name="value"
							render={() => <FormMessage />}
						/>
					</Form>
				</View>
			</View>
			<View className="mt-auto">
				<Keypad state={keypadState} />
				<ButtonGroup className="bg-white px-8 pb-8 pt-2">
					<Button
						size="xl"
						style={{
							opacity: !isValid ? 0.5 : 1,
							pointerEvents: !isValid ? "none" : "auto",
						}}
						onPress={form.handleSubmit(handleContinue)}
					>
						<ButtonText size="md">Lanjut</ButtonText>
					</Button>
				</ButtonGroup>
			</View>
		</View>
	);
}
